import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op } from "sequelize";

class EmpleadoController extends AbstractController {
  //Singleton
  //Atributo de clase
  private static _instance: EmpleadoController;
  //Método de clase
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new EmpleadoController("empleado");
    }
    return this._instance;
  }
  //Declarar todas las rutas del controlador
  protected initRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.get(
      "/consultarEmpleados",
      this.getConsultarEmpleados.bind(this)
    );
    this.router.post("/crearEmpleado", this.postCrearEmpleado.bind(this));
    this.router.delete(
      "/eliminarEmpleado/:id",
      this.deleteBorrarEmpleado.bind(this)
    );
    this.router.get(
      "/calificacionPromedio/:id",
      this.getCalificacionPromedio.bind(this)
    );
    // Api para mostrar el promedio de la calificacion de las llamadas de un empleado en un día
    // Ejemplo de petición:
    // GET 44.209.22.101:8080/empleado/califPromDia/2/calificaciones/2023-05-21
    this.router.get(
      "/califPromDia/:id/calificaciones/:date",
      this.getCalifPromDia.bind(this)
    );
    this.router.get(
      "/consultarLlamadasEmpleado/:id",
      this.getSumLlamadasEmpleado.bind(this)
    );
    this.router.get(
      "/consutarEmpleado/:id",
      this.getConsultarEmpleado.bind(this)
    );
    // Api para mostrar el promedio de llamadas por agente
    this.router.get(
      "/consultarPromLlamadasEmpleado/:id",
      this.getPromLlamadasEmpleado.bind(this)
    );
      this.router.get("/agentesActivos", this.agentesActivos.bind(this)); //Notificaciones
      this.router.get("/notificacionesDia/:id/:fecha", this.notificacionesDia.bind(this)); //Notificaciones
      this.router.get("/notificaciones", this.notificaciones.bind(this)); //Notificaciones
  }

  private async notificaciones(req: Request, res: Response) {
    try {

      const notificaciones = await db["Notificacion"].findAll();
      res.status(200).json(notificaciones);

    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async notificacionesDia(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;
  
      // Convertir la fecha de la URL al formato de la base de datos (ISO 8601)
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
          FechaHora: {
            [Op.between]: [fechaISO, new Date(new Date(fechaISO).getTime() + 86400000)] // Agregar 24 horas al final del día
          }
        }
      });
  
      if (notificaciones.length === 0) {
        return res.status(404).send("No se encontraron notificaciones para este empleado en la fecha especificada");
      }
  
      return res.status(200).json(notificaciones);
  
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error interno del servidor: " + error);
    }
  }

  private async agentesActivos(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(`
      SELECT 
          SUM(CASE WHEN L.Estado = 1 THEN 1 ELSE 0 END) AS Activos,
          SUM(CASE WHEN L.Estado = 0 THEN 1 ELSE 0 END) AS Inactivos
      FROM Empleado
      LEFT JOIN Llamada AS L ON L.IdEmpleado = Empleado.IdEmpleado AND L.FechaHora = (
              SELECT MAX(L2.FechaHora) 
              FROM Llamada AS L2 
              WHERE L2.IdEmpleado = Empleado.IdEmpleado)
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
      LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete
      ORDER BY Empleado.IdEmpleado;

      `, { type: db.sequelize.QueryTypes.SELECT });

      return res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async getConsultarEmpleado(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (empleado) {
        res.status(200).json(empleado);
      } else {
        res.status(404).send("El empleado no existe");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  private async getCalificacionPromedio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe");
      }

      const llamadasEmpleado = await db.Llamada.findAll({
        where: { IdEmpleado: id },
        attributes: ["IdLlamada"],
      });

      if (llamadasEmpleado && llamadasEmpleado.length > 0) {
        let sumatoriaCalificaciones = 0;
        let totalLlamadas = 0;

        for (const llamada of llamadasEmpleado) {
          const encuestasLlamada = await db.Encuesta.findAll({
            where: { IdLlamada: llamada.IdLlamada },
            attributes: ["Calificacion"],
          });

          if (encuestasLlamada && encuestasLlamada.length > 0) {
            const sumCalificacionesLlamada = encuestasLlamada.reduce(
              (sum: number, encuesta: any) => sum + encuesta.Calificacion,
              0
            );
            sumatoriaCalificaciones += sumCalificacionesLlamada;
            totalLlamadas += encuestasLlamada.length;
          }
        }

        const promedioGeneral =
          totalLlamadas > 0 ? sumatoriaCalificaciones / totalLlamadas : 0;

        res.status(200).json({ promedioGeneral });
      } else {
        res.status(404).send("No se encontraron llamadas para este empleado");
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  // Función que calcula el promedio de la calificacion de las llamadas de un empleado en un día
  private async getCalifPromDia(req: Request, res: Response) {
    try {
      const { id, date } = req.params;

      const empleado = await db.Empleado.findOne({
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe");
      }

      // Conversión de la fecha a un formato general
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Obtener las llamadas y las califs en una fecha específica
      const llamadasCalif = await db.Llamada.findAll({
        where: {
          IdEmpleado: id,
          Fecha: {
            [db.Op.between]: [startDate, endDate],
          },
        },
        include: {
          model: db.Encuesta,
          attributes: ["Calificacion"],
        },
      });

      if (llamadasCalif.length === 0) {
        return res
          .status(404)
          .send(
            "No se encontraron llamadas para este empleado en la fecha indicada"
          );
      }

      // calcular el promedio de calificaciones
      let sumCalifs = 0;
      let totalCalifs = 0;

      for (const llamada of llamadasCalif) {
        for (const encuesta of llamada.Encuestas) {
          sumCalifs += encuesta.Calificacion;
          totalCalifs++;
        }
      }

      const promGeneral = totalCalifs > 0 ? sumCalifs / totalCalifs : 0;
      res.status(200).json({ promGeneral });
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Error interno del servidor: " + error);
    }
  }

  private getTest(req: Request, res: Response) {
    try {
      console.log("Prueba exitosa");
      res.status(200).send("<h1>Prueba exitosa</h1>");
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server errorError" + error);
    }
  }

  private async getSumLlamadasEmpleado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const llamadas = await db.Llamada.findAll({
        where: { IdEmpleado: id }, // Busca las llamadas del empleado
        attributes: [
          "IdEmpleado", // Selecciona el id del empleado
          [
            db.Sequelize.fn("COUNT", db.Sequelize.col("IdLlamada")),
            "NumeroLlamadas",
          ], // Cuenta el número de llamadas
        ],
        group: ["IdEmpleado"], // Agrupa por empleado
      });

      if (llamadas && llamadas.length > 0) {
        // Si hay llamadas...
        res.status(200).json(llamadas); // ... manda las llamadas.
      } else {
        res.status(404).send("Empleado no encontrado"); // Si no, manda un error.
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error); // Error interno del servidor.
    }
  }

  // Función que calcula el promedio de la duración de las llamadas de un empleado
  private async getPromLlamadasEmpleado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const llamadas = await db.Llamada.findAll({
        where: { IdEmpleado: id }, // Busca las llamadas del empleado
        attributes: [
          "IdEmpleado", // Selecciona el id del empleado
          [
            db.Sequelize.fn("AVG", db.Sequelize.col("Duracion")),
            "PromLlamadas",
          ], // Calcula el promedio de la duración de las llamadas
        ],
        group: ["IdEmpleado"], // Agrupa por empleado
      });

      if (llamadas && llamadas.length > 0) {
        // Si hay llamadas...
        res.status(200).json(llamadas); // ... manda las llamadas.
      } else {
        res.status(404).send("Empleado no encontrado"); // Si no, manda un error.
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Internal server error" + error); // Error interno del servidor.
    }
  }

  private async getConsultarEmpleados(req: Request, res: Response) {
    try {
      let empleados = await db["Empleado"].findAll(); // Manda los datos de la tabla
      res.status(200).json(empleados);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async postCrearEmpleado(req: Request, res: Response) {
    try {
      console.log(req.body);
      await db.Empleado.create(req.body); //Insert
      console.log("Empleado creado");
      res.status(200).send("<h1>Empleado creado</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async deleteBorrarEmpleado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.Empleado.destroy({ where: { IdEmpleado: id } });
      res.status(200).send("<h1>Empleado eliminado</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }
}

export default EmpleadoController;
