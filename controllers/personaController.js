import { json } from 'express';
import { pool } from '../database/conexion.js';

class PersonaController{
    constructor(){}

    async consultarTodos(req,res){
        try {
            const[rows] = await pool.query('SELECT * FROM persona');
            res.status(200).json(rows)
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
        
    async insertar(){}

    async consultarUno(){}

    async modificar(){}

    async eliminar(){}

}

export default new PersonaController();