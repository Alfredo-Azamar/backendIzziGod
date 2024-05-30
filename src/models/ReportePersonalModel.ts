import { Model, Sequelize } from "sequelize";

interface ReportePAttributes {
    IdReporteP: string;
    FechaHora: string;
    Descripcion: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class ReportePersonal extends Model<ReportePAttributes>
        implements ReportePAttributes
    {
        public IdReporteP!: string;
        public FechaHora!: string;
        public Descripcion!: string;

        static associate(models: any) {
            ReportePersonal.belongsTo(models.Zona, {
                foreignKey: "IdZona",
                as: "Zona",
            });

            ReportePersonal.belongsTo(models.Cliente, {
                foreignKey: "Celular",
                as: "Cliente",
            });
            
            ReportePersonal.belongsTo(models.Empleado, {
                foreignKey: "IdEmpleado",
                as: "Empleado",
            });
        }
    }
    ReportePersonal.init(
        {
            IdReporteP: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            FechaHora: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            Descripcion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "ReportePersonal",
        }
    );
    return ReportePersonal;
}