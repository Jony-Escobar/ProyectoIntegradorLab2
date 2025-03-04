import Plantilla from '../models/Plantilla.js';
import Atencion from '../models/Atencion.js';

const obtenerPlantillas = async (req, res) => {
    try {
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        const plantillas = await Plantilla.obtenerPlantillas(medicoId);
        res.json(plantillas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al obtener las plantillas' });
    }
};

const obtenerPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        const plantilla = await Plantilla.obtenerPlantilla(id, medicoId);
        
        if (!plantilla) {
            return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
        }
        
        res.json(plantilla);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ mensaje: 'Error al obtener la plantilla' });
    }
};

const crearPlantilla = async (req, res) => {
    try {
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        const { titulo, contenido } = req.body;
        
        // Validar que el título no esté vacío
        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'El título de la plantilla es obligatorio' 
            });
        }
        
        // El contenido puede estar vacío, lo guardamos tal cual
        console.log('Creando plantilla:', { titulo, contenido, medicoId });
        
        const id = await Plantilla.crearPlantilla({
            titulo,
            contenido: contenido || '',
            medicoId
        });
        
        res.json({ 
            success: true,
            message: 'Plantilla creada correctamente',
            id 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error al crear la plantilla' });
    }
};

const actualizarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido } = req.body;
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        
        // Validar que el título no esté vacío
        if (!titulo || titulo.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'El título de la plantilla es obligatorio' 
            });
        }
        
        // El contenido puede estar vacío, lo guardamos tal cual
        console.log('Actualizando plantilla:', { id, titulo, contenido, medicoId });
        
        await Plantilla.editarPlantilla({
            id,
            titulo,
            contenido: contenido || '',
            medicoId
        });
        
        res.json({ success: true, message: 'Plantilla actualizada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la plantilla' });
    }
};

const eliminarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const medicoId = await Atencion.obtenerMedicoIdPorUsuario(req.usuario.id);
        
        await Plantilla.eliminarPlantilla(id, medicoId);
        
        res.json({ success: true, message: 'Plantilla eliminada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar la plantilla' });
    }
};

export {
    obtenerPlantillas,
    obtenerPlantilla,
    crearPlantilla,
    actualizarPlantilla,
    eliminarPlantilla
};
