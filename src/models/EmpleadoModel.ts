import { Model, Sequelize } from "sequelize";

interface EmpleadoAttributes {
  IdEmpleado: number;
  Nombre: string;
  ApellidoP: string;
  ApellidoM: string;
  Usuario: string;
  Contra: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Empleado
    extends Model<EmpleadoAttributes>
    implements EmpleadoAttributes
  {
    public IdEmpleado!: number;
    public Nombre!: string;
    public ApellidoP!: string;
    public ApellidoM!: string;
    public Usuario!: string;
    public Contra!: string;

    static associate(models: any) {
      Empleado.belongsTo(models.Rol, {
        foreignKey: "IdRol",
        as: "Rol",
      });
    }
  }
  Empleado.init(
    {
      IdEmpleado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ApellidoP: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ApellidoM: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Usuario: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Contra: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Empleado",
    }
  );
  return Empleado;
};
