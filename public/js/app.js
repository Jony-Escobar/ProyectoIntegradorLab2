// Importa los modulos necesarios
import { initializeCalendar } from './modules/calendar.js';

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId')?.value;
    
    if (calendarEl && userId) {
        const calendar = initializeCalendar(calendarEl, userId);
        
        // Maneja cambio de especialidad
        const especialidadSelect = document.getElementById('especialidadSelect');
        if (especialidadSelect) {
            especialidadSelect.addEventListener('change', () => calendar.refetchEvents());
        }
    }

    // Configura modal de historia clínica
    const modalPrincipal = document.getElementById('modalPrincipal');
    if (modalPrincipal) {
        modalPrincipal.addEventListener('show.bs.modal', handleModalShow);
    }
});

// Maneja la apertura del modal de historia clínica
async function handleModalShow(event) {
    try {
        const idPaciente = event.relatedTarget.getAttribute('data-id');
        await Promise.all([
            cargarInfoPaciente(idPaciente),
            cargarHistorialMedico(idPaciente)
        ]);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar la historia clínica');
    }
}

// Carga y muestra la información del paciente
async function cargarInfoPaciente(idPaciente) {
    const response = await fetch(`/api/informacionPaciente/${idPaciente}`);
    const data = await response.json();
    const paciente = data[0];

    // Actualizar los elementos del modal con la información del paciente
    document.getElementById('dniPaciente').textContent = paciente.dni;
    document.getElementById('sexoPaciente').textContent = paciente.sexo;
    document.getElementById('nombreCompletoPaciente').textContent = 
        `${paciente.nombre} ${paciente.apellido}`;
    document.getElementById('telefonoPaciente').textContent = paciente.telefono || '-';
    document.getElementById('emailPaciente').textContent = paciente.email || '-';
}

// Carga y muestra el historial médico
async function cargarHistorialMedico(idPaciente) {
    try {
        const response = await fetch(`/api/historial-medico/${idPaciente}`);
        const data = await response.json();
        const medicoActualId = data.medicoActualId;
        const historial = data.historial;
        const ultimaAtencion = data.ultimaAtencion;
        
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = '';

        historial.forEach(consulta => {
            const row = document.createElement('tr');
            const tieneInformacionDetallada = consulta.evolucion !== null;
            const esUltimaAtencion = ultimaAtencion && consulta.id === ultimaAtencion.id;
            
            row.innerHTML = `
                <td>${consulta.fecha}</td>
                <td>${consulta.medico}</td>
                <td>${consulta.motivo}</td>
                <td>${consulta.diagnosticos || '-'}</td>
                <td>
                    ${tieneInformacionDetallada ? `
                        <div class="btn-group">
                            <button 
                                class="btn btn-sm btn-info ver-detalle-atencion"
                                data-atencion='${JSON.stringify(consulta)}'
                            >
                                Ver Más
                            </button>
                            ${esUltimaAtencion ? `
                                <button 
                                    class="btn btn-sm btn-warning editar-atencion"
                                    onclick="if (confirm('¿Estás seguro de querer editar ésta atención?')) { window.location.href='/atencion/editar/${consulta.id}' }"
                                >
                                    Editar
                                </button>
                            ` : ''}
                        </div>
                    ` : `
                        <span class="text-muted">
                            <small>No disponible</small>
                        </span>
                    `}
                </td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll('.ver-detalle-atencion').forEach(btn => {
            btn.addEventListener('click', mostrarDetalleAtencion);
        });
    } catch (error) {
        console.error('Error al cargar historial médico:', error);
        alert('Error al cargar el historial médico');
    }
}

function mostrarDetalleAtencion(e) {
    const atencion = JSON.parse(e.currentTarget.dataset.atencion);
    
    const modalContent = `
        <div class="modal fade" id="modalDetalleAtencion" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalle de Atención: ${atencion.fecha}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6 class="text-success">Información General</h6>
                            <p><strong>Médico:</strong> ${atencion.medico}</p>
                            <p><strong>Motivo:</strong> ${atencion.motivo}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Diagnósticos</h6>
                            <p>${atencion.diagnosticos || 'No registrado'}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Evolución</h6>
                            <p>${atencion.evolucion || 'No registrado'}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Alergias</h6>
                            <p>${atencion.alergias ? `${atencion.alergias} (${atencion.importancia_alergia})` : '<small>No registrado</small>'}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Antecedentes</h6>
                            <p>${atencion.antecedentes || '<small>No registrado</small>'}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Hábitos</h6>
                            <p>${atencion.habitos || '<small>No registrado</small>'}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-success">Medicamentos</h6>
                            <p>${atencion.medicamentos || '<small>No registrado</small>'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modalDetalleAtencion');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleAtencion'));
    modal.show();
}

// Actualiza la tabla de historial médico
function actualizarTablaHistorial(historial) {
    const contenedor = document.getElementById('contenedorTablaConsultas');
    if (!contenedor) return;

    // Destruir DataTable existente si existe
    if ($.fn.DataTable.isDataTable('#tablaHistoriaClinica')) {
        $('#tablaHistoriaClinica').DataTable().destroy();
    }

    const columnas = [
        { titulo: 'Fecha', campo: 'fecha'},
        { titulo: 'Médico', campo: 'medico' },
        { titulo: 'Motivo', campo: 'motivo' },
        { titulo: 'Diagnósticos', campo: 'diagnosticos' },
        { titulo: 'Evolución', campo: 'evolucion' },
        { titulo: 'Alergias', campo: 'alergias', formato: (alergias, registro) => 
            alergias ? `${alergias} (${registro.importancia_alergia})` : '-' },
        { titulo: 'Antecedentes', campo: 'antecedentes' },
        { titulo: 'Hábitos', campo: 'habitos' },
        { titulo: 'Medicamentos', campo: 'medicamentos' }
    ];

    contenedor.innerHTML = generarTablaHTML(columnas, historial);

    // Inicializa DataTable con configuración personalizada
    $('#tablaHistoriaClinica').DataTable({
        ...dataTableConfig,
        order: [[0, 'desc']]
    });
}