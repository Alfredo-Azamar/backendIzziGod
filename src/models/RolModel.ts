import {Model, Sequelize} from 'sequelize';

interface RolAttributes {
    IdRol: number;
    Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Rol extends Model <RolAttributes> implements RolAttributes {
        public IdRol!:number;
        public Nombre!:string;
    }
    Rol.init({
        IdRol: {
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
        modelName: 'Rol'
    });
    return Rol;
}