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

// Maneja la apertura del modal
async function handleModalShow(event) {
    // Obtiene el boton que disparo el evento y el ID del paciente
    const button = event.relatedTarget;
    const idPaciente = button.getAttribute('data-id');
    
    // Carga la informacion del paciente y actualiza la tabla
    await infoPaciente(idPaciente);
    initializeDataTable(1, 1);
}

// Carga la informacion del paciente (datos de ejemplo)
async function infoPaciente(idPaciente) {
    // Objeto con datos de ejemplo del paciente
    const fields = {
        dniPaciente: "432432",
        apellidoPaciente: "Apellido ejemplo",
        nombrePaciente: "Nombre ejemplo",
        telefonoPaciente: "123456789",
        emailPaciente: "ejemplo@email.com"
    };

    // Actualiza los campos del formulario con los datos del paciente
    for (const [id, value] of Object.entries(fields)) {
        document.getElementById(id).value = value;
    }
}