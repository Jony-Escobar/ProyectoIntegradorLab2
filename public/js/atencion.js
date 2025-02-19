import { initGestionPlantillas } from './modules/gestionPlantillas.js';

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    initGestionPlantillas();
    // Obtiene referencia al formulario de atención
    const formAtencion = document.getElementById('formAtencion');
    
    // Agrega listener al evento submit del formulario
    if (formAtencion) {
        formAtencion.addEventListener('submit', async function(e) {
            // Previene el comportamiento por defecto del formulario
            e.preventDefault();
            
            // Recolectar todas las notas clínicas
            const notasClinicas = [];
            const editores = document.querySelectorAll('.quill-editor');
            
            editores.forEach(editor => {
                const contenido = editor.querySelector('.ql-editor').innerHTML;
                if (contenido && contenido.trim() !== '<p><br></p>' && contenido.trim() !== '') {
                    notasClinicas.push(contenido);
                }
            });

            if (notasClinicas.length === 0) {
                alert('Debe incluir al menos una nota clínica');
                return;
            }

            if (!confirm('¿Está seguro de finalizar la atención? El turno se marcará como finalizado.')) {
                return;
            }

            // Recolectar todos los diagnósticos
            const diagnosticos = [];
            const gruposDiagnosticos = document.querySelectorAll('.diagnostico-grupo');
            
            gruposDiagnosticos.forEach(grupo => {
                const tipo = grupo.querySelector('.tipo-diagnostico').value;
                const descripcion = grupo.querySelector('.diagnostico-texto').value;
                
                if (tipo && descripcion) {
                    diagnosticos.push({
                        tipoId: tipo,
                        descripcion: descripcion
                    });
                }
            });

            // Código para antecedentes patológicos múltiples
            const antecedentes = [];
            const gruposAntecedentes = document.querySelectorAll('.antecedente-grupo');
            
            gruposAntecedentes.forEach(grupo => {
                const descripcion = grupo.querySelector('.antecedente-texto').value;
                const fechaDesde = grupo.querySelector('.antecedente-fecha-desde').value;
                const fechaHasta = grupo.querySelector('.antecedente-fecha-hasta').value;
                
                if (descripcion) {
                    antecedentes.push({
                        descripcion,
                        fechaDesde: fechaDesde || new Date().toISOString().split('T')[0],
                        fechaHasta: fechaHasta || null
                    });
                }
            });

            // Código para hábitos múltiples
            const habitos = [];
            const gruposHabitos = document.querySelectorAll('.habito-grupo');
            
            gruposHabitos.forEach(grupo => {
                const descripcion = grupo.querySelector('.habito-texto').value;
                const fechaDesde = grupo.querySelector('.habito-fecha-desde').value;
                const fechaHasta = grupo.querySelector('.habito-fecha-hasta').value;
                
                if (descripcion) {
                    habitos.push({
                        descripcion,
                        fechaDesde: fechaDesde || new Date().toISOString().split('T')[0],
                        fechaHasta: fechaHasta || null
                    });
                }
            });

            // Código para medicamentos múltiples
            const medicamentos = [];
            const gruposMedicamentos = document.querySelectorAll('.medicamento-grupo');
            
            gruposMedicamentos.forEach(grupo => {
                const descripcion = grupo.querySelector('.medicamento-texto').value;
                const fechaDesde = grupo.querySelector('.medicamento-fecha-desde').value;
                const fechaHasta = grupo.querySelector('.medicamento-fecha-hasta').value;
                
                if (descripcion) {
                    medicamentos.push({
                        descripcion,
                        fechaDesde: fechaDesde || new Date().toISOString().split('T')[0],
                        fechaHasta: fechaHasta || null
                    });
                }
            });

            const formData = {
                turnoId: document.getElementById('turnoId').value,
                alergia: document.getElementById('selectAlergia')?.value,
                importancia: document.getElementById('selectImportancia')?.value,
                alergiaFechaDesde: document.getElementById('alergiaFechaDesde')?.value || new Date().toISOString().split('T')[0],
                alergiaFechaHasta: document.getElementById('alergiaFechaHasta')?.value || null,
                antecedentesPatologicos: document.getElementById('antecedentesPatologicos')?.value,
                antecedenteFechaDesde: document.getElementById('antecedenteFechaDesde')?.value || new Date().toISOString().split('T')[0],
                antecedenteFechaHasta: document.getElementById('antecedenteFechaHasta')?.value || null,
                habitos: habitos,
                habitosFechaDesde: document.getElementById('habitosFechaDesde')?.value || new Date().toISOString().split('T')[0],
                habitosFechaHasta: document.getElementById('habitosFechaHasta')?.value || null,
                medicamentosUso: document.getElementById('medicamentosUso')?.value,
                diagnosticos: diagnosticos,
                notasClinicas: notasClinicas,
                antecedentes: antecedentes,
                medicamentos: medicamentos
            };

            try {
                // Realiza peticion POST al endpoint de atencion
                const response = await fetch('/atencion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                // Obtiene la respuesta en formato JSON
                const data = await response.json();

                // Si la peticion fue exitosa
                if (response.ok) {
                    alert('Atención finalizada correctamente');
                    window.location.href = '/agenda';
                } else {
                    // Si hubo error muestra mensaje
                    alert(data.mensaje || 'Error al guardar la atención');
                }
            } catch (error) {
                // Captura y muestra errores
                console.error('Error:', error);
                alert('Error al guardar la atención');
            }
        });
    }

    // Agregar nuevo código para diagnósticos múltiples
    const diagnosticosContainer = document.getElementById('diagnosticosContainer');
    const btnAgregarDiagnostico = document.getElementById('btnAgregarDiagnostico');
    let contadorDiagnosticos = 1;

    // Almacenar las opciones de tipos al cargar la página
    const tiposOptions = document.querySelector('#selectTipo_0')?.innerHTML || '';

    if (btnAgregarDiagnostico) {
        btnAgregarDiagnostico.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 diagnostico-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-6">
                    <label for="selectTipo_${contadorDiagnosticos}" class="form-label">Tipo</label>
                    <select class="form-select tipo-diagnostico" id="selectTipo_${contadorDiagnosticos}" name="tipos[]" required>
                        ${tiposOptions}
                    </select>
                </div>
                <div class="col-md-11">
                    <textarea class="form-control diagnostico-texto" id="diagnostico_${contadorDiagnosticos}" name="diagnosticos[]" rows="3" required></textarea>
                </div>
                <div class="col-md-1 d-flex align-items-center">
                    <button type="button" class="btn btn-danger btn-eliminar-diagnostico">X</button>
                </div>
            `;
            diagnosticosContainer.appendChild(nuevoGrupo);
            contadorDiagnosticos++;
            actualizarBotonesEliminar();
        });
    }

    if (diagnosticosContainer) {
        diagnosticosContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-diagnostico')) {
                e.target.closest('.diagnostico-grupo').remove();
                actualizarBotonesEliminar();
            }
        });
    }

    function actualizarBotonesEliminar() {
        const grupos = diagnosticosContainer.querySelectorAll('.diagnostico-grupo');
        grupos.forEach((grupo, index) => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-diagnostico');
            btnEliminar.disabled = grupos.length === 1;
        });
    }

    // Agregar código para alergias múltiples
    const alergiasContainer = document.getElementById('alergiasContainer');
    const btnAgregarAlergia = document.getElementById('btnAgregarAlergia');
    let contadorAlergias = 1;

    // Almacenar las opciones al cargar la página
    const alergiasOptions = document.querySelector('#selectAlergia_0')?.innerHTML || '';
    const importanciasOptions = document.querySelector('#selectImportancia_0')?.innerHTML || '';

    if (btnAgregarAlergia) {
        btnAgregarAlergia.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 alergia-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-3">
                    <label for="selectAlergia_${contadorAlergias}" class="form-label">Alergia</label>
                    <select class="form-select alergia-select" id="selectAlergia_${contadorAlergias}" name="alergias[]">
                        ${alergiasOptions}
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="selectImportancia_${contadorAlergias}" class="form-label">Importancia</label>
                    <select class="form-select importancia-select" id="selectImportancia_${contadorAlergias}" name="importancias[]">
                        ${importanciasOptions}
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="alergiaFechaDesde_${contadorAlergias}" class="form-label">Fecha Desde</label>
                    <input type="date" class="form-control alergia-fecha-desde" id="alergiaFechaDesde_${contadorAlergias}" name="alergiasFechaDesde[]" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="col-md-2">
                    <label for="alergiaFechaHasta_${contadorAlergias}" class="form-label">Fecha Hasta</label>
                    <input type="date" class="form-control alergia-fecha-hasta" id="alergiaFechaHasta_${contadorAlergias}" name="alergiasFechaHasta[]">
                </div>
                <div class="col-md-1 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-eliminar-alergia">X</button>
                </div>
            `;
            alergiasContainer.appendChild(nuevoGrupo);
            contadorAlergias++;
            actualizarBotonesEliminarAlergia();
        });
    }

    if (alergiasContainer) {
        alergiasContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-alergia')) {
                e.target.closest('.alergia-grupo').remove();
                actualizarBotonesEliminarAlergia();
            }
        });
    }

    function actualizarBotonesEliminarAlergia() {
        const grupos = alergiasContainer.querySelectorAll('.alergia-grupo');
        grupos.forEach(grupo => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-alergia');
            btnEliminar.disabled = grupos.length === 1;
        });
    }

    // Código para antecedentes patológicos múltiples
    const antecedentesContainer = document.getElementById('antecedentesContainer');
    const btnAgregarAntecedente = document.getElementById('btnAgregarAntecedente');
    let contadorAntecedentes = 1;

    if (btnAgregarAntecedente) {
        btnAgregarAntecedente.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 antecedente-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-6">
                    <label for="antecedente_${contadorAntecedentes}" class="form-label">Descripción</label>
                    <textarea class="form-control antecedente-texto" id="antecedente_${contadorAntecedentes}" name="antecedentes[]" rows="3"></textarea>
                </div>
                <div class="col-md-2">
                    <label for="antecedenteFechaDesde_${contadorAntecedentes}" class="form-label">Fecha Desde</label>
                    <input type="date" class="form-control antecedente-fecha-desde" id="antecedenteFechaDesde_${contadorAntecedentes}" name="antecedentesFechaDesde[]" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="col-md-2">
                    <label for="antecedenteFechaHasta_${contadorAntecedentes}" class="form-label">Fecha Hasta</label>
                    <input type="date" class="form-control antecedente-fecha-hasta" id="antecedenteFechaHasta_${contadorAntecedentes}" name="antecedentesFechaHasta[]">
                </div>
                <div class="col-md-1 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-eliminar-antecedente">X</button>
                </div>
            `;
            antecedentesContainer.appendChild(nuevoGrupo);
            contadorAntecedentes++;
            actualizarBotonesEliminarAntecedente();
        });
    }

    if (antecedentesContainer) {
        antecedentesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-antecedente')) {
                e.target.closest('.antecedente-grupo').remove();
                actualizarBotonesEliminarAntecedente();
            }
        });
    }

    function actualizarBotonesEliminarAntecedente() {
        const grupos = antecedentesContainer.querySelectorAll('.antecedente-grupo');
        grupos.forEach(grupo => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-antecedente');
            btnEliminar.disabled = grupos.length === 1;
        });
    }

    // Código para hábitos múltiples
    const habitosContainer = document.getElementById('habitosContainer');
    const btnAgregarHabito = document.getElementById('btnAgregarHabito');
    let contadorHabitos = 1;

    if (btnAgregarHabito) {
        btnAgregarHabito.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 habito-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-6">
                    <label for="habito_${contadorHabitos}" class="form-label">Descripción</label>
                    <textarea class="form-control habito-texto" id="habito_${contadorHabitos}" name="habitos[]" rows="3"></textarea>
                </div>
                <div class="col-md-2">
                    <label for="habitoFechaDesde_${contadorHabitos}" class="form-label">Fecha Desde</label>
                    <input type="date" class="form-control habito-fecha-desde" id="habitoFechaDesde_${contadorHabitos}" name="habitosFechaDesde[]" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="col-md-2">
                    <label for="habitoFechaHasta_${contadorHabitos}" class="form-label">Fecha Hasta</label>
                    <input type="date" class="form-control habito-fecha-hasta" id="habitoFechaHasta_${contadorHabitos}" name="habitosFechaHasta[]">
                </div>
                <div class="col-md-1 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-eliminar-habito">X</button>
                </div>
            `;
            habitosContainer.appendChild(nuevoGrupo);
            contadorHabitos++;
            actualizarBotonesEliminarHabito();
        });
    }

    if (habitosContainer) {
        habitosContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-habito')) {
                e.target.closest('.habito-grupo').remove();
                actualizarBotonesEliminarHabito();
            }
        });
    }

    function actualizarBotonesEliminarHabito() {
        const grupos = habitosContainer.querySelectorAll('.habito-grupo');
        grupos.forEach(grupo => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-habito');
            btnEliminar.disabled = grupos.length === 1;
        });
    }

    // Código para medicamentos múltiples
    const medicamentosContainer = document.getElementById('medicamentosContainer');
    const btnAgregarMedicamento = document.getElementById('btnAgregarMedicamento');
    let contadorMedicamentos = 1;

    if (btnAgregarMedicamento) {
        btnAgregarMedicamento.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 medicamento-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-6">
                    <label for="medicamento_${contadorMedicamentos}" class="form-label">Descripción</label>
                    <textarea class="form-control medicamento-texto" id="medicamento_${contadorMedicamentos}" name="medicamentos[]" rows="3"></textarea>
                </div>
                <div class="col-md-2">
                    <label for="medicamentoFechaDesde_${contadorMedicamentos}" class="form-label">Fecha Desde</label>
                    <input type="date" class="form-control medicamento-fecha-desde" id="medicamentoFechaDesde_${contadorMedicamentos}" name="medicamentosFechaDesde[]" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="col-md-2">
                    <label for="medicamentoFechaHasta_${contadorMedicamentos}" class="form-label">Fecha Hasta</label>
                    <input type="date" class="form-control medicamento-fecha-hasta" id="medicamentoFechaHasta_${contadorMedicamentos}" name="medicamentosFechaHasta[]">
                </div>
                <div class="col-md-1 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-eliminar-medicamento">X</button>
                </div>
            `;
            medicamentosContainer.appendChild(nuevoGrupo);
            contadorMedicamentos++;
            actualizarBotonesEliminarMedicamento();
        });
    }

    if (medicamentosContainer) {
        medicamentosContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-eliminar-medicamento')) {
                e.target.closest('.medicamento-grupo').remove();
                actualizarBotonesEliminarMedicamento();
            }
        });
    }

    function actualizarBotonesEliminarMedicamento() {
        const grupos = medicamentosContainer.querySelectorAll('.medicamento-grupo');
        grupos.forEach(grupo => {
            const btnEliminar = grupo.querySelector('.btn-eliminar-medicamento');
            btnEliminar.disabled = grupos.length === 1;
        });
    }
}); 