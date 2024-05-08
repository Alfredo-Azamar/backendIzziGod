import { Model, Sequelize } from "sequelize";

interface IncidenciaAttributes {
  IdIncidencia: number;
  Nombre: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Incidencia
    extends Model<IncidenciaAttributes>
    implements IncidenciaAttributes
  {
    public IdIncidencia!: number;
    public Nombre!: string;
  }

  Incidencia.init(
    {
      IdIncidencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Incidencia",
    }
  );
  return Incidencia;
};
