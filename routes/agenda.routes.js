import express from 'express'
import AgendaController from '../controllers/agendaController.js';

const agendaRoutes = express.Router()

// Ruta para mostrar la agenda
agendaRoutes.get('/agenda', AgendaController.mostrarAgenda)
// Ruta para enviar POST desde agenda
//agendaRoutes.post('/agenda', AgendaController.filtrar)

export default agendaRoutes;