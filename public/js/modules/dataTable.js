// Exporta la configuración común de DataTables
export const dataTableConfig = {
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
    scrollX: true,
    lengthMenu: [
        [5, 10, 25, 50, -1],
        ['5 Filas', '10 Filas', '25 Filas', '50 Filas', 'Ver Todo']
    ],
    searching: true,
    ordering: true,
    paging: true,
    info: true,
    autoWidth: false,
    headerCallback: function(thead) {
        $(thead).find('th').css('background-color', '#f8f9fa');
    }
};

// Función auxiliar para generar el HTML de la tabla
function generarTablaHTML(columnas, datos) {
    return `
        <table class='table table-striped' id='tablaHistoriaClinica'>
            <thead>
                <tr>
                    ${columnas.map(col => `<th>${col.titulo}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${datos.map(registro => `
                    <tr>
                        ${columnas.map(col => `
                            <td>${col.formato ? 
                                col.formato(registro[col.campo], registro) : 
                                registro[col.campo] || '-'}</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export { generarTablaHTML };
