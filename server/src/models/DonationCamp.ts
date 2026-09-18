import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";
import { CampStatus, OrganizerType } from "../types/enums";

// DonationCamp Attributes

export interface DonationCampAttributes {
  id: string;
  hospital_id?: string;
  title: string;
  description?: string;
  venue: string;
  camp_date: Date;
  start_time: string;
  end_time: string;
  status: CampStatus;
  created_at?: Date;
  city_id: string;
  organizer_name: string;
  organizer_type: OrganizerType;
}

export interface DonationCampCreationAttributes
  extends Optional<
    DonationCampAttributes,
    "id" | "description" | "status" | "created_at"
  > {}

// DonationCamp Model

class DonationCamp
  extends Model<
    DonationCampAttributes,
    DonationCampCreationAttributes
  >
  implements DonationCampAttributes
{
  public id!: string;
  public hospital_id?: string;
  public title!: string;
  public description?: string;
  public venue!: string;
  public camp_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public status!: CampStatus;
  public created_at?: Date;
  public city_id!: string;
  public organizer_name!: string;
  public organizer_type!: OrganizerType;
}

DonationCamp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

    hospital_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "hospitals",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    organizer_name: {
  type: DataTypes.STRING,
  allowNull: false,
    },

  organizer_type: {
  type: DataTypes.ENUM(...Object.values(OrganizerType)),
  allowNull: false,
    },

    camp_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(CampStatus)),
      allowNull: false,
      defaultValue: CampStatus.UPCOMING,
    },
  },
  {
    sequelize,
    tableName: "donation_camps",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["city_id", "camp_date"],
      },
      {
        fields: ["status", "camp_date"],
      },
      {
        fields: ["hospital_id"],
      },
    ],
  }
);

export default DonationCamp;