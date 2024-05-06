import { Model, DataTypes } from 'sequelize';

interface ContratoAttributes {
    IdContrato: number;
    Fecha : string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Contrato extends Model<ContratoAttributes> implements ContratoAttributes {
        public IdContrato!: number;
        public Fecha!: string;

        static associate(models: any) {
            Contrato.belongsTo(models.Cliente, {
                foreignKey: "IdCliente",
                as: "Cliente"
            });
            Contrato.belongsTo(models.Paquete, {
                foreignKey: "IdPaquete",
                as: "Paquete"
            });
        }
    }

    Contrato.init({
        IdContrato: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Fecha: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Contrato'
    });

    return Contrato;
}