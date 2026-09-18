import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

import {
  BloodGroup,
  BloodStockStatus,
} from "../types/enums";

// Blood Bank Status Attributes
export interface BloodBankStatusAttributes {
  id: string;
  hospital_id: string;
  blood_group: BloodGroup;
  units_available: number;
  status: BloodStockStatus;
  last_confirmed: Date;
  submitted_by: string;
}

export interface BloodBankStatusCreationAttributes
  extends Optional<
    BloodBankStatusAttributes,
    "id" | "status" | "last_confirmed"
  > {}

// Blood Bank Status Model
class BloodBankStatus
  extends Model<
    BloodBankStatusAttributes,
    BloodBankStatusCreationAttributes
  >
  implements BloodBankStatusAttributes
{
  public id!: string;
  public hospital_id!: string;
  public blood_group!: BloodGroup;
  public units_available!: number;
  public status!: BloodStockStatus;
  public last_confirmed!: Date;
  public submitted_by!: string;
}

BloodBankStatus.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hospitals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    blood_group: {
      type: DataTypes.ENUM(...Object.values(BloodGroup)),
      allowNull: false,
    },

    units_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.ENUM(...Object.values(BloodStockStatus)),
      allowNull: false,
      defaultValue: BloodStockStatus.AVAILABLE,
    },

    last_confirmed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    submitted_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },

  {
    sequelize,
    tableName: "blood_bank_status",
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["hospital_id", "blood_group"],
      },
      {
        fields: ["hospital_id", "status"],
      },
    ],
  }
);

export default BloodBankStatus;
