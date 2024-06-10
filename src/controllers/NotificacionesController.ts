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
    this.router.get("/consultarNotificaciones", this.getConsultarNotificaciones.bind(this));
    this.router.get("/notificacionesAgente/:id/:fecha", this.notificacionAgente.bind(this));
    this.router.get("/notificacionesDiaGlobal/:fecha", this.notificacionesDiaGlobal.bind(this));
    this.router.delete("/eliminarNotificacion/:id", this.deleteNotificacion.bind(this));
    this.router.get("/getNOTI", this.getNoti.bind(this));
  }

  private async getNoti(req: Request, res: Response) {
    try {
      const notificaciones = await db.sequelize.query(`
        SELECT Titulo, Descripcion, FechaHora, Empleado.Nombre
        FROM NotiAgente
        JOIN Notificacion ON NotiAgente.IdNotificacion = Notificacion.IdNotificacion
        JOIN Empleado ON NotiAgente.IdEmpleado = Empleado.IdEmpleado;
        `);
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

  private async notificacionesDiaGlobal(req: Request, res: Response) {
    try {
      const { fecha } = req.params;

      const fechaISO = `${fecha}T00:00:00.000Z`;

      const notificaciones = await db.Notificacion.findAll({
        where: {
          EsGlobal: true,
          FechaHora: {
            [Op.between]: [
              fechaISO,
              new Date(new Date(fechaISO).getTime() + 86400000),
            ], // Agregar 24 horas al final del día
          },
        },
      });

      if (notificaciones.length === 0) {
        return res
          .status(404)
          .send(
            "No se encontraron notificaciones globales en la fecha especificada"
          );
      }

      res.status(200).json(notificaciones);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async notificacionDiaGlobalBandera(fecha: any) {
    try {
      const fechaISO = new Date(fecha);

      const year = fechaISO.getUTCFullYear();
      const month = String(fechaISO.getUTCMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
      const day = String(fechaISO.getUTCDate()).padStart(2, "0");
      const fechaSinHora = `${year}-${month}-${day}`;

      const inicioDelDia = new Date(`${fechaSinHora}T00:00:00.000Z`);

      const finDelDia = new Date(inicioDelDia.getTime() + 86400000 - 1);

      const notificaciones = await db.Notificacion.findAll({
        where: {
          EsGlobal: true,
          FechaHora: {
            [Op.between]: [inicioDelDia, finDelDia],
          },
        },
      });

      console.log(notificaciones);
      return notificaciones;
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  private async notificacionAgenteBandera(id: any, fecha: any) {
    try {
      const fechaISO = new Date(fecha);

      const year = fechaISO.getUTCFullYear();
      const month = String(fechaISO.getUTCMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
      const day = String(fechaISO.getUTCDate()).padStart(2, "0");
      const fechaSinHora = `${year}-${month}-${day}`;

      const inicioDelDia = new Date(`${fechaSinHora}T00:00:00.000Z`);

      const finDelDia = new Date(inicioDelDia.getTime() + 86400000 - 1);

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
        FechaHora: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      });

      if (!empleado) {
        console.log("El empleado no existe");
      }

      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdEmpleado: id,
          EsGlobal: false,
          FechaHora: {
            [Op.between]: [
              fechaISO,
              new Date(new Date(fechaISO).getTime() + 86400000),
            ], // Agregar 24 horas al final del día
          },
        },
      });

      console.log(notificaciones);
      return notificaciones;
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  private async notificacionAgente(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const fechaISO = `${fecha}T00:00:00.000Z`;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe");
      }

      const notificaciones = await db.Notificacion.findAll({
        where: {
          IdEmpleado: id,
          EsGlobal: false,
          FechaHora: {
            [Op.between]: [
              fechaISO,
              new Date(new Date(fechaISO).getTime() + 86400000),
            ], // Agregar 24 horas al final del día
          },
        },
      });

      if (notificaciones.length === 0) {
        return res
          .status(404)
          .send(
            "No se encontraron notificaciones para este empleado en la fecha especificada"
          );
      }

      return res.status(200).json(notificaciones);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error interno del servidor: " + error);
    }
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

      // // Envia notificacion a todos los empleados
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

      // // Envia notificacion a un empleado
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
      console.log("Prueba exitosa");
      res.status(200).send("<h1>Prueba exitosa</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }
}

export default ReporteController;
