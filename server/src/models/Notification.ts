import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

import {
  NotificationType,
  NotificationStatus,
} from "../types/enums";

// Notification Attributes
export interface NotificationAttributes {
  id: string;
  user_id: string;
  // Set for blood request alerts; empty for admin announcements
  request_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  sent_at?: Date;
  created_at?: Date;
}

export interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    "id" | "request_id" | "status" | "sent_at" | "created_at"
  > {}

// Notification Model
class Notification
  extends Model<
    NotificationAttributes,
    NotificationCreationAttributes
  >
  implements NotificationAttributes
{
  public id!: string;
  public user_id!: string;
  public request_id?: string | null;
  public title!: string;
  public message!: string;
  public type!: NotificationType;
  public status!: NotificationStatus;
  public sent_at?: Date;
  public created_at?: Date;
}

Notification.init(
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

    request_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "blood_requests",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        ...Object.values(NotificationType)
      ),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        ...Object.values(NotificationStatus)
      ),
      allowNull: false,
      defaultValue: NotificationStatus.PENDING,
    },

    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["user_id", "created_at"],
      },
      {
        fields: ["user_id", "status"],
      },
    ],
  }
);

export default Notification;