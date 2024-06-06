import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op } from "sequelize";
import { any } from "joi";

class LlamadaController extends AbstractController {
  //Singleton
  //Atributo de clase
  private static _instance: LlamadaController;
  //Método de clase
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new LlamadaController("llamada");
    }
    return this._instance;
  }

  //Declarar todas las rutas del controlador
  protected initRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.get("/consultarLlamadas", this.getConsultarLlamadas.bind(this));//
    this.router.post("/crearLlamada", this.postCrearLlamada.bind(this));//
    this.router.delete("/eliminarLlamada/:id", this.deleteBorrarLlamada.bind(this));//
    this.router.post("/crearIncidencia", this.postCrearIncidencia.bind(this));
    this.router.post("/crearEncuesta", this.postCrearEncuesta.bind(this));//
    this.router.get("/infoTarjetas", this.getInfoTarjetas.bind(this));//
    this.router.get("/infoTarjetasV2", this.getInfoTarjetasV2.bind(this));//
    this.router.put("/actualizarLlamada", this.putActualizarLlamada.bind(this)); //Socket //
    this.router.get("/infoIncidencias", this.getInfoIncidencias.bind(this));//
    this.router.get('/consultarSolucion/:asunto', this.getConsultarSolucion.bind(this));//
    this.router.get('/consultarSoluciones', this.getConsultarSoluciones.bind(this));//
    this.router.get("/llamadasDeHoy", this.getLlamadasDeHoy.bind(this));//
    this.router.get("/negativeCallsCount", this.getNegativeCallsCount.bind(this)); //Notificaciones //
    this.router.get("/averageCallDuration", this.getAverageCallDuration.bind(this)); //Notificaciones //
    this.router.put("/actualizarLlamadaFinalizada", this.putActualizarLlamadaFinalizada.bind(this)); //Socket //
    this.router.get("/llamadasArribaDelTiempo/:duracion", this.llamadasArribaDelTiempo.bind(this));//
    this.router.get("/numPorAsunto", this.numPorAsunto.bind(this));//
    this.router.get("/llamadasPorDia", this.getLlamadasPorDiaHistorico.bind(this)); //
    this.router.get("/llamadasPorHoras", this.porHoras.bind(this)); //
    this.router.get("/top4Agentes", this.top4Agentes.bind(this));
    this.router.get("/obtenerSentimiento/:IdLlamada", this.obtenerSentimiento.bind(this));
    this.router.get("/tipoEmocionPorDia", this.emocionesPorDia.bind(this));
    this.router.put("/cambiarSentiment", this.cambiarSentiment.bind(this));
  }

  private async obtenerSentimiento(req: Request, res: Response) {
    try {
      const { IdLlamada } = req.params;
      const sentimiento = await db.Llamada.findOne({
        where: { IdLlamada },
        attributes: ["Sentiment"]
      });

      if (!sentimiento) {
        return res.status(404).send("No se encontró el sentimiento");
      }

      res.status(200).json(sentimiento);
    } catch (err: any) {
      console.log(err);
      res.status(500).send('Internal server error' + err);
    }
  }

  private async cambiarSentiment(req: Request, res: Response) {
    try {
      const {id} = req.body;
      const {sentiment} = req.body;
      const actLlamada = await db.Llamada.update(
        {Sentiment: sentiment},
        {where: {IdLlamada: id}}
      );
      
      const io = req.app.get("socketio");
      if (io) {
        io.emit("sentiment", sentiment);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send(actLlamada);
      console.log("Sentiment actualizado");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async emocionesPorDia(req: Request, res: Response) {
    try {
      const emociones = await db.sequelize.query(`
      SELECT 
        SUM(CASE WHEN Sentiment = 'positive' THEN 1 ELSE 0 END) as Positive,
        SUM(CASE WHEN Sentiment = 'neutral' THEN 1 ELSE 0 END) as Neutral,
        SUM(CASE WHEN Sentiment = 'negative' THEN 1 ELSE 0 END) as Negative
      FROM Llamada
      WHERE DATE(FechaHora) = CURDATE();
      `,
        { type: db.sequelize.QueryTypes.SELECT });
      res.status(200).json(emociones);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async top4Agentes(req: Request, res: Response) {
    try {
      const agentes = await db.sequelize.query(
        `SELECT Nombre, ApellidoP, AVG(Calificacion) AS cali
        FROM Llamada
        JOIN Encuesta ON Llamada.IdLlamada = Encuesta.IdLlamada
        JOIN Empleado ON Llamada.IdEmpleado = Empleado.IdEmpleado
        GROUP BY Llamada.IdEmpleado
        ORDER BY Llamada.IdEmpleado DESC
        LIMIT 4;`,
        { type: db.sequelize.QueryTypes.SELECT });
      res.status(200).json(agentes);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async porHoras(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(
        `SELECT 
          HOUR(FechaHora) AS Hora,
          COUNT(*) AS NumeroDeLlamadas
        FROM Llamada AS L
        GROUP BY HOUR(FechaHora)
        ORDER BY Hora ASC;`,
        { type: db.sequelize.QueryTypes.SELECT });
      const llamadasPorHora = [0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0]; // Para cada día de la semana

      llamadas.forEach((llamada: any) => {
        llamadasPorHora[parseInt(llamada.Hora) - 1] = llamada.NumeroDeLlamadas;
      });

      res.status(200).json(llamadasPorHora);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  public async getLlamadasPorDiaHistorico(req: Request, res: Response) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();

      const llamadas = await db.Llamada.findAll({
        where: {
          FechaHora: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });
      const llamadasPorDia = [0, 0, 0, 0, 0, 0, 0]; // Para cada día de la semana

      llamadas.forEach((llamada: any) => {
        const dia = new Date(llamada.FechaHora).getDay(); // Asume que 'fecha' es cuando se realizó la llamada
        llamadasPorDia[dia]++;
      });

      console.log(llamadasPorDia);

      res.json(llamadasPorDia);

    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error" + error);
    }
  }

  private async numPorAsunto(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(
        `SELECT Asunto, COUNT(*) as veces FROM Llamada GROUP BY Asunto ORDER BY Asunto ASC;`,
        { type: db.sequelize.QueryTypes.SELECT });
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async llamadasArribaDelTiempo(req: Request, res: Response) {
    try {
      const { duracion } = req.params;
      console.log(duracion);
      const llamadas = await db.sequelize.query(
        `SELECT 
          SUM(CASE WHEN TIME_TO_SEC(Duracion) > ${duracion} THEN 1 ELSE 0 END) AS ArribaDelTiempo,
          SUM(CASE WHEN TIME_TO_SEC(Duracion) <= ${duracion} THEN 1 ELSE 0 END) AS AbajoDelTiempo
        FROM Llamada AS L`,
        { type: db.sequelize.QueryTypes.SELECT });
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async putActualizarLlamadaFinalizada(req: Request, res: Response) {
    // Cambiar la duracion y estado de la llamada
    try {
      const { id } = req.body;
      const { duracion } = req.body;
      const { estado } = req.body;
      const actLlamada = await db.Llamada.update(
        { Duracion: duracion, Estado: estado },
        { where: { IdLlamada: id } }
      );

      const io = req.app.get("socketio");
      if (io) {
        const llamadas = await this.getInfoTarjetasV3();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }



      res.status(200).send(actLlamada);
      console.log("Llamada actualizada");

    } catch (err: any) {
      console.log(err);
      res.status(500).send('Internal server error' + err);
    }
  }

  private async getConsultarSoluciones(req: Request, res: Response) {
    try {
      let soluciones = await db["SolucionBase"].findAll();

      if (soluciones.length == 0) {
        return res.status(404).send("No se encontraron soluciones");
      }

      res.status(200).json(soluciones);

    } catch (err: any) {
      console.log(err);
      res.status(500).send('Internal server error' + err);
    }
  }

  private async getConsultarSolucion(req: Request, res: Response) {
    try {
      const { asunto } = req.params;
      const soluciones = await db.SolucionBase.findAll({
        where: { Asunto: asunto },
        attributes: ['IdSolucion', 'Nombre', 'Asunto'],
        include: [
          {
            model: db.Pasos,
            as: 'Pasos',
            attributes: ['Descripcion']
          }
        ]
      });

      if (!soluciones) {
        return res.status(404).send("No se encontraron soluciones");
      }
      res.status(200).json(soluciones);

    } catch (err: any) {
      console.log(err);
      res.status(500).send('Internal server error' + err);

    }
  }

  private async getLlamadasDeHoy(req: Request, res: Response) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // Establece la hora al inicio del día

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999); // Establece la hora al final del día

      const llamadasDeHoy = await db.Llamada.count({
        where: {
          fechaHora: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
      });

      res.status(200).json({ llamadasDeHoy });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async getInfoIncidencias(req: Request, res: Response) {
    try {
      const incidencia = await db.sequelize.query(`
        SELECT *, Incidencia.Nombre as NombreIncidencia, Zona.Nombre as NombreZona, Reporte.Prioridad
        FROM Reporte
        JOIN Incidencia ON Reporte.IdIncidencia = Incidencia.IdIncidencia
        JOIN Zona ON Reporte.IdZona = Zona.IdZona
      `, { type: db.sequelize.QueryTypes.SELECT });

      res.status(200).json(incidencia);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
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

  private async getInfoTarjetasV2(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(`
      SELECT DISTINCT
          L.Asunto, L.Sentiment, L.Notas, L.IdLlamada, L.Estado,
          Cliente.Nombre AS CName, Cliente.ApellidoP AS CLastName, Cliente.Celular,
          Zona.Nombre AS ZoneName, 
          Empleado.Nombre, Empleado.ApellidoP, Empleado.IdEmpleado AS IdEmpleado,
          Contrato.Fecha, Paquete.Nombre AS PName, Paquete.Precio,
          (SELECT COUNT(*) FROM Llamada AS Llamadas WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado) AS numLlamadas 
      FROM Empleado
      LEFT JOIN (
          SELECT L1.*
          FROM Llamada AS L1
          JOIN (
              SELECT IdEmpleado, MAX(FechaHora) AS MaxFechaHora
              FROM Llamada
              GROUP BY IdEmpleado
          ) AS L2 ON L1.IdEmpleado = L2.IdEmpleado AND L1.FechaHora = L2.MaxFechaHora
      ) AS L ON L.IdEmpleado = Empleado.IdEmpleado
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
      LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete  
      WHERE Empleado.Rol = 'agente'
      GROUP BY 
          Cliente.Celular
      ORDER BY Empleado.IdEmpleado;
  
      `, { type: db.sequelize.QueryTypes.SELECT });

      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async getInfoTarjetas(req: Request, res: Response) {
    try {
      let llamada = await db.Llamada.findAll({
        where: { Estado: true },
        attributes: ["Asunto", "Sentiment", "Notas"],
        include: [
          {
            model: db.Cliente,
            as: "Cliente",
            attributes: ["Nombre", "ApellidoP"],
            include: [
              {
                model: db.Zona,
                as: "Zona",
                attributes: ["Nombre"],
              },
            ],
          },
          {
            model: db.Empleado,
            as: "Empleado",
            attributes: [
              "Nombre",
              "ApellidoP",
              [
                db.sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM Llamada AS Llamadas
                                WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado
                            )`),
                "numLlamadas",
              ],
            ],
          },
        ],
      });

      // Si no la encuentra
      if (!llamada) {
        return res.status(404).send("No hay llamadas activas");
      }

      res.status(200).json(llamada);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async putActualizarLlamada(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const { IdEmpleado } = req.body;
      const actLlamada = await db.Llamada.update(
        { IdEmpleado },
        { where: { IdLlamada: id } }
      );

      // Emitir evento de socket
      const io = req.app.get("socketio");
      if (io) {
        const llamadas = await this.getInfoTarjetasV3();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send("<h1>Llamada actualizada</h1>");
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

  private async getConsultarLlamadas(req: Request, res: Response) {
    try {
      let llamadas = await db["Llamada"].findAll();
      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async getAverageCallDuration(req: Request, res: Response) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      let averageDuration = await db["Llamada"].findAll({
        attributes: [[db.Sequelize.fn('AVG', db.Sequelize.literal(`TIME_TO_SEC(Duracion)`)), 'averageDuration']],
        where: {
          FechaHora: {
            [db.Sequelize.Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      res.status(200).json(averageDuration);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }


  private async getNegativeCallsCount(req: Request, res: Response) {
    try {
      const llamadas = await db.sequelize.query(`
      SELECT COUNT(*) AS count
      FROM (
        SELECT 
            L.Sentiment
        FROM Empleado
        LEFT JOIN Llamada AS L ON L.IdEmpleado = Empleado.IdEmpleado AND L.FechaHora = (
                SELECT MAX(L2.FechaHora) 
                FROM Llamada AS L2 
                WHERE L2.IdEmpleado = Empleado.IdEmpleado)
        LEFT JOIN Cliente ON L.Celular = Cliente.Celular
        LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
        LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
        LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete 
        WHERE L.Sentiment = "NEGATIVE") AS subquery;
      `, { type: db.sequelize.QueryTypes.SELECT });

      res.status(200).json(llamadas);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async getNegativeCallsCount2(req: Request, res: Response) {
    try {
      let count = await db["Llamada"].count({
        where: { Estado: true, Sentiment: "NEGATIVE" }
      });
      res.status(200).json({ count });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }


  private async getInfoTarjetasV3() {
    try {
      const llamadas = await db.sequelize.query(`
      SELECT 
          L.Asunto, L.Sentiment, L.Notas, L.IdLlamada, L.Estado,
          Cliente.Nombre AS CName, Cliente.ApellidoP AS CLastName, Cliente.Celular,
          Zona.Nombre AS ZoneName, 
          Empleado.Nombre, Empleado.ApellidoP, Empleado.IdEmpleado AS IdEmpleado,
          Contrato.Fecha, Paquete.Nombre AS PName, Paquete.Precio,
          (SELECT COUNT(*) FROM Llamada AS Llamadas WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado) AS numLlamadas 
      FROM Empleado
      LEFT JOIN (
          SELECT L1.*
          FROM Llamada AS L1
          JOIN (
              SELECT IdEmpleado, MAX(FechaHora) AS MaxFechaHora
              FROM Llamada
              GROUP BY IdEmpleado
          ) AS L2 ON L1.IdEmpleado = L2.IdEmpleado AND L1.FechaHora = L2.MaxFechaHora
      ) AS L ON L.IdEmpleado = Empleado.IdEmpleado
      LEFT JOIN Cliente ON L.Celular = Cliente.Celular
      LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
      LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
      LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete  
      WHERE Empleado.Rol = 'agente'
      ORDER BY Empleado.IdEmpleado;
    `, { type: db.sequelize.QueryTypes.SELECT });

      return llamadas;
    } catch (err) {
      console.log(err);
      throw new Error("Internal server error" + err);
    }
  }

  private async postCrearLlamada(req: Request, res: Response) {
    try {
      console.log(req.body);
      const nuevaLlamada = await db.Llamada.create(req.body); // Insert
      console.log("Llamada creada");

      // Emitir evento de socket
      const io = req.app.get("socketio");
      if (io) {
        const llamadas = await this.getInfoTarjetasV3();
        io.emit("newPage", llamadas);
        console.log("Evento emitido");
      } else {
        console.log("Socket.IO no está disponible");
      }

      res.status(200).send("<h1>Llamada creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async deleteBorrarLlamada(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.Llamada.destroy({ where: { IdLlamada: id } });
      res.status(200).send("<h1>Llamada eliminada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async postCrearIncidencia(req: Request, res: Response) {
    try {
      console.log(req.body);
      await db.Reporte.create(req.body); //Insert
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


      res.status(200).send("<h1>Incidencia creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }

  private async postCrearEncuesta(req: Request, res: Response) {
    try {
      console.log(req.body);
      await db.Encuesta.create(req.body); //Insert
      console.log("Encuesta creada");
      res.status(200).send("<h1>Encuesta creada</h1>");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error" + err);
    }
  }
}

export default LlamadaController;