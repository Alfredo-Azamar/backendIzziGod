import { Model, Sequelize } from "sequelize";

enum EstadoEnum{
  Inactivo = "inactivo",
  Positivo = "positivo",
  Preventivo = "preventivo",
  Critico = "critico"
}

interface LlamadaAttributes {
  IdLlamada: number;
  FechaHora: string;
  Notas: string;
  Estado: EstadoEnum;
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

    static associate(models: any) {
      Llamada.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Llamada.belongsTo(models.Cliente, {
        foreignKey: "IdCliente",
        as: "Cliente",
      });
      Llamada.belongsTo(models.Asunto, {
        foreignKey: "IdAsunto",
        as: "Asunto",
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
      }
    },
    {
      sequelize,
      modelName: "Llamada",
    }
  );
  return Llamada;
};