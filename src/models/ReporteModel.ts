import { Model, Sequelize } from "sequelize";

enum PrioridadEnum {
    Alta = "alta",
    Media = "media",
    Baja = "baja"
}

interface ReporteAttibutes{
    IdReporte: number;
    FechaHora: string;
    Prioridad: PrioridadEnum;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Reporte extends Model <ReporteAttibutes> implements ReporteAttibutes {
        public IdReporte!:number;
        public FechaHora!:string;
        public Prioridad!:PrioridadEnum;

        static associate(models: any){
            Reporte.belongsTo(models.Zona,{
                foreignKey: 'IdZona',
                as: 'Zona',
            });
            Reporte.belongsTo(models.Cliente,{
                foreignKey: 'Celular',
                as: 'Cliente',
            });
            Reporte.belongsTo(models.Empleado,{
                foreignKey: 'IdEmpleado',
                as: 'Empleado',
            });
            Reporte.belongsTo(models.Incidencia,{
                foreignKey: 'IdIncidencia',
                as: 'Incidencia',
            });
        }
    }
    Reporte.init({
        IdReporte: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        FechaHora: {
            type: DataTypes.DATE,
            allowNull: false
        },
        Prioridad: {
            type: DataTypes.ENUM,
            values: Object.values(PrioridadEnum),
            allowNull: false,
            defaultValue: PrioridadEnum.Baja
        }
    }, {
        sequelize, 
        modelName: 'Reporte'
    });
    return Reporte;
}