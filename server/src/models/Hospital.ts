import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";

// Hospital Attributes

export interface HospitalAttributes {
  id: string;
  name: string;
  city_id: string;
  address: string;
  contact_phone: string;
  latitude?: number;
  longitude?: number;
}

export interface HospitalCreationAttributes
  extends Optional<
    HospitalAttributes,
    "id" | "latitude" | "longitude"
  > {}

// Hospital Model

class Hospital
  extends Model<
    HospitalAttributes,
    HospitalCreationAttributes
  >
  implements HospitalAttributes
{
  public id!: string;
  public name!: string;
  public city_id!: string;
  public address!: string;
  public contact_phone!: string;
  public latitude?: number;
  public longitude?: number;
}

Hospital.init(
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

    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "hospitals",
    timestamps: false,
  }
);

export default Hospital;