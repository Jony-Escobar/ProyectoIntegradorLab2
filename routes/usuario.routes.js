import express from 'express'
import UsuarioController from '../controllers/usuarioController.js';

const usuarioRoutes = express.Router()

// Ruta para mostrar el formulario de login
usuarioRoutes.get('/login', UsuarioController.mostrarFormulario)
// Ruta para procesar el login
usuarioRoutes.post('/auth/login', UsuarioController.autenticar)

export default usuarioRoutes;