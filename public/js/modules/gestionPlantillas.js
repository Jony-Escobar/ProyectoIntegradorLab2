export function initGestionPlantillas() {
    console.log('Inicializando gestionPlantillas.js');
    
    // Verificar que Quill está disponible globalmente
    if (typeof window.Quill === 'undefined') {
        console.error('Error: Quill no está disponible globalmente. La gestión de plantillas no funcionará correctamente.');
        return;
    }
    
    console.log('Usando Quill versión:', window.Quill.version);

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
    
    // Inicializar modales
    let modalGestion, modalPlantilla;
    
    try {
        modalGestion = new bootstrap.Modal('#modalGestionPlantillas');
        modalPlantilla = new bootstrap.Modal('#modalPlantilla');
    } catch (error) {
        console.error('Error al inicializar los modales:', error);
        return;
    }
    
    const btnNuevaPlantilla = document.getElementById('btnNuevaPlantilla');
    const formPlantilla = document.getElementById('formPlantilla');
    let editorPlantilla;

    // Inicializar el editor Quill para la plantilla con opciones compatibles con 2.0.3
    try {
        const editorElement = document.getElementById('editorPlantilla');
        if (editorElement) {
            console.log('Inicializando editor Quill para plantillas');
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
            console.log('Editor de plantillas inicializado correctamente');
        }
    } catch (error) {
        console.error('Error al inicializar el editor Quill para plantillas:', error);
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

    // Cargar plantillas
    async function cargarPlantillas() {
        try {
            console.log('Cargando plantillas');
            const response = await fetch('/api/plantillas');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantillas = await response.json();
            console.log('Plantillas cargadas:', plantillas.length);
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
            console.log('Actualizando selectores de plantillas');
            const response = await fetch('/api/plantillas');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantillas = await response.json();
            console.log('Plantillas obtenidas para selectores:', plantillas.length);
            
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
            
            console.log('Selectores de plantillas actualizados');
        } catch (error) {
            console.error('Error al actualizar plantillas:', error);
        }
    }
    
    // Agregar event listeners
    if (btnGestionPlantillas) {
        btnGestionPlantillas.addEventListener('click', function() {
            cargarPlantillas();
            modalGestion.show();
        });
    }
    
    if (btnNuevaPlantilla) {
        btnNuevaPlantilla.addEventListener('click', function() {
            if (formPlantilla) {
                formPlantilla.reset();
                formPlantilla.dataset.mode = 'create';
                formPlantilla.dataset.id = '';
                
                if (editorPlantilla) {
                    editorPlantilla.root.innerHTML = '';
                }
                
                modalPlantilla.show();
            }
        });
    }
    
    if (formPlantilla) {
        formPlantilla.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const mode = this.dataset.mode || 'create';
            const plantillaId = this.dataset.id || '';
            const titulo = document.getElementById('tituloPlantilla').value;
            const contenido = editorPlantilla ? editorPlantilla.root.innerHTML : '';
            
            if (!titulo || !contenido) {
                alert('Por favor complete todos los campos');
                return;
            }
            
            try {
                console.log('Guardando plantilla:', mode === 'edit' ? 'edición' : 'nueva');
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
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('Plantilla guardada con éxito');
                    cargarPlantillas();
                    actualizarSelectPlantillas();
                    modalPlantilla.hide();
                } else {
                    alert(result.message || 'Hubo un error al guardar la plantilla');
                }
            } catch (error) {
                console.error('Error al guardar plantilla:', error);
                alert('Hubo un error al guardar la plantilla');
            }
        });
    }
    
    // Estas dos funciones deben ser accesibles desde fuera
    window.editarPlantilla = async function(id) {
        try {
            console.log('Editando plantilla:', id);
            const response = await fetch(`/api/plantillas/${id}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const plantilla = await response.json();
            
            if (formPlantilla) {
                formPlantilla.dataset.mode = 'edit';
                formPlantilla.dataset.id = id;
                
                const tituloInput = document.getElementById('tituloPlantilla');
                if (tituloInput) {
                    tituloInput.value = plantilla.titulo;
                }
                
                if (editorPlantilla) {
                    // Intentar insertar el contenido como delta
                    try {
                        console.log('Contenido de plantilla:', plantilla.contenido);
                        const delta = htmlToDelta(plantilla.contenido);
                        if (delta) {
                            console.log('Aplicando contenido como delta');
                            editorPlantilla.setContents(delta);
                        } else {
                            console.log('Aplicando contenido como HTML');
                            editorPlantilla.root.innerHTML = plantilla.contenido;
                        }
                    } catch (error) {
                        console.error('Error al establecer contenido:', error);
                        // Intento alternativo
                        try {
                            editorPlantilla.root.innerHTML = plantilla.contenido;
                        } catch (innerError) {
                            console.error('Error en el método alternativo:', innerError);
                            alert('Error al cargar el contenido de la plantilla');
                        }
                    }
                }
                
                modalPlantilla.show();
            }
        } catch (error) {
            console.error('Error al editar plantilla:', error);
            alert('Hubo un error al cargar la plantilla');
        }
    };
    
    window.eliminarPlantilla = async function(id) {
        if (!confirm('¿Está seguro de eliminar esta plantilla?')) {
            return;
        }
        
        try {
            console.log('Eliminando plantilla:', id);
            const response = await fetch(`/api/plantillas/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Plantilla eliminada con éxito');
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
    
    console.log('Inicialización de gestionPlantillas.js completada');
}
