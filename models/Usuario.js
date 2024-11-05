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

      const [rows] = await pool.query(`
        SELECT u.*, 
               CONCAT(p.nombre, ' ', p.apellido) as nombre_completo 
        FROM usuarios u
        JOIN medicos m ON m.usuario_id = u.id
        JOIN personas p ON p.id = m.persona_id
        WHERE u.user = ?`, [user]);
      
      const usuario = rows[0];
      
      if (!usuario) {
        return null;
      }

      const passwordValida = await bcrypt.compare(pass, usuario.pass);
      
      if (passwordValida) {
        return {
          id: usuario.id,
          user: usuario.user,
          nombre_completo: usuario.nombre_completo
        };
      }
      return null;

    } catch (error) {
      console.error('Error al validar credenciales:', error);
      throw new Error('Error al validar las credenciales');
    }
  }
  
}

export default Usuario;