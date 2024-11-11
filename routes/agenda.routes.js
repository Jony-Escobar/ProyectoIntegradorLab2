import express from 'express'
import AgendaController from '../controllers/agendaController.js';

const agendaRoutes = express.Router()

// Ruta para mostrar la agenda
agendaRoutes.get('/agenda', AgendaController.mostrarAgenda)

// Agregar nueva ruta API para obtener turnos
agendaRoutes.get('/api/turnos/:id/:especialidadId', AgendaController.obtenerTurnos)

// Agregar nueva ruta API - Consultar atenciones previas
agendaRoutes.get('/api/atenciones/:id', AgendaController.atencionesPrevias)

export default agendaRoutes;