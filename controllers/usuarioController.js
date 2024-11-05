import Usuario from '../models/Usuario.js';
import generarJWT from '../helpers/tokens.js';
import jwt from 'jsonwebtoken';

class UsuarioController {
    //Metodos estaticos para poder exportar todo

    static mostrarFormulario(req, res) {
        // Verificar si existe un token
        const token = req.cookies._token;
        
        if (token) {
            try {
                // Verificar si el token es valido
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.id) {
                    return res.redirect('/agenda');
                }
            } catch (error) {
                // Si el token no es valido, limpiar la cookie
                res.clearCookie('_token');
                res.clearCookie('_userId');
            }
        }
        
        // Si no hay token o no es valido, mostrar el formulario de login
        res.render('login', {
            pagina: 'Iniciar sesión'
        });
    }

    static async autenticar(req, res) {
        const { user, pass } = req.body;
        try {
            const userData = await Usuario.validarCredenciales(user, pass);
            if (userData) {
                // Generar el JWT
                const token = generarJWT(userData.id);

                // Guardar en cookie tanto el token como el ID del usuario
                res.cookie('_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60 * 12 // 12 horas en milisegundos
                });
                
                // Agregar una cookie para el ID del usuario
                res.cookie('_userId', userData.id, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60 * 12 // 12 horas en milisegundos
                });

                // Agregar cookie para el nombre del medico
                res.cookie('_userName', userData.nombre_completo, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60 * 12
                });
                // Redireccionar al agenda
                res.redirect('/agenda');
            } else {
                // Si las credenciales son invalidas, renderizar el formulario de login con un mensaje de error
                res.render('login', {
                    pagina: 'Iniciar sesión',
                    error: 'Credenciales invalidas'
                });
            }
        } catch (error) {
            console.error('Error al autenticar:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static cerrarSesion(req, res) {
        // Limpiar las cookies
        res.clearCookie('_token');
        res.clearCookie('_userId');
        res.clearCookie('_userName');
        // Redireccionar al login
        res.redirect('/login');
    }

    static async verificarAutenticacion(req, res) {
        // Obtener el token de las cookies
        const token = req.cookies._token;
        
        // Si existe un token
        if (token) {
            try {
                // Verificar y decodificar el token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Si el token contiene un ID valido, redirigir a la agenda
                if (decoded.id) {
                    return res.redirect('/agenda');
                }
            } catch (error) {
                // Si hay error en la verificacion, limpiar las cookies
                res.clearCookie('_token');
                res.clearCookie('_userId');
            }
        }
        
        // Si no hay token o es invalido, redirigir al login
        res.redirect('/login');
    }
}

//Exportamos todo
export default UsuarioController;