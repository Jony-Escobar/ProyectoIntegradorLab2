export function initializeRichText() {
    tinymce.init({
        selector: '#notasClinicas',
        plugins: [
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 
            'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 
            'wordcount', 'checklist', 'mediaembed', 'casechange', 'export', 
            'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 
            'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 
            'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 
            'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 
            'markdown', 'importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
            { value: 'First.Name', title: 'First Name' },
            { value: 'Email', title: 'Email' },
        ],
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        exportpdf_converter_options: { 'format': 'Letter', 'margin_top': '1in', 'margin_right': '1in', 'margin_bottom': '1in', 'margin_left': '1in' },
        exportword_converter_options: { 'document': { 'size': 'Letter' } },
        importword_converter_options: { 'formatting': { 'styles': 'inline', 'resets': 'inline', 'defaults': 'inline', } },
        setup: function (editor) {
            editor.on('change', function () {
                // Actualiza el textarea oculto con el contenido del editor
                editor.save();
                // Dispara el evento input en el textarea
                const event = new Event('input', { bubbles: true });
                document.getElementById('notasClinicas').dispatchEvent(event);
            });
        },
        required: true,
    });
}
