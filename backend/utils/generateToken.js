import jwt from 'jsonwebtoken';

/**
 * Signs a JWT containing the user's id.
 * @param {string} userId
 * @returns {string} signed JWT
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sets the JWT as an httpOnly cookie on the response and also
 * returns the token so it can be included in the JSON body for
 * clients that prefer header-based auth.
 */
export const sendTokenResponse = (res, userId) => {
  const token = generateToken(userId);

  const cookieExpiresDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  });

  return token;
};
