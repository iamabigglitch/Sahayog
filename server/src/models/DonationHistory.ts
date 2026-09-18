import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

import {
  DonationStatus,
} from "../types/enums";

// DonationHistory Attributes
export interface DonationHistoryAttributes {
  id: string;
  donor_id: string;
  request_id: string;
  status: DonationStatus;
  donation_date: Date;
  created_at?: Date;
}

export interface DonationHistoryCreationAttributes
  extends Optional<
    DonationHistoryAttributes,
    "id" | "created_at"
  > {}

// DonationHistory Model
class DonationHistory
  extends Model<
    DonationHistoryAttributes,
    DonationHistoryCreationAttributes
  >
  implements DonationHistoryAttributes
{
  public id!: string;
  public donor_id!: string;
  public request_id!: string;
  public status!: DonationStatus;
  public donation_date!: Date;
  public created_at?: Date;
}

DonationHistory.init(
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

    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "blood_requests",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM(
        ...Object.values(DonationStatus)
      ),
      allowNull: false,
      defaultValue:
        DonationStatus.COMPLETED,
    },

    donation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "donation_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["donor_id", "request_id"],
      },
      {
        fields: ["donor_id", "donation_date"],
      },
    ],
  }
);

export default DonationHistory;