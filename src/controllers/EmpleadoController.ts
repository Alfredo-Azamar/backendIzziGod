import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

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
      const { id } = req.params; // Obtiene el id del empleado

      const empleado = await db.Empleado.findOne({ // Busca el empleado
        where: { IdEmpleado: id },
      });

      if (!empleado) {
        return res.status(404).send("El empleado no existe"); // Si no existe, manda un error
      }

      const llamadasEmpleado = await db.Llamada.findAll({ // Busca las llamadas del empleado
        where: { IdEmpleado: id }, // Busca por id del empleado
        attributes: ["IdLlamada"], // Selecciona el id de la llamada
      });

      if (llamadasEmpleado && llamadasEmpleado.length > 0) { // Si hay llamadas...
        let sumatoriaCalificaciones = 0; // Inicializa la sumatoria de calificaciones
        let totalLlamadas = 0; // Inicializa el total de llamadas

        for (const llamada of llamadasEmpleado) { // Por cada llamada...
          const encuestasLlamada = await db.Encuesta.findAll({ // Busca las encuestas de la llamada
            where: { IdLlamada: llamada.IdLlamada }, // Busca por id de la llamada
            attributes: ["Calificacion"], // Selecciona la calificación
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
      //llamadas tendra un array con las llamadas del empleado, y un array de encuestas
      // asosiada a las llamadas
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
