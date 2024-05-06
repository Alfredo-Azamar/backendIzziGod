import { Model, Sequelize } from "sequelize";

interface EstadoAttributes {
    IdEstado: number;
    Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Estado
        extends Model<EstadoAttributes>
        implements EstadoAttributes {
        public IdEstado!: number;
        public Nombre!: string;
    }
    Estado.init(
        {
            IdEstado: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Nombre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Estado",
        }
    );
    return Estado;
};