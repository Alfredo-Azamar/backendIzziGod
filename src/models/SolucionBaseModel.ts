import { Model, Sequelize } from "sequelize";

enum AsuntoEnum{
    Ventas = "ventas",
    Internet = "internet",
    Telefonia = "telefonia",
    Television = "television",
    Soporte = "soporte",
  }

interface SolucionBaseAttributes {
    IdSolucion: number;
    Nombre: string;
    Asunto: AsuntoEnum;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class SolucionBase
        extends Model<SolucionBaseAttributes>
        implements SolucionBaseAttributes
    {
        public IdSolucion!: number;
        public Nombre!: string;
        public Asunto!: AsuntoEnum;

        static associate(models: any) {
            SolucionBase.hasMany(models.Pasos, {
                foreignKey: "IdSolucion",
                as: "Pasos",
            });
        }
    }
    SolucionBase.init(
        {
            IdSolucion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Nombre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Asunto: {
                type: DataTypes.ENUM,
                values: Object.values(AsuntoEnum),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "SolucionBase",
        }
    );
    return SolucionBase;
};