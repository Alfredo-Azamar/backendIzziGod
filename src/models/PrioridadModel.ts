import {Model, Sequelize} from "sequelize";

interface PrioridadAttributes{
    IdPrioridad: number;
    Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Prioridad extends Model <PrioridadAttributes> implements PrioridadAttributes {
        public IdPrioridad!:number;
        public Nombre!:string;
    }
    Prioridad.init({
        IdPrioridad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize, 
        modelName: 'Prioridad'
    });
    return Prioridad;
}