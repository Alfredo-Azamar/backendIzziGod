import { DataTypes, Model, Sequelize } from 'sequelize';


enum SexoEnum {
    Masculino = "male",
    Femenino = "female",
    Otro = "otro"
}

interface ClienteAttributes {
    Celular: string;
    Nombre: string;
    ApellidoP: string;
    ApellidoM: string;
    FechaNac: string;
    Sexo: SexoEnum;
    Correo: string;
}

module.exports = (sequelize: Sequelize, type: any) => {
    class Cliente extends Model<ClienteAttributes> implements ClienteAttributes {
        public Celular!: string;
        public Nombre!: string;
        public ApellidoP!: string;
        public ApellidoM!: string;
        public FechaNac!: string;
        public Sexo!: SexoEnum;
        public Correo!: string;

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
        },
        Sexo: {
            type: DataTypes.ENUM,
            values: Object.values(SexoEnum),
            allowNull: false,
            defaultValue: SexoEnum.Otro
        },
        Correo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
        {
            sequelize,
            modelName: 'Cliente'
        });

    return Cliente;
}