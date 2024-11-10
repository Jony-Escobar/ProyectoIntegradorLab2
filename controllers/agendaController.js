import Agenda from '../models/Agenda.js';

class AgendaController {
    //Metodos estaticas para poder exportar todo
    static async mostrarAgenda(req, res) {
        try {
            const especialidades = await Agenda.obtenerEspecialidadesMedico(req.usuario.id);
            
            res.render('agenda', {
                pagina: 'Agenda diaria',
                userId: req.usuario.id,
                userName: req.usuario.nombre,
                especialidades
            });
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            res.render('agenda', {
                pagina: 'Agenda diaria',
                userId: req.usuario.id,
                userName: req.usuario.nombre,
                error: 'Error al cargar especialidades'
            });
        }
    }

    static async obtenerTurnos(req, res) {
        try {
            const { id, especialidadId } = req.params;
            const turnos = await Agenda.mostrarTurnosPorUsuario(id, especialidadId);
            res.json(turnos);
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            res.status(500).json({ error: 'Error al obtener los turnos' });
        }
    }

    static async atencionesPrevias(req, res){
        try {
            const { id } = req.params;
            const atenciones = await Agenda.mostrarAtencionesPrevias(id);
            res.json(atenciones);
        } catch (error) {
            console.error('Error al obtener atenciones:', error);
            res.status(500).json({ error: 'Error al obtener las atenciones' });
        }
    }
}

//Exportamos todo
export default AgendaController;