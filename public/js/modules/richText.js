export function initializeRichText() {
    const editor = document.getElementById('notasClinicas');
    if (!editor) return;

    // Crear un div contenedor para Quill
    const quillContainer = document.createElement('div');
    quillContainer.id = 'editor-container';
    editor.parentNode.insertBefore(quillContainer, editor);
    editor.style.display = 'none';

    // Configurar las opciones de la barra de herramientas
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
    ];

    // Inicializar Quill
    const quill = new Quill('#editor-container', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    // Actualizar el textarea oculto cuando el contenido cambie
    quill.on('text-change', function() {
        const html = quill.root.innerHTML;
        editor.value = html;
        // Disparar evento input en el textarea
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    });
}
