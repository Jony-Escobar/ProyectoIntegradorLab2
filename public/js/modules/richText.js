export function initializeRichText() {
    
    // Verificar que Quill está disponible globalmente
    if (typeof window.Quill === 'undefined') {
        console.error('Error: Quill no está disponible globalmente. La funcionalidad de richText no funcionará correctamente.');
        alert('Error: El editor de texto enriquecido no se pudo cargar correctamente. Por favor, recargue la página o contacte al administrador.');
        return;
    }
        
    const notasContainer = document.getElementById('notasClinicasContainer');
    if (!notasContainer) {
        console.warn('No se encontró el contenedor de notas clínicas');
        return;
    }

    let contadorNotas = 0;
    
    // Configuración de toolbar actualizada para Quill 2.0.3
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': [1, 2, false] }],
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

    // Función para convertir HTML a delta para Quill
    function htmlToDelta(html) {
        // Crear un div temporal para procesar el HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        // Si usamos Quill 2.0.3, podemos usar esta API
        if (window.Quill && window.Quill.version && window.Quill.version.startsWith('2.')) {
            try {
                // Intentar usar el método clipboard.convert de Quill
                const quillInstance = new window.Quill(document.createElement('div'));
                return quillInstance.clipboard.convert(html);
            } catch (error) {
                console.error('Error al convertir HTML a delta:', error);
                return null;
            }
        }
        
        return null;
    }

    // Inicializar el editor Quill para el primer editor que viene por defecto en la vista
    const inicializarEditorInicial = () => {
        console.log('Inicializando editor inicial');
        // Buscar todos los editores Quill que aún no han sido inicializados
        const editoresNoInicializados = notasContainer.querySelectorAll('.quill-editor:not(.ql-container)');
        console.log('Editores no inicializados encontrados:', editoresNoInicializados.length);
        
        // Inicializar cada editor encontrado
        editoresNoInicializados.forEach((editor, index) => {
            console.log(`Inicializando editor #${index + 1}:`, editor);
            // Verificar si el editor ya tiene una instancia de Quill
            if (!editor.classList.contains('ql-container')) {
                try {
                    console.log(`Creando instancia de Quill para editor #${index + 1}`);
                    // Inicializar el editor de texto enriquecido
                    const quillEditor = new Quill(editor, {
                        theme: 'snow',
                        modules: {
                            toolbar: toolbarOptions
                        }
                    });
                    console.log(`Editor #${index + 1} inicializado correctamente`);
                    
                    // Agregar event listener para la plantilla si existe
                    const grupo = editor.closest('.nota-grupo');
                    if (grupo) {
                        const plantillaSelect = grupo.querySelector('.plantilla-select');
                        if (plantillaSelect) {
                            plantillaSelect.addEventListener('change', function() {
                                const selectedOption = this.options[this.selectedIndex];
                                if (selectedOption.dataset.contenido) {
                                    // Desescapar el contenido antes de insertarlo en el editor
                                    const contenidoReal = selectedOption.dataset.contenido
                                        .replace(/&amp;/g, '&')
                                        .replace(/&quot;/g, '"')
                                        .replace(/&#39;/g, "'")
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>');
                                    
                                    quillEditor.root.innerHTML = contenidoReal;
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error al inicializar el editor #${index + 1}:`, error);
                }
            } else {
                console.log(`Editor #${index + 1} ya está inicializado`);
            }
        });
    };

    // Inicializar el editor inicial
    inicializarEditorInicial();

    // Agregar nueva nota
    // Obtiene el botón para agregar notas clínicas
    const btnAgregarNota = document.getElementById('btnAgregarNota');

    // Función para actualizar botones de eliminar
    function actualizarBotonesEliminar() {
        const grupos = notasContainer.querySelectorAll('.nota-grupo');
        grupos.forEach((grupo, index) => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-nota');
            if (btnEliminar) {
                btnEliminar.disabled = grupos.length === 1;
            }
        });
    }

    // Manejar eliminación de notas
    notasContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-eliminar-nota')) {
            e.target.closest('.nota-grupo').remove();
            actualizarBotonesEliminar();
        }
    });
    
    // Inicializar los botones de eliminar
    actualizarBotonesEliminar();
}
