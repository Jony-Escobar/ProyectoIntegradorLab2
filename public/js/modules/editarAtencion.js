import { initGestionPlantillas } from '/js/modules/gestionPlantillas.js';
import { initializeRichText } from '/js/modules/richText.js';

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const btnAgregarAntecedente = document.getElementById('btnAgregarAntecedente');
    const btnAgregarHabito = document.getElementById('btnAgregarHabito');
    const btnAgregarNota = document.getElementById('btnAgregarNota');
    const btnAgregarAlergia = document.getElementById('btnAgregarAlergia');
    const btnAgregarMedicamento = document.getElementById('btnAgregarMedicamento');
    const btnAgregarDiagnostico = document.getElementById('btnAgregarDiagnostico');

    if (btnAgregarAntecedente) {
        btnAgregarAntecedente.addEventListener('click', () => agregarAntecedente());
    }

    if (btnAgregarHabito) {
        btnAgregarHabito.addEventListener('click', () => agregarHabito());
    }

    if (btnAgregarNota && !btnAgregarNota._listenerAdded) {
        btnAgregarNota.addEventListener('click', () => agregarNotaClinica());
        btnAgregarNota._listenerAdded = true;
    }

    if (btnAgregarAlergia) {
        btnAgregarAlergia.addEventListener('click', () => agregarAlergia());
    }

    if (btnAgregarMedicamento) {
        btnAgregarMedicamento.addEventListener('click', () => agregarMedicamento());
    }

    if (btnAgregarDiagnostico) {
        btnAgregarDiagnostico.addEventListener('click', () => agregarDiagnostico());
    }

    // Primero cargar los datos existentes
    cargarDatosExistentes();
    
    // Verificar si el botón existe antes de inicializar
    const btnGestionPlantillas = document.getElementById('btnGestionPlantillas');
    if (btnGestionPlantillas) {
        btnGestionPlantillas.addEventListener('click', function() {
            // Abrir el modal de gestión de plantillas
            const modalElement = document.getElementById('modalGestionPlantillas');
            if (modalElement) {
                const plantillasModal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Agregar manejador para el evento de cierre
                modalElement.addEventListener('hidden.bs.modal', function() {
                    // Limpiar cualquier estado o recurso que pueda estar causando problemas
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                });
                
                // Asegurarse de que el botón de cerrar funcione correctamente
                const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                if (closeButton) {
                    closeButton.addEventListener('click', function() {
                        plantillasModal.hide();
                    });
                }
                
                plantillasModal.show();
            } else {
                console.error('No se encontró el elemento del modal: modalGestionPlantillas');
            }
        });
        
        // Inicializar la gestión de plantillas
        initGestionPlantillas();
    }
    
    // Inicializar el editor de texto enriquecido después de cargar los datos
    initializeRichText();

    const formAtencion = document.getElementById('formAtencion');
    
    if (formAtencion) {
        formAtencion.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar que todos los campos abiertos estén completos
            let formValido = true;
            
            // Validar alergias
            const alergiasGroups = document.querySelectorAll('.alergia-grupo');
            alergiasGroups.forEach(grupo => {
                const alergiaSelect = grupo.querySelector('.alergia-select');
                const importanciaSelect = grupo.querySelector('.importancia-select');
                const fechaDesde = grupo.querySelector('.alergia-fecha-desde');
                
                if (alergiaSelect && !alergiaSelect.value) {
                    alergiaSelect.classList.add('is-invalid');
                    formValido = false;
                } else if (alergiaSelect) {
                    alergiaSelect.classList.remove('is-invalid');
                }
                
                if (importanciaSelect && !importanciaSelect.value) {
                    importanciaSelect.classList.add('is-invalid');
                    formValido = false;
                } else if (importanciaSelect) {
                    importanciaSelect.classList.remove('is-invalid');
                }
                
                if (fechaDesde && !fechaDesde.value) {
                    fechaDesde.classList.add('is-invalid');
                    formValido = false;
                } else if (fechaDesde) {
                    fechaDesde.classList.remove('is-invalid');
                }
            });
            
            // Validar antecedentes
            const antecedentesGroups = document.querySelectorAll('.antecedente-grupo');
            antecedentesGroups.forEach(grupo => {
                const descripcion = grupo.querySelector('.antecedente-texto');
                const fechaDesde = grupo.querySelector('.antecedente-fecha-desde');
                
                if (descripcion && !descripcion.value.trim()) {
                    descripcion.classList.add('is-invalid');
                    formValido = false;
                } else if (descripcion) {
                    descripcion.classList.remove('is-invalid');
                }
                
                if (fechaDesde && !fechaDesde.value) {
                    fechaDesde.classList.add('is-invalid');
                    formValido = false;
                } else if (fechaDesde) {
                    fechaDesde.classList.remove('is-invalid');
                }
            });
            
            // Validar hábitos
            const habitosGroups = document.querySelectorAll('.habito-grupo');
            habitosGroups.forEach(grupo => {
                const descripcion = grupo.querySelector('.habito-texto');
                const fechaDesde = grupo.querySelector('.habito-fecha-desde');
                
                if (descripcion && !descripcion.value.trim()) {
                    descripcion.classList.add('is-invalid');
                    formValido = false;
                } else if (descripcion) {
                    descripcion.classList.remove('is-invalid');
                }
                
                if (fechaDesde && !fechaDesde.value) {
                    fechaDesde.classList.add('is-invalid');
                    formValido = false;
                } else if (fechaDesde) {
                    fechaDesde.classList.remove('is-invalid');
                }
            });
            
            // Validar medicamentos
            const medicamentosGroups = document.querySelectorAll('.medicamento-grupo');
            medicamentosGroups.forEach(grupo => {
                const descripcion = grupo.querySelector('.medicamento-texto');
                
                if (descripcion && !descripcion.value.trim()) {
                    descripcion.classList.add('is-invalid');
                    formValido = false;
                } else if (descripcion) {
                    descripcion.classList.remove('is-invalid');
                }
            });
            
            // Si hay campos inválidos, mostrar mensaje y detener el envío
            if (!formValido) {
                alert("Por favor, complete todos los campos obligatorios o elimine los registros incompletos usando el botón X.");
                return;
            }
            
            try {
                const atencionId = window.location.pathname.split('/').pop();
                
                const formData = {
                    notasClinicas: Array.from(document.querySelectorAll('.nota-grupo')).map(grupo => ({
                        id: grupo.querySelector('.quill-editor')?.dataset?.notaId || null,
                        contenido: grupo.querySelector('.ql-editor')?.innerHTML?.trim()
                    })).filter(n => n.contenido && n.contenido !== '<p></p>' && n.contenido !== '<p><br></p>'),

                    diagnosticos: Array.from(document.querySelectorAll('.diagnostico-grupo')).map(grupo => ({
                        id: grupo.dataset.diagnosticoId || null,
                        descripcion: grupo.querySelector('.diagnostico-texto')?.value?.trim(),
                        tipoId: grupo.querySelector('.tipo-diagnostico')?.value
                    })).filter(d => d.descripcion && d.tipoId),

                    alergias: Array.from(document.querySelectorAll('.alergia-grupo')).map(grupo => ({
                        id: grupo.dataset.alergiaId || null,
                        alergiaId: grupo.querySelector('.alergia-select')?.value,
                        importanciaId: grupo.querySelector('.importancia-select')?.value,
                        fechaDesde: grupo.querySelector('.alergia-fecha-desde')?.value || null,
                        fechaHasta: grupo.querySelector('.alergia-fecha-hasta')?.value || null
                    })).filter(a => a.alergiaId && a.importanciaId),

                    antecedentes: Array.from(document.querySelectorAll('.antecedente-grupo')).map(grupo => ({
                        id: grupo.dataset.antecedenteId || null,
                        descripcion: grupo.querySelector('.antecedente-texto')?.value?.trim(),
                        fechaDesde: grupo.querySelector('.antecedente-fecha-desde')?.value || null,
                        fechaHasta: grupo.querySelector('.antecedente-fecha-hasta')?.value || null
                    })).filter(a => a.descripcion),

                    habitos: Array.from(document.querySelectorAll('.habito-grupo')).map(grupo => ({
                        id: grupo.dataset.habitoId || null,
                        descripcion: grupo.querySelector('.habito-texto')?.value?.trim(),
                        fechaDesde: grupo.querySelector('.habito-fecha-desde')?.value || null,
                        fechaHasta: grupo.querySelector('.habito-fecha-hasta')?.value || null
                    })).filter(h => h.descripcion),

                    medicamentos: Array.from(document.querySelectorAll('.medicamento-grupo')).map(grupo => ({
                        id: grupo.dataset.medicamentoId || null,
                        descripcion: grupo.querySelector('.medicamento-texto')?.value?.trim(),
                        fechaDesde: grupo.querySelector('.medicamento-fecha-desde')?.value || null,
                        fechaHasta: grupo.querySelector('.medicamento-fecha-hasta')?.value || null
                    })).filter(m => m.descripcion)
                };

                // Validaciones del lado del cliente
                if (!formData.notasClinicas.length) {
                    throw new Error('Debe incluir al menos una nota clínica');
                }

                if (!formData.diagnosticos.length) {
                    throw new Error('Debe incluir al menos un diagnóstico');
                }

                const response = await fetch(`/atencion/editar/${atencionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.mensaje || 'Error al actualizar la atención');
                }

                alert('Atención actualizada correctamente');
                window.location.href = '/agenda';

            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Error al guardar los cambios');
            }
        });
    }

    // Agregar event listeners para los botones de eliminar
    const containers = {
        'diagnostico': document.getElementById('diagnosticosContainer'),
        'alergia': document.getElementById('alergiasContainer'),
        'antecedente': document.getElementById('antecedentesContainer'),
        'habito': document.getElementById('habitosContainer'),
        'medicamento': document.getElementById('medicamentosContainer'),
        'nota': document.getElementById('notasClinicasContainer')
    };

    // Agregar delegación de eventos para cada contenedor
    Object.entries(containers).forEach(([tipo, container]) => {
        if (container) {
            container.addEventListener('click', function(e) {
                if (e.target.classList.contains(`btn-eliminar-${tipo}`)) {
                    const grupo = e.target.closest(`.${tipo}-grupo`);
                    if (grupo) {
                        grupo.remove();
                        
                        // Contar cuántos grupos quedan de este tipo
                        const gruposRestantes = container.querySelectorAll(`.${tipo}-grupo`).length;
                        
                        // Si no quedan grupos y no es un tipo obligatorio, mostrar "No registrado"
                        const tiposNoObligatorios = ['alergia', 'antecedente', 'habito', 'medicamento'];
                        if (tiposNoObligatorios.includes(tipo) && gruposRestantes === 0) {
                            // Verificar si ya existe el mensaje "No registrado"
                            const mensajeNoRegistrado = container.querySelector('.mensaje-no-registrado');
                            if (!mensajeNoRegistrado) {
                                container.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
                            }
                        }
                        
                        actualizarBotonesEliminar(tipo);
                    }
                }
            });
        }
    });

    // Agregar event listener para el botón Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            // Mostrar mensaje de confirmación
            const confirmar = confirm("¿Está seguro que desea cancelar? Se perderán todos los cambios no guardados.");
            
            // Si el usuario confirma, redirigir a la página de agenda
            if (confirmar) {
                window.location.href = '/agenda';
            }
            // Si el usuario cancela la confirmación, no hacer nada y permanecer en la página
        });
    }
});

// Función genérica para actualizar botones de eliminar
function actualizarBotonesEliminar(tipo) {
    // Obtener el contenedor según el tipo
    let container;
    switch (tipo) {
        case 'nota':
            container = document.getElementById('notasClinicasContainer');
            break;
        case 'diagnostico':
            container = document.getElementById('diagnosticosContainer');
            break;
        case 'alergia':
            container = document.getElementById('alergiasContainer');
            break;
        case 'antecedente':
            container = document.getElementById('antecedentesContainer');
            break;
        case 'habito':
            container = document.getElementById('habitosContainer');
            break;
        case 'medicamento':
            container = document.getElementById('medicamentosContainer');
            break;
        default:
            return;
    }

    if (!container) return;

    // Obtener todos los grupos del tipo específico
    const grupos = container.querySelectorAll(`.${tipo}-grupo`);
    
    // Los botones de eliminar solo deben estar deshabilitados para notas y diagnósticos
    // cuando hay solo uno, para el resto siempre deben estar habilitados
    const tiposObligatorios = ['nota', 'diagnostico'];
    const esObligatorio = tiposObligatorios.includes(tipo);
    
    // Para los tipos no obligatorios, si no quedan grupos, mostrar el mensaje "No registrado"
    const tiposNoObligatorios = ['alergia', 'antecedente', 'habito', 'medicamento'];
    if (tiposNoObligatorios.includes(tipo) && grupos.length === 0) {
        // Verificar si ya existe el mensaje "No registrado"
        const mensajeNoRegistrado = container.querySelector('.mensaje-no-registrado');
        if (!mensajeNoRegistrado) {
            container.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
        }
        return;
    }
    
    grupos.forEach(grupo => {
        const btnEliminar = grupo.querySelector(`.btn-eliminar-${tipo}`);
        if (btnEliminar) {
            // Si es de tipo obligatorio y solo hay uno, deshabilitar el botón
            // Si no, siempre habilitar el botón
            btnEliminar.disabled = esObligatorio && grupos.length === 1;
        }
    });
}

// Función para cargar diagnósticos existentes
function cargarDatosExistentes() {
    const formAtencion = document.getElementById('formAtencion');
    if (!formAtencion) return;

    try {
        const atencionData = JSON.parse(formAtencion.dataset.atencion);
        const plantillas = JSON.parse(formAtencion.dataset.plantillas || '[]');
        const tipos = JSON.parse(formAtencion.dataset.tipos);
        const alergias = JSON.parse(formAtencion.dataset.alergias);
        const importancias = JSON.parse(formAtencion.dataset.importancias);
        
        // Guardar datos en variables globales para uso en otras funciones
        window.tiposDiagnostico = tipos;
        window.alergias = alergias;
        window.importancias = importancias;
        window.plantillas = plantillas;

        // Función auxiliar para validar y formatear fechas
        const formatearFecha = (fecha) => {
            if (!fecha || fecha === '0000-00-00' || fecha === 'null') return '';
            return fecha;
        };

        // Cargar notas clínicas
        if (atencionData.notas_clinicas?.length) {
            const notasContainer = document.getElementById('notasClinicasContainer');
            notasContainer.innerHTML = '';
            
            atencionData.notas_clinicas.forEach(nota => {
                agregarNotaClinica(nota.nota);
            });
        }

        // Cargar diagnósticos
        if (atencionData.diagnosticos?.length) {
            const diagnosticosContainer = document.getElementById('diagnosticosContainer');
            diagnosticosContainer.innerHTML = '';
            
            atencionData.diagnosticos.forEach(diagnostico => {
                agregarDiagnostico(diagnostico.descripcion, diagnostico.tipo_id);
            });
        }

        // Cargar alergias y mostrar mensaje si no hay
        const alergiasContainer = document.getElementById('alergiasContainer');
        if (atencionData.alergias?.length) {
            alergiasContainer.innerHTML = '';
            
            atencionData.alergias.forEach(alergia => {
                agregarAlergia(
                    alergia.alergia_id,
                    alergia.importancia_id,
                    formatearFecha(alergia.fecha_desde),
                    formatearFecha(alergia.fecha_hasta)
                );
            });
            alergiasContainer.querySelector('.mensaje-no-registrado')?.remove();
        } else if (alergiasContainer) {
            // Vaciar el contenedor existente pero mantener el mensaje "No registrado" si existe
            const mensajeNoRegistrado = alergiasContainer.querySelector('.mensaje-no-registrado');
            if (!mensajeNoRegistrado) {
                alergiasContainer.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
            }
        }

        // Cargar medicamentos y mostrar mensaje si no hay
        const medicamentosContainer = document.getElementById('medicamentosContainer');
        if (atencionData.medicamentos?.length) {
            medicamentosContainer.innerHTML = '';
            
            atencionData.medicamentos.forEach(medicamento => {
                agregarMedicamento(medicamento.descripcion);
            });
            medicamentosContainer.querySelector('.mensaje-no-registrado')?.remove();
        } else if (medicamentosContainer) {
            // Vaciar el contenedor existente pero mantener el mensaje "No registrado" si existe
            const mensajeNoRegistrado = medicamentosContainer.querySelector('.mensaje-no-registrado');
            if (!mensajeNoRegistrado) {
                medicamentosContainer.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
            }
        }

        // Cargar antecedentes y mostrar mensaje si no hay
        const antecedentesContainer = document.getElementById('antecedentesContainer');
        if (atencionData.antecedentes?.length) {
            antecedentesContainer.innerHTML = '';
            
            atencionData.antecedentes.forEach(antecedente => {
                agregarAntecedente(
                    antecedente.descripcion,
                    formatearFecha(antecedente.fecha_desde),
                    formatearFecha(antecedente.fecha_hasta)
                );
            });
            antecedentesContainer.querySelector('.mensaje-no-registrado')?.remove();
        } else if (antecedentesContainer) {
            // Vaciar el contenedor existente pero mantener el mensaje "No registrado" si existe
            const mensajeNoRegistrado = antecedentesContainer.querySelector('.mensaje-no-registrado');
            if (!mensajeNoRegistrado) {
                antecedentesContainer.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
            }
        }

        // Cargar hábitos y mostrar mensaje si no hay
        const habitosContainer = document.getElementById('habitosContainer');
        if (atencionData.habitos?.length) {
            habitosContainer.innerHTML = '';
            
            atencionData.habitos.forEach(habito => {
                agregarHabito(
                    habito.descripcion,
                    formatearFecha(habito.fecha_desde),
                    formatearFecha(habito.fecha_hasta)
                );
            });
            habitosContainer.querySelector('.mensaje-no-registrado')?.remove();
        } else if (habitosContainer) {
            // Vaciar el contenedor existente pero mantener el mensaje "No registrado" si existe
            const mensajeNoRegistrado = habitosContainer.querySelector('.mensaje-no-registrado');
            if (!mensajeNoRegistrado) {
                habitosContainer.innerHTML = '<div class="mensaje-no-registrado"><span class="text-muted fst-italic">No registrado</span></div>';
            }
        }

    } catch (error) {
        console.error('Error al cargar datos existentes:', error);
    }

    const notasContainer = document.getElementById('notasClinicasContainer');
    
    if (notasContainer) {
        // Agregar event listener para eliminar notas
        notasContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-nota')) {
                const grupoNota = e.target.closest('.nota-grupo');
                if (grupoNota) {
                    grupoNota.remove();
                    const grupos = notasContainer.querySelectorAll('.nota-grupo');
                    grupos.forEach(grupo => {
                        const btnEliminar = grupo.querySelector('.btn-eliminar-nota');
                        if (btnEliminar) {
                            btnEliminar.disabled = grupos.length === 1;
                        }
                    });
                }
            }
        });
    }
}

// Función para agregar diagnóstico
function agregarDiagnostico(descripcion = '', tipoId = '') {
    const diagnosticosContainer = document.getElementById('diagnosticosContainer');
    if (!diagnosticosContainer) {
        console.error('No se encontró el contenedor de diagnósticos');
        return;
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 diagnostico-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Tipo</label>
            <select class="form-select tipo-diagnostico">
                <option value="">Seleccionar tipo</option>
                ${window.tiposDiagnostico.map(tipo => 
                    `<option value="${tipo.id}" ${tipo.id.toString() === tipoId.toString() ? 'selected' : ''}>${tipo.tipo}</option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-11">
            <textarea class="form-control diagnostico-texto" rows="3">${descripcion}</textarea>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-diagnostico">X</button>
        </div>
    `;
    diagnosticosContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('diagnostico');
}

function agregarAlergia(alergiaId = '', importanciaId = '', fechaDesde = '', fechaHasta = '') {
    const alergiasContainer = document.getElementById('alergiasContainer');
    if (!alergiasContainer) return;
    
    // Remover el mensaje "No registrado" si existe
    const mensajeNoRegistrado = alergiasContainer.querySelector('.mensaje-no-registrado');
    if (mensajeNoRegistrado) {
        mensajeNoRegistrado.remove();
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 alergia-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-3">
            <label class="form-label">Alergia <span class="text-danger">*</span></label>
            <select class="form-select alergia-select" required>
                <option value="">Seleccionar Alergia</option>
                ${window.alergias.map(alergia => 
                    `<option value="${alergia.id}" ${alergia.id.toString() === alergiaId.toString() ? 'selected' : ''}>
                        ${alergia.alergia}
                    </option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Importancia <span class="text-danger">*</span></label>
            <select class="form-select importancia-select" required>
                <option value="">Seleccionar Importancia</option>
                ${window.importancias.map(importancia => 
                    `<option value="${importancia.id}" ${importancia.id.toString() === importanciaId.toString() ? 'selected' : ''}>
                        ${importancia.importancia}
                    </option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Desde <span class="text-danger">*</span></label>
            <input type="date" class="form-control alergia-fecha-desde" value="${fechaDesde || new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Hasta</label>
            <input type="date" class="form-control alergia-fecha-hasta" value="${fechaHasta || ''}">
        </div>
        <div class="col-md-1 btn-group-bottom">
            <button type="button" class="btn btn-danger btn-eliminar-alergia">X</button>
        </div>
    `;
    alergiasContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('alergia');
}

function agregarMedicamento(descripcion = '') {
    const medicamentosContainer = document.getElementById('medicamentosContainer');
    if (!medicamentosContainer) return;
    
    // Remover el mensaje "No registrado" si existe
    const mensajeNoRegistrado = medicamentosContainer.querySelector('.mensaje-no-registrado');
    if (mensajeNoRegistrado) {
        mensajeNoRegistrado.remove();
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 medicamento-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-11">
            <label class="form-label">Descripción <span class="text-danger">*</span></label>
            <textarea class="form-control medicamento-texto" rows="3" required>${descripcion}</textarea>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-medicamento">X</button>
        </div>
    `;
    medicamentosContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('medicamento');
}

function agregarAntecedente(descripcion = '', fechaDesde = '', fechaHasta = '') {
    const antecedentesContainer = document.getElementById('antecedentesContainer');
    if (!antecedentesContainer) return;
    
    // Remover el mensaje "No registrado" si existe
    const mensajeNoRegistrado = antecedentesContainer.querySelector('.mensaje-no-registrado');
    if (mensajeNoRegistrado) {
        mensajeNoRegistrado.remove();
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 antecedente-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Descripción <span class="text-danger">*</span></label>
            <textarea class="form-control antecedente-texto" rows="3" required>${descripcion}</textarea>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Desde <span class="text-danger">*</span></label>
            <input type="date" class="form-control antecedente-fecha-desde" value="${fechaDesde || new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Hasta</label>
            <input type="date" class="form-control antecedente-fecha-hasta" value="${fechaHasta || ''}">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-antecedente">X</button>
        </div>
    `;
    antecedentesContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('antecedente');
}

function agregarHabito(descripcion = '', fechaDesde = '', fechaHasta = '') {
    const habitosContainer = document.getElementById('habitosContainer');
    if (!habitosContainer) return;
    
    // Remover el mensaje "No registrado" si existe
    const mensajeNoRegistrado = habitosContainer.querySelector('.mensaje-no-registrado');
    if (mensajeNoRegistrado) {
        mensajeNoRegistrado.remove();
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 habito-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Descripción <span class="text-danger">*</span></label>
            <textarea class="form-control habito-texto" rows="3" required>${descripcion}</textarea>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Desde <span class="text-danger">*</span></label>
            <input type="date" class="form-control habito-fecha-desde" value="${fechaDesde || new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Hasta</label>
            <input type="date" class="form-control habito-fecha-hasta" value="${fechaHasta || ''}">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-habito">X</button>
        </div>
    `;
    habitosContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('habito');
}

function agregarElemento(tipo, container, html) {
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = `row g-3 ${tipo}-grupo mb-2`;
    nuevoGrupo.innerHTML = html;
    container.appendChild(nuevoGrupo);
    actualizarBotonesEliminar(tipo);
}

async function agregarNotaClinica(contenido = '') {
    // Refrescar la lista de plantillas antes de crear la nueva nota
    try {
        const response = await fetch('/api/plantillas');
        if (response.ok) {
            window.plantillas = await response.json();
        }
    } catch (error) {
        console.error('Error al actualizar plantillas:', error);
    }
    
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 nota-grupo mb-2';
    
    // Crear el HTML para las plantillas con escape apropiado
    let plantillasHTML = '';
    if (window.plantillas && window.plantillas.length) {
        plantillasHTML = `
            <div class="mb-3">
                <select class="form-select plantilla-select">
                    <option value="">Seleccionar plantilla...</option>
                    ${window.plantillas.map(plantilla => {
                        // Escapar el contenido HTML para el atributo data
                        const contenidoEscapado = plantilla.contenido
                            .replace(/&/g, '&amp;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');
                        
                        return `<option value="${plantilla.id}" data-contenido="${contenidoEscapado}">${plantilla.titulo}</option>`;
                    }).join('')}
                </select>
            </div>
        `;
    }
    
    nuevoGrupo.innerHTML = `
        <div class="col-md-11">
            ${plantillasHTML}
            <div class="editor-container">
                <div class="quill-editor"></div>
            </div>
        </div>
        <div class="col-md-1 d-flex align-items-center">
            <button type="button" class="btn btn-danger btn-eliminar-nota">X</button>
        </div>
    `;

    const notasContainer = document.getElementById('notasClinicasContainer');
    notasContainer.appendChild(nuevoGrupo);
    
    // Inicializar el editor de texto enriquecido
    const quillEditor = new Quill(nuevoGrupo.querySelector('.quill-editor'), {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }]
            ]
        }
    });
    
    // Establecer contenido si existe
    if (contenido) {
        quillEditor.root.innerHTML = contenido;
    }
    
    // Agregar event listener para la plantilla
    const plantillaSelect = nuevoGrupo.querySelector('.plantilla-select');
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
    
    actualizarBotonesEliminar('nota');
}
