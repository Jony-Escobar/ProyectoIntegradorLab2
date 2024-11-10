import Agenda from '../models/Agenda.js';

class AgendaController {
    //Metodos estaticas para poder exportar todo
    static async mostrarAgenda(req, res) {
        try {
            const especialidades = await Agenda.obtenerEspecialidadesMedico(req.cookies._userId);
            
            res.render('agenda', {
                pagina: 'Agenda diaria',
                userId: req.cookies._userId,
                userName: req.cookies._userName,
                especialidades
            });
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            res.render('agenda', {
                pagina: 'Agenda diaria',
                userId: req.cookies._userId,
                userName: req.cookies._userName,
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