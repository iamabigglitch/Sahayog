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
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  sent_at?: Date;
}

export interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    "id" | "status" | "sent_at"
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
  public title!: string;
  public message!: string;
  public type!: NotificationType;
  public status!: NotificationStatus;
  public sent_at?: Date;
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
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(NotificationStatus)),
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
    timestamps: false,
  }
);

export default Notification;