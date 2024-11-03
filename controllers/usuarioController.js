import Usuario from '../models/Usuario.js';

class UsuarioController {
    //Metodos estaticos para poder exportar todo

    static mostrarFormulario(req,res) {
        res.render('login', {
            pagina: 'Iniciar sesión'
        })
    }

    static async autenticar(req, res) {
        const { user, pass } = req.body;
        try {
            const userData = await Usuario.validarCredenciales(user, pass);
            if (userData) {
                res.render('agenda', {
                    pagina: 'Agenda'
                });
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
}

//Exportamos todo
export default UsuarioController;