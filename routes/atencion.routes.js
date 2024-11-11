import express from 'express';
import { formularioNuevaAtencion } from '../controllers/atencionController.js';

const router = express.Router();

// Rutas para atencion
router.get('/atencion', formularioNuevaAtencion);

export default router;
