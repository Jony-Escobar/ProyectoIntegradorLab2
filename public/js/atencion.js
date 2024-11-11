document.addEventListener('DOMContentLoaded', function() {
    const formAtencion = document.getElementById('formAtencion');
    
    formAtencion?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            alergia: document.getElementById('selectAlergia').value,
            importancia: document.getElementById('selectImportancia').value,
            antecedentesPatologicos: document.getElementById('antecedentesPatologicos').value,
            habitos: document.getElementById('habitos').value,
            medicamentosUso: document.getElementById('medicamentosUso').value,
            diagnostico: document.getElementById('diagnostico').value,
            notasClinicas: tinymce.get('notasClinicas').getContent(),
            pacienteId: document.getElementById('pacienteId').value,
            turnoId: document.getElementById('turnoId').value
        };

        try {
            const response = await fetch('/atencion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Atención guardada correctamente');
                window.location.href = '/agenda';
            } else {
                alert(data.mensaje || 'Error al guardar la atención');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la atención');
        }
    });
}); 