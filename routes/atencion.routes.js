import express from 'express';
import { formularioNuevaAtencion, guardarAtencion } from '../controllers/atencionController.js';

const router = express.Router();

// Rutas para atencion
router.get('/atencion/:id', formularioNuevaAtencion);
router.post('/atencion', guardarAtencion);

export default router;
