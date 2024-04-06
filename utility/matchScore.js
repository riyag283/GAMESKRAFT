const geolib = require("geolib");

function calculateMatchMeasure(user1, user2) {
  // Calculate proximity score
  const coords1 = {
    latitude: user1.location.coordinates[0],
    longitude: user1.location.coordinates[1],
  };
  const coords2 = {
    latitude: user2.location.coordinates[0],
    longitude: user2.location.coordinates[1],
  };
  const distance = geolib.getDistance(coords1, coords2) / 1000; // getDistance returns meters, convert to km
  const proximityScore = 1 / (1 + distance); // Higher score for closer proximity

  // Calculate game interest match score
  const user1Games = user1.gameInterest.reduce(
    (acc, game) => ({ ...acc, [game.game]: game }),
    {}
  );
  const user2Games = user2.gameInterest.reduce(
    (acc, game) => ({ ...acc, [game.game]: game }),
    {}
  );
  const commonGames = Object.keys(user1Games).filter(
    (game) => game in user2Games
  );
  const gameInterestScore =
    commonGames.length /
    Math.max(Object.keys(user1Games).length, Object.keys(user2Games).length); // Higher score for more common games

  // Calculate game skill score
  let skillScore = 0;
  if (commonGames.length > 0) {
    skillScore = commonGames.reduce(
      (acc, game) =>
        acc +
        Math.abs(user1Games[game].skillScore - user2Games[game].skillScore) /
          10,
      0
    );
    skillScore /= commonGames.length; // Average normalized difference in skill scores for common games
  }
  skillScore = 1 - skillScore; // Higher score for smaller difference in skill scores

  // Calculate final match measure
  //   console.log(proximityScore, gameInterestScore, skillScore);
  const matchMeasure =
    0.5 * proximityScore + 0.3 * gameInterestScore + 0.2 * skillScore;

  return matchMeasure;
}

module.exports = calculateMatchMeasure;
