import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class LlamadaController extends AbstractController {
    //Singleton
    //Atributo de clase
    private static _instance: LlamadaController;
    //Método de clase
    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new LlamadaController("llamada");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/test',this.getTest.bind(this));//*
        this.router.get('/consultarLlamadas',this.getConsultarLlamadas.bind(this));//*
        this.router.post('/crearLlamada',this.postCrearLlamada.bind(this));//*
        this.router.delete('/eliminarLlamada/:id',this.deleteBorrarLlamada.bind(this));//*
        this.router.get('/consultarAsunto', this.getConsultarAsunto.bind(this));//*
        this.router.post('/crearAsunto', this.postCrearAsunto.bind(this));//*
        this.router.put('/actualizarAsunto/:id', this.putActualizarAsunto.bind(this));//* NO IMPLEMENTADO EN APPS
    }
    
    private getTest(req: Request,res: Response){
        try{
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>")
        }catch(error:any){
            console.log(error);
            res.status(500).send('Internal server error'+error);
        }
    }

    private async getConsultarLlamadas(req: Request,res: Response){
        try{
            let llamadas = await db["Llamada"].findAll();
            res.status(200).json(llamadas);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }
    
    private async postCrearLlamada(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Llamada.create(req.body); //Insert
            console.log("Llamada creada");
            res.status(200).send("<h1>Llamada creada</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async deleteBorrarLlamada(req: Request,res: Response){
        try{
            const {id} = req.params;
            await db.Llamada.destroy({where:{IdLlamada:id}});
            res.status(200).send("<h1>Llamada eliminada</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async getConsultarAsunto(req: Request,res: Response){
        try{
            let asuntos = await db["Asunto"].findAll();
            res.status(200).json(asuntos);
        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }

    private async postCrearAsunto(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Asunto.create(req.body); //Insert
            console.log("Asunto creado");
            res.status(200).send("<h1>Asunto creado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async putActualizarAsunto(req: Request,res: Response){
        try{
            const {id} = req.params;
            await db.Asunto.update(req.body,{where:{IdAsunto:id}});
            res.status(200).send("<h1>Asunto actualizado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }
}

export default LlamadaController;