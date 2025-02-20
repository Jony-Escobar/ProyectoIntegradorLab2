import Atencion from '../models/Atencion.js';
import Plantilla from '../models/Plantilla.js';

// Controlador para mostrar el formulario de nueva atencion
const formularioNuevaAtencion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener el ID del médico usando el ID del usuario en sesión
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        console.log('ID del usuario en sesión:', req.usuario.id);
        console.log('ID del médico encontrado:', medicoId);

        if (!medicoId) {
            throw new Error('No se encontró el médico asociado al usuario');
        }

        await Atencion.actualizarEstadoTurno(id, 2);

        const [alergias, importancias, tipos, plantillas] = await Promise.all([
            Atencion.obtenerAlergias(),
            Atencion.obtenerImportancias(), 
            Atencion.obtenerTipos(),
            Plantilla.obtenerPlantillas(medicoId)
        ]);
        
        res.render('atencion', {
            pagina: 'Nueva Atención',
            alergias,
            importancias,
            tipos,
            plantillas,
            turnoId: id
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({ 
            mensaje: 'Hubo un error al cargar el formulario',
            error: error.message 
        });
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
            diagnosticos,
            tipos,
            notasClinicas
        } = req.body;

        // Validación de notas clínicas
        if (!notasClinicas || !notasClinicas.length || 
            notasClinicas.every(nota => nota.trim() === '' || nota.trim() === '<p></p>')) {
            return res.status(400).json({ 
                mensaje: 'Debe incluir al menos una nota clínica' 
            });
        }

        // Guarda la atencion en la base de datos
        const atencionId = await Atencion.guardarAtencion({
            turnoId,
            alergia,
            importancia,
            antecedentesPatologicos,
            habitos,
            medicamentosUso,
            diagnosticos,
            tipos,
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

const formularioEditarAtencion = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);

        if (!medicoId) {
            throw new Error('No se encontró el médico asociado al usuario');
        }

        const [atencion, alergias, importancias, tipos, plantillas] = await Promise.all([
            Atencion.obtenerAtencionCompleta(id, medicoId),
            Atencion.obtenerAlergias(),
            Atencion.obtenerImportancias(),
            Atencion.obtenerTipos(),
            Plantilla.obtenerPlantillas(medicoId)
        ]);

        res.render('editarAtencion', {
            pagina: 'Editar Atención',
            atencion,
            alergias,
            importancias,
            tipos,
            plantillas
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            mensaje: 'Hubo un error al cargar el formulario de edición',
            error: error.message
        });
    }
};

const actualizarAtencion = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        
        if (!medicoId) {
            return res.status(403).json({ 
                mensaje: 'No tiene permisos para actualizar esta atención' 
            });
        }

        const {
            notasClinicas,
            diagnosticos,
            alergias,
            antecedentes,
            habitos,
            medicamentos
        } = req.body;

        // Validaciones
        if (!notasClinicas?.length || notasClinicas.every(nota => !nota?.contenido?.trim() || nota.contenido.trim() === '<p></p>')) {
            return res.status(400).json({ 
                mensaje: 'Debe incluir al menos una nota clínica' 
            });
        }

        if (!diagnosticos?.length || diagnosticos.every(d => !d?.descripcion?.trim())) {
            return res.status(400).json({ 
                mensaje: 'Debe incluir al menos un diagnóstico' 
            });
        }

        // Validar formato de fechas
        const validarFecha = (fecha) => {
            if (!fecha) return true;
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            return fechaRegex.test(fecha);
        };

        // Validar fechas de alergias
        if (alergias?.some(a => (a.fechaDesde && !validarFecha(a.fechaDesde)) || 
                                (a.fechaHasta && !validarFecha(a.fechaHasta)))) {
            return res.status(400).json({
                mensaje: 'Formato de fecha inválido en alergias'
            });
        }

        await Atencion.actualizarAtencion(id, medicoId, req.body);

        res.json({ mensaje: 'Atención actualizada correctamente' });

    } catch (error) {
        console.error('Error en actualizarAtencion:', error);
        res.status(500).json({ 
            mensaje: 'Error al actualizar la atención',
            error: error.message 
        });
    }
};

// Exporta los controladores
export {
    formularioNuevaAtencion,
    guardarAtencion,
    formularioEditarAtencion,
    actualizarAtencion
};
