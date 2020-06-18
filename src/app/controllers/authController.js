const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');
const mailer = require('../../modules/mailer');
const User = require('../models/User');

const router = express.Router();

function generateToken(params = {}) {
  return token = jwt.sign(params, authConfig.secret, { expiresIn: 86400 });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: 'User already exists' });

    const user = await User.create(req.body);
    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return res.status(400).send({ error: 'User not found' });

  if (!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password' });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id })
  });
});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: expirationDate
      }
    });

    await mailer.sendMail({
      from: '"Marcio Casagrande" <mmlcasag@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Forgot your password?", // Subject line
      text: "Você esqueceu sua senha? Não tem problema utilize este token: " + token, // plain text body
      html: "<p>Você esqueceu sua senha? Não tem problema utilize este token: " + token + "</p>", // html body
    });

    res.send({ token });
  } catch ( err ) {
    res.status(400).send({ error: 'Error on forgot password' });
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Invalid token' });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token has already expired' });

    user.password = password;

    await user.save();

    res.send({ ok: true });
  } catch ( err ) {
    res.send(400).send({ error: 'Could not reset password' })
  }
});

module.exports = router;