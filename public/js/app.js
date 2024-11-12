// Importa los modulos necesarios para la aplicacion
import { initializeCalendar } from './modules/calendar.js';
import { initializeDataTable } from './modules/dataTable.js';
import { initializeRichText } from './modules/richText.js';

// Cuando el DOM esta completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene elementos del DOM necesarios
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId')?.value;
    let calendar;

    // Si existe el elemento calendario y el ID de usuario
    if (calendarEl && userId) {
        // Inicializa el calendario
        calendar = initializeCalendar(calendarEl, userId);

        // Maneja el cambio de especialidad medica
        const especialidadSelect = document.getElementById('especialidadSelect');
        if (especialidadSelect) {
            especialidadSelect.addEventListener('change', function() {
                // Refresca los eventos del calendario al cambiar la especialidad
                calendar.refetchEvents();
            });
        }
    }

    // Inicializa la tabla de datos y el editor de texto enriquecido
    initializeDataTable(1);
    initializeRichText();

    // Configura el modal de atenciones previas
    const modalAtencionesPrevias = document.getElementById('modalPrincipal');
    if (modalAtencionesPrevias) {
        modalAtencionesPrevias.addEventListener('show.bs.modal', handleModalShow);
    }
});

// Maneja la apertura del modal cuando se muestra
async function handleModalShow(event) {
    // Obtiene el boton que disparo el evento y el ID del paciente
    const button = event.relatedTarget;
    const idPaciente = button.getAttribute('data-id');
    
    try {
        // Carga la informacion basica del paciente usando su ID
        await infoPaciente(idPaciente);
        
        // Realiza una peticion para obtener el historial medico del paciente
        const response = await fetch(`/api/historial-medico/${idPaciente}`);
        const historial = await response.json();
        
        // Actualiza la tabla con el historial médico obtenido
        actualizarTablaHistorial(historial);
    } catch (error) {
        // Maneja cualquier error que ocurra durante la carga
        console.error('Error:', error);
        alert('Error al cargar la historia clínica');
    }
}

// Función para actualizar la tabla del historial médico
function actualizarTablaHistorial(historial) {
    // Obtiene el contenedor donde se mostrará la tabla
    const contenedor = document.getElementById('contenedorTablaConsultas');
    
    // Si ya existe una tabla DataTable, la destruye antes de crear una nueva
    if ($.fn.DataTable.isDataTable('#tablaHistoriaClinica')) {
        $('#tablaHistoriaClinica').DataTable().destroy();
    }
    
    // Crea la estructura HTML de la tabla
    let tabla = `
        <table class='table table-striped' id='tablaHistoriaClinica'>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Médico</th>
                    <th>Motivo</th>
                    <th>Diagnósticos</th>
                    <th>Evolución</th>
                    <th>Alergias</th>
                    <th>Antecedentes</th>
                    <th>Hábitos</th>
                    <th>Medicamentos</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Itera sobre cada registro del historial para crear las filas
    historial.forEach(registro => {
        tabla += `
            <tr>
                <td>${new Date(registro.fecha).toLocaleDateString('es-ES')}</td>
                <td>${registro.medico || '-'}</td>
                <td>${registro.motivo || '-'}</td>
                <td>${registro.diagnosticos || '-'}</td>
                <td>${registro.evolucion || '-'}</td>
                <td>${registro.alergias ? `${registro.alergias} (${registro.importancia_alergia})` : '-'}</td>
                <td>${registro.antecedentes || '-'}</td>
                <td>${registro.habitos || '-'}</td>
                <td>${registro.medicamentos || '-'}</td>
            </tr>
        `;
    });

    // Cierra la estructura de la tabla
    tabla += '</tbody></table>';
    contenedor.innerHTML = tabla;

    // Inicializa DataTable con configuraciones especificas
    $('#tablaHistoriaClinica').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' // Configurar en español
        },
        dom: 'Bfrtip', // Controles de la tabla
        scrollX: true, // Permite scroll horizontal
        lengthMenu: [ // Opciones de cantidad de registros a mostrar
            [5, 10, 25, 50, -1],
            ['5 Filas', '10 Filas', '25 Filas', '50 Filas', 'Ver Todo']
        ],
        order: [[0, 'desc']], // Ordena por fecha descendente
        searching: true, // Habilita la busqueda
        ordering: true, // Permite ordenamiento
        paging: true, // Habilita la paginacion
        info: true, // Muestra informacion sobre los registros
        autoWidth: false, // Desactiva el ancho automatico
        headerCallback: function(thead, data, start, end, display) {
            $(thead).find('th').css('background-color', '#f8f9fa'); // Estilo para encabezados
        }
    });
}

// mostrar los detalles del historial en un modal
function mostrarDetallesHistorial(registro) {
    // Crea el HTML del modal con los detalles del registro
    const modalHTML = `
        <div class="modal fade" id="modalDetalles" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles de la Atención</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${registro.evolucion ? `
                            <div class="mb-3">
                                <h6 class="text-primary">Evolución</h6>
                                <div>${registro.evolucion}</div>
                            </div>
                        ` : ''}
                        ${registro.alergias ? `
                            <div class="mb-3">
                                <h6 class="text-primary">Alergias</h6>
                                <div>${registro.alergias}</div>
                            </div>
                        ` : ''}
                        ${registro.antecedentes ? `
                            <div class="mb-3">
                                <h6 class="text-primary">Antecedentes Patológicos</h6>
                                <div>${registro.antecedentes}</div>
                            </div>
                        ` : ''}
                        ${registro.habitos ? `
                            <div class="mb-3">
                                <h6 class="text-primary">Hábitos</h6>
                                <div>${registro.habitos}</div>
                            </div>
                        ` : ''}
                        ${registro.medicamentos ? `
                            <div class="mb-3">
                                <h6 class="text-primary">Medicamentos en Uso</h6>
                                <div>${registro.medicamentos}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Elimina el modal anterior si existe
    const modalAnterior = document.getElementById('modalDetalles');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Agrega el nuevo modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Inicializa y muestra el modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
    modal.show();
}

// Función para cargar la información del paciente desde la API
async function infoPaciente(idPaciente) {
    // Obtiene la informacion del paciente
    const response = await fetch(`/api/informacionPaciente/${idPaciente}`);
    const data = await response.json();

    // Convierte el arreglo de datos a un objeto
    const paciente = await arregloAObjeto(data, "id");

    // Extrae los datos relevantes del paciente
    const { dni, apellido, nombre, telefono, email, sexo } = paciente[idPaciente];

    // Crea un objeto con los campos a actualizar
    const fields = {
        dniPaciente: dni,
        apellidoPaciente: apellido,
        nombrePaciente: nombre,
        telefonoPaciente: telefono,
        emailPaciente: email,
        sexoPaciente: sexo
    };

    // Actualiza cada campo del formulario con los datos del paciente
    for (const [id, value] of Object.entries(fields)) {
        document.getElementById(id).value = value;
    }
}

// Función auxiliar para convertir un arreglo en objeto usando una clave especifica
async function arregloAObjeto(arreglo, clave) {
    return arreglo.reduce((objeto, elemento) => {
      objeto[elemento[clave]] = elemento;
      return objeto;
    }, {});
}