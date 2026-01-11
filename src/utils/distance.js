/**
 * Calculate Manhattan distance between two points
 * Manhattan distance formula: |x1 - x2| + |y1 - y2|
 * 
 * @param {Object} point1 - First point with x and y properties
 * @param {number} point1.x - X coordinate of first point
 * @param {number} point1.y - Y coordinate of first point
 * @param {Object} point2 - Second point with x and y properties
 * @param {number} point2.x - X coordinate of second point
 * @param {number} point2.y - Y coordinate of second point
 * @returns {number} The Manhattan distance between the two points
 */
function calculateDistance(point1, point2) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  return dx + dy;
}

module.exports = calculateDistance;
