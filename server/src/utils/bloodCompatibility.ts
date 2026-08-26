import { BloodGroup } from "../types/enums";

/**
 * Determines whether a donor's blood group
 * is compatible with a recipient's blood group
 * for red blood cell donation.
 */
export const isBloodGroupCompatible = (
  donorBloodGroup: BloodGroup,
  recipientBloodGroup: BloodGroup
): boolean => {
  const compatibleDonors: Record<BloodGroup, BloodGroup[]> = {
    [BloodGroup.A_POS]: [
      BloodGroup.A_POS,
      BloodGroup.O_POS,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.A_NEG]: [
      BloodGroup.A_NEG,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.B_POS]: [
      BloodGroup.B_POS,
      BloodGroup.O_POS,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.B_NEG]: [
      BloodGroup.B_NEG,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.AB_POS]: [
      BloodGroup.AB_POS,
      BloodGroup.A_POS,
      BloodGroup.A_NEG,
      BloodGroup.B_POS,
      BloodGroup.B_NEG,
      BloodGroup.O_POS,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.AB_NEG]: [
      BloodGroup.AB_NEG,
      BloodGroup.A_NEG,
      BloodGroup.B_NEG,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.O_POS]: [
      BloodGroup.O_POS,
      BloodGroup.O_NEG,
    ],

    [BloodGroup.O_NEG]: [
      BloodGroup.O_NEG,
    ],
  };

  return compatibleDonors[recipientBloodGroup].includes(
    donorBloodGroup
  );
};