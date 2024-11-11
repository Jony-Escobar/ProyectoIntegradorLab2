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

export {
    formularioNuevaAtencion
};
