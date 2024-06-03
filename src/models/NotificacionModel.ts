import { Model, Sequelize } from "sequelize";

interface NotificacionAttributes {
    IdNotificacion: number;
    EsGlobal: boolean;
    FechaHora: string;
    Titulo: string;
    Descripcion: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Notificacion
        extends Model<NotificacionAttributes>
        implements NotificacionAttributes
    {
        public IdNotificacion!: number;
        public EsGlobal!: boolean;
        public FechaHora!: string
        public Titulo!: string;
        public Descripcion!: string;

        static associate(models: any) {
            Notificacion.belongsTo(models.Empleado, {
                foreignKey: "IdEmpleado",
                as: "Empleado",
            });
        }
    }
    Notificacion.init(
        {
            IdNotificacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            EsGlobal: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            FechaHora: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            Titulo: {
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
            modelName: "Notificacion",
        }
    );
    return Notificacion;
}