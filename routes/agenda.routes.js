import express from 'express'
import AgendaController from '../controllers/agendaController.js';

const agendaRoutes = express.Router()

// Ruta para mostrar la agenda
agendaRoutes.get('/agenda', AgendaController.mostrarAgenda)

// Agregar nueva ruta API para obtener turnos
agendaRoutes.get('/api/turnos/:id/:especialidadId', AgendaController.obtenerTurnos)

// Agregar nueva ruta API - Consultar atenciones previas
agendaRoutes.get('/api/atenciones/:id/:medicoId', AgendaController.atencionesPrevias)

// Agregar nueva ruta API - Obteniendo informacion del paciente
agendaRoutes.get('/api/informacionPaciente/:id', AgendaController.informacionPaciente)

// Agregar nueva ruta API - Obteniendo historial médico
agendaRoutes.get('/api/historial-medico/:pacienteId', AgendaController.obtenerHistorialMedico);

export default agendaRoutes;