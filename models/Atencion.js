import { pool } from "../database/conexion.js";

class Atencion {
    static async obtenerAlergias(){
        const query = `SELECT * FROM alergias;`;
        try {
            const [alergias] = await pool.query(query);
            return alergias;
        } catch (error) {
            console.error('Error obteniendo alergias:', error);
            throw new Error('Error obteniendo alergias');
        }
    }

    static async obtenerImportancias(){
        const query = `SELECT * FROM importancias;`;
        try {
            const [importancias] = await pool.query(query);
            return importancias;
        } catch (error) {
            console.error('Error obteniendo importancias:', error);
            throw new Error('Error obteniendo importancias');
        }
    }

    static async guardarAtencion(datos) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insertar la atención principal
            const [resultAtencion] = await connection.query(`
                INSERT INTO atenciones (
                    paciente_id, medico_id, turno_id,
                    diagnostico, notas_clinicas,
                    fecha_inicio, fecha_fin
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `, [datos.pacienteId, datos.medicoId, datos.turnoId, 
                datos.diagnostico, datos.notasClinicas]);

            const atencionId = resultAtencion.insertId;

            // Si hay alergia, guardarla
            if (datos.alergia && datos.importancia) {
                await connection.query(`
                    INSERT INTO alergias_paciente (
                        atencion_id, alergia_id, importancia_id
                    ) VALUES (?, ?, ?)
                `, [atencionId, datos.alergia, datos.importancia]);
            }

            // Guardar antecedentes patológicos
            if (datos.antecedentesPatologicos) {
                await connection.query(`
                    INSERT INTO antecedentes_patologicos (
                        atencion_id, descripcion, fecha_registro
                    ) VALUES (?, ?, NOW())
                `, [atencionId, datos.antecedentesPatologicos]);
            }

            // Guardar hábitos
            if (datos.habitos) {
                await connection.query(`
                    INSERT INTO habitos (
                        atencion_id, descripcion, fecha_registro
                    ) VALUES (?, ?, NOW())
                `, [atencionId, datos.habitos]);
            }

            // Guardar medicamentos en uso
            if (datos.medicamentosUso) {
                await connection.query(`
                    INSERT INTO medicamentos_uso (
                        atencion_id, descripcion, fecha_registro
                    ) VALUES (?, ?, NOW())
                `, [atencionId, datos.medicamentosUso]);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default Atencion;