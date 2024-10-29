module.exports={
    HOST: process.env.HOST,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    DATABASE: process.env.DATABASE,
    PORT: process.env.PORT,
    waitForConnections:true,
    connectLimit: 10,
    queueLimit: 0
}