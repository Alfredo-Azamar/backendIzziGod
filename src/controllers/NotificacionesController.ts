import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op, where } from "sequelize";
import moment from 'moment-timezone';

class ReporteController extends AbstractController {
  //Singleton
  //Class attribute
  private static _instance: ReporteController;
  //Class Method
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new ReporteController("notificacion");
    }
    return this._instance;
  }
  //Routes controller declaration
  protected initRoutes(): void {
    // Test route
    this.router.get("/test", this.getTest.bind(this));

    //Create global notification
    this.router.post("/crearNotificacion", this.postCrearNotificacion.bind(this)); 

    //Create notification for a specific agent
    this.router.post("/crearNotificacionAgente", this.postCrearNotificacionAgente.bind(this)); 

    // Delete notification
    this.router.delete("/eliminarNotificacion/:idNoti/:idAgente", this.deleteNotificacion.bind(this));

    // Get all notifications
    this.router.get("/getNotificaciones", this.getNotificaciones.bind(this));

    // Get all notifications for a specific agent
    this.router.get("/getNotificacionAgente/:id", this.getNotificacionAgente.bind(this));
  }

  // Get all notifications for a specific agent
  private async getNotificacionAgente(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Find all notifications for the agent
      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })
      //Map the idNotis array to find its description in the Notification table
      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdNotificacion: {
            [Op.in]: idNotis.map((noti: any) => noti.IdNotificacion)
          }
        },
        attributes: ["IdNotificacion","Titulo", "Descripcion"]
      });
      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error: " + error);
    }
  }

  // Get all notifications
  private async getNotificaciones(req: Request, res: Response) {
    try {
      const notificaciones = await db.Notificacion.findAll();
      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Delete notification
  private async deleteNotificacion(req: Request, res: Response) {
    try {
      const {idNoti, idAgente} = req.params;
      // await db.Notificacion.destroy({where:{IdNotificacion:idNoti}});
      await db.NotiAgente.destroy(
        {
          where:{
            IdNotificacion:idNoti,
            IdEmpleado:idAgente
          }
        });
      res.status(200).send("Notificación eliminada correctamente");

    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }


  // Create notification for a specific agent
  private async postCrearNotificacionAgente(req: Request, res: Response) {
    try {
      const {Titulo, Descripcion, IdEmpleado} = req.body;
      const FechaHora = moment().tz("America/Mexico_City").format();
      const subFechaHora = FechaHora.substring(0, 19);
      
      const notificacion = await db.sequelize.query(`
        INSERT INTO Notificacion(FechaHora, Titulo, Descripcion)
        VALUES('${subFechaHora}', '${Titulo}', '${Descripcion}');
        `);
    
      await db.NotiAgente.create({
        IdNotificacion: notificacion[0],
        IdEmpleado,
      });

      // Notify the agent that a notification has been created
      const io = req.app.get("socketio"); 
      if (io) {
        const notificacionEmpleado = await this.notificacionAgenteBandera(
          IdEmpleado
        );
        io.emit(`notificacion_empleado_${IdEmpleado}`, notificacionEmpleado);
        console.log("Notificación enviada a empleado: " + IdEmpleado);
        console.log(notificacionEmpleado);
      } else {
        console.log("No se pudo enviar la notificación global");
      }

      res.status(201).json("<h1>Notificación creada con éxito</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Get all notifications for a specific agent
  private async notificacionAgenteBandera(id: any) {
    try {
      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })

      //Map the idNotis array to find its description in the Notification table
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

  // Create global notification
  private async postCrearNotificacion(req: Request, res: Response) {
    try {
      // Creates new notification
      const {Titulo, Descripcion} = req.body;
      const FechaHora = moment().tz("America/Mexico_City").format();
      const subFechaHora = FechaHora.substring(0, 19); 

      console.log(subFechaHora);

      // Inster new notification
      const newNoti = await db.sequelize.query(`
        INSERT INTO Notificacion(FechaHora, Titulo, Descripcion)
        VALUES('${subFechaHora}', '${Titulo}', '${Descripcion}');
        `);

      // Find all agents
      const agentesId = await db.Empleado.findAll({
        where: {Rol: "agente"},
        attributes: ["IdEmpleado"]
      });

      // Create a new notification for each agent
      const notiAgentes = agentesId.map((agente: any) => ({
        IdNotificacion: newNoti[0],
        IdEmpleado: agente.IdEmpleado
      }));

      // Insert all the relations in the database
      await db.NotiAgente.bulkCreate(notiAgentes);  

      // Notify all agents that a new notification has been created
      const io = req.app.get("socketio"); // Web Socket
      if (io) {

        // Notify each agent
        for (const agente of agentesId) {
          const notificacionEmpleado = await this.notificacionAgenteBandera(agente.IdEmpleado);
          console.log("Notificación enviada a empleado: " + agente.IdEmpleado);
          io.emit(`notificacion_empleado_${agente.IdEmpleado}` , notificacionEmpleado);
        }
        console.log("Notificación empleado enviada a todos los agentes");
      } else { 
        console.log("No se pudo enviar la notificación global");
      }

      res.status(201).json("<h1>Notificación creada con éxito</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  // Test route
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
