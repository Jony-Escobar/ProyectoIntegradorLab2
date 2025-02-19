import { pool } from "../database/conexion.js";

class Plantilla {
static async crearPlantilla(datos) {
    const query = `
        INSERT INTO plantillas_evoluciones (titulo, contenido, medico_id) 
        VALUES (?, ?, ?)
    `;
    try {
        const [resultado] = await pool.query(query, [
            datos.titulo,
            datos.contenido,
            datos.medicoId
        ]);
        return resultado.insertId;
    } catch (error) {
        console.error('Error creando plantilla:', error);
        throw new Error('Error al crear la plantilla');
    }
}

static async editarPlantilla(datos) {
    const query = `
        UPDATE plantillas_evoluciones 
        SET titulo = ?, contenido = ? 
        WHERE id = ? AND medico_id = ?
    `;
    try {
        await pool.query(query, [
            datos.titulo,
            datos.contenido,
            datos.id,
            datos.medicoId
        ]);
        return true;
    } catch (error) {
        console.error('Error editando plantilla:', error);
        throw new Error('Error al editar la plantilla');
    }
}

static async eliminarPlantilla(id, medicoId) {
    const query = `
        DELETE FROM plantillas_evoluciones 
        WHERE id = ? AND medico_id = ?
    `;
    try {
        await pool.query(query, [id, medicoId]);
        return true;
    } catch (error) {
        console.error('Error eliminando plantilla:', error);
        throw new Error('Error al eliminar la plantilla');
    }
}

static async obtenerPlantillas(medicoId) {
    const query = `SELECT id, titulo, contenido FROM plantillas_evoluciones WHERE medico_id = ?`;
    try {
        const [plantillas] = await pool.query(query, [medicoId]);
        return plantillas;
    } catch (error) {
        console.error('Error obteniendo plantillas:', error);
        throw new Error('Error al obtener las plantillas');
    }
}

static async obtenerPlantilla(id, medicoId) {
    const query = `SELECT id, titulo, contenido FROM plantillas_evoluciones WHERE id = ? AND medico_id = ?`;
    try {
        const [plantillas] = await pool.query(query, [id, medicoId]);
        return plantillas[0];
    } catch (error) {
        console.error('Error obteniendo plantilla:', error);
        throw new Error('Error al obtener la plantilla');
    }
}
}

export default Plantilla;