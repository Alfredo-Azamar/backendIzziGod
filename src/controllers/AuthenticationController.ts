import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class AuthenticationController extends AbstractController{
    
    //Singleton
    //Atributo de clase
    private static _instance:AuthenticationController;
    //Método de clase
    public static get instance():AuthenticationController{
        return this._instance || (this._instance = new this('auth'));
    }

    protected initRoutes(): void {
        this.router.post('/signup', this.signup.bind(this));
        this.router.post('/verify',this.verify.bind(this));
        this.router.post('/signin',this.signin.bind(this));
        this.router.get('/test',this.authMiddleware.verifyToken,this.test.bind(this));
        
    }


    private async test(req:Request,res:Response){
        res.status(200).send("Esto es una prueba");
    }

    private async signin(req:Request,res:Response){
        const {email,password} = req.body;
        try{
            // const login = await this.cognitoService.signInUser(email,password);
            // res.status(200).send({...login.AuthenticationResult});

            // Autenticar al usuario con Cognito
            const login = await this.cognitoService.signInUser(email, password);
            const token = login.AuthenticationResult;


            // Buscar información adicional del usuario en la base de datos
            const user = await db.Empleado.findOne({
                where: { Correo: email  },
                attributes: ['IdEmpleado', 'Nombre', 'ApellidoP', 'ApellidoM'] // Ajusta según los atributos que necesites
            });

            if (!user) {
                return res.status(404).send({ message: "User not found" }).end();
            }

            // Combinar y enviar la respuesta
            res.status(200).send({
                token,
                user
            });


        }catch(error:any){
            res.status(500).send({code:error.code,message:error.message}).end()
        }
    }

    private async verify(req:Request,res:Response){
        const{email,code} =req.body;
        try{
            await this.cognitoService.verifyUser(email,code);
            console.log("Usuario de cognito verificado",email);
            return res.status(200).send({message:"verified user"}).end();

        }catch(error:any){
            res.status(500).send({code:error.code,message:error.message}).end()
        }
    }

    private async signup(req:Request,res:Response){
        const {email,password,name, role} = req.body;
        console.log(req.body);
        try{
            //Create a new user in Cognito
            const user = await this.cognitoService.signUpUser(email,password,[
                {
                    Name: 'email',
                    Value: email
                }
            ])
            console.log("Usuario de cognito creado",user);
            res.status(201).send({message:"User signedUp"})
        }catch(error:any){
            res.status(500).send({code:error.code,message:error.message}).end()
        }
    }
}

export default AuthenticationController;