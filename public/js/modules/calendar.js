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
                    //title: `\nPACIENTE: ${turno.nombre_paciente}\nMOTIVO: ${turno.motivo_consulta}\nESTADO: ${turno.estado_turno}`,
                    start: new Date(`${turno.fecha}T${turno.hora}`).toISOString(),
                    backgroundColor: getEventColor(turno.estado_turno),
                    borderColor: 'white',
                    extendedProps: {
                        nombre_paciente: turno.nombre_paciente,
                        motivo_consulta: turno.motivo_consulta,
                        estado_turno: turno.estado_turno,
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
            let paciente = arg.event.extendedProps.nombre_paciente;
            let motivo = arg.event.extendedProps.motivo_consulta;
            let estado = arg.event.extendedProps.estado_turno;
            
            // Vista diaria con formato completo
            if (arg.view.type === 'timeGridDay') {
                return {
                    html: `
                        <div style="font-size: 15px; padding: 4px; height: 100%; width: 100%;">
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; height: 100%; align-items: stretch;">
                                <div class="text-start" style="padding-left: 8px; width: 100px;">
                                    <b>Paciente:</b><br>
                                    ${paciente}
                                </div>
                                <div class="text-start" style="width: 100px;">
                                    <b>Motivo:</b><br>
                                    ${motivo}
                                </div>
                                <div class="text-start" style="width: 100px;">
                                    <b>Estado:</b><br>
                                    ${estado}
                                </div>
                                <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; width: 100px;">
                                    <button 
                                        class="btn btn-sm btn-secondary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalPrincipal" 
                                        data-id="${arg.event.extendedProps.idPaciente}" 
                                        style="white-space: nowrap;"
                                    >Ver HC</button>
                                    ${new Date().toISOString().split('T')[0] === arg.event.start.toISOString().split('T')[0] && estado !== 'Finalizado' ? `
                                        <button 
                                            class="btn btn-sm btn-success"
                                            onclick="if(confirm('¿Desea ${estado === 'En atencion' ? 'continuar' : 'iniciar'} la atención?')) window.location.href='/atencion/${arg.event.extendedProps.turnoId}'"
                                            style="white-space: nowrap;"
                                        >${estado === 'En atencion' ? 'Continuar' : 'Atender'}</button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `
                };
            } 
            // Vista semanal con formato comprimido
            else {
                return {
                    html: `
                        <div style="font-size: 11px; padding: 2px; text-align: left; overflow: hidden;">
                            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <b>P:</b> ${paciente}
                            </div>
                            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <b>M:</b> ${motivo}
                            </div>
                        </div>
                    `
                };
            }
        },
        eventDidMount: function(info) {
            // Asegura que el color se aplique correctamente en todas las vistas
            info.el.style.backgroundColor = getEventColor(info.event.extendedProps.estado_turno);
            info.el.style.borderColor = 'white';
        },
        dayCellDidMount: function(info) {
            // Asegura que las celdas del mes tengan el alto correcto
            info.el.style.height = 'auto';
        }
    });

    calendar.render();
    return calendar;
}

function getEventColor(estado) {
    const colors = {
        'Pendiente': '#ffc107',
        'En atencion': '#0d6efd',
        'Finalizado': '#28a745'
    };
    return colors[estado] || '#ffc107';
}

