import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";
import { RSVPStatus } from "../types/enums";

// CampRSVP Attributes

export interface CampRSVPAttributes {
  id: string;
  donor_id: string;
  camp_id: string;

  status: RSVPStatus;

  registered_at?: Date;
}

export interface CampRSVPCreationAttributes
  extends Optional<
    CampRSVPAttributes,
    "id" | "status" | "registered_at"
  > {}

// CampRSVP Model
class CampRSVP
  extends Model<
    CampRSVPAttributes,
    CampRSVPCreationAttributes
  >
  implements CampRSVPAttributes
{
  public id!: string;
  public donor_id!: string;
  public camp_id!: string;
  public status!: RSVPStatus;
  public registered_at?: Date;
}

CampRSVP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    donor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "donor_profiles",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    camp_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "donation_camps",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM(...Object.values(RSVPStatus)),
      allowNull: false,
      defaultValue: RSVPStatus.REGISTERED,
    },

    registered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
  sequelize,
  tableName: "camp_rsvps",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["donor_id", "camp_id"],
    },
    {
      fields: ["camp_id", "status"],
    },
  ],
}
);

export default CampRSVP;