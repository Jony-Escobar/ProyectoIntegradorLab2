import express, { urlencoded } from 'express';
const port = 3000;
const app=express();

//Middleware
app.use(express.json);
app.use(urlencoded);

app.get('/', (req,res)=>{
    res.send('App Funcionando')
})

app.listen(port,()=>{
    console.log(`Servidor funcionando en puerto ${port}`);
})