import { Model, Sequelize } from "sequelize";

enum PreguntaEnum{
    Pregunta1 = "1",
    Pregunta2 = "2",
    Pregunta3 = "3",
}

interface EncuestaAttributes {
    IdEncuesta: number;
    Pregunta: PreguntaEnum;
    Calificacion: number;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    class Encuesta
        extends Model<EncuestaAttributes>
        implements EncuestaAttributes
    {
        public IdEncuesta!: number;
        public Pregunta!: PreguntaEnum;
        public Calificacion!: number;

        static associate(models: any) {
            Encuesta.belongsTo(models.Llamada, {
                foreignKey: "IdLlamada",
                as: "Llamada",
            });
        }
    }
    Encuesta.init(
        {
            IdEncuesta: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Pregunta: {
                type: DataTypes.ENUM,
                values: Object.values(PreguntaEnum),
                allowNull: false,
            },
            Calificacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Encuesta",
        }
    );
    return Encuesta;
}