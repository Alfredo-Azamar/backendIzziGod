import { Model, Sequelize } from "sequelize";

interface ReporteAttibutes{
    IdReporte: number;
    Hora: string;
    Fecha: string;
    Prioridad: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Reporte extends Model <ReporteAttibutes> implements ReporteAttibutes {
        public IdReporte!:number;
        public Hora!:string;
        public Fecha!:string;
        public Prioridad!:string;

        static associate(models: any){
            Reporte.belongsTo(models.Zona,{
                foreignKey: 'IdZona',
                as: 'Zona',
            });
            Reporte.belongsTo(models.TipoIncidencia,{
                foreignKey: 'IdIncidencia',
                as: 'TipoIncidencia',
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
        Hora: {
            type: DataTypes.TIME,
            allowNull: false
        },
        Fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        Prioridad: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize, 
        modelName: 'Reporte'
    });
    return Reporte;
}