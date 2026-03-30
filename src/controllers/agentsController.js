const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const Alert = require('../models/Alert');

// GET /v1/agents/escalation/analyse
exports.analyse = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Gather signals for scoring
    const [totalTxns, recentTxns, openComplaints, highAlerts] = await Promise.all([
      Transaction.count({ where: { userId } }),
      Transaction.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 30 }),
      Complaint.count({ where: { userId, status: 'Open' } }),
      Alert.count({ where: { userId, severity: 'high', read: false } }),
    ]);

    // Risk scoring logic
    let riskScore = 10; // base
    riskScore += openComplaints * 15;
    riskScore += highAlerts * 20;

    // Detect unusual spending: if any recent txn > 50000
    const largeSpend = recentTxns.filter(t => t.type === 'debit' && t.amount > 50000).length;
    riskScore += largeSpend * 10;

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    // Determine tier
    let tier, recommendation;
    if (riskScore > 70) {
      tier = 'L3';
      recommendation = 'Immediate review required. Account flagged for suspicious activity.';
    } else if (riskScore > 40) {
      tier = 'L2';
      recommendation = 'Elevated risk detected. Monitoring increased.';
    } else {
      tier = 'L1';
      recommendation = 'Account activity within normal parameters.';
    }

    res.json({
      riskScore,
      tier,
      recommendation,
      signals: {
        openComplaints,
        highAlerts,
        largeTxnsLast30: largeSpend,
        totalTransactions: totalTxns,
      },
      analysedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
