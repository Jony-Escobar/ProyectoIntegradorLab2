//Imports
import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import protegerRuta from './middleware/protegerRuta.js';
import usuarioRoutes from './routes/usuario.routes.js';
import agendaRoutes from './routes/agenda.routes.js';
import atencionRoutes from './routes/atencion.routes.js';

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

// Rutas publicas (sin autenticacion)
app.use('/', usuarioRoutes)

// Aplicar middleware de proteccion a todas las rutas privadas
app.use(protegerRuta);

// Rutas protegidas
app.use('/', agendaRoutes)
app.use('/', atencionRoutes)
app.get('/hc', (req, res) => {
    res.render('hc')
});

//* Definir la carpeta publica   
app.use(express.static('public'));

//Definir puerto y arrancar el proyecto
app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
