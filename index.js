//Imports
import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuario.routes.js';
import agendaRoutes from './routes/agenda.routes.js';

//Variables
const port = 3000;
const app = express();

//Middlewares
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
//Habilitar Pug
app.set("view engine", "pug")
app.set("views", "./views")

//Routing
app.get('/test', (req, res) => {
    res.render('hc')
});

app.use('/', usuarioRoutes)
app.use('/', agendaRoutes)

//* Definir la carpeta publica   
app.use(express.static('public'));

//Definir puerto y arrancar el proyecto
app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
