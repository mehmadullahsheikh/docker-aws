import express from "express"
import {createServer} from "http"
import {Server} from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"

const app=express()
const httpServer= createServer(app)

const io=new Server(httpServer,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

const ySocketIO=new YSocketIO(io);
ySocketIO.initialize()

//health check routes
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"hello world",
        sucess:true

    })
})

app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"ok",
        sucess:true

    })
})

httpServer.listen(3000,()=>{
    console.log("server is running on port 3000")
})