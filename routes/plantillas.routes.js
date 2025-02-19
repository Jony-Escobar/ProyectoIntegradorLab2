import express from 'express';
import { 
    obtenerPlantillas,
    obtenerPlantilla,
    crearPlantilla,
    actualizarPlantilla,
    eliminarPlantilla
} from '../controllers/plantillasController.js';
import protegerRuta from '../middleware/protegerRuta.js';

const router = express.Router();

// Todas las rutas están protegidas
router.use(protegerRuta);

// Rutas para gestión de plantillas
router.get('/', obtenerPlantillas);
router.get('/:id', obtenerPlantilla);
router.post('/', crearPlantilla);
router.put('/:id', actualizarPlantilla);
router.delete('/:id', eliminarPlantilla);

export default router;
