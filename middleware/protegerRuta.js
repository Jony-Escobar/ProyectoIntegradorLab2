import jwt from 'jsonwebtoken';

const protegerRuta = (req, res, next) => {
    const token = req.cookies._token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
    } catch (error) {
        return res.clearCookie('_token').redirect('/login');
    }
    next();
}

export default protegerRuta;