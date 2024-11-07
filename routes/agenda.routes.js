import express from 'express'
import protegerRuta from '../middleware/protegerRuta.js';
import AgendaController from '../controllers/agendaController.js';

const agendaRoutes = express.Router()

// Ruta para mostrar la agenda
agendaRoutes.get('/agenda', protegerRuta, AgendaController.mostrarAgenda)
// Ruta para enviar POST desde agenda
//agendaRoutes.post('/agenda', AgendaController.filtrar)

// Agregar nueva ruta API para obtener turnos
agendaRoutes.get('/api/turnos/:id/:especialidadId', protegerRuta, AgendaController.obtenerTurnos)

export default agendaRoutes;