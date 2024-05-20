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
        this.router.get('/test',this.getTest.bind(this));
        this.router.get('/consultarLlamadas',this.getConsultarLlamadas.bind(this));
        this.router.post('/crearLlamada',this.postCrearLlamada.bind(this));
        this.router.delete('/eliminarLlamada/:id',this.deleteBorrarLlamada.bind(this));
        this.router.post('/crearIncidencia',this.postCrearIncidencia.bind(this));
        this.router.post('/crearEncuesta',this.postCrearEncuesta.bind(this));
        this.router.get('/infoTarjetas/:idLlamada',this.getInfoTarjetas.bind(this));
        this.router.put('/actualizarLlamada/:id',this.putActualizarLlamada.bind(this));
    }
    
    private async getInfoTarjetas(req: Request,res: Response){
        try{
            // let info = {
            //     totalLlamadas: await db.Llamada.count(),
            //     totalIncidencias: await db.Incidencia.count(),
            //     totalEncuestas: await db.Encuesta.count()
            // }
            // res.status(200).json(info);
            const {idLlamada} = req.params;
            let llamada = await db.Llamada.findOne({
                where: { IdLlamada: idLlamada },
                attributes: ['Asunto', 'Sentiment'],
                include: [
                    {
                        model: db.Cliente,
                        as: "Cliente",
                        attributes: ['Nombre', 'ApellidoP'],
                        include: [
                            {
                                model: db.Zona,
                                as: "Zona",
                                attributes: ['Nombre']
                            }
                        ]
                    },
                    {
                        model: db.Empleado,
                        as: "Empleado",
                        attributes: ['Nombre', 'ApellidoP'],
                    }
                ]
            });

            //Si no la encuentra
            if (llamada) {
                res.status(200).json(llamada);
            } else {
                res.status(404).send('Llamada no encontrada');
            }
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }
    
    private async putActualizarLlamada(req: Request,res: Response){
        try {
            const {id} = req.params;
            const {IdEmpleado} = req.body;
            
            await db.Llamada.update({ IdEmpleado }, { where: { IdLlamada: id } });
            res.status(200).send("<h1>Llamada actualizada</h1>");

        } catch (error: any) {
            console.log(error);
            res.status(500).send('Internal server error'+error);
        }
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

    private async postCrearIncidencia(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Incidencia.create(req.body); //Insert
            console.log("Incidencia creada");
            res.status(200).send("<h1>Incidencia creada</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async postCrearEncuesta(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Encuesta.create(req.body); //Insert
            console.log("Encuesta creada");
            res.status(200).send("<h1>Encuesta creada</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }
}

export default LlamadaController;