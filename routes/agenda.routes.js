import express from 'express'
import AgendaController from '../controllers/agendaController.js';

const agendaRoutes = express.Router()

// Ruta para mostrar la agenda
agendaRoutes.get('/agenda', AgendaController.mostrarAgenda)

// Ruta para obtener turnos
agendaRoutes.get('/api/turnos/:id/:especialidadId', AgendaController.obtenerTurnos)

// Ruta para consultar atenciones previas
agendaRoutes.get('/api/atenciones/:id/:medicoId', AgendaController.atencionesPrevias)

// Ruta para obtener informacion del paciente
agendaRoutes.get('/api/informacionPaciente/:id', AgendaController.informacionPaciente)

// Ruta para obtener historial medico
agendaRoutes.get('/api/historial-medico/:pacienteId', AgendaController.obtenerHistorialMedico);

export default agendaRoutes;