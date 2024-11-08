// Espera a que el DOM este completamente cargado antes de ejecutar el codigo
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene el elemento del calendario y el valor del userId
    const calendarEl = document.getElementById('calendar');
    const userId = document.getElementById('userId')?.value;

    // Llamados de tablas
    contenidoTablaConsultas(datosConsultas);

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

/* Datos de pruebna para la tabla consutlas previas */
let datosConsultas = [
    { id: 1, fecha: '2024-11-10', motivo: 'Gordo', acciones: '' },
    { id: 2, fecha: '2024-11-11', motivo: 'Gordo', acciones: '' },
    { id: 3, fecha: '2024-11-12', motivo: 'Gordo', acciones: '' },
    { id: 4, fecha: '2024-11-13', motivo: 'Gordo', acciones: '' },
    { id: 5, fecha: '2024-11-14', motivo: 'Gripe', acciones: '' },
    { id: 6, fecha: '2024-11-15', motivo: 'Gripe', acciones: '' },
    { id: 7, fecha: '2024-11-16', motivo: 'Resfriado', acciones: '' },
    { id: 8, fecha: '2024-11-17', motivo: 'Flaco', acciones: '' }
];

//* Creacion de tabla consultas anteriores
function tablaConsultas(){
    let tabla = `
        <table class='table table-striped table-sm compact' id='tablaSitios'>
            <thead>
                <tr class='table-dark text-uppercase mt-2'>
                    <th scope='col'>id</th>
                    <th scope='col'>Fecha</th>
                    <th scope='col'>Motivo consulta</th>
                    <th scope='col'>Acciones</th>
                </tr>
            </thead>
        </table>
    `;

    document.getElementById('tablaConsultas').innerHTML = tabla;
}

//* imeplementando DataTable a la tabla
function contenidoTablaConsultas(dataConsultas){
    // Elimina el contenido existente de la tabla
    $('#tablaSitios').empty();
    
    tablaConsultas();
    var contenedor = document.getElementById('tablaConsultas');

    // Inicializa DataTable
    $('#tablaSitios').DataTable({
        data: dataConsultas,
        columns: [
            { data: 'id' },
            { data: 'fecha' },
            { data: 'motivo' },
            { data: null,
                defaultContent: `
                    <button type="button" class="btn btn-primary" style="margin-right: 5px" data-bs-toggle="modal" data-bs-target="#modalEditSitio">
                        <i class="bi bi-pencil-fill"></i> Tomar Turno
                    </button>

                    <button type="button" class="btn btn-primary" style="margin-right: 5px" data-bs-toggle="modal" data-bs-target="#modalEditSitio">
                        <i class="bi bi-pencil-fill"></i> HC
                    </button>
                `,
            },
        ],

        language: {
            "decimal": "",
            "emptyTable": "No hay informacion",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ Registros",
            "infoEmpty": "Mostrando 0 de 0 registros",
            "infoFiltered": "(Filtrado de _MAX_ total Registros)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ Registros",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "Sin resultados encontrados",
            "paginate": {
                "first": "Primero",
                "last": "Ultimo",
                "next": "Siguiente",
                "previous": "Anterior"
            }
        },

        dom: 'Bfrtip',

        lengthMenu: [
            [5, 10, 50, 100, 500, -1],
            ['5 Filas', '10 Filas', '50 Filas', '100 Filas', '500 Filas', 'Ver Todo']
        ]
    });
}
    
