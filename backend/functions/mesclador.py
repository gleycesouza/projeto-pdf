from PyPDF2 import PdfFileMerger, PdfFileReader
import boto3
import io

BUCKET = 'projeto-pdf'
s3 = boto3.resource('s3')

def handler(event, context):

  # Recebe parametros com o caminho dos arquivos
  paths = event['paths']
  print(paths)
  merger = PdfFileMerger()

  # Para cada caminho de pdf no s3 
  for pdf_path in paths:
    print(pdf_path)
    pdf_file = get_from_s3(BUCKET, pdf_path)    # puxa arquivo do s3
    pdf = PdfFileReader(io.BytesIO(pdf_file))   # transforma binario em pdf
    merger.append(pdf)                          # adiciona o pdf no merger

  merger.write('/tmp/output.pdf')               #escreve o arquivo na pasta temporária
  merger.close()

  # salva arquivo resultante no s3
  upload_file_to_s3('/tmp/output.pdf', BUCKET, 'data/output.pdf')

  return {
    'statusCode': 200,
    'headers': { 
      'Access-Control-Allow-Origin': '*',
    },
    'body': 'success'
  }

#função para ler o arquivo do S3
def get_from_s3(s3_bucket, s3_path):
  obj = s3.Object(s3_bucket, s3_path)
  return obj.get()['Body'].read()

#função para upar o arquivo no S3
def upload_file_to_s3(filename, s3_bucket , s3_path):
  s3.meta.client.upload_file(filename, s3_bucket, s3_path)