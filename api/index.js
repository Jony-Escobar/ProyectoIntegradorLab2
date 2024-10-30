import dotenv from 'dotenv';
import express, { urlencoded } from 'express';

dotenv.config();
const port = 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('App Funcionando');
});

app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
