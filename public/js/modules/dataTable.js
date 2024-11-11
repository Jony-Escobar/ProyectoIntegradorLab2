export async function initializeDataTable(idUsuario, idAgenda = null) {
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

    const response = await fetch(`/api/atenciones/${idUsuario}/${idAgenda || 1}`);
    const data = await response.json();

    $('#tablaConsultas').DataTable({
        data: data,
        columns: [
            { data: 'Apellido' },
            { data: 'Nombre' },
            { data: 'Motivo Consulta' },
            { data: 'Fecha inicio' },
            { data: 'Fecha Fin' },
            { 
                data: null,
                defaultContent: getTableActions()
            }
        ],
        language: getDataTableLanguage(),
        dom: 'Bfrtip',
        lengthMenu: [
            [5, 10, 50, 100, 500, -1],
            ['5 Filas', '10 Filas', '50 Filas', '100 Filas', '500 Filas', 'Ver Todo']
        ]
    });
}

function getTableActions() {
    return `
        <button type="button" class="btn btn-primary" style="margin-right: 5px" data-bs-toggle="modal" data-bs-target="#modalEditSitio">
            <i class="bi bi-pencil-fill"></i> Tomar Turno
        </button>
        <button type="button" class="btn btn-primary" style="margin-right: 5px" data-bs-toggle="modal" data-bs-target="#modalEditSitio">
            <i class="bi bi-pencil-fill"></i> HC
        </button>
    `;
}

function getDataTableLanguage() {
    return {
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
    };
}
