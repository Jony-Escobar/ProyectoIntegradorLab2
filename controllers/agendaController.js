import Agenda from '../models/Agenda.js';

class AgendaController {
    //Metodos estaticas para poder exportar todo
    static mostrarAgenda(req,res) {
        res.render('agenda', {
            pagina: 'Agenda diaria',
            userId: req.userId
        })
    }

    static async obtenerTurnos(req, res) {
        try {
            const { id } = req.params;
            const turnos = await Agenda.mostrarTurnosPorUsuario(id);
            res.json(turnos);
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            res.status(500).json({ error: 'Error al obtener los turnos' });
        }
    }
}

//Exportamos todo
export default AgendaController;