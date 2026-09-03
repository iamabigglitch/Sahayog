import DeviceToken from "../models/DeviceToken";

export interface RegisterDeviceTokenData {
  userId: string;
  token: string;
  platform: "android" | "ios" | "web";
}

export class DeviceTokenService {
  static async registerDeviceToken(
    data: RegisterDeviceTokenData
  ) {
    const {
      userId,
      token,
      platform,
    } = data;

    const existingToken = await DeviceToken.findOne({
      where: {
        token,
      },
    });

    if (existingToken) {
      existingToken.user_id = userId;
      existingToken.platform = platform;
      existingToken.is_active = true;

      await existingToken.save();

      return existingToken;
    }

    return DeviceToken.create({
      user_id: userId,
      token,
      platform,
      is_active: true,
    });
  }

  static async deactivateDeviceToken(
    tokenId: string,
    userId: string
  ) {
    const deviceToken =
      await DeviceToken.findByPk(tokenId);

    if (!deviceToken) {
      throw new Error("Device token not found");
    }

    if (deviceToken.user_id !== userId) {
      throw new Error(
        "You are not allowed to deactivate this device token"
      );
    }

    deviceToken.is_active = false;

    await deviceToken.save();

    return deviceToken;
  }

  static async getActiveTokens(
    userId: string
  ) {
    return DeviceToken.findAll({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
  }

  static async getActiveTokenValues(
    userId: string
  ) {
    const tokens =
      await this.getActiveTokens(userId);

    return tokens.map(
      (deviceToken) => deviceToken.token
    );
  }
}