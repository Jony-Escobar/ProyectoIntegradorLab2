import jwt from 'jsonwebtoken';

const generarJWT = userData => jwt.sign({
    id: userData.id,
    nombre: userData.nombre_completo
}, process.env.JWT_SECRET, { 
    expiresIn: '12h' 
});

export default generarJWT;
