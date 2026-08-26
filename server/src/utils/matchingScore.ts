interface MatchingScoreInput {
  distanceKm?: number;
  sameCity: boolean;
  donorVerified: boolean;
  trustScore: number;
}

export const calculateMatchingScore = ({
  distanceKm,
  sameCity,
  donorVerified,
  trustScore,
}: MatchingScoreInput): number => {
  // Verified donor: maximum 30 points
  const verificationScore = donorVerified ? 30 : 0;

  // Same city: 20 points
  const cityScore = sameCity ? 20 : 0;

  // Trust score: maximum 20 points
  const normalizedTrustScore = Math.max(
    0,
    Math.min(trustScore, 100)
  );

  const trustScorePoints =
    (normalizedTrustScore / 100) * 20;

  // Proximity: maximum 30 points
  //
  // 0 km = 30 points
  // 10 km = 20 points
  // 20 km = 10 points
  // 30+ km = 0 points
  let proximityScore = 0;

  if (distanceKm !== undefined) {
    proximityScore = Math.max(
      0,
      Math.min(
        30,
        30 - distanceKm
      )
    );
  }

  const totalScore =
    verificationScore +
    cityScore +
    trustScorePoints +
    proximityScore;

  return Number(totalScore.toFixed(2));
};