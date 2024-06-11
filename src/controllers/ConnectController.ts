import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../config';
import { ConnectContactLensClient, ListRealtimeContactAnalysisSegmentsCommand } from "@aws-sdk/client-connect-contact-lens"
import { Connect } from 'aws-sdk';

function formatMillisToMinutesAndSeconds(millis: number): string {
    let minutes = Math.floor(millis / 60000);
    let seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

class ConnectController extends AbstractController {
    // Singleton
    private static _instance: ConnectController;

    public static get instance(): ConnectController {
        if (!this._instance) {
            this._instance = new ConnectController("connect");
        }
        return this._instance;
    }

    // Inicializar las rutas
    protected initRoutes(): void {
        this.router.get('/sentiment/:idLlamada', this.sendSentiment.bind(this));
    }

    private async sendSentiment(req: Request, res: Response) {
        const client = new ConnectContactLensClient({ region: AWS_REGION });
        AWS.config.update({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });

        // const connect = new AWS.Connect();

        const {idLlamada} = req.params;
        console.log(idLlamada);

        const params = {
            InstanceId: "arn:aws:connect:us-east-1:905418447691:instance/cbfa02b8-09e5-4774-8576-45965720fb02",
            ContactId: idLlamada
        };

        const command = new ListRealtimeContactAnalysisSegmentsCommand(params);

        try {
            const response = await client.send(command);
            const segments = response.Segments?.map(segment => ({
                role: segment.Transcript?.ParticipantRole,
                content: segment.Transcript?.Content,
                sentiment: segment.Transcript?.Sentiment,
                startTime: formatMillisToMinutesAndSeconds(segment.Transcript?.BeginOffsetMillis || 0)
            }));
            res.json(segments);
        } catch (error) {
            console.error("Error getting transcript:", error);
            res.status(500).send('Error getting transcript');
        }
    }
}

export default ConnectController;