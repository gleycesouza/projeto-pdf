const multipart = require('aws-multipart-parser');
const AWS = require('aws-sdk');

const BUCKET = 'projeto-pdf'
const s3 = new AWS.S3();
const lambda = new AWS.Lambda({ region: 'us-east-1'});

module.exports.handler = async (event, context) => {
    
  // Recebe dados do formulário do frontend
  const formData = multipart.parse(event, true);
  console.log(formData);
  const pdfsPaths = []
  for(let i = 0; i < formData.file_count; i++){
    const filename = `data/file_${i}.pdf`
    await saveToS3(formData['file_'+i].content, BUCKET, filename) // salva cada arquivo no s3
    pdfsPaths.push(filename) // salva localização dos arquivos pra passar pra outra lambda
  }

  // invoca a lambda function que vai mesclar os pdfs
  console.log('invoking lambda')
  await lambda.invoke({
    FunctionName: 'arn:aws:lambda:us-east-1:052408020127:function:projeto-pdf-backend-dev-mesclador',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({ paths: pdfsPaths })
  }).promise();

  // pega arquivo resultante do s3 e salva na variavel
  console.log('reading output')
  const pdf = await getFromS3(BUCKET, 'data/output.pdf')
  
  // Deleta arquivos do s3
  var params = { Bucket: BUCKET, Key: 'data/' };
  await s3.deleteObject(params);
  
  // retorna arquivo pdf
  return { 
    statusCode: 200, 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type' : 'application/pdf'
    }, 
    body: pdf.toString('base64'),
    isBase64Encoded: true 
  };
}

//salvando o arquivo no S3
async function saveToS3(data, bucket, key){
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: data
  }).promise()
}

//importando o arquivo do S3
async function getFromS3(bucket, key){
  const data = await s3.getObject({
    Bucket: bucket,
    Key: key, 
  }).promise()

  return data.Body;
}