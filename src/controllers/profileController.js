const User = require('../models/User');

// GET /v1/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      accountNumber: user.accountNumber,
      settings: {
        fraudAlerts: true,
        spendingAlerts: true,
        biometricEnabled: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    await user.update(updates);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};
