import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface DeviceTokenAttributes {
  id: string;
  user_id: string;
  token: string;
  platform: "android" | "ios" | "web";
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface DeviceTokenCreationAttributes
  extends Optional<
    DeviceTokenAttributes,
    "id" | "is_active" | "created_at" | "updated_at"
  > {}

class DeviceToken
  extends Model<
    DeviceTokenAttributes,
    DeviceTokenCreationAttributes
  >
  implements DeviceTokenAttributes
{
  public id!: string;
  public user_id!: string;
  public token!: string;
  public platform!: "android" | "ios" | "web";
  public is_active!: boolean;
  public created_at?: Date;
  public updated_at?: Date;
}

DeviceToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: "users",
        key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    platform: {
      type: DataTypes.ENUM(
        "android",
        "ios",
        "web"
      ),
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "device_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DeviceToken;