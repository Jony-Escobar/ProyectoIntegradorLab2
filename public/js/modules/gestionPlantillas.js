export function initGestionPlantillas() {
    
    // Verificar que Quill está disponible globalmente
    if (typeof window.Quill === 'undefined') {
        console.error('Error: Quill no está disponible globalmente. La gestión de plantillas no funcionará correctamente.');
        return;
    }
    
    // Esperar a que Bootstrap esté disponible
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap no está cargado');
        return;
    }

    const btnGestionPlantillas = document.getElementById('btnGestionPlantillas');
    if (!btnGestionPlantillas) {
        // Si no existe el botón de gestión de plantillas, no continuamos
        console.warn('No se encontró el botón de gestión de plantillas');
        return;
    }
    
    // Inicializar modales - Solo inicializamos modalPlantilla aquí
    // modalGestionPlantillas se inicializa en editarAtencion.js
    let modalPlantilla;
    
    try {
        const modalPlantillaElement = document.getElementById('modalPlantilla');
        
        if (!modalPlantillaElement) {
            console.error('No se encontró el elemento del modal de plantilla');
            return;
        }
        
        modalPlantilla = new bootstrap.Modal(modalPlantillaElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        
        // Agregar manejador para el evento de cierre
        modalPlantillaElement.addEventListener('hidden.bs.modal', function() {
            // Limpiar cualquier estado o recurso que pueda estar causando problemas
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        });
    } catch (error) {
        console.error('Error al inicializar el modal de plantilla:', error);
        return;
    }
    
    const btnNuevaPlantilla = document.getElementById('btnNuevaPlantilla');
    const formPlantilla = document.getElementById('formPlantilla');
    let editorPlantilla;

    // Inicializar el editor Quill para la plantilla con opciones compatibles con 2.0.3
    try {
        const editorElement = document.getElementById('editorPlantilla');
        if (editorElement) {         
            // Limpiar cualquier instancia previa
            if (editorElement.querySelector('.ql-editor')) {
                editorElement.innerHTML = '';
            }
            
            // Inicializar Quill con opciones específicas para 2.0.3
            editorPlantilla = new window.Quill('#editorPlantilla', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'size': ['small', false, 'large'] }],
                        [{ 'color': [] }, { 'background': [] }],
                    ]
                },
                placeholder: 'Escriba aquí el contenido de su plantilla...'
            });
        }
    } catch (error) {
        console.error('Error al inicializar el editor Quill para plantillas:', error);
    }

    // Función para convertir HTML a delta para Quill
    function htmlToDelta(html) {
        try {            
            // Crear un div temporal para procesar el HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // Si usamos Quill 2.0.3, podemos usar esta API
            if (window.Quill && window.Quill.version && window.Quill.version.startsWith('2.')) {
                try {
                    // Intentar usar el método clipboard.convert de Quill
                    const tempEditor = new window.Quill(document.createElement('div'));
                    
                    // Usar dangerouslyPasteHTML si está disponible
                    if (tempEditor.clipboard && typeof tempEditor.clipboard.dangerouslyPasteHTML === 'function') {
                        tempEditor.clipboard.dangerouslyPasteHTML(html);
                        return tempEditor.getContents();
                    }
                    
                    // Alternativa: usar convert si está disponible
                    if (tempEditor.clipboard && typeof tempEditor.clipboard.convert === 'function') {
                        return tempEditor.clipboard.convert(html);
                    }
                    
                    // Última alternativa: establecer innerHTML y obtener contenido
                    tempEditor.root.innerHTML = html;
                    return tempEditor.getContents();
                } catch (error) {
                    console.error('Error al convertir HTML a delta con Quill 2.0.3:', error);
                }
            }
            
            // Método alternativo para versiones anteriores o si falló el método anterior
            try {
                // Crear un editor temporal
                const tempDiv = document.createElement('div');
                document.body.appendChild(tempDiv);
                
                const tempEditor = new window.Quill(tempDiv, {
                    theme: 'snow'
                });
                
                // Establecer el HTML y obtener el delta
                tempEditor.root.innerHTML = html;
                const delta = tempEditor.getContents();
                
                // Limpiar
                document.body.removeChild(tempDiv);
                
                return delta;
            } catch (fallbackError) {
                console.error('Error en método alternativo de conversión:', fallbackError);
                return null;
            }
        } catch (error) {
            console.error('Error general en htmlToDelta:', error);
            return null;
        }
    }

    // Cargar plantillas
    async function cargarPlantillas() {
        try {
            const response = await fetch('/api/plantillas');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantillas = await response.json();
            const tbody = document.getElementById('tablePlantillas');
            
            if (!tbody) {
                console.error('No se encontró el elemento tablePlantillas');
                return;
            }
            
            tbody.innerHTML = plantillas.map(plantilla => `
                <tr>
                    <td>${plantilla.titulo}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1 btn-editar" data-id="${plantilla.id}">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${plantilla.id}">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Agregar event listeners a los botones de editar y eliminar
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', () => editarPlantilla(btn.dataset.id));
            });
            
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', () => eliminarPlantilla(btn.dataset.id));
            });
        } catch (error) {
            console.error('Error cargando plantillas:', error);
        }
    }

    // Actualizar la función actualizarSelectPlantillas para hacerla compatible con Quill 2.0.3
    async function actualizarSelectPlantillas() {
        try {
            const response = await fetch('/api/plantillas');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantillas = await response.json();
            
            // Actualizar la variable global window.plantillas
            window.plantillas = plantillas;
            
            // Actualizar todos los selectores de plantillas en los editores
            document.querySelectorAll('.plantilla-select').forEach(select => {
                const valorActual = select.value;
                
                // Limpiar el select
                select.innerHTML = '';
                
                // Agregar la opción por defecto
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Seleccionar plantilla...';
                select.appendChild(defaultOption);
                
                // Agregar las plantillas
                plantillas.forEach(plantilla => {
                    const option = document.createElement('option');
                    option.value = plantilla.id;
                    
                    // Escapar el contenido HTML para el atributo data
                    const contenidoEscapado = plantilla.contenido
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    
                    option.dataset.contenido = contenidoEscapado;
                    option.textContent = plantilla.titulo;
                    select.appendChild(option);
                });
                
                // Restaurar el valor seleccionado si existía
                select.value = valorActual;
            });            
        } catch (error) {
            console.error('Error al actualizar plantillas:', error);
        }
    }
    
    // Agregar event listeners
    if (btnGestionPlantillas) {
        btnGestionPlantillas.addEventListener('click', function() {
            cargarPlantillas();
            // No necesitamos mostrar el modal aquí, ya se hace en editarAtencion.js
        });
    }
    
    if (btnNuevaPlantilla) {
        btnNuevaPlantilla.addEventListener('click', function() {
            if (formPlantilla) {
                formPlantilla.reset();
                formPlantilla.dataset.mode = 'create';
                formPlantilla.dataset.id = '';
                
                if (editorPlantilla) {
                    // Limpiar completamente el editor
                    editorPlantilla.setText('');                   
                }
                
                // Actualizar el título del modal
                const modalTitle = document.querySelector('#modalPlantilla .modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'Nueva Plantilla';
                }
                
                modalPlantilla.show();
            }
        });
    }
    
    if (formPlantilla) {
        formPlantilla.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const mode = this.dataset.mode || 'create';
                const plantillaId = this.dataset.id || '';
                const titulo = document.getElementById('titulo').value;
                
                // Obtener el contenido del editor de varias maneras posibles
                let contenido = '';
                let contenidoVacio = false;
                
                if (editorPlantilla) {
                    try {
                        // Método 1: Obtener directamente del innerHTML
                        contenido = editorPlantilla.root.innerHTML;
                        
                        // Verificar si el contenido está vacío
                        if (!contenido.trim() || contenido === '<p><br></p>') {
                            contenidoVacio = true;
                            contenido = '<p><br></p>'; // Mantener un párrafo vacío como contenido
                        }
                    } catch (editorError) {
                        console.error('Error al obtener contenido del editor:', editorError);
                        
                        // Intento alternativo: obtener directamente del elemento DOM
                        try {
                            const editorElement = document.querySelector('#editorPlantilla .ql-editor');
                            if (editorElement) {
                                contenido = editorElement.innerHTML;                                
                                // Verificar si el contenido está vacío
                                if (!contenido.trim() || contenido === '<p><br></p>') {
                                    contenidoVacio = true;
                                    contenido = '<p><br></p>'; // Mantener un párrafo vacío como contenido
                                }
                            }
                        } catch (domError) {
                            console.error('Error al obtener contenido del DOM:', domError);
                        }
                    }
                }
                
                // Verificar que tenemos contenido válido
                if (!contenido) {
                    // Si no se pudo obtener ningún contenido, usar un párrafo vacío
                    contenido = '<p><br></p>';
                    contenidoVacio = true;
                }
                
                // No modificar el contenido si el usuario quiere dejarlo vacío
                if (!contenidoVacio) {
                    // Asegurarse de que el contenido esté en formato HTML válido
                    if (!contenido.startsWith('<')) {
                        contenido = `<p>${contenido.replace(/\n/g, '<br>')}</p>`;
                    }
                }
                
                // Verificar campos obligatorios
                if (!titulo) {
                    alert('Por favor ingrese un título para la plantilla');
                    return;
                }
                
                const method = mode === 'edit' ? 'PUT' : 'POST';
                const url = mode === 'edit' ? `/api/plantillas/${plantillaId}` : '/api/plantillas';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ titulo, contenido })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error en la respuesta del servidor:', errorText);
                    throw new Error(`Error HTTP: ${response.status}. Detalles: ${errorText}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Plantilla guardada correctamente');
                    cargarPlantillas();
                    actualizarSelectPlantillas();
                    modalPlantilla.hide();
                } else {
                    console.error('Error reportado por el servidor:', result);
                    alert(result.message || 'Hubo un error al guardar la plantilla');
                }
            } catch (error) {
                console.error('Error al guardar plantilla:', error);
                alert(`Hubo un error al guardar la plantilla: ${error.message}`);
            }
        });
    }
    
    // Estas dos funciones deben ser accesibles desde fuera
    window.editarPlantilla = async function(id) {
        try {
            const response = await fetch(`/api/plantillas/${id}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantilla = await response.json();
            
            if (formPlantilla) {
                formPlantilla.dataset.mode = 'edit';
                formPlantilla.dataset.id = id;
                
                // Obtener el campo de título por su ID correcto
                const tituloInput = document.getElementById('titulo');
                if (tituloInput) {
                    tituloInput.value = plantilla.titulo;
                } else {
                    console.error('No se encontró el campo de título');
                }
                
                if (editorPlantilla) {
                    // Limpiar el editor antes de establecer nuevo contenido
                    editorPlantilla.root.innerHTML = '';
                    
                    // Verificar si la plantilla tiene contenido vacío
                    const contenidoVacio = !plantilla.contenido || plantilla.contenido.trim() === '' || plantilla.contenido === '<p><br></p>';
                    
                    if (contenidoVacio) {
                        editorPlantilla.setText('');
                    } else {
                        // Esperar a que el DOM se actualice antes de establecer el contenido
                        setTimeout(() => {
                            try {                                
                                // Método 1: Usar pasteHTML si está disponible (Quill v2)
                                if (editorPlantilla.clipboard && typeof editorPlantilla.clipboard.dangerouslyPasteHTML === 'function') {
                                    editorPlantilla.clipboard.dangerouslyPasteHTML(plantilla.contenido);
                                } 
                                // Método 2: Usar setContents con un delta convertido
                                else if (typeof htmlToDelta === 'function') {
                                    const delta = htmlToDelta(plantilla.contenido);
                                    if (delta) {
                                        editorPlantilla.setContents(delta);
                                    }
                                } 
                                // Método 3: Establecer innerHTML directamente
                                else {
                                    editorPlantilla.root.innerHTML = plantilla.contenido;
                                }
                                
                                // Forzar actualización del editor
                                editorPlantilla.update();
                  
                                // Si el contenido sigue vacío, intentar una vez más
                                if (!editorPlantilla.root.innerHTML.trim()) {
                                    editorPlantilla.root.innerHTML = plantilla.contenido;
                                    editorPlantilla.update();
                                }
                            } catch (error) {
                                console.error('Error al establecer contenido HTML:', error);
                                
                                // Último intento: establecer el HTML directamente
                                try {
                                    const editorElement = document.getElementById('editorPlantilla');
                                    if (editorElement) {
                                        // Desconectar temporalmente Quill
                                        const oldEditor = editorPlantilla;
                                        editorElement.innerHTML = plantilla.contenido;
                                        
                                        // Reinicializar Quill en el mismo elemento
                                        editorPlantilla = new window.Quill('#editorPlantilla', {
                                            theme: 'snow',
                                            modules: {
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                    [{ 'size': ['small', false, 'large'] }],
                                                    [{ 'color': [] }, { 'background': [] }],
                                                ]
                                            }
                                        });
                                    }
                                } catch (innerError) {
                                    console.error('Error en el último intento:', innerError);
                                    alert('Error al cargar el contenido de la plantilla');
                                }
                            }
                        }, 100); // Pequeño retraso para asegurar que el DOM esté listo
                    }
                } else {
                    console.error('Editor Quill no inicializado');
                }
                
                // Mostrar el modal después de cargar los datos
                if (modalPlantilla) {                    
                    // Actualizar el título del modal
                    const modalTitle = document.querySelector('#modalPlantilla .modal-title');
                    if (modalTitle) {
                        modalTitle.textContent = 'Editar Plantilla';
                    }
                    
                    // Esperar a que el contenido se establezca antes de mostrar el modal
                    setTimeout(() => {
                        modalPlantilla.show();
                        
                        // Verificar una vez más si el contenido se estableció correctamente
                        setTimeout(() => {
                            if (editorPlantilla && (!editorPlantilla.root.innerHTML.trim() || editorPlantilla.root.innerHTML === '<p><br></p>')) {
                                try {
                                    // Último intento después de que el modal esté visible
                                    editorPlantilla.root.innerHTML = plantilla.contenido;
                                    editorPlantilla.update();
                                } catch (e) {
                                    console.error('Error en el último intento después de mostrar el modal:', e);
                                }
                            }
                        }, 200);
                    }, 200);
                } else {
                    console.error('Modal de plantilla no inicializado');
                }
            } else {
                console.error('Formulario de plantilla no encontrado');
            }
        } catch (error) {
            console.error('Error al editar plantilla:', error);
            alert('Error al cargar la plantilla para editar');
        }
    };
    
    window.eliminarPlantilla = async function(id) {
        if (!confirm('¿Está seguro de eliminar esta plantilla?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/plantillas/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                cargarPlantillas();
                actualizarSelectPlantillas();
            } else {
                alert(result.message || 'Hubo un error al eliminar la plantilla');
            }
        } catch (error) {
            console.error('Error al eliminar plantilla:', error);
            alert('Hubo un error al eliminar la plantilla');
        }
    };
}
