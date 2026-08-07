import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import sequelize from "../config/database";

import { ResponseStatus } from "../types/enums";

// RequestResponse Attributes

export interface RequestResponseAttributes {
  id: string;
  request_id: string;
  donor_id: string;
  status: ResponseStatus;
  responded_at?: Date;
}

export interface RequestResponseCreationAttributes
  extends Optional<
    RequestResponseAttributes,
    "id" | "status" | "responded_at"
  > {}

// RequestResponse Model

class RequestResponse
  extends Model<
    RequestResponseAttributes,
    RequestResponseCreationAttributes
  >
  implements RequestResponseAttributes
{
  public id!: string;
  public request_id!: string;
  public donor_id!: string;
  public status!: ResponseStatus;
  public responded_at?: Date;
}

RequestResponse.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    donor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(ResponseStatus)),
      allowNull: false,
      defaultValue: ResponseStatus.PENDING,
    },

    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "request_responses",
    timestamps: false,
  }
);

export default RequestResponse;