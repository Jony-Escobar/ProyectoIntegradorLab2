import express from 'express';
import { 
    formularioNuevaAtencion, 
    guardarAtencion, 
    formularioEditarAtencion, 
    actualizarAtencion 
} from '../controllers/atencionController.js';

const router = express.Router();

// IMPORTANTE: El orden de las rutas es crucial
// Las rutas más específicas deben ir primero
router.get('/atencion/editar/:id', formularioEditarAtencion);
router.patch('/atencion/editar/:id', actualizarAtencion);
router.get('/atencion/:id', formularioNuevaAtencion);
router.post('/atencion', guardarAtencion);

export default router;
