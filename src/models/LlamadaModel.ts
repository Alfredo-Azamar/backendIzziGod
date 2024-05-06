import { Model, Sequelize } from "sequelize";

interface LlamadaAttributes {
  IdLlamada: number;
  HoraInicio: string;
  HoraFin: string;
  Notas: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Llamada
    extends Model<LlamadaAttributes>
    implements LlamadaAttributes
  {
    public IdLlamada!: number;
    public HoraInicio!: string;
    public HoraFin!: string;
    public Notas!: string;

    static associate(models: any) {
      Llamada.belongsTo(models.Empleado, {
        foreignKey: "IdEmpleado",
        as: "Empleado",
      });
      Llamada.belongsTo(models.Cliente, {
        foreignKey: "IdCliente",
        as: "Cliente",
      });
      Llamada.belongsTo(models.Estado, {
        foreignKey: "IdEstado",
        as: "Estado",
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
      HoraInicio: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      HoraFin: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      Notas: {
        type: DataTypes.STRING,
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