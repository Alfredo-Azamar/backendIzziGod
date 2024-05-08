import { Model, Sequelize } from "sequelize";

export enum RolEnum {
  Supervisor = "supervisor",
  Agente = "agente"
}

interface EmpleadoAttributes {
  IdEmpleado: number;
  Rol: RolEnum;
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
    public Rol!: RolEnum;
    public Nombre!: string;
    public ApellidoP!: string;
    public ApellidoM!: string;
    public Usuario!: string;
    public Contra!: string;
  }
  Empleado.init(
    {
      IdEmpleado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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