const Alert = require('../models/Alert');

// GET /v1/alerts
exports.listAlerts = async (req, res, next) => {
  try {
    const items = await Alert.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
    });

    // Compute risk score from unread fraud/spending alerts
    const unreadHigh = items.filter(a => !a.read && a.severity === 'high').length;
    const unreadMed = items.filter(a => !a.read && a.severity === 'medium').length;
    const riskScore = Math.min(100, unreadHigh * 25 + unreadMed * 10 + 10);

    res.json({
      riskScore,
      lastAnalyzed: new Date().toISOString(),
      items: items.map(a => ({
        id: a.id,
        type: a.type,
        message: a.message,
        severity: a.severity,
        read: a.read,
        ts: a.ts,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/alerts/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    await alert.update({ read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
