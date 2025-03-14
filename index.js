//Imports
import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import protegerRuta from './middleware/protegerRuta.js';
import usuarioRoutes from './routes/usuario.routes.js';
import agendaRoutes from './routes/agenda.routes.js';
import atencionRoutes from './routes/atencion.routes.js';
import path from 'path';
import plantillasRoutes from './routes/plantillas.routes.js';

//Variables
const port = 3000;
const app = express();

// 1. Configurar middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(cookieParser());

//Habilitar Pug
app.set("view engine", "pug")
app.set("views", "./views")

// 2. Rutas públicas
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.module.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// 3. Rutas públicas
app.use('/', usuarioRoutes)

// 4. Middleware de protección
app.use(protegerRuta);

// 5. Rutas protegidas
app.use('/', agendaRoutes)
app.use('/', atencionRoutes)
app.use('/api/plantillas', plantillasRoutes);

//Definir puerto y arrancar el proyecto
app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
