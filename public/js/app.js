// Importa los modulos necesarios
import { initializeCalendar } from './modules/calendar.js';
import { initializeRichText } from './modules/richText.js';

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

    // Inicializa el editor de texto enriquecido
    initializeRichText();

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
        const historial = await response.json();
        
        const tbody = document.getElementById('tablaHistorialBody');
        tbody.innerHTML = '';

        historial.forEach(consulta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${consulta.fecha}</td>
                <td>${consulta.medico}</td>
                <td>${consulta.motivo}</td>
                <td>${consulta.diagnosticos || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar historial médico:', error);
        alert('Error al cargar el historial médico');
    }
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
        { titulo: 'Fecha', campo: 'fecha', formato: fecha => new Date(fecha).toLocaleDateString('es-ES') },
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