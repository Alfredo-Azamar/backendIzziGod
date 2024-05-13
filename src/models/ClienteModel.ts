import { DataTypes, Model, Sequelize } from 'sequelize';

interface ClienteAttributes {
    Celular: string;
    Nombre: string;
    ApellidoP: string;
    ApellidoM: string;
    FechaNac: string;
}

module.exports = (sequelize: Sequelize, type: any) => {
    class Cliente extends Model<ClienteAttributes> implements ClienteAttributes {
        public Celular!: string;
        public Nombre!: string;
        public ApellidoP!: string;
        public ApellidoM!: string;
        public FechaNac!: string;

        static associate(models: any) {
            Cliente.belongsTo(models.Zona, {
                foreignKey: "IdZona",
                as: "Zona",
            });
            
        }
    }

    Cliente.init({
        Celular: {
            type: DataTypes.STRING,
            primaryKey: true,
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
        }
    },
        {
            sequelize,
            modelName: 'Cliente'
        });

    return Cliente;
}