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
                // Verificar si el token es válido
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.id) {
                    return res.redirect('/agenda');
                }
            } catch (error) {
                // Si el token no es válido, limpiar la cookie
                res.clearCookie('_token');
                res.clearCookie('_userId');
            }
        }
        
        // Si no hay token o no es válido, mostrar el formulario de login
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

                res.redirect('/agenda');
            } else {
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
        res.clearCookie('_token');
        res.clearCookie('_userId');  // Limpiar también la cookie del userId
        res.redirect('/login');
    }

    static async verificarAutenticacion(req, res) {
        const token = req.cookies._token;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.id) {
                    return res.redirect('/agenda');
                }
            } catch (error) {
                res.clearCookie('_token');
                res.clearCookie('_userId');
            }
        }
        
        res.redirect('/login');
    }
}

//Exportamos todo
export default UsuarioController;