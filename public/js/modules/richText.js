export function initializeRichText() {
    console.log('Inicializando richText.js');
    
    // Verificar que Quill está disponible globalmente
    if (typeof window.Quill === 'undefined') {
        console.error('Error: Quill no está disponible globalmente. La funcionalidad de richText no funcionará correctamente.');
        alert('Error: El editor de texto enriquecido no se pudo cargar correctamente. Por favor, recargue la página o contacte al administrador.');
        return;
    }
    
    console.log('Usando Quill versión:', window.Quill.version);
    
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

    function inicializarQuill(container, contenidoInicial = '') {
        try {
            console.log('Inicializando editor Quill en contenedor');
            
            // Asegurarse de que el elemento existe antes de inicializar Quill
            const editorElement = container.querySelector('.quill-editor');
            if (!editorElement) {
                console.error('No se encontró el elemento .quill-editor en el contenedor');
                return null;
            }

            console.log('Creando instancia de Quill');

            // Inicializar Quill con la configuración actualizada
            const quill = new window.Quill(editorElement, {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow',
                placeholder: 'Escriba aquí su nota clínica...'
            });
            
            console.log('Instancia de Quill creada correctamente');

            // Si hay contenido inicial, lo establecemos usando la API de Quill
            if (contenidoInicial && contenidoInicial.trim() !== '') {
                try {
                    console.log('Estableciendo contenido inicial');
                    // Intentar insertar el contenido como delta si es posible
                    const delta = htmlToDelta(contenidoInicial);
                    if (delta) {
                        quill.setContents(delta);
                    } else {
                        // Fallback a innerHTML si no se pudo convertir
                        quill.root.innerHTML = contenidoInicial;
                    }
                } catch (error) {
                    console.error('Error al establecer contenido inicial:', error);
                    // Intento alternativo
                    try {
                        quill.root.innerHTML = contenidoInicial;
                    } catch (innerError) {
                        console.error('Error en el método alternativo:', innerError);
                    }
                }
            }

            // Configurar el selector de plantillas
            const plantillaSelect = container.querySelector('.plantilla-select');
            if (plantillaSelect) {
                console.log('Configurando selector de plantillas');
                plantillaSelect.addEventListener('change', function() {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption && selectedOption.dataset.contenido) {
                        try {
                            console.log('Aplicando plantilla seleccionada');
                            // Decodificar el contenido HTML antes de asignarlo
                            const contenidoDecodificado = selectedOption.dataset.contenido
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&quot;/g, '"')
                                .replace(/&#39;/g, "'")
                                .replace(/&amp;/g, '&');
                            
                            console.log('Contenido decodificado:', contenidoDecodificado);
                            
                            // Intentar insertar el contenido como delta
                            const delta = htmlToDelta(contenidoDecodificado);
                            if (delta) {
                                console.log('Insertando contenido como delta');
                                quill.setContents(delta);
                            } else {
                                // Fallback a pasteHTML
                                console.log('Fallback: Insertando contenido como HTML');
                                quill.root.innerHTML = contenidoDecodificado;
                            }
                        } catch (error) {
                            console.error('Error al aplicar la plantilla:', error);
                            alert('Hubo un error al aplicar la plantilla. Por favor, inténtelo de nuevo o seleccione otra plantilla.');
                        }
                    }
                });
            }

            return quill;
        } catch (error) {
            console.error('Error al inicializar Quill:', error);
            return null;
        }
    }

    // Inicializar el primer editor
    console.log('Buscando el primer editor');
    const primerEditor = notasContainer.querySelector('.nota-grupo');
    if (primerEditor) {
        console.log('Primer editor encontrado, inicializando');
        const contenidoInicial = primerEditor.querySelector('.quill-editor').innerHTML || '';
        inicializarQuill(primerEditor, contenidoInicial);
    } else {
        console.warn('No se encontró el primer editor (.nota-grupo)');
    }

    // Agregar nueva nota
    const btnAgregarNota = document.getElementById('btnAgregarNota');
    if (btnAgregarNota) {
        console.log('Configurando botón de agregar nota');
        btnAgregarNota.addEventListener('click', function() {
            contadorNotas++;
            console.log('Agregando nueva nota:', contadorNotas);
            
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
    } else {
        console.warn('No se encontró el botón de agregar nota');
    }

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
            console.log('Eliminando nota');
            e.target.closest('.nota-grupo').remove();
            actualizarBotonesEliminar();
        }
    });
    
    // Inicializar los botones de eliminar
    actualizarBotonesEliminar();
    console.log('Inicialización de richText.js completada');
}
