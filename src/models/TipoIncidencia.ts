import { Model, Sequelize } from "sequelize";

interface TipoIncidenciaAttributes{
    IdTipoIncidencia: number;
    Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class TipoIncidencia extends Model <TipoIncidenciaAttributes> implements TipoIncidenciaAttributes {
        public IdTipoIncidencia!:number;
        public Nombre!:string;
    }

    TipoIncidencia.init({
        IdTipoIncidencia: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize, 
        modelName: 'TipoIncidencia'
    });
    return TipoIncidencia;
}