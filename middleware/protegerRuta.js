import jwt from 'jsonwebtoken';

const protegerRuta = (req, res, next) => {
    const token = req.cookies._token;
    if (!token) {
        console.error('Error de autenticación: Token no encontrado en las cookies');
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            console.error('Error de autenticación: ID de usuario no encontrado en el token decodificado');
            return res.clearCookie('_token').redirect('/login');
        }
        req.userId = decoded.id;
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        return res.clearCookie('_token').redirect('/login');
    }
    next();
}

export default protegerRuta;