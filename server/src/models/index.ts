import User from "./User";
import City from "./City";
import DonorProfile from "./DonorProfile";
import HealthLog from "./HealthLog";
import DonationHistory from "./DonationHistory";
import Hospital from "./Hospital";
import BloodRequest from "./BloodRequest";
import RequestResponse from "./RequestResponse";
import Notification from "./Notification";
import BloodBankStatus from "./BloodBankStatus";
import DonationCamp from "./DonationCamp";
import CampRSVP from "./CampRSVP";
import OtpVerification from "./OtpVerification";
import RefreshToken from "./RefreshToken";

// User ↔ DonorProfile (One-to-One)
User.hasOne(DonorProfile, {
  foreignKey: "user_id",
  as: "donorProfile",
});

DonorProfile.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// City ↔ DonorProfile (One-to-Many)
City.hasMany(DonorProfile, {
  foreignKey: "city_id",
  as: "donors",
});

DonorProfile.belongsTo(City, {
  foreignKey: "city_id",
  as: "city",
});

// DonorProfile ↔ HealthLog (One-to-Many)
DonorProfile.hasMany(HealthLog, {
  foreignKey: "donor_id",
  as: "healthLogs",
});

HealthLog.belongsTo(DonorProfile, {
  foreignKey: "donor_id",
  as: "donor",
});

// DonorProfile ↔ DonationHistory (One-to-Many)
DonorProfile.hasMany(DonationHistory, {
  foreignKey: "donor_id",
  as: "donationHistory",
});

DonationHistory.belongsTo(DonorProfile, {
  foreignKey: "donor_id",
  as: "donor",
});

// City ↔ Hospital (One-to-Many)
City.hasMany(Hospital, {
  foreignKey: "city_id",
  as: "hospitals",
});

Hospital.belongsTo(City, {
  foreignKey: "city_id",
  as: "city",
});

// Hospital ↔ BloodRequest (One-to-Many)
Hospital.hasMany(BloodRequest, {
  foreignKey: "hospital_id",
  as: "bloodRequests",
});

BloodRequest.belongsTo(Hospital, {
  foreignKey: "hospital_id",
  as: "hospital",
});

// City ↔ BloodRequest (One-to-Many)
City.hasMany(BloodRequest, {
  foreignKey: "city_id",
  as: "bloodRequests",
});

BloodRequest.belongsTo(City, {
  foreignKey: "city_id",
  as: "city",
});

// BloodRequest ↔ RequestResponse (One-to-Many)
BloodRequest.hasMany(RequestResponse, {
  foreignKey: "request_id",
  as: "responses",
});

RequestResponse.belongsTo(BloodRequest, {
  foreignKey: "request_id",
  as: "bloodRequest",
});

// DonorProfile ↔ RequestResponse (One-to-Many)
DonorProfile.hasMany(RequestResponse, {
  foreignKey: "donor_id",
  as: "responses",
});

RequestResponse.belongsTo(DonorProfile, {
  foreignKey: "donor_id",
  as: "donor",
});

// User ↔ Notification (One-to-Many)
User.hasMany(Notification, {
  foreignKey: "user_id",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Hospital ↔ BloodBankStatus (One-to-Many)
Hospital.hasMany(BloodBankStatus, {
  foreignKey: "hospital_id",
  as: "bloodBankStatuses",
});

BloodBankStatus.belongsTo(Hospital, {
  foreignKey: "hospital_id",
  as: "hospital",
});

// Hospital ↔ DonationCamp (One-to-Many)
Hospital.hasMany(DonationCamp, {
  foreignKey: "hospital_id",
  as: "donationCamps",
});

DonationCamp.belongsTo(Hospital, {
  foreignKey: "hospital_id",
  as: "hospital",
});

// DonationCamp ↔ CampRSVP (One-to-Many)
DonationCamp.hasMany(CampRSVP, {
  foreignKey: "camp_id",
  as: "rsvps",
});

CampRSVP.belongsTo(DonationCamp, {
  foreignKey: "camp_id",
  as: "camp",
});

// DonorProfile ↔ CampRSVP (One-to-Many)
DonorProfile.hasMany(CampRSVP, {
  foreignKey: "donor_id",
  as: "campRegistrations",
});

CampRSVP.belongsTo(DonorProfile, {
  foreignKey: "donor_id",
  as: "donor",
});

// City ↔ DonationCamp (One-to-Many)
City.hasMany(DonationCamp, {
  foreignKey: "city_id",
  as: "donationCamps",
});

DonationCamp.belongsTo(City, {
  foreignKey: "city_id",
  as: "city",
});

// User ↔ RefreshToken (One-to-Many)
User.hasMany(RefreshToken, {
  foreignKey: "user_id",
  as: "refreshTokens",
});

RefreshToken.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export { User, City, DonorProfile, HealthLog, DonationHistory, Hospital, BloodRequest, RequestResponse, Notification, BloodBankStatus, DonationCamp, CampRSVP, OtpVerification, RefreshToken };