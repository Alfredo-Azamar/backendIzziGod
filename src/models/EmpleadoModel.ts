import { Model, Sequelize } from "sequelize";

enum RolEnum {
  Supervisor = "supervisor",
  Agente = "agente"
}

interface EmpleadoAttributes {
  IdEmpleado: string;
  Rol: RolEnum;
  Nombre: string;
  ApellidoP: string;
  ApellidoM: string;
  Correo: string;
  Contra: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Empleado
    extends Model<EmpleadoAttributes>
    implements EmpleadoAttributes
  {
    public IdEmpleado!: string;
    public Rol!: RolEnum;
    public Nombre!: string;
    public ApellidoP!: string;
    public ApellidoM!: string;
    public Correo!: string;
    public Contra!: string;
  }
  Empleado.init(
    {
      IdEmpleado: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      Rol: {
        type: DataTypes.ENUM,
        values: Object.values(RolEnum),
        allowNull: false,
        defaultValue: RolEnum.Agente,
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
      Correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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