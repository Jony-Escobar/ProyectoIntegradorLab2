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

    // Función para obtener el HTML de la plantilla
    function obtenerPlantillaHTML() {
        const plantillasSelect = document.querySelector('.plantilla-select');
        return plantillasSelect ? plantillasSelect.outerHTML : '';
    }

    function inicializarQuill(container) {
        const quill = new Quill(container.querySelector('.quill-editor'), {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });

        const plantillaSelect = container.querySelector('.plantilla-select');
        if (plantillaSelect) {
            plantillaSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption.dataset.contenido) {
                    quill.root.innerHTML = selectedOption.dataset.contenido;
                }
            });
        }

        return quill;
    }

    // Inicializar el primer editor
    inicializarQuill(notasContainer.querySelector('.nota-grupo'));

    // Agregar nueva nota
    const btnAgregarNota = document.getElementById('btnAgregarNota');
    if (btnAgregarNota) {
        btnAgregarNota.addEventListener('click', function() {
            contadorNotas++;
            const plantillaHTML = obtenerPlantillaHTML();
            
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 nota-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-11">
                    ${plantillaHTML}
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

    // Función para actualizar botones de eliminar
    function actualizarBotonesEliminar() {
        const grupos = notasContainer.querySelectorAll('.nota-grupo');
        grupos.forEach((grupo, index) => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-nota');
            btnEliminar.disabled = grupos.length === 1;
        });
    }

    // Manejar eliminación de notas
    notasContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-eliminar-nota')) {
            e.target.closest('.nota-grupo').remove();
            actualizarBotonesEliminar();
        }
    });
}
