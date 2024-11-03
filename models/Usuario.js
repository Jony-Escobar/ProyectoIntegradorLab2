import { pool } from "../database/conexion.js";
import bcrypt from 'bcrypt';

class Usuario {

  // Metodo para verificar las credenciales de un usuario
  static async validarCredenciales(user, pass) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE user = ?', [user]); 
    const usuario = rows[0];
    
    if (!usuario) {
      return null;
    }

    const passwordValida = await bcrypt.compare(pass, usuario.pass);
    
    return passwordValida ? new Usuario(usuario.id, usuario.user, usuario.pass) : null;
  }
  
}

export default Usuario;