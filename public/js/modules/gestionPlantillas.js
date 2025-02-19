export function initGestionPlantillas() {
    // Esperar a que Bootstrap esté disponible
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap no está cargado');
        return;
    }

    const modalGestion = new bootstrap.Modal('#modalGestionPlantillas');
    const modalPlantilla = new bootstrap.Modal('#modalPlantilla');
    const btnGestionPlantillas = document.getElementById('btnGestionPlantillas');
    const btnNuevaPlantilla = document.getElementById('btnNuevaPlantilla');
    const formPlantilla = document.getElementById('formPlantilla');
    let editorPlantilla;

    // Inicializar el editor Quill para la plantilla
    editorPlantilla = new Quill('#editorPlantilla', {
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

    // Cargar plantillas
    async function cargarPlantillas() {
        try {
            const response = await fetch('/api/plantillas');
            const plantillas = await response.json();
            const tbody = document.getElementById('tablePlantillas');
            tbody.innerHTML = plantillas.map(plantilla => `
                <tr>
                    <td>${plantilla.titulo}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editarPlantilla(${plantilla.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarPlantilla(${plantilla.id})">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error cargando plantillas:', error);
            alert('Error al cargar las plantillas');
        }
    }

    // Event Listeners
    btnGestionPlantillas.addEventListener('click', () => {
        cargarPlantillas();
        modalGestion.show();
    });

    btnNuevaPlantilla.addEventListener('click', () => {
        formPlantilla.reset();
        formPlantilla.id.value = '';
        editorPlantilla.root.innerHTML = '';
        document.querySelector('#modalPlantilla .modal-title').textContent = 'Nueva Plantilla';
        modalPlantilla.show();
    });

    formPlantilla.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            id: formPlantilla.id.value,
            titulo: formPlantilla.titulo.value,
            contenido: editorPlantilla.root.innerHTML
        };

        try {
            const url = datos.id ? `/api/plantillas/${datos.id}` : '/api/plantillas';
            const method = datos.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) throw new Error('Error en la operación');

            // Primero actualizamos los datos
            await cargarPlantillas();
            await actualizarSelectPlantillas();
            
            // Luego cerramos el modal
            modalPlantilla.hide();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la plantilla');
        }
    });

    // Funciones para editar y eliminar
    window.editarPlantilla = async (id) => {
        try {
            const response = await fetch(`/api/plantillas/${id}`);
            const plantilla = await response.json();
            
            formPlantilla.id.value = plantilla.id;
            formPlantilla.titulo.value = plantilla.titulo;
            editorPlantilla.root.innerHTML = plantilla.contenido;
            
            document.querySelector('#modalPlantilla .modal-title').textContent = 'Editar Plantilla';
            modalPlantilla.show();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar la plantilla');
        }
    };

    window.eliminarPlantilla = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta plantilla?')) return;
        
        try {
            const response = await fetch(`/api/plantillas/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar');
            
            cargarPlantillas();
            actualizarSelectPlantillas();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la plantilla');
        }
    };

    async function actualizarSelectPlantillas() {
        try {
            const response = await fetch('/api/plantillas');
            const plantillas = await response.json();
            
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
                    option.dataset.contenido = plantilla.contenido;
                    option.textContent = plantilla.titulo;
                    select.appendChild(option);
                });
                
                // Restaurar el valor seleccionado si existía
                select.value = valorActual;
            });
        } catch (error) {
            console.error('Error actualizando selectores:', error);
        }
    }
}
