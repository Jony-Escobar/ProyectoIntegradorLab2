export function initializeRichText() {
    const notasContainer = document.getElementById('notasClinicasContainer');
    if (!notasContainer) return;

    let contadorNotas = 0;
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }]
    ];

    function inicializarQuill(container) {
        const quill = new Quill(container.querySelector('.quill-editor'), {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });
        return quill;
    }

    // Inicializar el primer editor
    inicializarQuill(notasContainer.querySelector('.nota-grupo'));

    // Agregar nueva nota
    const btnAgregarNota = document.getElementById('btnAgregarNota');
    if (btnAgregarNota) {
        btnAgregarNota.addEventListener('click', function() {
            contadorNotas++;
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 nota-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-11">
                    <div class="editor-container">
                        <div class="quill-editor"></div>
                    </div>
                </div>
                <div class="col-md-1 d-flex align-items-center">
                    <button type="button" class="btn btn-danger btn-eliminar-nota">X</button>
                </div>
            `;
            notasContainer.appendChild(nuevoGrupo);
            inicializarQuill(nuevoGrupo);
            actualizarBotonesEliminar();
        });
    }

    // Eliminar nota
    notasContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-eliminar-nota')) {
            e.target.closest('.nota-grupo').remove();
            actualizarBotonesEliminar();
        }
    });

    function actualizarBotonesEliminar() {
        const grupos = notasContainer.querySelectorAll('.nota-grupo');
        grupos.forEach(grupo => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-nota');
            btnEliminar.disabled = grupos.length === 1;
        });
    }
}
