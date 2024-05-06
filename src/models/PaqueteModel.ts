import { Model, DataTypes } from 'sequelize';

interface PaqueteAttributes {
    IdPaquete: number;
    Nombre: string;
    Precio: number;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Paquete extends Model<PaqueteAttributes> implements PaqueteAttributes {
        public IdPaquete!: number;
        public Nombre!: string;
        public Precio!: number;
    }

    Paquete.init({
        IdPaquete: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Precio: {
            type: DataTypes.DECIMAL,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Paquete'
    });

    return Paquete;
}