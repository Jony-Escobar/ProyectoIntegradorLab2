import { pool } from "../database/conexion.js";
import bcrypt from 'bcrypt';

class Usuario {
  constructor(id, user, pass) {
    this.id = id;
    this.user = user;
    this.pass = pass;
  }

  // Metodo para verificar las credenciales de un usuario
  static async validarCredenciales(user, pass) {
    try {
      if (!user || !pass) {
        return null;
      }

      const [rows] = await pool.query('SELECT * FROM usuarios WHERE user = ?', [user]); 
      const usuario = rows[0];
      
      if (!usuario) {
        return null;
      }

      const passwordValida = await bcrypt.compare(pass, usuario.pass);
      
      return passwordValida ? new Usuario(usuario.id, usuario.user, usuario.pass) : null;

    } catch (error) {
      console.error('Error al validar credenciales:', error);
      throw new Error('Error al validar las credenciales');
    }
  }
  
}

export default Usuario;