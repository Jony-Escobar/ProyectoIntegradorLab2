document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId').value;

    if(calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
            allDaySlot: false,
            slotDuration: '00:30:00',
            events: async function(info, successCallback, failureCallback) {
                try {                    
                    const response = await fetch(`/api/turnos/${userId}`);
                    const data = await response.json();
                    
                    const events = data.map(turno => {
                        const fechaHora = new Date(`${turno.fecha}T${turno.hora}`);
                        
                        const event = {
                            title: turno.nombre_paciente,
                            start: fechaHora.toISOString(),
                            end: new Date(fechaHora.getTime() + 30*60000).toISOString(),
                            description: turno.motivo_consulta,
                            status: turno.estado_turno,
                            backgroundColor: turno.estado_turno === 'Pendiente' ? '#3788d8' : '#28a745',
                            borderColor: turno.estado_turno === 'Pendiente' ? '#3788d8' : '#28a745'
                        };
                        return event;
                    });
                    successCallback(events);
                } catch (error) {
                    console.error('Error al cargar los turnos:', error);
                    failureCallback(error);
                }
            },
            eventDidMount: function(info) {
                info.el.title = `Paciente: ${info.event.title}\nMotivo: ${info.event.extendedProps.description}\nEstado: ${info.event.extendedProps.status}`;
            },
            editable: false,
            selectable: false,
            nowIndicator: true,
            businessHours: {
                daysOfWeek: [ 1, 2, 3, 4, 5 ],
                startTime: '08:00',
                endTime: '20:00',
            }
        });

        calendar.render();
    }
});