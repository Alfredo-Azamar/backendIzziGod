//const express = require('express'); //JS
import express, {Request, Response} from 'express'; //TS
import AbstractController from '../controllers/AbstractController';
import db from '../models';
import cors from 'cors';

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as socketIo from 'socket.io';

class Server{
    //Atributos de instancia
    private app: express.Application;
    private port: number;
    private env:string;
    private server:any;
    private io:any;
    //Metodos de instancia

    constructor(appInit:{port:number;env:string;middlewares:any[];controllers:AbstractController[]}){
        this.app = express();
        this.port = appInit.port;
        this.env = appInit.env;
        this.loadmiddlewares(appInit.middlewares);
        this.loadRoutes(appInit.controllers);
        this.connectDB();
        
        this.app.use(cors());

        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*",
            },
        });
        this.app.set('socketio', this.io);
        this.setupSocketIO();
        
    }

    private loadRoutes(controllers:AbstractController[]):void{
        this.app.get('/',(req:Request,res:Response)=>{
            res.status(200).send('Hello world');
        })
        
        controllers.forEach((controller:AbstractController )=> {
            this.app.use(`/${controller.prefix}`,controller.router);
        })
    }

    private loadmiddlewares(middlewares:any[]):void{
        middlewares.forEach((middleware:any)=>{
            this.app.use(middleware);
        })
    }

    private async connectDB(){
        await db.sequelize.sync({force:false}); //true para que borre todo antes de realizarlo
    }

    public init(){
        this.server.listen(this.port,()=>{
            console.log(`Server running on port ${this.port}`);
        })       
    }

    private setupSocketIO() {
        this.io.on('connection', (socket: socketIo.Socket) => {
            console.log('A user connected');
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

}

export default Server;