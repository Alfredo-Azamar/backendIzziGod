import { Model, Sequelize } from "sequelize";

interface AsuntoAttributes {
  IdAsunto: number;
  Nombre: string;
  Descripcion: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Asunto
        extends Model<AsuntoAttributes>
        implements AsuntoAttributes
    {
        public IdAsunto!: number;
        public Nombre!: string;
        public Descripcion!: string;
    }
    Asunto.init(
        {
        IdAsunto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        },
        {
        sequelize,
        modelName: "Asunto",
        }
    );
    return Asunto;
}