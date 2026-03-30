const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// GET /v1/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { userId: req.user.userId } });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const recentTransactions = await Transaction.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      balance: {
        savings: account.savingsBalance,
        current: account.currentBalance,
      },
      transactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        merchant: t.counterparty || t.description,
        ts: t.createdAt,
        category: t.category,
        referenceId: t.referenceId,
        status: t.status,
        accountType: t.accountType,
      })),
      isOffline: false,
    });
  } catch (err) {
    next(err);
  }
};
