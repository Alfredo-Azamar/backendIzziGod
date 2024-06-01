import { Model, Sequelize } from "sequelize";

enum SentimentEnum{
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
  Duracion: string;
  Estado: boolean;
  Sentiment: SentimentEnum;
  Asunto: AsuntoEnum;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Llamada
    extends Model<LlamadaAttributes>
    implements LlamadaAttributes
  {
    public IdLlamada!: string;
    public FechaHora!: string;
    public Notas!: string;
    public Duracion!: string;
    public Estado!: boolean;
    public Sentiment!: SentimentEnum;
    public Asunto!: AsuntoEnum;

    static associate(models: any) {
      Llamada.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Llamada.belongsTo(models.Cliente, {
        foreignKey: "Celular",
        as: "Cliente",
      });
      Llamada.belongsTo(models.SolucionBase, {
        foreignKey: "IdSolucion",
        as: "Solucion",
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
      Duracion: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      Sentiment: {
        type: DataTypes.ENUM,
        values: Object.values(SentimentEnum),
        allowNull: false,
        defaultValue: SentimentEnum.Inactivo,
      },
      Asunto: {
        type: DataTypes.ENUM,
        values: Object.values(AsuntoEnum),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Llamada",
    }
  );
  return Llamada;
};