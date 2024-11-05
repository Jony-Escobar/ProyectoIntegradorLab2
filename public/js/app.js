document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId').value;

    if(calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
            },
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
            allDaySlot: false,
            slotDuration: '00:30:00',
            events: async function(info, successCallback, failureCallback) {
                try {                    
                    const response = await fetch(`/api/turnos/${userId}`);
                    const data = await response.json();
                    
                    const events = data.map(turno => ({
                        title: `\nPACIENTE: ${turno.nombre_paciente}\nMOTIVO: ${turno.motivo_consulta}\nESTADO: ${turno.estado_turno}\n[Ver Historia Clínica]`,
                        start: new Date(`${turno.fecha}T${turno.hora}`).toISOString(),
                        backgroundColor: turno.estado_turno === 'Pendiente' ? '#3788d8' : 
                                      turno.estado_turno === 'En atencion' ? '#ffc107' :
                                      turno.estado_turno === 'Finalizado' ? '#28a745' : '#3788d8',
                        borderColor: turno.estado_turno === 'Pendiente' ? '#3788d8' : 
                                   turno.estado_turno === 'En atencion' ? '#ffc107' :
                                   turno.estado_turno === 'Finalizado' ? '#28a745' : '#3788d8'
                    }));
                    successCallback(events);
                } catch (error) {
                    console.error('Error al cargar los turnos:', error);
                    failureCallback(error);
                }
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