/**
 * Ranking: upvotes + comments (fast + simple).
 */

/**
 * score = (upvotes * 0.7) + (comments * 0.3)
 * @param {{ ups: number, num_comments: number }} p
 */
function rankScore(p) {
  const ups = Math.max(0, p.ups || 0);
  const comments = Math.max(0, p.num_comments || 0);
  return Math.round((ups * 0.7 + comments * 0.3) * 1000) / 1000;
}

module.exports = { rankScore };
