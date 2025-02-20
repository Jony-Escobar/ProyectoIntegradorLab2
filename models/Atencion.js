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
                    (descripcion, atencion_id) 
                    VALUES (?, ?)
                `;
                
                for (const medicamento of datos.medicamentos) {
                    if (medicamento.trim()) {
                        await connection.query(insertMedicamento, [medicamento, atencionId]);
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

    static async obtenerMedicoIdPorUsuario(usuarioId) {
        const query = `
            SELECT m.id as medico_id 
            FROM medicos m 
            WHERE m.usuario_id = ?
        `;
        try {
            const [resultado] = await pool.query(query, [usuarioId]);
            return resultado[0]?.medico_id;
        } catch (error) {
            console.error('Error obteniendo ID del médico:', error);
            throw new Error('Error obteniendo ID del médico');
        }
    }

    static async obtenerAtencionCompleta(id) {
        const connection = await pool.getConnection();
        try {
            // Consulta principal para obtener datos básicos de la atención
            const [atencion] = await connection.query(`
                SELECT 
                    a.id,
                    a.turno_id,
                    t.motivo_consulta
                FROM atenciones a
                JOIN turnos t ON t.id = a.turno_id
                WHERE a.id = ?
            `, [id]);

            if (!atencion) {
                throw new Error('Atención no encontrada');
            }

            // Obtener notas clínicas
            const [notasClinicas] = await connection.query(`
                SELECT id, nota
                FROM notas_clinicas 
                WHERE atencion_id = ?
            `, [id]);

            // Obtener diagnósticos
            const [diagnosticos] = await connection.query(`
                SELECT id, descripcion, tipo_id
                FROM diagnosticos 
                WHERE atencion_id = ?
            `, [id]);

            // Obtener alergias
            const [alergias] = await connection.query(`
                SELECT 
                    aa.id,
                    aa.alergia_id,
                    aa.importancia_id,
                    DATE_FORMAT(aa.fecha_desde, '%Y-%m-%d') as fecha_desde,
                    DATE_FORMAT(aa.fecha_hasta, '%Y-%m-%d') as fecha_hasta
                FROM atencion_alergia aa
                WHERE aa.atencion_id = ?
            `, [id]);

            // Obtener antecedentes
            const [antecedentes] = await connection.query(`
                SELECT 
                    id,
                    descripcion,
                    DATE_FORMAT(fecha_desde, '%Y-%m-%d') as fecha_desde,
                    DATE_FORMAT(fecha_hasta, '%Y-%m-%d') as fecha_hasta
                FROM antecedentes_patologicos 
                WHERE atencion_id = ?
            `, [id]);

            // Obtener hábitos
            const [habitos] = await connection.query(`
                SELECT 
                    id,
                    descripcion,
                    DATE_FORMAT(fecha_desde, '%Y-%m-%d') as fecha_desde,
                    DATE_FORMAT(fecha_hasta, '%Y-%m-%d') as fecha_hasta
                FROM habitos 
                WHERE atencion_id = ?
            `, [id]);

            // Obtener medicamentos
            const [medicamentos] = await connection.query(`
                SELECT id, descripcion
                FROM medicamentos_en_uso 
                WHERE atencion_id = ?
            `, [id]);

            // Combinar todos los datos
            return {
                ...atencion,
                notas_clinicas: notasClinicas,
                diagnosticos,
                alergias,
                antecedentes,
                habitos,
                medicamentos
            };

        } catch (error) {
            console.error('Error al obtener atención completa:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async actualizarAtencion(atencionId, medicoId, datos) {
        const connection = await pool.getConnection();
        try {
            console.log('1. Iniciando transacción');
            console.log('2. Datos recibidos:', { atencionId, medicoId, datos });

            await connection.beginTransaction();

            // Agregar logs para cada operación
            console.log('3. Actualizando notas clínicas');
            for (const nota of datos.notasClinicas) {
                console.log('Procesando nota:', nota);
                if (nota.id) {
                    await connection.query(
                        'UPDATE notas_clinicas SET nota = ? WHERE id = ? AND atencion_id = ?',
                        [nota.contenido, nota.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO notas_clinicas (nota, atencion_id) VALUES (?, ?)',
                        [nota.contenido, atencionId]
                    );
                }
            }

            // 4. Actualizar diagnósticos
            console.log('5. Actualizando diagnósticos');
            for (const diagnostico of datos.diagnosticos) {
                if (diagnostico.id) {
                    await connection.query(
                        'UPDATE diagnosticos SET descripcion = ?, tipo_id = ? WHERE id = ? AND atencion_id = ?',
                        [diagnostico.descripcion, diagnostico.tipoId, diagnostico.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO diagnosticos (descripcion, tipo_id, atencion_id) VALUES (?, ?, ?)',
                        [diagnostico.descripcion, diagnostico.tipoId, atencionId]
                    );
                }
            }

            // 5. Actualizar alergias
            console.log('7. Actualizando alergias');
            for (const alergia of datos.alergias) {
                if (alergia.id) {
                    await connection.query(
                        'UPDATE atencion_alergia SET alergia_id = ?, importancia_id = ?, fecha_desde = ?, fecha_hasta = ? WHERE id = ? AND atencion_id = ?',
                        [alergia.alergiaId, alergia.importanciaId, alergia.fechaDesde, alergia.fechaHasta, alergia.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO atencion_alergia (atencion_id, alergia_id, importancia_id, fecha_desde, fecha_hasta) VALUES (?, ?, ?, ?, ?)',
                        [atencionId, alergia.alergiaId, alergia.importanciaId, alergia.fechaDesde, alergia.fechaHasta]
                    );
                }
            }

            // 6. Actualizar antecedentes
            console.log('9. Actualizando antecedentes');
            for (const antecedente of datos.antecedentes) {
                if (antecedente.id) {
                    await connection.query(
                        'UPDATE antecedentes_patologicos SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id = ? AND atencion_id = ?',
                        [antecedente.descripcion, antecedente.fechaDesde, antecedente.fechaHasta, antecedente.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO antecedentes_patologicos (descripcion, fecha_desde, fecha_hasta, atencion_id) VALUES (?, ?, ?, ?)',
                        [antecedente.descripcion, antecedente.fechaDesde, antecedente.fechaHasta, atencionId]
                    );
                }
            }

            // 7. Actualizar hábitos
            console.log('11. Actualizando hábitos');
            for (const habito of datos.habitos) {
                if (habito.id) {
                    await connection.query(
                        'UPDATE habitos SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id = ? AND atencion_id = ?',
                        [habito.descripcion, habito.fechaDesde, habito.fechaHasta, habito.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO habitos (descripcion, fecha_desde, fecha_hasta, atencion_id) VALUES (?, ?, ?, ?)',
                        [habito.descripcion, habito.fechaDesde, habito.fechaHasta, atencionId]
                    );
                }
            }

            // 8. Actualizar medicamentos
            console.log('13. Actualizando medicamentos');
            for (const medicamento of datos.medicamentos) {
                if (medicamento.id) {
                    await connection.query(
                        'UPDATE medicamentos_en_uso SET descripcion = ? WHERE id = ? AND atencion_id = ?',
                        [medicamento.descripcion, medicamento.id, atencionId]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO medicamentos_en_uso (descripcion, atencion_id) VALUES (?, ?)',
                        [medicamento.descripcion, atencionId]
                    );
                }
            }

            await connection.commit();
            console.log('4. Transacción completada');
            return true;

        } catch (error) {
            console.error('5. Error en la transacción:', error);
            console.error('6. Stack trace:', error.stack);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default Atencion;