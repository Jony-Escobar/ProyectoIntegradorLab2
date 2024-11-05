// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene los elementos del DOM necesarios
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId').value;

    // Verifica si existe el elemento del calendario
    if(calendarEl) {
        // Inicializa el calendario con FullCalendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay', // Vista inicial: dia con horarios
            locale: 'es', // Configuración del idioma a español
            headerToolbar: {
                left: 'prev,next today', // Botones de navegación a la izquierda
                center: 'title', // Título en el centro
                right: 'dayGridMonth,timeGridWeek,timeGridDay' // Botones de vista a la derecha
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
            },
            slotMinTime: '08:00:00', // Hora de inicio del dia
            slotMaxTime: '20:00:00', // Hora de fin del dia
            allDaySlot: false, // Deshabilita la fila de "todo el dia"
            slotDuration: '00:30:00', // Duración de cada slot: 30 minutos
            // Funcion para cargar los eventos (turnos) desde la API
            events: async function(info, successCallback, failureCallback) {
                try {                    
                    // Realiza la peticion a la API para obtener los turnos
                    const response = await fetch(`/api/turnos/${userId}`);
                    const data = await response.json();
                    
                    // Transforma los datos de la API al formato requerido por FullCalendar
                    const events = data.map(turno => ({
                        title: `\nPACIENTE: ${turno.nombre_paciente}\nMOTIVO: ${turno.motivo_consulta}\nESTADO: ${turno.estado_turno}\n[Ver Historia Clínica]`,
                        start: new Date(`${turno.fecha}T${turno.hora}`).toISOString(),
                        // Define el color de fondo segun el estado del turno
                        backgroundColor: turno.estado_turno === 'Pendiente' ? '#ffc107' : 
                                      turno.estado_turno === 'En atencion' ? '#3788d8' :
                                      turno.estado_turno === 'Finalizado' ? '#28a745' : '#ffc107',
                        // Define el color del borde segun el estado del turno
                        borderColor: turno.estado_turno === 'Pendiente' ? '#ffc107' : 
                                   turno.estado_turno === 'En atencion' ? '#3788d8' :
                                   turno.estado_turno === 'Finalizado' ? '#28a745' : '#ffc107'
                    }));
                    successCallback(events);
                } catch (error) {
                    console.error('Error al cargar los turnos:', error);
                    failureCallback(error);
                }
            },
            editable: false, // Deshabilita la edición de eventos
            selectable: false, // Deshabilita la selección de fechas
            nowIndicator: true, // Muestra indicador de hora actual
            businessHours: {
                daysOfWeek: [ 1, 2, 3, 4, 5 ], // Días laborables: lunes a viernes
                startTime: '08:00', // Hora de inicio
                endTime: '20:00', // Hora de fin
            }
        });

        // Renderiza el calendario
        calendar.render();
    }
});