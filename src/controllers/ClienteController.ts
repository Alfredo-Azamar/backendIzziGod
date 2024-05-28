import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class ClienteController extends AbstractController {
    // Singleton
    // Atributo de clase
    private static _instance: ClienteController;
    // Método de clase
    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new ClienteController("cliente");
        }
        return this._instance;
    }
    // Declarar todas las rutas del controlador
    protected initRoutes(): void {
        this.router.get('/test',this.getTest.bind(this));
        this.router.get('/consultarClientes',this.getConsultarClientes.bind(this));
        this.router.post('/crearCliente',this.postCrearCliente.bind(this));
        this.router.delete('/eliminarCliente/:id',this.deleteBorrarCliente.bind(this));
        this.router.get('/consultarContrato',this.getConsultarContrato.bind(this));
        this.router.post('/crearContrato',this.postCrearContrato.bind(this));
        this.router.put('/actualizarContrato/:id', this.putActualizarContrato.bind(this));//* NO IMPLEMENTADO EN APPS
        this.router.delete('/eliminarContrato/:id', this.deleteBorrarContrato.bind(this));
        this.router.get('/consultarCliente/:celular', this.getConsultarCliente.bind(this)); //MAX
        this.router.get('/telefonoPorZona/:nombreZona', this.getTelefonoPorZona.bind(this));
    }


    private async getConsultarCliente(req: Request, res: Response) { //MAX
        try {
            const { celular } = req.params;
            await db.Cliente.findOne({
                where: { Celular: celular },
                attributes: ['Celular', 'Nombre', 'ApellidoP', 'ApellidoM', 'IdZona']
            })
                .then((cliente: any) => {
                    if (cliente) {
                        res.status(200).json(cliente);
                    } else {
                        res.status(404).send("Cliente no encontrado");
                    }
                })
                .catch((err: any) => {
                    console.log(err);
                    res.status(500).send('Internal server error' + err);
                });
        } catch(error:any) {
            console.log(error);
            res.status(500).send('Internal server error'+error);
        }
    }

    private getTest(req: Request,res: Response){
        try{
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>")
        }catch(error:any){
            console.log(error);
            res.status(500).send('Internal server error'+error);
        }
    }

    private async getConsultarClientes(req: Request, res: Response) {
        try{
            let clientes = await db["Cliente"].findAll();
            res.status(200).json(clientes);
        } catch(err) {
            console.log(err)
            res.status(500).send('Internal server error '+err)
        }
    }

    private async getTelefonoPorZona(req: Request, res: Response) {
        try{
            let { nombreZona } = req.params;

            let zona = await db.Zona.findOne({
                where: { nombre: nombreZona }
            });

            if (!zona) {
                res.status(404).send('Zona not found');
                return;
            }

            let telefonos = await db.Cliente.findAll({
                where: { IdZona: zona.IdZona },
                attributes: ['Celular']
            });
            res.status(200).json(telefonos);
        } catch(err) {
            console.log(err)
            res.status(500).send('Internal server error '+err)
        }
    }

    

    private async postCrearCliente(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Cliente.create(req.body); //Insert
            console.log("Cliente creado");
            res.status(200).send("<h1>Cliente creado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async deleteBorrarCliente(req: Request,res: Response){
        try{
            const {id} = req.params;
            await db.Cliente.destroy({where:{IdCliente:id}});
            res.status(200).send("<h1>Cliente eliminado</h1>");
        } catch(err) {
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async getConsultarContrato(req: Request, res: Response) {
        try{
            let contratos = await db["Contrato"].findAll();
            res.status(200).json(contratos);
        } catch(err) {
            console.log(err)
            res.status(500).send('Internal server error '+err)
        }
    }

    private async postCrearContrato(req: Request,res: Response){
        try{
            console.log(req.body);
            await db.Contrato.create(req.body); //Insert
            console.log("Contrato creado");
            res.status(200).send("<h1>Contrato creado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async putActualizarContrato(req: Request, res: Response) {
        try{
            const {id} = req.params;
            await db.Contrato.update(req.body, {where:{IdContrato:id}});
            res.status(200).send("<h1>Contrato actualizado</h1>");
        } catch(err) {
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }

    private async deleteBorrarContrato(req: Request, res: Response) {
        try{
            const {id} = req.params;
            await db.Contrato.destroy({where:{IdContrato:id}});
            res.status(200).send("<h1>Contrato eliminado</h1>");
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error'+err);
        }
    }
}

export default ClienteController;