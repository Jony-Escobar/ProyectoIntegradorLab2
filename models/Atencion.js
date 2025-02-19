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

            // 2. Guardar alergias (múltiples)
            if (datos.alergias && datos.alergias.length > 0) {
                const insertAlergia = `
                    INSERT INTO atencion_alergia 
                    (importancia_id, fecha_desde, fecha_hasta, atencion_id, alergia_id) 
                    VALUES (?, ?, ?, ?, ?)
                `;

                for (let i = 0; i < datos.alergias.length; i++) {
                    if (datos.alergias[i] && datos.importancias[i]) {
                        await connection.query(
                            insertAlergia,
                            [
                                datos.importancias[i],
                                datos.alergiasFechaDesde[i] || new Date().toISOString().split('T')[0],
                                datos.alergiasFechaHasta[i] || null,
                                atencionId,
                                datos.alergias[i]
                            ]
                        );
                    }
                }
            }

            // 3. Guardar antecedentes patológicos (múltiples)
            if (datos.antecedentes && datos.antecedentes.length > 0) {
                const insertAntecedente = `
                    INSERT INTO antecedentes_patologicos 
                    (descripcion, fecha_desde, fecha_hasta, atencion_id) 
                    VALUES (?, ?, ?, ?)
                `;

                for (const antecedente of datos.antecedentes) {
                    if (antecedente.descripcion.trim() !== '') {
                        await connection.query(
                            insertAntecedente,
                            [
                                antecedente.descripcion,
                                antecedente.fechaDesde,
                                antecedente.fechaHasta,
                                atencionId
                            ]
                        );
                    }
                }
            }

            // 4. Guardar hábitos (múltiples)
            if (datos.habitos && datos.habitos.length > 0) {
                const insertHabito = `
                    INSERT INTO habitos 
                    (descripcion, fecha_desde, fecha_hasta, atencion_id) 
                    VALUES (?, ?, ?, ?)
                `;

                for (const habito of datos.habitos) {
                    if (habito.descripcion.trim() !== '') {
                        await connection.query(
                            insertHabito,
                            [
                                habito.descripcion,
                                habito.fechaDesde,
                                habito.fechaHasta,
                                atencionId
                            ]
                        );
                    }
                }
            }

            // 5. Guardar medicamentos en uso (múltiples)
            if (datos.medicamentos && datos.medicamentos.length > 0) {
                const insertMedicamento = `
                    INSERT INTO medicamentos_en_uso 
                    (descripcion, fecha_desde, fecha_hasta, atencion_id) 
                    VALUES (?, ?, ?, ?)
                `;

                for (const medicamento of datos.medicamentos) {
                    if (medicamento.descripcion.trim() !== '') {
                        await connection.query(
                            insertMedicamento,
                            [
                                medicamento.descripcion,
                                medicamento.fechaDesde,
                                medicamento.fechaHasta,
                                atencionId
                            ]
                        );
                    }
                }
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

            // 7. Guardar notas clinicas (múltiples)
            if (datos.notasClinicas && datos.notasClinicas.length > 0) {
                const insertNotaClinica = `
                    INSERT INTO notas_clinicas 
                    (nota, atencion_id) 
                    VALUES (?, ?)
                `;

                for (const nota of datos.notasClinicas) {
                    if (nota.trim() !== '' && nota.trim() !== '<p></p>') {
                        await connection.query(insertNotaClinica, [nota, atencionId]);
                    }
                }
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