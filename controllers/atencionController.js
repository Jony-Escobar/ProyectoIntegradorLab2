import Alergia from '../models/Atencion.js';

const formularioNuevaAtencion = async (req, res) => {
    try {
        const [alergias, importancias] = await Promise.all([
            Alergia.obtenerAlergias(),
            Alergia.obtenerImportancias()
        ]);
        
        res.render('atencion', {
            pagina: 'Nueva Atención',
            alergias,
            importancias
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Hubo un error al cargar el formulario' });
    }
};

const guardarAtencion = async (req, res) => {
    try {
        const {
            alergia,
            importancia,
            antecedentesPatologicos,
            habitos,
            medicamentosUso,
            diagnostico,
            notasClinicas,
            pacienteId,
            turnoId
        } = req.body;

        await Alergia.guardarAtencion({
            alergia,
            importancia,
            antecedentesPatologicos,
            habitos,
            medicamentosUso,
            diagnostico,
            notasClinicas,
            pacienteId,
            medicoId: req.usuario.id,
            turnoId
        });

        res.json({ mensaje: 'Atención guardada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar la atención' });
    }
};

export {
    formularioNuevaAtencion,
    guardarAtencion
};
