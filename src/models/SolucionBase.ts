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
    Asunto: AsuntoEnum;
    Prioridad: number;
    Paso: number;
    Solucion: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class SolucionBase
        extends Model<SolucionBaseAttributes>
        implements SolucionBaseAttributes
    {
        public IdSolucion!: number;
        public Asunto!: AsuntoEnum;
        public Prioridad!: number;
        public Paso!: number;
        public Solucion!: string;
    }
    SolucionBase.init(
        {
            IdSolucion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Asunto: {
                type: DataTypes.ENUM,
                values: Object.values(AsuntoEnum),
                allowNull: false,
              },
            Prioridad: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Paso: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Solucion: {
                type: DataTypes.STRING,
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