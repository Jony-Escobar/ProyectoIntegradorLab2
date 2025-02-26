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
                DATE_FORMAT(atenciones.fecha_atencion, '%Y-%m-%d') as "Fecha"
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
                DATE_FORMAT(a.fecha_atencion, '%Y-%m-%d') as fecha,
                CONCAT(pm.nombre, ' ', pm.apellido) as medico,
                t.motivo_consulta as motivo,
                GROUP_CONCAT(DISTINCT d.descripcion SEPARATOR '; ') as diagnosticos,
                CASE 
                    WHEN m.id = ? THEN nc.nota 
                    ELSE NULL 
                END as evolucion,
                CASE 
                    WHEN m.id = ? THEN GROUP_CONCAT(DISTINCT al.alergia)
                    ELSE NULL 
                END as alergias,
                CASE 
                    WHEN m.id = ? THEN GROUP_CONCAT(DISTINCT i.importancia)
                    ELSE NULL 
                END as importancia_alergia,
                CASE 
                    WHEN m.id = ? THEN ap.descripcion
                    ELSE NULL 
                END as antecedentes,
                CASE 
                    WHEN m.id = ? THEN h.descripcion
                    ELSE NULL 
                END as habitos,
                CASE 
                    WHEN m.id = ? THEN mu.descripcion
                    ELSE NULL 
                END as medicamentos,
                m.id as medico_id
            FROM atenciones a
            JOIN turnos t ON t.id = a.turno_id
            JOIN agendas ag ON ag.id = t.agenda_id
            JOIN especialidad_medico em ON em.id = ag.especialidad_medico_id
            JOIN medicos m ON m.id = em.medico_id
            JOIN personas pm ON pm.id = m.persona_id
            LEFT JOIN diagnosticos d ON d.atencion_id = a.id
            LEFT JOIN notas_clinicas nc ON nc.atencion_id = a.id
            LEFT JOIN atencion_alergia aa ON aa.atencion_id = a.id
            LEFT JOIN alergias al ON al.id = aa.alergia_id
            LEFT JOIN importancias i ON i.id = aa.importancia_id
            LEFT JOIN antecedentes_patologicos ap ON ap.atencion_id = a.id
            LEFT JOIN habitos h ON h.atencion_id = a.id
            LEFT JOIN medicamentos_en_uso mu ON mu.atencion_id = a.id
            WHERE t.paciente_id = ?
            GROUP BY a.id, fecha, medico, motivo, evolucion, antecedentes, habitos, medicamentos, medico_id
            ORDER BY a.fecha_atencion DESC
        `;

        try {
            const [historial] = await pool.query(query, [
                medicoActualId, 
                medicoActualId,
                medicoActualId,
                medicoActualId,
                medicoActualId,
                medicoActualId,
                pacienteId
            ]);
            return historial;
        } catch (error) {
            console.error('Error al obtener historial médico:', error);
            throw new Error('Error al obtener historial médico');
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