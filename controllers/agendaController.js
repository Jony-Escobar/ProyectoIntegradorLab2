import Agenda from '../models/Agenda.js';

class AgendaController {
    //Metodos estaticas para poder exportar todo
    static mostrarAgenda(req,res) {
        res.render('agenda', {
            pagina: 'Agenda diaria'
        })
    }

}

//Exportamos todo
export default AgendaController;