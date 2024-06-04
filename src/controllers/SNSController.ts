import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import AWS from 'aws-sdk';
import {AWS_REGION, AWS_ACCESS_KEY_ID_C, AWS_SECRET_ACCESS_KEY_C} from '../config';


class SNSController extends AbstractController {
    // Singleton
    private static _instance: SNSController;

    public static get instance(): SNSController {
        if (!this._instance) {
            this._instance = new SNSController("sns");
        }
        return this._instance;
    }

    // Inicializar las rutas
    protected initRoutes(): void {
        this.router.post('/send-message', this.sendMessage.bind(this));
        this.router.post('/add-phone-number', this.addPhoneNumber.bind(this));
    }

    private async addPhoneNumber(req: Request, res: Response) {
        try {
            const { phoneNumber } = req.body;

            // Configurar AWS con tus credenciales
            AWS.config.update({
                accessKeyId: AWS_ACCESS_KEY_ID_C,
                secretAccessKey: AWS_SECRET_ACCESS_KEY_C,
                region: AWS_REGION // Por ejemplo, 'us-east-1'
            });

            // Crear un nuevo objeto SNS
            const sns = new AWS.SNS();

            const params = {
                Protocol: 'sms',
                TopicArn: 'arn:aws:sns:us-east-1:905418447691:Incidencias', 
                Endpoint: phoneNumber // Número de teléfono al que deseas suscribir
            };

            const data = await sns.subscribe(params).promise();

            console.log("Número de teléfono suscrito con éxito:", data);
            res.status(200).json({ message: "Número de teléfono suscrito con éxito", data });
        } catch (error) {
            console.error('Error al agregar el número de teléfono:', error);
            res.status(500).json({ error: 'Error al agregar el número de teléfono' });
        }
    }

    private async sendMessage(req: Request, res: Response) {
        try {
            const { phoneNumber, message } = req.body;

            // Configurar AWS con tus credenciales
            AWS.config.update({
                accessKeyId: AWS_ACCESS_KEY_ID_C,
                secretAccessKey: AWS_SECRET_ACCESS_KEY_C,
                region: AWS_REGION // Por ejemplo, 'us-east-1'
            });

            // Crear un nuevo objeto SNS
            const sns = new AWS.SNS();

            console.log("phoneNumber", phoneNumber);
            console.log("message", message);
            
            // Definir el mensaje que deseas enviar
            const params = {
                Message: message,
                PhoneNumber: phoneNumber
            };

            // Enviar el mensaje
            const data = await sns.publish(params).promise();

            console.log("Mensaje enviado con éxito:", data);
            res.status(200).json({ message: "Mensaje enviado con éxito" });
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.status(500).json({ error: 'Error al enviar el mensaje' });
        }
    }
}

export default SNSController;
