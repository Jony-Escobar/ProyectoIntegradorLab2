// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene referencia al formulario de atención
    const formAtencion = document.getElementById('formAtencion');
    
    // Agrega listener al evento submit del formulario
    formAtencion?.addEventListener('submit', async function(e) {
        // Previene el comportamiento por defecto del formulario
        e.preventDefault();
        
        if (!confirm('¿Está seguro de finalizar la atención? El turno se marcará como finalizado.')) {
            return;
        }

        // Crea objeto con los datos del formulario
        const formData = {
            turnoId: document.getElementById('turnoId').value,
            alergia: document.getElementById('selectAlergia').value,
            importancia: document.getElementById('selectImportancia').value,
            antecedentesPatologicos: document.getElementById('antecedentesPatologicos').value,
            habitos: document.getElementById('habitos').value,
            medicamentosUso: document.getElementById('medicamentosUso').value,
            diagnostico: document.getElementById('diagnostico').value,
            tipoId: document.getElementById('selectTipo').value,
            notasClinicas: document.getElementById('notasClinicas').value
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
}); 