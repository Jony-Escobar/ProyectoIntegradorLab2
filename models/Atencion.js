import { pool } from "../database/conexion.js";

class Atencion {
    static async obtenerAlergias() {
        const query = `SELECT * FROM alergias;`;
        try {
            const [alergias] = await pool.query(query);
            return alergias;
        } catch (error) {
            console.error('Error obteniendo alergias:', error);
            throw new Error('Error obteniendo alergias');
        }
    }

    static async obtenerImportancias() {
        const query = `SELECT * FROM importancias;`;
        try {
            const [importancias] = await pool.query(query);
            return importancias;
        } catch (error) {
            console.error('Error obteniendo importancias:', error);
            throw new Error('Error obteniendo importancias');
        }
    }

    static async obtenerTipos() {
        const query = `SELECT * FROM tipos;`;
        try {
            const [tipos] = await pool.query(query);
            return tipos;
        } catch (error) {
            console.error('Error obteniendo tipos:', error);
            throw new Error('Error obteniendo tipos');
        }
    }

    static async guardarAtencion(datos) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Insertar atencion principal
            const [resultadoAtencion] = await connection.query(
                `INSERT INTO atenciones (fecha_atencion, turno_id) 
                 VALUES (NOW(), ?)`,
                [datos.turnoId]
            );
            const atencionId = resultadoAtencion.insertId;

            // 2. Actualizar estado del turno a "Finalizado" (ID 3)
            await connection.query(
                `UPDATE turnos SET estado_id = 3 WHERE id = ?`,
                [datos.turnoId]
            );

            // 2. Guardar alergia si existe
            if (datos.alergia && datos.importancia) {
                const fechaDesde = datos.alergiaFechaDesde || new Date().toISOString().split('T')[0];
                await connection.query(
                    `INSERT INTO atencion_alergia 
                     (importancia_id, fecha_desde, fecha_hasta, atencion_id, alergia_id) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        datos.importancia, 
                        fechaDesde,
                        datos.alergiaFechaHasta || null, 
                        atencionId, 
                        datos.alergia
                    ]
                );
            }

            // 3. Guardar antecedentes patologicos
            if (datos.antecedentesPatologicos) {
                const fechaDesde = datos.antecedenteFechaDesde || new Date().toISOString().split('T')[0];
                await connection.query(
                    `INSERT INTO antecedentes_patologicos 
                     (descripcion, fecha_desde, fecha_hasta, atencion_id) 
                     VALUES (?, ?, ?, ?)`,
                    [
                        datos.antecedentesPatologicos, 
                        fechaDesde,
                        datos.antecedenteFechaHasta || null, 
                        atencionId
                    ]
                );
            }

            // 4. Guardar habitos
            if (datos.habitos) {
                const fechaDesde = datos.habitosFechaDesde || new Date().toISOString().split('T')[0];
                await connection.query(
                    `INSERT INTO habitos 
                     (descripcion, fecha_desde, fecha_hasta, atencion_id) 
                     VALUES (?, ?, ?, ?)`,
                    [
                        datos.habitos, 
                        fechaDesde,
                        datos.habitosFechaHasta || null, 
                        atencionId
                    ]
                );
            }

            // 5. Guardar medicamentos en uso
            if (datos.medicamentosUso) {
                await connection.query(
                    `INSERT INTO medicamentos_en_uso 
                     (descripcion, atencion_id) 
                     VALUES (?, ?)`,
                    [datos.medicamentosUso, atencionId]
                );
            }

            // 6. Guardar diagnósticos (múltiples)
            if (datos.diagnosticos && datos.diagnosticos.length > 0) {
                const insertDiagnostico = `
                    INSERT INTO diagnosticos 
                    (descripcion, tipo_id, atencion_id) 
                    VALUES (?, ?, ?)
                `;

                for (const diagnostico of datos.diagnosticos) {
                    await connection.query(
                        insertDiagnostico,
                        [diagnostico.descripcion, diagnostico.tipoId, atencionId]
                    );
                }
            }

            // 7. Guardar notas clinicas
            if (datos.notasClinicas) {
                await connection.query(
                    `INSERT INTO notas_clinicas 
                     (nota, atencion_id) 
                     VALUES (?, ?)`,
                    [datos.notasClinicas, atencionId]
                );
            }

            await connection.commit();
            return atencionId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async actualizarEstadoTurno(turnoId, estadoId) {
        const query = `UPDATE turnos SET estado_id = ? WHERE id = ?`;
        try {
            await pool.query(query, [estadoId, turnoId]);
            return true;
        } catch (error) {
            console.error('Error actualizando estado del turno:', error);
            throw new Error('Error actualizando estado del turno');
        }
    }
}

export default Atencion;