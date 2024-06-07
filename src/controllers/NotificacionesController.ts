import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op, where } from "sequelize";

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
    this.router.delete("/eliminarNotificacion/:id", this.deleteNotificacion.bind(this));
    this.router.get("/getNotificaciones", this.getNotificaciones.bind(this));
    this.router.get("/getNotiAgente", this.getNotiAgente.bind(this));
    this.router.get("/getNotificacionAgente/:id/:fecha", this.getNotificacionAgente.bind(this));
  }

  private async notificacionAgenteBandera(id: any,fecha: any) {
    try {
      const fechaISO = new Date(fecha);

      const year = fechaISO.getUTCFullYear();
      const month = String(fechaISO.getUTCMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
      const day = String(fechaISO.getUTCDate()).padStart(2, "0");
      const fechaSinHora = `${year}-${month}-${day}`;

      const inicioDelDia = new Date(`${fechaSinHora}T00:00:00.000Z`);

      const finDelDia = new Date(inicioDelDia.getTime() + 86400000 - 1);

      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })

      //Mapear el arreglo de idNotis para buscar su descripción en la tabla Notificacion
      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdNotificacion: {
            [Op.in]: idNotis.map((noti: any) => noti.IdNotificacion)
          },
          FechaHora: {
            [Op.between]: [inicioDelDia, finDelDia],
          },
        }
      });

      return notificaciones;

    } catch(err: any) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  private async getNotificacionAgente(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const fechaISO = `${fecha}T00:00:00.000Z`;

      const idNotis = await db.NotiAgente.findAll({
        where: {IdEmpleado: id},
        attributes: ["IdNotificacion"]
      })
      //Mapear el arreglo de idNotis para buscar su descripción en la tabla Notificacion
      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdNotificacion: {
            [Op.in]: idNotis.map((noti: any) => noti.IdNotificacion)
          },
          FechaHora: {
            [Op.between]: [fechaISO, new Date(new Date(fechaISO).getTime() + 86400000)],
          }
        }
      });
      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error: " + error);
    }
  }

  private async getNotiAgente(req: Request, res: Response) {
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
      const { FechaHora, Titulo, Descripcion, IdEmpleado} = req.body;
      const notificacion = await db.Notificacion.create({
        FechaHora,
        Titulo,
        Descripcion,
      });
      
      await db.NotiAgente.create({
        IdNotificacion: notificacion.IdNotificacion,
        IdEmpleado,
      });

      // Envia notificacion a todos los empleados
      // const io = req.app.get("socketio"); // Web Socket
      // if (io) {
      //   const notificacionesGlobales = await this.notificacionDiaGlobalBandera(
      //     FechaHora
      //   );
      //   io.emit("notificacion_global", notificacionesGlobales);
      //   console.log("Notificación global enviada");
      // } else {
      //   console.log("No se pudo enviar la notificación global");
      // }

      res.status(201).json("<h1>Notificación creada con éxito</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
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

      // Creates new notification for each agent
      await db.sequelize.query(`
        INSERT INTO NotiAgente(IdNotificacion, IdEmpleado)
        SELECT ${newNoti.IdNotificacion}, IdEmpleado FROM Empleado WHERE Rol = 'agente';
        `);

      // Envia notificacion a un empleado
      // const io = req.app.get("socketio"); // Web Socket
      // if (io) {
      //   const notificacionEmpleado = await this.notificacionAgenteBandera(
      //     IdEmpleado,
      //     FechaHora
      //   );
      //   io.emit("notificacion_empleado", notificacionEmpleado);
      //   console.log("Notificación empleado enviada");
      // } else {
      //   console.log("No se pudo enviar la notificación global");
      // }

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
