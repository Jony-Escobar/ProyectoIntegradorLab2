import { pool } from "../database/conexion.js";

class Alergia {
    static async obtenerAlergias(){
        const query = `SELECT * FROM alergias;`

        try {
            const [alergias] = await pool.query(query);
            return alergias;
        } catch (error) {
            console.error('Error obteniendo alergias:', error);
            throw new Error('Error obteniendo alergias');
        }
    }

    static async obtenerImportancias(){
        const query = `SELECT * FROM importancias;`

        try {
            const [importancias] = await pool.query(query);
            return importancias;
        } catch (error) {
            console.error('Error obteniendo importancias:', error);
            throw new Error('Error obteniendo importancias');
        }
    }
}

export default Alergia;