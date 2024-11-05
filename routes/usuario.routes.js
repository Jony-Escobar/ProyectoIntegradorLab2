import express from 'express'
import UsuarioController from '../controllers/usuarioController.js';

const usuarioRoutes = express.Router()

// Ruta principal que verifica autenticación
usuarioRoutes.get('/', UsuarioController.verificarAutenticacion)

// Ruta para mostrar el formulario de login
usuarioRoutes.get('/login', UsuarioController.mostrarFormulario)

// Ruta para procesar el login
usuarioRoutes.post('/login', UsuarioController.autenticar)

// Ruta para cerrar sesión
usuarioRoutes.get('/logout', UsuarioController.cerrarSesion)

export default usuarioRoutes;