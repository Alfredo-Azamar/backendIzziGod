import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import {RolEnum} from "../models/EmpleadoModel";
import db from "../models";

class EmpleadoController extends AbstractController {
    //Singleton
    //Atributo de clase
    private static _instance: EmpleadoController;
    //Método de clase
    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new EmpleadoController("empleado");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/test',this.getTest.bind(this));//*
        this.router.get('/consultarEmpleados',this.getConsultarEmpleados.bind(this));//*
        this.router.post('/crearEmpleado',this.postCrearEmpleado.bind(this));//*
        this.router.delete('/eliminarEmpleado/:id',this.deleteBorrarEmpleado.bind(this));//*
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

    private async getConsultarEmpleados(req: Request,res: Response){
        try{
            let empleados = await db["Empleado"].findAll(); // Manda los datos de la tabla
            res.status(200).json(empleados);

        }catch(err){
            console.log(err)
            res.status(500).send('Internal server error'+err);
        }
    }
    
    private async postCrearEmpleado(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Empleado.create(req.body); //Insert
            console.log("Empleado creado");
            res.status(200).send("<h1>Empleado creado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async deleteBorrarEmpleado(req: Request,res: Response){
        try{
            const {id} = req.params;
            await db.Empleado.destroy({where:{IdEmpleado:id}});
            res.status(200).send("<h1>Empleado eliminado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }
}

export default EmpleadoController;