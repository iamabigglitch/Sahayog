import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";
import { BloodGroup } from "../types/enums";

// DonorProfile Attributes

export interface DonorProfileAttributes {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  city_id: string;
  latitude?: number;
  longitude?: number;
  last_donation_date?: Date;
  available: boolean;
  donor_verified: boolean;
  trust_score: number;
  updated_at?: Date;
}

export interface DonorProfileCreationAttributes
  extends Optional<
    DonorProfileAttributes,
    | "id"
    | "latitude"
    | "longitude"
    | "last_donation_date"
    | "available"
    | "donor_verified"
    | "trust_score"
    | "updated_at"
  > {}

// DonorProfile Model

class DonorProfile
  extends Model<
    DonorProfileAttributes,
    DonorProfileCreationAttributes
  >
  implements DonorProfileAttributes
{
  public id!: string;
  public user_id!: string;
  public blood_group!: BloodGroup;
  public city_id!: string;
  public latitude?: number;
  public longitude?: number;
  public last_donation_date?: Date;
  public available!: boolean;
  public donor_verified!: boolean;
  public trust_score!: number;
  public updated_at?: Date;
}

DonorProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    blood_group: {
    type: DataTypes.ENUM(...Object.values(BloodGroup)),
    allowNull: false,
    },

    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "cities",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    last_donation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    donor_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    trust_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "donor_profiles",
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["city_id"],
      },
      {
        fields: ["available", "donor_verified"],
      },
      {
        fields: ["blood_group"],
      },
    ],
  }
);

export default DonorProfile;