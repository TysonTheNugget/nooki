const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mySuperSecretKey12345!';  // Ensure this matches the secret used during token generation

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token using jsonwebtoken
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decodedToken.user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token or token missing' });
  }
};

module.exports = authMiddleware;
