import { Model, Sequelize } from "sequelize";

enum EstadoEnum{
  Inactivo = "inactivo",
  Positivo = "positivo",
  Preventivo = "preventivo",
  Critico = "critico"
}

enum AsuntoEnum{
  Ventas = "ventas",
  Internet = "internet",
  Telefonia = "telefonia",
  Television = "television",
  Soporte = "soporte",
}

interface LlamadaAttributes {
  IdLlamada: number;
  FechaHora: string;
  Notas: string;
  Estado: EstadoEnum;
  Asunto: AsuntoEnum;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Llamada
    extends Model<LlamadaAttributes>
    implements LlamadaAttributes
  {
    public IdLlamada!: number;
    public FechaHora!: string;
    public Notas!: string;
    public Estado!: EstadoEnum;
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
    }
  }
  Llamada.init(
    {
      IdLlamada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
    },
    {
      sequelize,
      modelName: "Llamada",
    }
  );
  return Llamada;
};