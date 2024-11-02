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

//Exportamos todo
export default UsuarioController;