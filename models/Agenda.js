import { pool } from "../database/conexion.js";

class Agenda {
    //Metodos estaticos para poder exportar todo

    static async mostrarTurnosPorUsuario(id, especialidadId) {        
        const query = `
            SELECT
                DATE_FORMAT(turnos.hora, '%H:%i:%s') as hora,
                DATE_FORMAT(turnos.fecha, '%Y-%m-%d') as fecha,
                CONCAT(personas.nombre, ' ', personas.apellido) AS nombre_paciente,
                turnos.motivo_consulta,
                estados.estado AS estado_turno
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
}

//Exportamos todo
export default Agenda;