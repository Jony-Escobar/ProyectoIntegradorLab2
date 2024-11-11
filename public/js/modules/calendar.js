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
        slotMaxTime: '20:00:00',
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
                        turnoId: turno.id_turno
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
            endTime: '20:00',
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
        'En atencion': '#3788d8',
        'Finalizado': '#28a745'
    };
    return colors[estado] || '#ffc107';
}

function createEventContent(arg, calendar) {
    let div = document.createElement('div');
    let currentView = calendar.view.type;
    
    console.log('Creando contenido del evento:', {
        title: arg.event.title,
        extendedProps: arg.event.extendedProps
    });
    
    if (currentView === 'timeGridDay') {
        div.innerHTML = `
            <b>${arg.event.title}</b><br>
            <a 
                href="${arg.event.extendedProps.historiaClinicaUrl}" 
                class="btn btn-link"
                data-bs-toggle="modal"
                data-bs-target="#modalPrincipal" 
                data-id="${arg.event.extendedProps.idPaciente}" 
            >Ver Historia Clínica</a>
            <a 
                href="/atencion/${arg.event.extendedProps.turnoId}" 
                class="btn btn-link"
                onclick="console.log('Click en Iniciar Atención, turnoId:', '${arg.event.extendedProps.turnoId}')"
            >Iniciar Atención</a>
        `;
    } else {
        div.innerHTML = `<b>${arg.event.title}</b>`;
    }
    return { domNodes: [div] };
}
