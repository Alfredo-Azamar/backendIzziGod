import { Model, Sequelize } from "sequelize";

interface ReporteAttibutes{
    IdReporte: number;
    FechaHora: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Reporte extends Model <ReporteAttibutes> implements ReporteAttibutes {
        public IdReporte!:number;
        public FechaHora!:string;

        static associate(models: any){
            Reporte.belongsTo(models.Zona,{
                foreignKey: 'IdZona',
                as: 'Zona',
            });
            Reporte.belongsTo(models.TipoIncidencia,{
                foreignKey: 'IdIncidencia',
                as: 'TipoIncidencia',
            });
            Reporte.belongsTo(models.Prioridad,{
                foreignKey: 'IdPrioridad',
                as: 'Prioridad',
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
        }
    }, {
        sequelize, 
        modelName: 'Reporte'
    });
    return Reporte;
}