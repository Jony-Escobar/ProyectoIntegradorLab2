// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene referencia al formulario de atención
    const formAtencion = document.getElementById('formAtencion');
    
    // Agrega listener al evento submit del formulario
    if (formAtencion) {
        formAtencion.addEventListener('submit', async function(e) {
            // Previene el comportamiento por defecto del formulario
            e.preventDefault();
            
            // Obtener el contenido del editor
            const notasClinicas = tinymce.get('notasClinicas').getContent();
            
            if (!notasClinicas || notasClinicas.trim() === '<p></p>' || notasClinicas.trim() === '') {
                alert('La nota clínica es obligatoria');
                tinymce.get('notasClinicas').focus();
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

            const formData = {
                turnoId: document.getElementById('turnoId').value,
                alergia: document.getElementById('selectAlergia')?.value,
                importancia: document.getElementById('selectImportancia')?.value,
                alergiaFechaDesde: document.getElementById('alergiaFechaDesde')?.value || new Date().toISOString().split('T')[0],
                alergiaFechaHasta: document.getElementById('alergiaFechaHasta')?.value || null,
                antecedentesPatologicos: document.getElementById('antecedentesPatologicos')?.value,
                antecedenteFechaDesde: document.getElementById('antecedenteFechaDesde')?.value || new Date().toISOString().split('T')[0],
                antecedenteFechaHasta: document.getElementById('antecedenteFechaHasta')?.value || null,
                habitos: document.getElementById('habitos')?.value,
                habitosFechaDesde: document.getElementById('habitosFechaDesde')?.value || new Date().toISOString().split('T')[0],
                habitosFechaHasta: document.getElementById('habitosFechaHasta')?.value || null,
                medicamentosUso: document.getElementById('medicamentosUso')?.value,
                diagnosticos: diagnosticos,
                notasClinicas: notasClinicas
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

    if (btnAgregarDiagnostico) {
        btnAgregarDiagnostico.addEventListener('click', function() {
            const nuevoGrupo = document.createElement('div');
            nuevoGrupo.className = 'row g-3 diagnostico-grupo mb-2';
            nuevoGrupo.innerHTML = `
                <div class="col-md-6">
                    <label for="selectTipo_${contadorDiagnosticos}" class="form-label">Tipo</label>
                    <select class="form-select tipo-diagnostico" id="selectTipo_${contadorDiagnosticos}" name="tipos[]" required>
                        <option value="">Seleccione tipo</option>
                        ${document.getElementById('selectTipo_0').innerHTML.split('<option value="">Seleccione tipo</option>')[1]}
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
}); 