const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).send({ error: 'No token provided' });

  const parts = authHeader.split(' ');

  if (parts.length != 2)
    return res.status(401).send({ error: 'Token not made up of 2 parts' });

  const [ scheme , token ] = parts;

  if (scheme.trim() != 'Bearer')
    return res.status(401).send({ error: 'Part 1 of token does not contain the word Bearer' });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err)
      return res.status(401).send({ error: 'Invalid token' });

    req.authenticatedUserId = decoded.id;

    return next();
  });
};
