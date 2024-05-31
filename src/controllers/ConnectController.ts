import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../config';
import { ConnectContactLensClient, ListRealtimeContactAnalysisSegmentsCommand } from "@aws-sdk/client-connect-contact-lens"
import { Connect } from 'aws-sdk';

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
        this.router.post('/sentiment', this.sendSentiment.bind(this));
        this.router.get('/queue', this.getQueue.bind(this));
    }

    private async sendSentiment(req: Request, res: Response) {
        const client = new ConnectContactLensClient({ region: AWS_REGION });
        AWS.config.update({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });

        const connect = new AWS.Connect();

        const { coso } = req.body;
        console.log(coso);

        const params = {
            InstanceId: "arn:aws:connect:us-east-1:905418447691:instance/cbfa02b8-09e5-4774-8576-45965720fb02",
            ContactId: coso
        };

        const command = new ListRealtimeContactAnalysisSegmentsCommand(params);

        try {
            const response = await client.send(command);
            const segments = response.Segments?.map(segment => ({
                role: segment.Transcript?.ParticipantRole,
                content: segment.Transcript?.Content,
                sentiment: segment.Transcript?.Sentiment
            }));
            res.json(segments);
        } catch (error) {
            console.error("Error getting transcript:", error);
            res.status(500).send('Error getting transcript');
        }
    }

    private async getQueue(req: Request, res: Response) {

        const connect = new Connect({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });

        const params = {
            InstanceId: 'cbfa02b8-09e5-4774-8576-45965720fb02', // replace with your instance id
            Filters: {
                Queues: ['b69796d7-0a6a-4dbe-9337-f04070dc9136']
            },
            Groupings: ['QUEUE'],
            CurrentMetrics: [{
                Name: 'CONTACTS_IN_QUEUE'
            }]
        };

        try {
            const data = await connect.getCurrentMetricData(params).promise();
            const metricResults = data.MetricResults;
            const agentsOnline = metricResults?.[0]?.Collections?.[0]?.Value ?? null;
            res.json({ agentsOnline });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting queue data');
        }
    }
}

export default ConnectController;