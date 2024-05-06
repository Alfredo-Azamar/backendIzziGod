import { DataTypes, Model, Sequelize } from 'sequelize';

interface ClienteAttributes {
    IdCliente: number;
    Nombre: string;
    ApellidoP: string;
    ApellidoM: string;
    FechaNac: string;
    Celular: string;
}

module.exports = (sequelize: Sequelize, type: any) => {
    class Cliente extends Model<ClienteAttributes> implements ClienteAttributes {
        public IdCliente!: number;
        public Nombre!: string;
        public ApellidoP!: string;
        public ApellidoM!: string;
        public FechaNac!: string;
        public Celular!: string;

        static associate(models: any) {
            Cliente.belongsTo(models.Zona, {
                foreignKey: "IdZona",
                as: "Zona",
            });
            
        }
    }

    Cliente.init({
        IdCliente: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ApellidoP: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ApellidoM: {
            type: DataTypes.STRING,
            allowNull: false
        },
        FechaNac: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        Celular: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
        {
            sequelize,
            modelName: 'Cliente'
        });

    return Cliente;
}