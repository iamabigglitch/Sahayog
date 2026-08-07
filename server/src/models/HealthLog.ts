import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";

// HealthLog Attributes

export interface HealthLogAttributes {
  id: string;
  donor_id: string;
  hemoglobin: number;
  weight_kg: number;
  feeling_healthy: boolean;
  logged_at?: Date;
}

export interface HealthLogCreationAttributes
  extends Optional<
    HealthLogAttributes,
    "id" | "logged_at"
  > {}

// HealthLog Model

class HealthLog
  extends Model<
    HealthLogAttributes,
    HealthLogCreationAttributes
  >
  implements HealthLogAttributes
{
  public id!: string;
  public donor_id!: string;
  public hemoglobin!: number;
  public weight_kg!: number;
  public feeling_healthy!: boolean;
  public logged_at?: Date;
}

HealthLog.init(
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

    hemoglobin: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    weight_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    feeling_healthy: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    logged_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "health_logs",
    timestamps: false,
  }
);

export default HealthLog;