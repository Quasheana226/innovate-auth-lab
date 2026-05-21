import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already in use.' });
  }

  const user = await User.create({ username, email, password });

  // Return the user but hide the password
  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
  });
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Incorrect email or password.' });
  }

  const correct = await user.isCorrectPassword(password);
  if (!correct) {
    return res.status(400).json({ message: 'Incorrect email or password.' });
  }

  const token = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
});

export default router;