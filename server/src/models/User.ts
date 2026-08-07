import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";
import { UserRole } from "../types/enums";

// User Attributes

export interface UserAttributes {
  id: string;
  phone: string;
  password_hash: string;
  role: "donor" | "admin";
  phone_verified: boolean;
  created_at?: Date;
}

// Attributes required when creating a new user

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "phone_verified" | "created_at"> {}


// User Model

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public phone!: string;
  public password_hash!: string;
  public role!: UserRole;
  public phone_verified!: boolean;
  public created_at?: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
    type: DataTypes.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.DONOR,
    },

    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default User;