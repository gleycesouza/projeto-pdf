document.addEventListener('DOMContentLoaded', function(){
    document.querySelector("#form").addEventListener('submit', onFormSubmit);
    // document.querySelector("#arquivos").addEventListener('change', updateList);

    $.fn.filepond.registerPlugin(FilePondPluginImagePreview);
    //$.fn.filepond.registerPlugin(FilePondPluginFileValidateType);
    $('.my-pond').filepond();
    $('.my-pond').filepond('allowReorder', true);
    $('.my-pond').filepond('allowMultiple', true);
    $('.my-pond').filepond('labelIdle', 'Arraste e solte os arquivos aqui ou <span class="filepond--label-action"> Busque </span>');
    //$$('.my-pond').filepond('allowProgress', true);
    //$$('.my-pond').filepond('acceptedFileTypes', ['.pdf']);

    var btnEnviar = document.querySelector('#enviar');
    var btnBaixar = document.querySelector('#baixar');
    var baixarLink = document.querySelector('#baixar-link');

    function formSuccess(response){
        // trecho de sucesso
        console.log("status code da resposta do servidor: " + response.status);
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        console.log("status code da resposta do servidor: " + response.status);
        baixarLink.href = url;
        baixarLink.setAttribute('download', 'Arquivos mesclados.pdf');
        btnBaixar.classList.remove('d-none');
    }
    
    function formError(response){
        // trecho de erro
        console.log("status code " + response.status);
        console.log("deu erro " + response);
    }
    
    function onFormSubmit(e){
        console.log('Formulario submetido')
        e.preventDefault();
    
        // slsdivResultado.innerHTML = '';
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<span class="spinner-grow spinner-grow-sm mr-2" role="status"></span> Carregando...'
        btnBaixar.classList.add('d-none');

        var formData = new FormData();
        var files = $('.my-pond').filepond('getFiles');    
        console.log(files)
        // var doc = document.querySelector('.filepond--browser');
        // console.log(doc.files.length)
        formData.append('file_count', files.length || 0)
        //formData.append("arquivos", files);
        for(var i = 0; i < files.length; i++)
            formData.append(`file_${i}`, files[i].file)
        
        const httpClient = axios.create();

        httpClient.defaults.timeout = 1000000;

        httpClient.post(
            'https://1ax1ixyw46.execute-api.us-east-1.amazonaws.com/dev/api/processador',
            formData, 
            { 
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'arraybuffer',
            }
        )
        .then(formSuccess)
        .catch(formError)
        .finally(() => { 
            btnEnviar.disabled = false
            btnEnviar.innerHTML = '<i class="fas fa-paperclip mr-2"></i> Enviar'
        })

    }

    // function updateList(){
    //     var input = document.getElementById('arquivos');
    //     var output = document.getElementById('fileList');
    //     var children = "";
    //     for (var i = 0; i < input.files.length; ++i) {
    //         children += '<div>' + input.files.item(i).name + '</div>';
    //     }
    //     output.innerHTML = '<ul>'+children+'</ul>';
    // }
})