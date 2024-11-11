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
            },
            // Funcion que define el contenido personalizado de los eventos del calendario
            eventContent: function(arg) {
                // Crea un nuevo elemento div para el contenido
                let div = document.createElement('div');
                // Obtiene el tipo de vista actual del calendario
                let currentView = calendar.view.type;
                
                // Si la vista es diaria, muestra informacion detallada
                if (currentView === 'timeGridDay') {
                    div.innerHTML = `
                        <b>${arg.event.title}</b><br>
                        <a href="${arg.event.extendedProps.historiaClinicaUrl}" class="btn btn-link">Ver Historia Clínica</a>
                        <a href="${arg.event.extendedProps.iniciarAtencionUrl}" class="btn btn-link">Iniciar Atencion</a>
                    `;
                } else {
                    // Para otras vistas, solo muestra el titulo
                    div.innerHTML = `<b>${arg.event.title}</b>`;
                }
                // Retorna un objeto con el elemento DOM creado
                return { domNodes: [div] };
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

    //TablaConsultas
    tablaConsultas(1);

    textoEnriquecido();

});

async function tablaConsultas(idUsuario) {

    let tabla = `
        <table class='table table-striped table-sm' id='tablaConsultas'>
            <thead>
                <tr class='text-uppercase table-primary mt-2'>
                    <th scope='col'>Apellido</th>
                    <th scope='col'>Nombre</th>
                    <th scope='col'>Motivo consulta</th>
                    <th scope='col'>Fecha Incio</th>
                    <th scope='col'>Fecha Fin</th>
                    <th scope='col'>Acciones</th>
                </tr>
            </thead>
        </table>
    `;

    document.getElementById('contenedorTablaConsultas').innerHTML = tabla;

    //- Consulta a la base de datos
    const response = await fetch(`/api/atenciones/${idUsuario}`);
    const data = await response.json();
    console.log(data)

    $('#tablaConsultas').DataTable({
        data: data,
        columns: [
            { data: 'Apellido' },
            { data: 'Nombre' },
            { data: 'Motivo Consulta' },
            { data: 'Fecha inicio' },
            { data: 'Fecha Fin' },
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

function textoEnriquecido(){
    tinymce.init({
        selector: '#notasClinicas',
        plugins: [
          // * Funciones principales de edición
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
          /* 
            * Su cuenta incluye una prueba gratuita de las funciones premium de TinyMCE
            - Pruebe las funciones premium más populares hasta el 23 de noviembre de 2024:
           */

          'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
          
          //* Acceso temprano a convertidores de documentos
          'importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        exportpdf_converter_options: { 'format': 'Letter', 'margin_top': '1in', 'margin_right': '1in', 'margin_bottom': '1in', 'margin_left': '1in' },
        exportword_converter_options: { 'document': { 'size': 'Letter' } },
        importword_converter_options: { 'formatting': { 'styles': 'inline', 'resets': 'inline',	'defaults': 'inline', } },
      });
}