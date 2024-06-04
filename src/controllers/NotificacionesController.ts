import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { where } from "sequelize";

class ReporteController extends AbstractController {
    //Singleton
    //Atributo de clase
    private static _instance: ReporteController;
    //Método de clase
    public static get instance(): AbstractController {
        if (!this._instance) {
            this._instance = new ReporteController("notificacion");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/test', this.getTest.bind(this));
        this.router.post('/crearNotificacion', this.postCrearNotificacion.bind(this));
        this.router.get('/consultarNotificaciones', this.getConsultarNotificaciones.bind(this));
        this.router.post('/crearNotificacionEsGlobal', this.postCrearNotificacionEsGlobal.bind(this));
    }

    private async getConsultarNotificaciones(req: Request, res: Response) {
        try {
            const notificaciones = await db.Notificacion.findAll({
                include: [
                    {
                        model: db.Empleado,
                        as: "Empleado",
                        attributes: ["Nombre", "ApellidoP", "ApellidoM"],
                    },
                ],
            });
            res.status(200).json(notificaciones);
        } catch (error: any) {
            console.log(error);
            res.status(500).send('Internal server error' + error);
        }
    }

    private async postCrearNotificacionEsGlobal(req: Request, res: Response) {
        try {
            const { FechaHora, Titulo, Descripcion } = req.body;
            const notificacion = await db.Notificacion.create({
                EsGlobal: true,
                FechaHora,
                Titulo,
                Descripcion,
                IdEmpleado: null
            });
            res.status(201).json("<h1>Notificación creada con éxito</h1>");
        } catch (error: any) {
            console.log(error);
            res.status(500).send('Internal server error' + error);
        }
    }

    private async postCrearNotificacion(req: Request, res: Response) {
        try {
            const { EsGlobal, FechaHora, Titulo, Descripcion, IdEmpleado } = req.body;
            const notificacion = await db.Notificacion.create({
                EsGlobal,
                FechaHora,
                Titulo,
                Descripcion, 
                IdEmpleado
            });
            res.status(201).json("<h1>Notificación creada con éxito</h1>");
        } catch (error: any) {
            console.log(error);
            res.status(500).send('Internal server error' + error);
        }
    }

    private getTest(req: Request, res: Response) {
        try {
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>")
        } catch (error: any) {
            console.log(error);
            res.status(500).send('Internal server error' + error);
        }
    }
}

export default ReporteController;