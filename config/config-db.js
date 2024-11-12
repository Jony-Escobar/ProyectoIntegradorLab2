import dotenv from 'dotenv';
dotenv.config();

const dbconfig = {
    //Local
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'atencion_medica',
    
    /*Production
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,*/
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  export default dbconfig;