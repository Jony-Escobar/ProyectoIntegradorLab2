export function initializeCalendar(calendarEl, userId) {
    if (!calendarEl || !userId) return;

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
        slotMaxTime: '20:59:00',
        allDaySlot: false,
        slotDuration: '00:30:00',
        events: async function(info, successCallback, failureCallback) {
            try {
                const especialidadSelect = document.getElementById('especialidadSelect');
                const especialidadId = especialidadSelect ? especialidadSelect.value : '';
                
                const response = await fetch(`/api/turnos/${userId}/${especialidadId}`);
                const data = await response.json();

                const events = data.map(turno => ({
                    title: `\nPACIENTE: ${turno.nombre_paciente}\nMOTIVO: ${turno.motivo_consulta}\nESTADO: ${turno.estado_turno}`,
                    start: new Date(`${turno.fecha}T${turno.hora}`).toISOString(),
                    backgroundColor: getEventColor(turno.estado_turno),
                    borderColor: getEventColor(turno.estado_turno),
                    extendedProps: {
                        historiaClinicaUrl: `/historia-clinica/${turno.idPaciente}`,
                        iniciarAtencionUrl: `/atencion/${turno.id_turno}`,
                        estadoId: turno.estado_turno,
                        turnoId: turno.id_turno,
                        idPaciente: turno.idPaciente
                    }
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
            endTime: '20:00'
        },
        eventContent: function(arg) {
            return createEventContent(arg, calendar);
        }
    });

    calendar.render();
    return calendar;
}

function getEventColor(estado) {
    const colors = {
        'Pendiente': '#ffc107',
        'En atencion': '#dc3545',
        'Finalizado': '#28a745'
    };
    return colors[estado] || '#ffc107';
}

function createEventContent(arg, calendar) {
    let div = document.createElement('div');
    let currentView = calendar.view.type;
    
    if (currentView === 'timeGridDay') {
        let html = `
            <b>${arg.event.title}</b><br>
            <button 
                class="btn btn-sm btn-primary mt-1 mb-1"
                data-bs-toggle="modal"
                data-bs-target="#modalPrincipal" 
                data-id="${arg.event.extendedProps.idPaciente}" 
            >Ver Historia Clínica</button>`;

        const esHoy = new Date().toISOString().split('T')[0] === arg.event.start.toISOString().split('T')[0];
        
        if (esHoy && arg.event.extendedProps.estadoId !== 'Finalizado') {
            html += `
                <button 
                    class="btn btn-sm btn-success"
                    onclick="if(confirm('¿Desea iniciar la atención?')) window.location.href='/atencion/${arg.event.extendedProps.turnoId}'"
                >Iniciar Atención</button>`;
        }
        
        div.innerHTML = html;
    } else {
        div.innerHTML = `<b>${arg.event.title}</b>`;
    }
    return { domNodes: [div] };
}
