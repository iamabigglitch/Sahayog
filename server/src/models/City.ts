import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";

// City Attributes

export interface CityAttributes {
  id: string;
  name: string;
  province: string;
}

export interface CityCreationAttributes
  extends Optional<CityAttributes, "id"> {}

// City Model

class City
  extends Model<CityAttributes, CityCreationAttributes>
  implements CityAttributes
{
  public id!: string;
  public name!: string;
  public province!: string;
}

City.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "cities",
    timestamps: false,
  }
);

export default City;