import { Model, Sequelize } from "sequelize";

interface PasosAttributes {
    IdPaso: number;
    Descripcion: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Pasos 
        extends Model<PasosAttributes>
        implements PasosAttributes
    {
        public IdPaso!: number;
        public Descripcion!: string;

        static associate(models: any) {
            Pasos.belongsTo(models.SolucionBase, {
                foreignKey: "IdSolucion",
                as: "Solucion",
            });
        }
    }
    Pasos.init(
        {
            IdPaso: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Descripcion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Pasos",
        }
    );
    return Pasos;
}