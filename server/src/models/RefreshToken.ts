import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

// Refresh Token Attributes

export interface RefreshTokenAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at?: Date;
  created_at?: Date;
}

export interface RefreshTokenCreationAttributes
  extends Optional<
    RefreshTokenAttributes,
    "id" | "revoked_at" | "created_at"
  > {}

// Refresh Token Model

class RefreshToken
  extends Model<
    RefreshTokenAttributes,
    RefreshTokenCreationAttributes
  >
  implements RefreshTokenAttributes
{
  public id!: string;
  public user_id!: string;
  public token_hash!: string;
  public expires_at!: Date;
  public revoked_at?: Date;
  public created_at?: Date;
}

RefreshToken.init(
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

    token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "token_hash"],
      },
      {
        fields: ["user_id", "expires_at"],
      },
    ],
  }
);

export default RefreshToken;