import { Model, Sequelize } from "sequelize";

interface NotiAgenteAttributes {
    IdNotificacion: number;
    IdEmpleado: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class NotiAgente
        extends Model<NotiAgenteAttributes>
        implements NotiAgenteAttributes
    {
        public IdNotificacion!: number;
        public IdEmpleado!: string;

        static associate(models: any) {
            NotiAgente.belongsTo(models.Notificacion, {
                foreignKey: "IdNotificacion",
                as: "Notificacion",
            });
            NotiAgente.belongsTo(models.Empleado, {
                foreignKey: "IdEmpleado",
                as: "Empleado",
            });
        }
    }
    NotiAgente.init(
        {
            IdNotificacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            IdEmpleado: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: "NotiAgente",
        }
    );
    return NotiAgente;
};