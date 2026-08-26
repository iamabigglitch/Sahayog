import DonorProfile from "../models/DonorProfile";

const MIN_DAYS_BETWEEN_DONATIONS = 90;

export const isDonorEligible = (
  donor: DonorProfile
): boolean => {
  // A donor must be available.
  if (!donor.available) {
    return false;
  }

  // If there is no recorded previous donation,
  // the donor passes the donation-date check.
  if (!donor.last_donation_date) {
    return true;
  }

  const today = new Date();
  const lastDonation = new Date(donor.last_donation_date);

  const differenceInMilliseconds =
    today.getTime() - lastDonation.getTime();

  const differenceInDays =
    differenceInMilliseconds /
    (1000 * 60 * 60 * 24);

  return differenceInDays >= MIN_DAYS_BETWEEN_DONATIONS;
};