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
            this._instance = new ReporteController("reporte");
        }
        return this._instance;
    }
    //Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/test', this.getTest.bind(this));
        this.router.get('/consultarReportes', this.getConsultarReportes.bind(this));
        this.router.post('/crearReporte', this.postCrearReporte.bind(this)); //Socket
        this.router.delete('/eliminarReporte/:id', this.deleteBorrarReporte.bind(this));
        this.router.get('/reportesCliente/:id', this.getReportesCliente.bind(this));
    }

    private async getReportesCliente(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const reportes = await db.Reporte.findAll({
                where: { Celular: id }
            })

            // Si el cliente no tiene reportes
            if (reportes.length == 0) {
                return res.status(404).send("No tiene reportes");
            }

            res.status(200).json(reportes);

        } catch (err: any) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
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

    private async getConsultarReportes(req: Request, res: Response) {
        try {
            let reportes = await db["Reporte"].findAll();
            res.status(200).json(reportes);
        } catch (err) {
            console.log(err)
            res.status(500).send('Internal server error' + err);
        }
    }

    private async getInfoIncidenciasV2() {
        try {
          const incidencia = await db.sequelize.query(`
            SELECT *, Incidencia.Nombre as NombreIncidencia, Zona.Nombre as NombreZona
            FROM Reporte
            JOIN Incidencia ON Reporte.IdIncidencia = Incidencia.IdIncidencia
            JOIN Zona ON Reporte.IdZona = Zona.IdZona
          `, { type: db.sequelize.QueryTypes.SELECT });
    
          return incidencia;
        } catch (err) {
          console.log(err);
        }
      }

    private async postCrearReporte(req: Request, res: Response) {
        try {
            console.log(req.body);
            const nuevoReporte = await db.Reporte.create(req.body); //Insert
            console.log("Reporte creado");

            // Emitir evento de socket
            const io = req.app.get("socketio");
            if (io) {
                const incidencias = await this.getInfoIncidenciasV2();
                io.emit("newIncidencia", incidencias);
                console.log("Evento emitido");
            } else {
                console.log("Socket.IO no está disponible");
            }

            res.status(200).send("<h1>Reporte creado</h1>");
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }

    private async deleteBorrarReporte(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await db.Reporte.destroy({ where: { IdReporte: id } });
            console.log("Reporte eliminado");
            res.status(200).send("<h1>Reporte eliminado</h1>");
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error' + err);
        }
    }
}

export default ReporteController;