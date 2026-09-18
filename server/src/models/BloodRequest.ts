import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";

import {
  BloodGroup,
  RequestStatus,
  Urgency,
  RelationshipToPatient,
} from "../types/enums";

// BloodRequest Attributes

export interface BloodRequestAttributes {
  id: string;
  blood_group_needed: BloodGroup;
  units_needed: number;
  hospital_id: string;
  city_id: string;
  requester_name: string;
  contact_phone: string;
  relationship_to_patient: RelationshipToPatient;
  urgency: Urgency;
  status: RequestStatus;
  trust_score: number;
  expires_at: Date;
  created_at?: Date;
}

export interface BloodRequestCreationAttributes
  extends Optional<
    BloodRequestAttributes,
    "id" | "status" | "trust_score" | "created_at"
  > {}

// BloodRequest Model

class BloodRequest
  extends Model<
    BloodRequestAttributes,
    BloodRequestCreationAttributes
  >
  implements BloodRequestAttributes
{
  public id!: string;
  public blood_group_needed!: BloodGroup;
  public units_needed!: number;
  public hospital_id!: string;
  public city_id!: string;
  public requester_name!: string;
  public contact_phone!: string;
  public relationship_to_patient!: RelationshipToPatient;
  public urgency!: Urgency;
  public status!: RequestStatus;
  public trust_score!: number;
  public expires_at!: Date;
  public created_at?: Date;
}

BloodRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    blood_group_needed: {
      type: DataTypes.ENUM(...Object.values(BloodGroup)),
      allowNull: false,
    },

    units_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hospitals",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "cities",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    requester_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    relationship_to_patient: {
      type: DataTypes.ENUM(...Object.values(RelationshipToPatient)),
      allowNull: false,
    },

    urgency: {
      type: DataTypes.ENUM(...Object.values(Urgency)),
      allowNull: false,
      defaultValue: Urgency.NORMAL,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.REQUESTED,
    },

    trust_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "blood_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["status", "expires_at"],
      },
      {
        fields: ["city_id", "status"],
      },
      {
        fields: ["hospital_id"],
      },
    ],
  }
);

export default BloodRequest;