import bcrypt from 'bcrypt';
import { pool } from "../database/conexion.js";

const saltRounds = 10;

async function guardarUsuario(user, password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        
        const query = 'INSERT INTO usuarios (user, pass) VALUES (?, ?)';
        await pool.query(query, [user, hash]);
        
        console.log('Usuario guardado exitosamente');
        return true;
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        return false;
    }
}

// Ejecutar la funcion una sola vez
guardarUsuario('ACA VA EL USUARIO A CREAR', 'ACA VA LA CONTRASEÑA A CREAR')
    .then(() => console.log('Proceso completado'))
    .catch(err => console.error('Error:', err));

/*
Ejecutar seeder con node seeders/usuarioSeeder.js
*/