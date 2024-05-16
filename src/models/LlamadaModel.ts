import { Model, Sequelize } from "sequelize";

enum EstadoEnum{
  Inactivo = "inactivo",
  Mixed = "mixed",
  Negative = "negative",
  Neutral = "neutral",
  Positive = "positive",
}

enum AsuntoEnum{
  Ventas = "ventas",
  Internet = "internet",
  Telefonia = "telefonia",
  Television = "television",
  Soporte = "soporte",
}

interface LlamadaAttributes {
  IdLlamada: string;
  FechaHora: string;
  Notas: string;
  Estado: EstadoEnum;
  Asunto: AsuntoEnum;
  Duracion: number;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Llamada
    extends Model<LlamadaAttributes>
    implements LlamadaAttributes
  {
    public IdLlamada!: string;
    public FechaHora!: string;
    public Notas!: string;
    public Estado!: EstadoEnum;
    public Asunto!: AsuntoEnum;
    public Duracion!: number;

    static associate(models: any) {
      Llamada.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Llamada.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });
    }
  }
  Llamada.init(
    {
      IdLlamada: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      FechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Notas: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Estado: {
        type: DataTypes.ENUM,
        values: Object.values(EstadoEnum),
        allowNull: false,
        defaultValue: EstadoEnum.Inactivo,
      },
      Asunto: {
        type: DataTypes.ENUM,
        values: Object.values(AsuntoEnum),
        allowNull: false,
      },
      Duracion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Llamada",
    }
  );
  return Llamada;
};