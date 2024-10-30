import express, { urlencoded } from 'express';
const port = 3000;
const app = express();

// Middleware
app.use(express.json()); // Faltaban los paréntesis
app.use(urlencoded({ extended: true })); // Agregado el objeto de configuración

app.get('/', (req, res) => {
    res.send('App Funcionando');
});

app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
