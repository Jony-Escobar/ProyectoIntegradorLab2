//Imports
import express, { urlencoded } from 'express';
import cors from 'cors'
import usuarioRoutes from '../routes/usuario.routes.js';
import agendaRoutes from '../routes/agenda.routes.js'

//Variables
const port = 3000;
const app = express();

//Middlewares
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended:true}))

//Habilitar Pug
app.set("view engine", "pug")
app.set("views", "./views")

//Routing
app.get('/test', (req, res) => {
    res.send('App Funcionando');
});
app.use('/', usuarioRoutes)
app.use('/', agendaRoutes)

//Definir puerto y arrancar el proyecto
app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});

//Vercel
export default app;