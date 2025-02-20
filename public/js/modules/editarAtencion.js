import { initGestionPlantillas } from '/js/modules/gestionPlantillas.js';
import { initializeRichText } from '/js/modules/richText.js';

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const btnAgregarAntecedente = document.getElementById('btnAgregarAntecedente');
    const btnAgregarHabito = document.getElementById('btnAgregarHabito');
    const btnAgregarNota = document.getElementById('btnAgregarNota');

    if (btnAgregarAntecedente) {
        btnAgregarAntecedente.addEventListener('click', () => agregarAntecedente());
    }

    if (btnAgregarHabito) {
        btnAgregarHabito.addEventListener('click', () => agregarHabito());
    }

    if (btnAgregarNota) {
        btnAgregarNota.addEventListener('click', () => agregarNotaClinica());
    }

    // Primero cargar los datos existentes
    cargarDatosExistentes();
    
    // Verificar si el botón existe antes de inicializar
    const btnGestionPlantillas = document.getElementById('btnGestionPlantillas');
    if (btnGestionPlantillas) {
        initGestionPlantillas();
    }
    
    // Inicializar el editor de texto enriquecido después de cargar los datos
    initializeRichText();

    const formAtencion = document.getElementById('formAtencion');
    
    if (formAtencion) {
        formAtencion.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const atencionId = window.location.pathname.split('/').pop();
                
                const formData = {
                    notasClinicas: [{
                        id: document.querySelector('.quill-editor').dataset.notaId,
                        contenido: document.querySelector('.ql-editor').innerHTML.trim()
                    }],
                    diagnosticos: Array.from(document.querySelectorAll('.diagnostico-grupo'))
                        .map(grupo => ({
                            id: grupo.dataset.diagnosticoId,
                            descripcion: grupo.querySelector('.diagnostico-texto').value.trim(),
                            tipoId: grupo.querySelector('.tipo-diagnostico').value
                        }))
                        .filter(d => d.descripcion && d.tipoId),
                    alergias: Array.from(document.querySelectorAll('.alergia-grupo'))
                        .map(grupo => ({
                            id: grupo.dataset.alergiaId,
                            alergiaId: grupo.querySelector('.alergia-select').value,
                            importanciaId: grupo.querySelector('.importancia-select').value,
                            fechaDesde: grupo.querySelector('.alergia-fecha-desde').value || new Date().toISOString().split('T')[0],
                            fechaHasta: grupo.querySelector('.alergia-fecha-hasta').value || null
                        }))
                        .filter(a => a.alergiaId && a.importanciaId)
                };

                const response = await fetch(`/atencion/editar/${atencionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.mensaje || 'Error al actualizar la atención');
                }

                alert('Atención actualizada correctamente');
                window.location.href = '/api/agenda'; // Cambiado a la ruta correcta

            } catch (error) {
                console.error('Error:', error);
                alert('Error al guardar los cambios: ' + error.message);
            }
        });
    }
});

// Función genérica para actualizar botones de eliminar
function actualizarBotonesEliminar(tipo) {
    const container = document.getElementById(`${tipo}sContainer`);
    if (!container) return;
    
    const grupos = container.querySelectorAll(`.${tipo}-grupo`);
    grupos.forEach(grupo => {
        const btnEliminar = grupo.querySelector(`.btn-eliminar-${tipo}`);
        btnEliminar.disabled = grupos.length === 1;
    });
}

// Definir las funciones primero
function agregarDiagnostico(descripcion = '', tipoId = '') {
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 diagnostico-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Tipo</label>
            <select class="form-select tipo-diagnostico">
                <option value="">Seleccionar tipo</option>
                ${window.tiposDiagnostico.map(tipo => 
                    `<option value="${tipo.id}" ${tipo.id === tipoId ? 'selected' : ''}>${tipo.tipo}</option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-11">
            <label class="form-label">Descripción</label>
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
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 alergia-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-3">
            <label class="form-label">Alergia</label>
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
            <label class="form-label">Importancia</label>
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
            <label class="form-label">Fecha Desde</label>
            <input type="date" class="form-control alergia-fecha-desde" value="${fechaDesde || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Hasta</label>
            <input type="date" class="form-control alergia-fecha-hasta" value="${fechaHasta || ''}">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-alergia">X</button>
        </div>
    `;
    alergiasContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('alergia');
}

function agregarMedicamento(descripcion = '') {
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 medicamento-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-11">
            <label class="form-label">Descripción</label>
            <textarea class="form-control medicamento-texto" rows="3">${descripcion}</textarea>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-eliminar-medicamento">X</button>
        </div>
    `;
    medicamentosContainer.appendChild(nuevoGrupo);
    actualizarBotonesEliminar('medicamento');
}

function agregarAntecedente(descripcion = '', fechaDesde = '', fechaHasta = '') {
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 antecedente-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <textarea class="form-control antecedente-texto" rows="3">${descripcion}</textarea>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Desde</label>
            <input type="date" class="form-control antecedente-fecha-desde" value="${fechaDesde || ''}">
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
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'row g-3 habito-grupo mb-2';
    nuevoGrupo.innerHTML = `
        <div class="col-md-6">
            <textarea class="form-control habito-texto" rows="3">${descripcion}</textarea>
        </div>
        <div class="col-md-2">
            <label class="form-label">Fecha Desde</label>
            <input type="date" class="form-control habito-fecha-desde" value="${fechaDesde || ''}">
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

        // Cargar notas clínicas
        if (atencionData.notas_clinicas?.length) {
            const notasContainer = document.getElementById('notasClinicasContainer');
            notasContainer.innerHTML = '';
            
            atencionData.notas_clinicas.forEach(nota => {
                const nuevoGrupo = document.createElement('div');
                nuevoGrupo.className = 'row g-3 nota-grupo mb-2';
                nuevoGrupo.innerHTML = `
                    <div class="col-md-11">
                        <div class="mb-3">
                            <select class="form-select plantilla-select">
                                <option value="">Seleccionar plantilla...</option>
                                ${plantillas.map(plantilla => 
                                    `<option value="${plantilla.id}" data-contenido="${plantilla.contenido}">
                                        ${plantilla.titulo}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="editor-container">
                            <div class="quill-editor" data-nota-id="${nota.id}"></div>
                        </div>
                    </div>
                    <div class="col-md-1 d-flex align-items-center">
                        <button type="button" class="btn btn-danger btn-eliminar-nota">X</button>
                    </div>
                `;
                notasContainer.appendChild(nuevoGrupo);

                const quill = new Quill(nuevoGrupo.querySelector('.quill-editor'), {
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

                if (nota.nota) {
                    quill.root.innerHTML = nota.nota;
                }

                const plantillaSelect = nuevoGrupo.querySelector('.plantilla-select');
                if (plantillaSelect) {
                    plantillaSelect.addEventListener('change', function() {
                        const selectedOption = this.options[this.selectedIndex];
                        if (selectedOption.dataset.contenido) {
                            quill.root.innerHTML = selectedOption.dataset.contenido;
                        }
                    });
                }
            });

            actualizarBotonesEliminar('nota');
        }

        // Cargar diagnósticos
        if (atencionData.diagnosticos?.length) {
            const diagnosticosContainer = document.getElementById('diagnosticosContainer');
            diagnosticosContainer.innerHTML = '';
            
            atencionData.diagnosticos.forEach(diagnostico => {
                agregarDiagnostico(diagnostico.descripcion, diagnostico.tipo_id);
            });
        }

        // Cargar alergias
        if (atencionData.alergias?.length) {
            const alergiasContainer = document.getElementById('alergiasContainer');
            alergiasContainer.innerHTML = '';
            
            atencionData.alergias.forEach(alergia => {
                agregarAlergia(
                    alergia.alergia_id,
                    alergia.importancia_id,
                    alergia.fecha_desde,
                    alergia.fecha_hasta
                );
            });
        }

        // Cargar medicamentos
        if (atencionData.medicamentos?.length) {
            const medicamentosContainer = document.getElementById('medicamentosContainer');
            medicamentosContainer.innerHTML = '';
            
            atencionData.medicamentos.forEach(medicamento => {
                agregarMedicamento(medicamento.descripcion);
            });
        }

        // Cargar antecedentes
        if (atencionData.antecedentes?.length) {
            const antecedentesContainer = document.getElementById('antecedentesContainer');
            antecedentesContainer.innerHTML = '';
            
            atencionData.antecedentes.forEach(antecedente => {
                agregarAntecedente(
                    antecedente.descripcion,
                    antecedente.fecha_desde,
                    antecedente.fecha_hasta
                );
            });
        }

        // Cargar hábitos
        if (atencionData.habitos?.length) {
            const habitosContainer = document.getElementById('habitosContainer');
            habitosContainer.innerHTML = '';
            
            atencionData.habitos.forEach(habito => {
                agregarHabito(
                    habito.descripcion,
                    habito.fecha_desde,
                    habito.fecha_hasta
                );
            });
        }

    } catch (error) {
        console.error('Error al cargar datos existentes:', error);
    }
}
