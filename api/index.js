import express, { urlencoded } from 'express';
import cors from 'cors'
import personaRouter from '../routes/persona.routes.js';

const port = 3000;
const app = express();

//Middlewares
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.send('App Funcionando');
});

app.use('/personas', personaRouter)

app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});