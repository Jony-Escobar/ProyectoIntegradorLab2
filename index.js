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

// 1. Primero configurar los archivos estáticos
// Solo necesitamos una configuración de archivos estáticos
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// 2. Luego configurar el resto de middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(cookieParser());

//Habilitar Pug
app.set("view engine", "pug")
app.set("views", "./views")

// 3. Finalmente configurar las rutas
// Asegúrate que las rutas de usuario estén después de la configuración de archivos estáticos
app.use('/', usuarioRoutes)

// Aplicar middleware de proteccion a todas las rutas privadas
app.use(protegerRuta);

// Rutas protegidas
app.use('/', agendaRoutes)
app.use('/', atencionRoutes)
app.get('/hc', (req, res) => {
    res.render('hc')
});

// Rutas API
app.use('/api/plantillas', plantillasRoutes);

// Asegurarse que esta línea esté antes de las rutas
app.use(express.static(path.join(process.cwd(), 'public')));

//Definir puerto y arrancar el proyecto
app.listen(port, () => {
    console.log(`Servidor funcionando en puerto ${port}`);
});
