const jwt = require('jsonwebtoken');

// Short-lived access token, sent in the JSON response and stored in memory on the client.
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });

// Longer-lived refresh token, sent only as an httpOnly cookie.
const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

module.exports = { generateAccessToken, generateRefreshToken };
