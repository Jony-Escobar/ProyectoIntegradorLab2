import Atencion from '../models/Atencion.js';

// Controlador para mostrar el formulario de nueva atencion
const formularioNuevaAtencion = async (req, res) => {
    try {
        // Obtiene el ID del turno desde los parametros
        const { id } = req.params; // turno_id

        // Actualizar estado del turno a "En atención" (ID 2)
        await Atencion.actualizarEstadoTurno(id, 2);

        // Obtiene los datos necesarios para el formulario de forma paralela
        const [alergias, importancias, tipos] = await Promise.all([
            Atencion.obtenerAlergias(),
            Atencion.obtenerImportancias(), 
            Atencion.obtenerTipos()
        ]);
        
        // Renderiza la vista con los datos obtenidos
        res.render('atencion', {
            pagina: 'Nueva Atención',
            alergias,
            importancias,
            tipos,
            turnoId: id
        });
    } catch (error) {
        // Si hay error, lo registra y envia respuesta de error
        console.log(error);
        res.status(500).json({ mensaje: 'Hubo un error al cargar el formulario' });
    }
};

// Controlador para guardar una nueva atencion
const guardarAtencion = async (req, res) => {
    try {
        // Extrae todos los campos necesarios del body de la peticion
        const {
            turnoId,
            alergia,
            importancia,
            antecedentesPatologicos,
            habitos,
            medicamentosUso,
            diagnostico,
            tipoId,
            notasClinicas
        } = req.body;

        // Guarda la atencion en la base de datos
        const atencionId = await Atencion.guardarAtencion({
            turnoId,
            alergia,
            importancia,
            antecedentesPatologicos,
            habitos,
            medicamentosUso,
            diagnostico,
            tipoId,
            notasClinicas
        });

        // Envia respuesta exitosa
        res.json({ 
            mensaje: 'Atención guardada y finalizada correctamente',
            atencionId 
        });
    } catch (error) {
        // Si hay error, lo registra y envia respuesta de error
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar la atención' });
    }
};

// Exporta los controladores
export {
    formularioNuevaAtencion,
    guardarAtencion
};
