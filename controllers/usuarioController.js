import Usuario from '../models/Usuario.js';

class UsuarioController {
    static mostrarFormulario(req,res) {
        res.render('auth/login', {
            pagina: 'Iniciar sesión'
        })
    }

    static async autenticar(req, res) {
        const { user, pass } = req.body;
        try {
            const userData = await Usuario.buscarUsuarioPorCredenciales(user, pass);
            if (userData) {
                res.json({ message: 'Sesion iniciada correctamente'});
            } else {
                res.status(401).json({ message: 'Credenciales invalidas' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default UsuarioController;