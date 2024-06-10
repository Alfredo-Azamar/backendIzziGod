import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op, where } from "sequelize";
import moment from 'moment-timezone';

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
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crearNotificacion", this.postCrearNotificacion.bind(this));
    this.router.post("/crearNotificacionAgentes", this.postCrearNotificacionAgente.bind(this));
    this.router.get("/consultarNotificaciones", this.getConsultarNotificaciones.bind(this));
    this.router.get("/notificacionesAgente/:id/:fecha", this.notificacionAgente.bind(this));
    this.router.get("/notificacionesDiaGlobal/:fecha", this.notificacionesDiaGlobal.bind(this));
    this.router.delete("/eliminarNotificacion/:id", this.deleteNotificacion.bind(this));
    this.router.get("/getNotificaciones", this.getNotificaciones.bind(this));
    this.router.get("/getNotisAgentes", this.getNotisAgentes.bind(this));
    this.router.get("/getNotificacionAgente/:id", this.getNotificacionAgente.bind(this));
  }

  private async getNotificacionAgente(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })
      //Mapear el arreglo de idNotis para buscar su descripción en la tabla Notificacion
      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdNotificacion: {
            [Op.in]: idNotis.map((noti: any) => noti.IdNotificacion)
          }
        },
        attributes: ["Titulo", "Descripcion"]
      });
      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error: " + error);
    }
  }

  private async getNotisAgentes(req: Request, res: Response) {
    try{
      const notiAgentec= await db.NotiAgente.findAll();
      res.status(200).json(notiAgentec);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async getNotificaciones(req: Request, res: Response) {
    try {
      const notificaciones = await db.Notificacion.findAll();
      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async deleteNotificacion(req: Request, res: Response) {
    try {

      const {id} = req.params;
      await db.Notificacion.destroy({where:{IdNotificacion:id}});
      res.status(200).send("Notificación eliminada correctamente");

    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async postCrearNotificacionAgente(req: Request, res: Response) {
    try {
      const {Titulo, Descripcion, IdEmpleado} = req.body;
      const FechaHora = moment().tz("America/Mexico_City").format();
      const subFechaHora = FechaHora.substring(0, 19);
      console.log(FechaHora);
      const notificacion = await db.sequelize.query(`
        INSERT INTO Notificacion(FechaHora, Titulo, Descripcion)
        VALUES('${subFechaHora}', '${Titulo}', '${Descripcion}');
        `);

      // const notificacion = await db.Notificacion.create({
      //   FechaHora,
      //   Titulo,
      //   Descripcion,
      // });

      console.log(notificacion[0]);
      
      await db.NotiAgente.create({
        IdNotificacion: notificacion[0],
        IdEmpleado,
      });

      // Envia notificacion a todos los empleados
      const io = req.app.get("socketio"); // Web Socket
      if (io) {
        const notificacionEmpleado = await this.notificacionAgenteBandera(
          IdEmpleado
        );
        io.emit("notificacion_Empleado", notificacionEmpleado);
        console.log("Notificación enviada a empleado: " + IdEmpleado);
      } else {
        console.log("No se pudo enviar la notificación global");
      }

      res.status(201).json("<h1>Notificación creada con éxito</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async notificacionAgenteBandera(id: any) {
    try {
      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })

      //Mapear el arreglo de idNotis para buscar su descripción en la tabla Notificacion
      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdNotificacion: {
            [Op.in]: idNotis.map((noti: any) => noti.IdNotificacion)
          }
        }
      });

      return notificaciones;

    } catch(err: any) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  private async postCrearNotificacion(req: Request, res: Response) {
    try {
      // Creates new notification
      const {FechaHora, Titulo, Descripcion} = req.body;

      const newNoti = await db.Notificacion.create({
        FechaHora,
        Titulo,
        Descripcion
      });

      const agentesId = await db.Empleado.findAll({
        where: {Rol: "agente"},
        attributes: ["IdEmpleado"]
      });

      const notiAgentes = agentesId.map((agente: any) => ({
        IdNotificacion: newNoti.IdNotificacion,
        IdEmpleado: agente.IdEmpleado
      }));

      await db.NotiAgente.bulkCreate(notiAgentes);  // Inserta los datos de notiAgentes a la tabla

      // Envia notificacion a todos los empleados
      const io = req.app.get("socketio"); // Web Socket
      if (io) {
        let count = 0;
        for (const agente of agentesId) {
          const notificacionEmpleado = await this.notificacionAgenteBandera(agente.IdEmpleado);
          console.log("Notificación enviada a empleado: " + agente.IdEmpleado);
          io.emit("notificacion_empleado", notificacionEmpleado);
          count++;
        }
        console.log("Notificación empleado enviada" + count + " veces");
      } else { 
        console.log("No se pudo enviar la notificación global");
      }

      res.status(201).json("<h1>Notificación creada con éxito</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private getTest(req: Request, res: Response) {
    try {
      console.log("Prueba exitosa :)");
      res.status(200).send("<h1>Prueba exitosa</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }
}

export default ReporteController;
