import { Model, Sequelize } from "sequelize";

interface ZonaAttributes{
    IdZona: number;
    Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Zona extends Model <ZonaAttributes> implements ZonaAttributes {
        public IdZona!:number;
        public Nombre!:string;
    }
    
    Zona.init({
        IdZona: {
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
        modelName: 'Zona'
    });
    return Zona;
}