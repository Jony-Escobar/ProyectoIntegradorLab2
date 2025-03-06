import { pool } from "../database/conexion.js";

class Agenda {
    //Metodos estaticos para poder exportar todo

    static async mostrarTurnosPorUsuario(id, especialidadId) {        
        const query = `
            SELECT
                turnos.id as id_turno,
                DATE_FORMAT(turnos.hora, '%H:%i:%s') as hora,
                DATE_FORMAT(turnos.fecha, '%Y-%m-%d') as fecha,
                CONCAT(personas.nombre, ' ', personas.apellido) AS nombre_paciente,
                turnos.motivo_consulta,
                estados.estado AS estado_turno,
                pacientes.id as id_paciente
            FROM
                turnos
            JOIN pacientes ON turnos.paciente_id = pacientes.id
            JOIN personas ON personas.id = pacientes.persona_id
            JOIN estados ON estados.id = turnos.estado_id
            JOIN agendas ON agendas.id = turnos.agenda_id
            JOIN especialidad_medico ON especialidad_medico.id = agendas.especialidad_medico_id
            JOIN medicos ON medicos.id = especialidad_medico.medico_id
            WHERE
                medicos.usuario_id = ?
                AND especialidad_medico.id = ?
            ORDER BY
                turnos.fecha, turnos.hora;
        `;

        try {
            const [turnos] = await pool.query(query, [id, especialidadId]);
            return turnos;
        } catch (error) {
            throw error;
        }
    }

    static async obtenerEspecialidadesMedico(usuarioId) {
        const [especialidades] = await pool.query(`
            SELECT 
                em.id,
                e.especialidad as especialidad,
                em.matricula
            FROM especialidad_medico em
            JOIN especialidades e ON e.id = em.especialidad_id
            JOIN medicos m ON m.id = em.medico_id
            WHERE m.usuario_id = ?
        `, [usuarioId]);
        
        return especialidades;
    }

    static async mostrarAtencionesPrevias(id){
        const query = `
            SELECT
                personas.apellido AS 'Apellido',
                personas.nombre AS 'Nombre',
                turnos.motivo_consulta AS 'Motivo Consulta',
                DATE_FORMAT(atenciones.fecha_atencion, '%d-%m-%Y') as "Fecha"
            FROM turnos
                JOIN atenciones ON turnos.id = atenciones.turno_id
                JOIN pacientes ON turnos.paciente_id = pacientes.id
                JOIN personas ON pacientes.persona_id = personas.id
            WHERE personas.id = ?;
        `;

        try {
            const [atenciones] = await pool.query(query, [id]);
            return atenciones;
        } catch (error) {
            throw error;
        }
    }

    static async informacionPaciente(id){
        const query = `
            SELECT personas.*, pacientes.id as paciente_id 
            FROM personas 
            INNER JOIN pacientes ON pacientes.persona_id = personas.id 
            WHERE pacientes.id = ?;`

        try {
            const [paciente] = await pool.query(query, [id]);
            return paciente;
        } catch (error) {
            console.error('Error obteniendo datos del paciente:', error);
            throw new Error('Error obteniendo datos del paciente');
        }
    }

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

    static async obtenerHistorialMedico(pacienteId, medicoActualId) {
        const query = `
            SELECT 
                a.id,
                DATE_FORMAT(a.fecha_atencion, '%d-%m-%Y') as fecha,
                CONCAT(pm.nombre, ' ', pm.apellido) as medico,
                t.motivo_consulta as motivo,
                -- Diagnósticos
                GROUP_CONCAT(DISTINCT CONCAT(d.descripcion, ':::', td.tipo) SEPARATOR '|||') as diagnosticos_info,
                -- Alergias
                CASE 
                    WHEN m.id = ? THEN 
                        GROUP_CONCAT(DISTINCT CONCAT(
                            al.alergia, ':::', 
                            i.importancia, ':::', 
                            IFNULL(DATE_FORMAT(aa.fecha_desde, '%Y-%m-%d'), ''), ':::', 
                            IFNULL(DATE_FORMAT(aa.fecha_hasta, '%Y-%m-%d'), '')
                        ) SEPARATOR '|||')
                    ELSE NULL 
                END as alergias_info,
                -- Antecedentes
                CASE 
                    WHEN m.id = ? THEN 
                        GROUP_CONCAT(DISTINCT CONCAT(
                            ap.descripcion, ':::', 
                            IFNULL(DATE_FORMAT(ap.fecha_desde, '%Y-%m-%d'), ''), ':::', 
                            IFNULL(DATE_FORMAT(ap.fecha_hasta, '%Y-%m-%d'), '')
                        ) SEPARATOR '|||')
                    ELSE NULL 
                END as antecedentes_info,
                -- Hábitos
                CASE 
                    WHEN m.id = ? THEN 
                        GROUP_CONCAT(DISTINCT CONCAT(
                            h.descripcion, ':::', 
                            IFNULL(DATE_FORMAT(h.fecha_desde, '%Y-%m-%d'), ''), ':::', 
                            IFNULL(DATE_FORMAT(h.fecha_hasta, '%Y-%m-%d'), '')
                        ) SEPARATOR '|||')
                    ELSE NULL 
                END as habitos_info,
                -- Medicamentos
                CASE 
                    WHEN m.id = ? THEN 
                        GROUP_CONCAT(DISTINCT CONCAT(
                            mu.descripcion, ':::', 
                            IFNULL(DATE_FORMAT(mu.fecha_desde, '%Y-%m-%d'), ''), ':::', 
                            IFNULL(DATE_FORMAT(mu.fecha_hasta, '%Y-%m-%d'), '')
                        ) SEPARATOR '|||')
                    ELSE NULL 
                END as medicamentos_info,
                -- Evolución (notas)
                CASE 
                    WHEN m.id = ? THEN GROUP_CONCAT(DISTINCT nc.nota SEPARATOR '|||')
                    ELSE NULL 
                END as evolucion,
                m.id as medico_id
            FROM atenciones a
            JOIN turnos t ON t.id = a.turno_id
            JOIN agendas ag ON ag.id = t.agenda_id
            JOIN especialidad_medico em ON em.id = ag.especialidad_medico_id
            JOIN medicos m ON m.id = em.medico_id
            JOIN personas pm ON pm.id = m.persona_id
            LEFT JOIN diagnosticos d ON d.atencion_id = a.id
            LEFT JOIN tipos td ON td.id = d.tipo_id
            LEFT JOIN notas_clinicas nc ON nc.atencion_id = a.id
            LEFT JOIN atencion_alergia aa ON aa.atencion_id = a.id
            LEFT JOIN alergias al ON al.id = aa.alergia_id
            LEFT JOIN importancias i ON i.id = aa.importancia_id
            LEFT JOIN antecedentes_patologicos ap ON ap.atencion_id = a.id
            LEFT JOIN habitos h ON h.atencion_id = a.id
            LEFT JOIN medicamentos_en_uso mu ON mu.atencion_id = a.id
            WHERE t.paciente_id = ?
            GROUP BY 
                a.id, 
                fecha, 
                medico, 
                motivo,
                medico_id
            ORDER BY a.fecha_atencion DESC
        `;

        try {
            const [historial] = await pool.query(query, [
                medicoActualId, // Para alergias
                medicoActualId, // Para antecedentes
                medicoActualId, // Para hábitos
                medicoActualId, // Para medicamentos
                medicoActualId, // Para evolución
                pacienteId
            ]);
            
            // Procesar los datos recibidos para mantener la compatibilidad
            return historial.map(consulta => {
                // Procesar diagnósticos
                const diagnosticosInfo = consulta.diagnosticos_info ? consulta.diagnosticos_info.split('|||') : [];
                const diagnosticos = [];
                const tiposDiagnostico = [];
                
                diagnosticosInfo.forEach(info => {
                    const [diag, tipo] = info.split(':::');
                    if (diag) {
                        diagnosticos.push(diag);
                        tiposDiagnostico.push(tipo || 'No especificado');
                    }
                });
                
                // Procesar alergias
                const alergiasInfo = consulta.alergias_info ? consulta.alergias_info.split('|||') : [];
                const alergias = [];
                const importanciasAlergia = [];
                const alergiasFechaDesde = [];
                const alergiasFechaHasta = [];
                
                alergiasInfo.forEach(info => {
                    const [alergia, importancia, fechaDesde, fechaHasta] = info.split(':::');
                    if (alergia) {
                        alergias.push(alergia);
                        importanciasAlergia.push(importancia || 'No especificada');
                        alergiasFechaDesde.push(fechaDesde || '');
                        alergiasFechaHasta.push(fechaHasta || '');
                    }
                });
                
                // Procesar antecedentes
                const antecedentesInfo = consulta.antecedentes_info ? consulta.antecedentes_info.split('|||') : [];
                const antecedentes = [];
                const antecedentesFechaDesde = [];
                const antecedentesFechaHasta = [];
                
                antecedentesInfo.forEach(info => {
                    const [antecedente, fechaDesde, fechaHasta] = info.split(':::');
                    if (antecedente) {
                        antecedentes.push(antecedente);
                        antecedentesFechaDesde.push(fechaDesde || '');
                        antecedentesFechaHasta.push(fechaHasta || '');
                    }
                });
                
                // Procesar hábitos
                const habitosInfo = consulta.habitos_info ? consulta.habitos_info.split('|||') : [];
                const habitos = [];
                const habitosFechaDesde = [];
                const habitosFechaHasta = [];
                
                habitosInfo.forEach(info => {
                    const [habito, fechaDesde, fechaHasta] = info.split(':::');
                    if (habito) {
                        habitos.push(habito);
                        habitosFechaDesde.push(fechaDesde || '');
                        habitosFechaHasta.push(fechaHasta || '');
                    }
                });
                
                // Procesar medicamentos
                const medicamentosInfo = consulta.medicamentos_info ? consulta.medicamentos_info.split('|||') : [];
                const medicamentos = [];
                const medicamentosFechaDesde = [];
                const medicamentosFechaHasta = [];
                
                medicamentosInfo.forEach(info => {
                    const [medicamento, fechaDesde, fechaHasta] = info.split(':::');
                    if (medicamento) {
                        medicamentos.push(medicamento);
                        medicamentosFechaDesde.push(fechaDesde || '');
                        medicamentosFechaHasta.push(fechaHasta || '');
                    }
                });
                
                // Convertir evolución al formato esperado
                const evolucion = consulta.evolucion ? consulta.evolucion.split('|||').join('; ') : null;
                
                return {
                    ...consulta,
                    diagnosticos: diagnosticos.join('; '),
                    tipos_diagnostico: tiposDiagnostico.join('; '),
                    alergias: alergias.join('; '),
                    importancia_alergia: importanciasAlergia.join('; '),
                    alergias_fecha_desde: alergiasFechaDesde.join('; '),
                    alergias_fecha_hasta: alergiasFechaHasta.join('; '),
                    antecedentes: antecedentes.join('; '),
                    antecedentes_fecha_desde: antecedentesFechaDesde.join('; '),
                    antecedentes_fecha_hasta: antecedentesFechaHasta.join('; '),
                    habitos: habitos.join('; '),
                    habitos_fecha_desde: habitosFechaDesde.join('; '),
                    habitos_fecha_hasta: habitosFechaHasta.join('; '),
                    medicamentos: medicamentos.join('; '),
                    medicamentos_fecha_desde: medicamentosFechaDesde.join('; '),
                    medicamentos_fecha_hasta: medicamentosFechaHasta.join('; '),
                    evolucion
                };
            });
        } catch (error) {
            console.error('Error al obtener historial médico:', error);
            throw error;
        }
    }

    static async actualizarTurnosAntiguos() {
        const query = `
            UPDATE turnos 
            SET estado_id = 4
            WHERE fecha < CURDATE() 
            AND estado_id != 3
        `;

        try {
            const [resultado] = await pool.query(query);
            return resultado;
        } catch (error) {
            console.error('Error actualizando turnos antiguos:', error);
            throw new Error('Error actualizando turnos antiguos');
        }
    }

    static async obtenerUltimaAtencion(pacienteId, medicoId) {
        const query = `
            SELECT 
                a.id,
                a.fecha_atencion,
                t.id as turno_id,
                m.id as medico_id
            FROM atenciones a
            JOIN turnos t ON t.id = a.turno_id
            JOIN agendas ag ON ag.id = t.agenda_id
            JOIN especialidad_medico em ON em.id = ag.especialidad_medico_id
            JOIN medicos m ON m.id = em.medico_id
            WHERE t.paciente_id = ? 
            AND m.id = ?
            ORDER BY a.fecha_atencion DESC
            LIMIT 1
        `;

        try {
            const [atencion] = await pool.query(query, [pacienteId, medicoId]);
            return atencion[0];
        } catch (error) {
            console.error('Error al obtener última atención:', error);
            throw new Error('Error al obtener última atención');
        }
    }
}

//Exportamos todo
export default Agenda;