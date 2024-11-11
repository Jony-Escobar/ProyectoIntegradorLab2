import { initializeCalendar } from './modules/calendar.js';
import { initializeDataTable } from './modules/dataTable.js';
import { initializeRichText } from './modules/richText.js';

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId')?.value;
    let calendar;

    if (calendarEl && userId) {
        calendar = initializeCalendar(calendarEl, userId);

        const especialidadSelect = document.getElementById('especialidadSelect');
        if (especialidadSelect) {
            especialidadSelect.addEventListener('change', function() {
                // Refresca los eventos del calendario al cambiar la especialidad
                calendar.refetchEvents();
            });
        }
    }

    initializeDataTable(1);
    initializeRichText();

    const modalAtencionesPrevias = document.getElementById('modalPrincipal');
    if (modalAtencionesPrevias) {
        modalAtencionesPrevias.addEventListener('show.bs.modal', handleModalShow);
    }
});

async function handleModalShow(event) {
    const button = event.relatedTarget;
    const idPaciente = button.getAttribute('data-id');
    
    await infoPaciente(idPaciente);
    initializeDataTable(1, 1);
}

async function infoPaciente(idPaciente) {
    const fields = {
        dniPaciente: "432432",
        apellidoPaciente: "Apellido ejemplo",
        nombrePaciente: "Nombre ejemplo",
        telefonoPaciente: "123456789",
        emailPaciente: "ejemplo@email.com"
    };

    for (const [id, value] of Object.entries(fields)) {
        document.getElementById(id).value = value;
    }
}