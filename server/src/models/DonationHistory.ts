import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";
import { DonationStatus } from "../types/enums";

// DonationHistory Attributes

export interface DonationHistoryAttributes {
  id: string;
  donor_id: string;
  request_id: string;
  status: DonationStatus;
  donation_date: Date;
}

export interface DonationHistoryCreationAttributes
  extends Optional<DonationHistoryAttributes, "id"> {}

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
    },

    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
    type: DataTypes.ENUM(...Object.values(DonationStatus)),
    allowNull: false,
    defaultValue: DonationStatus.COMPLETED,
    },

    donation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "donation_history",
    timestamps: false,
  }
);

export default DonationHistory;