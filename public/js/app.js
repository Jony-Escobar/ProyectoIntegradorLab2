// Espera a que el DOM este completamente cargado antes de ejecutar el codigo
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene el elemento del calendario y el valor del userId
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId')?.value;

    // Verifica que el elemento del calendario y el userId existan
    if (calendarEl && userId) {
        // Inicializa el calendario de FullCalendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay', // Vista inicial del calendario
            locale: 'es', // Idioma del calendario
            headerToolbar: { // Configuración de la barra de herramientas del encabezado
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: { // Texto de los botones
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
            },
            slotMinTime: '08:00:00', // Hora minima de los slots
            slotMaxTime: '20:00:00', // Hora maxima de los slots
            allDaySlot: false, // Desactiva el slot de todo el día
            slotDuration: '00:30:00', // Duración de cada slot
            events: async function(info, successCallback, failureCallback) {
                try {
                    // Obtiene el valor del select de especialidades
                    const especialidadSelect = document.getElementById('especialidadSelect');
                    const especialidadId = especialidadSelect ? especialidadSelect.value : '';
                    
                    // Realiza una petición para obtener los turnos
                    const response = await fetch(`/api/turnos/${userId}/${especialidadId}`);
                    const data = await response.json();

                    // Mapea los datos de los turnos a eventos del calendario
                    const events = data.map(turno => ({
                        title: `\nPACIENTE: ${turno.nombre_paciente}\nMOTIVO: ${turno.motivo_consulta}\nESTADO: ${turno.estado_turno}\n[Ver Historia Clínica]`,
                        start: new Date(`${turno.fecha}T${turno.hora}`).toISOString(),
                        backgroundColor: turno.estado_turno === 'Pendiente' ? '#ffc107' : 
                                      turno.estado_turno === 'En atencion' ? '#3788d8' :
                                      turno.estado_turno === 'Finalizado' ? '#28a745' : '#ffc107',
                        borderColor: turno.estado_turno === 'Pendiente' ? '#ffc107' : 
                                   turno.estado_turno === 'En atencion' ? '#3788d8' :
                                   turno.estado_turno === 'Finalizado' ? '#28a745' : '#ffc107'
                    }));
                    
                    // Llama al callback de exito con los eventos
                    successCallback(events);
                } catch (error) {
                    // Maneja errores en la carga de turnos
                    console.error('Error al cargar los turnos:', error);
                    failureCallback(error);
                }
            },
            editable: false, // Desactiva la edicion de eventos
            selectable: false, // Desactiva la selección de eventos
            nowIndicator: true, // Muestra un indicador de la hora actual
            businessHours: { // Configura las horas laborales
                daysOfWeek: [ 1, 2, 3, 4, 5 ], // Dias laborales (lunes a viernes)
                startTime: '08:00', // Hora de inicio
                endTime: '20:00', // Hora de fin
            }
        });

        // Renderiza el calendario
        calendar.render();

        // Obtiene el select de especialidades y agrega un evento de cambio
        const especialidadSelect = document.getElementById('especialidadSelect');
        if (especialidadSelect) {
            especialidadSelect.addEventListener('change', function() {
                // Refresca los eventos del calendario al cambiar la especialidad
                calendar.refetchEvents();
            });
        }
    }
});