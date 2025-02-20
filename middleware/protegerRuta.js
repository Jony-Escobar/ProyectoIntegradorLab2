import jwt from 'jsonwebtoken';

const protegerRuta = (req, res, next) => {
    const token = req.cookies._token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = {
            id: decoded.id,
            nombre: decoded.nombre
        };

        // Validar acceso directo a la ruta /atencion
        if (req.path.startsWith('/atencion/') && !req.xhr) {
            const referer = req.headers.referer;
            if (!referer || !referer.includes('/agenda')) {
                return res.redirect('/agenda');
            }
        }

        next();
    } catch (error) {
        return res.clearCookie('_token').redirect('/login');
    }
};

export default protegerRuta;