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
        
        const contenedor = document.getElementById('contenedorHistorial');
        contenedor.innerHTML = '';

        // Crear contenedor de cards con grid
        const cardContainer = document.createElement('div');
        cardContainer.className = 'row row-cols-1 row-cols-md-2 g-4';
        
        historial.forEach(consulta => {
            const tieneInformacionDetallada = consulta.evolucion !== null;
            const esUltimaAtencion = ultimaAtencion && consulta.id === ultimaAtencion.id;
            
            // Mostrar diagnósticos en formato de lista en lugar de badges
            let diagnosticosHTML = '<p class="text-muted">No hay diagnósticos registrados</p>';
            if (consulta.diagnosticos) {
                const diagnosticosList = consulta.diagnosticos.split('; ');
                diagnosticosHTML = `
                    <ul class="list-group list-group-flush">
                        ${diagnosticosList.map(diagnostico => 
                            `<li class="list-group-item py-1">• ${diagnostico}</li>`
                        ).join('')}
                    </ul>
                `;
            }
            
            const cardCol = document.createElement('div');
            cardCol.className = 'col';
            cardCol.innerHTML = `
                <div class="card h-100 border-success">
                    <div class="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${consulta.fecha}</span>
                        <span class="badge bg-success bg-opacity-75">${consulta.medico}</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-success">
                            <i class="fas fa-clipboard-list me-2"></i>Motivo: <span class="text-dark">${consulta.motivo}</span>
                        </h5>
                        <div class="card-text mt-3">
                            <h6 class="text-success">
                                <i class="fas fa-stethoscope me-2"></i>Diagnósticos:
                            </h6>
                            ${diagnosticosHTML}
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        ${tieneInformacionDetallada ? `
                            <div class="d-flex justify-content-end">
                                <button 
                                    class="btn btn-sm btn-outline-success me-2 ver-detalle-atencion"
                                    data-atencion='${JSON.stringify(consulta)}'
                                >
                                    <i class="fas fa-eye me-1"></i>Ver Detalle
                                </button>
                                ${esUltimaAtencion ? `
                                    <button 
                                        class="btn btn-sm btn-outline-warning editar-atencion"
                                        onclick="if (confirm('¿Estás seguro de querer editar ésta atención?')) { window.location.href='/atencion/editar/${consulta.id}' }"
                                    >
                                        <i class="fas fa-edit me-1"></i>Editar
                                    </button>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="text-center">
                                <span class="text-muted">
                                    <small><i class="fas fa-lock me-1"></i>Información no disponible</small>
                                </span>
                            </div>
                        `}
                    </div>
                </div>
            `;
            cardContainer.appendChild(cardCol);
        });
        
        contenedor.appendChild(cardContainer);

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
    
    // Función auxiliar para formatear fechas
    const formatearFecha = (fecha) => {
        if (!fecha || fecha === '0000-00-00' || fecha === 'null') return null;
        // Asumimos que la fecha viene en formato YYYY-MM-DD
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return fecha;
    };
    
    // Función para mostrar rango de fechas
    const mostrarRangoFechas = (fechaDesde, fechaHasta) => {
        const desde = formatearFecha(fechaDesde);
        const hasta = formatearFecha(fechaHasta);
        
        if (desde && hasta) {
            return `<span class="text-muted">(${desde} - ${hasta})</span>`;
        } else if (desde) {
            return `<span class="text-muted">(Desde: ${desde})</span>`;
        } else if (hasta) {
            return `<span class="text-muted">(Hasta: ${hasta})</span>`;
        }
        return '';
    };
    
    const modalContent = `
        <div class="modal fade" id="modalDetalleAtencion" tabindex="-1">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Detalle de Atención: ${atencion.fecha}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <!-- Información General -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-info-circle me-2"></i>Información General</h6>
                                    </div>
                                    <div class="card-body">
                                        <p><strong>Médico:</strong> ${atencion.medico}</p>
                                        <p><strong>Motivo:</strong> ${atencion.motivo}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Diagnósticos -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-stethoscope me-2"></i>Diagnósticos</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.diagnosticos ? 
                                            (() => {
                                                const diagnosticosList = atencion.diagnosticos.split('; ');
                                                const tiposList = atencion.tipos_diagnostico ? atencion.tipos_diagnostico.split('; ') : [];
                                                
                                                return `<ul class="list-group list-group-flush">
                                                    ${diagnosticosList.map((diagnostico, index) => {
                                                        const tipo = tiposList[index] || 'No especificado';
                                                        let badgeClass = 'bg-secondary';
                                                        
                                                        if (tipo.toLowerCase().includes('confirmado')) {
                                                            badgeClass = 'bg-success';
                                                        } else if (tipo.toLowerCase().includes('preliminar')) {
                                                            badgeClass = 'bg-warning text-dark';
                                                        }
                                                        
                                                        return `<li class="list-group-item">
                                                            • ${diagnostico} 
                                                            <span class="badge ${badgeClass} ms-2">${tipo}</span>
                                                        </li>`;
                                                    }).join('')}
                                                </ul>`;
                                            })() : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Evolución -->
                            <div class="col-md-12 mb-3">
                                <div class="card border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-notes-medical me-2"></i>Notas</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.evolucion ? 
                                            atencion.evolucion.split('; ').map(nota => 
                                                `<div class="mb-2 p-2 border-bottom">${nota}</div>`
                                            ).join('') : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Alergias -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-allergies me-2"></i>Alergias</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.alergias ? 
                                            (() => {
                                                const alergiasArray = atencion.alergias.split('; ');
                                                const importanciasArray = atencion.importancia_alergia ? atencion.importancia_alergia.split('; ') : [];
                                                const fechasDesdeArray = atencion.alergias_fecha_desde ? atencion.alergias_fecha_desde.split('; ') : [];
                                                const fechasHastaArray = atencion.alergias_fecha_hasta ? atencion.alergias_fecha_hasta.split('; ') : [];
                                                
                                                return `<ul class="list-group list-group-flush">
                                                    ${alergiasArray.map((alergia, index) => {
                                                        const importancia = importanciasArray[index] || 'No especificada';
                                                        const fechaDesde = fechasDesdeArray[index] || '';
                                                        const fechaHasta = fechasHastaArray[index] || '';
                                                        let textClass = '';
                                                        
                                                        if (importancia.toLowerCase().includes('alta')) {
                                                            textClass = 'text-danger';
                                                        } else if (importancia.toLowerCase().includes('media')) {
                                                            textClass = 'text-warning';
                                                        } else if (importancia.toLowerCase().includes('baja')) {
                                                            textClass = 'text-info';
                                                        }
                                                        
                                                        return `<li class="list-group-item">
                                                            • ${alergia} <span class="${textClass}">(${importancia})</span>
                                                            <div class="small mt-1">
                                                                ${mostrarRangoFechas(fechaDesde, fechaHasta)}
                                                            </div>
                                                        </li>`;
                                                    }).join('')}
                                                </ul>`;
                                            })() : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Antecedentes -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-history me-2"></i>Antecedentes Patológicos</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.antecedentes ? 
                                            (() => {
                                                const antecedentesArray = atencion.antecedentes.split('; ');
                                                const fechasDesdeArray = atencion.antecedentes_fecha_desde ? atencion.antecedentes_fecha_desde.split('; ') : [];
                                                const fechasHastaArray = atencion.antecedentes_fecha_hasta ? atencion.antecedentes_fecha_hasta.split('; ') : [];
                                                
                                                return `<ul class="list-group list-group-flush">
                                                    ${antecedentesArray.map((antecedente, index) => {
                                                        const fechaDesde = fechasDesdeArray[index] || '';
                                                        const fechaHasta = fechasHastaArray[index] || '';
                                                        
                                                        return `<li class="list-group-item">
                                                            • ${antecedente}
                                                            <div class="small mt-1">
                                                                ${mostrarRangoFechas(fechaDesde, fechaHasta)}
                                                            </div>
                                                        </li>`;
                                                    }).join('')}
                                                </ul>`;
                                            })() : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Hábitos -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-walking me-2"></i>Hábitos</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.habitos ? 
                                            (() => {
                                                const habitosArray = atencion.habitos.split('; ');
                                                const fechasDesdeArray = atencion.habitos_fecha_desde ? atencion.habitos_fecha_desde.split('; ') : [];
                                                const fechasHastaArray = atencion.habitos_fecha_hasta ? atencion.habitos_fecha_hasta.split('; ') : [];
                                                
                                                return `<ul class="list-group list-group-flush">
                                                    ${habitosArray.map((habito, index) => {
                                                        const fechaDesde = fechasDesdeArray[index] || '';
                                                        const fechaHasta = fechasHastaArray[index] || '';
                                                        
                                                        return `<li class="list-group-item">
                                                            • ${habito}
                                                            <div class="small mt-1">
                                                                ${mostrarRangoFechas(fechaDesde, fechaHasta)}
                                                            </div>
                                                        </li>`;
                                                    }).join('')}
                                                </ul>`;
                                            })() : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Medicamentos -->
                            <div class="col-md-6 mb-3">
                                <div class="card h-100 border-success">
                                    <div class="card-header bg-success bg-opacity-10">
                                        <h6 class="text-success mb-0"><i class="fas fa-pills me-2"></i>Medicamentos en uso</h6>
                                    </div>
                                    <div class="card-body">
                                        ${atencion.medicamentos ? 
                                            (() => {
                                                const medicamentosArray = atencion.medicamentos.split('; ');
                                                const fechasDesdeArray = atencion.medicamentos_fecha_desde ? atencion.medicamentos_fecha_desde.split('; ') : [];
                                                const fechasHastaArray = atencion.medicamentos_fecha_hasta ? atencion.medicamentos_fecha_hasta.split('; ') : [];
                                                
                                                return `<ul class="list-group list-group-flush">
                                                    ${medicamentosArray.map((medicamento, index) => {
                                                        const fechaDesde = fechasDesdeArray[index] || '';
                                                        const fechaHasta = fechasHastaArray[index] || '';
                                                        
                                                        return `<li class="list-group-item">
                                                            • ${medicamento}
                                                            <div class="small mt-1">
                                                                ${mostrarRangoFechas(fechaDesde, fechaHasta)}
                                                            </div>
                                                        </li>`;
                                                    }).join('')}
                                                </ul>`;
                                            })() : 
                                            '<span class="text-muted">No registrado</span>'
                                        }
                                    </div>
                                </div>
                            </div>
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