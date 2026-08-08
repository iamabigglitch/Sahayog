import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";
import { OtpPurpose } from "../types/authtypes";

// OTP Verification Attributes
export interface OtpVerificationAttributes {
  id: string;
  phone: string;
  otp_hash: string;
  purpose: OtpPurpose;
  expires_at: Date;
  attempts: number;
  verified_at?: Date | null;
  created_at?: Date;
}

export interface OtpVerificationCreationAttributes
  extends Optional<
    OtpVerificationAttributes,
    "id" | "attempts" | "verified_at" | "created_at"
  > {}

// OTP Verification Model
class OtpVerification
  extends Model<
    OtpVerificationAttributes,
    OtpVerificationCreationAttributes
  >
  implements OtpVerificationAttributes
{
  public id!: string;
  public phone!: string;
  public otp_hash!: string;
  public purpose!: OtpPurpose;
  public expires_at!: Date;
  public attempts!: number;
  public verified_at?: Date | null;
  public created_at?: Date;
}

OtpVerification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    otp_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    purpose: {
      type: DataTypes.ENUM(...Object.values(OtpPurpose)),
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "otp_verifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default OtpVerification;