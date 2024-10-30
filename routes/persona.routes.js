import express from "express";
import personaController from "../controllers/personaController.js";

// Crear la instancia del enrutador
const personaRouter = express.Router();

// Definir las rutas
personaRouter.get('/', personaController.consultarTodos);

// Exportar el enrutador como default
export default personaRouter;
