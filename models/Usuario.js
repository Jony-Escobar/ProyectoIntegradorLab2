import { pool } from "../database/conexion.js";

class Usuario {

  // Metodo para verificar las credenciales de un usuario
  static async buscarUsuarioPorCredenciales(user, pass) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE user = ? AND pass = ?', [user, pass]); 
    const row = rows[0];
    return row ? new Usuario(row.id, row.user, row.pass) : null;
  }
  
}

export default Usuario;