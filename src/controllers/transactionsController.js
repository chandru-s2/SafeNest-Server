const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// GET /v1/transactions
exports.listTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    const type = req.query.type;

    const filter = { userId: req.user.userId };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const [total, rows] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    res.json({
      total,
      limit,
      offset: skip,
      transactions: rows.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        counterparty: t.counterparty,
        referenceId: t.referenceId,
        status: t.status,
        accountType: t.accountType,
        timestamp: t.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/transactions/recent
exports.getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        merchant: t.counterparty || t.description,
        ts: t.createdAt,
        category: t.category,
        referenceId: t.referenceId,
        status: t.status,
        accountType: t.accountType,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

// POST /v1/transactions/send
exports.sendMoney = async (req, res, next) => {
  try {
    const { amount, counterparty, description, accountType = 'savings', referenceId } = req.body;
    if (!amount || !counterparty) return res.status(400).json({ error: 'amount and counterparty are required' });

    const account = await Account.findOne({ userId: req.user.userId });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const balance = accountType === 'savings' ? account.savingsBalance : account.currentBalance;
    if (balance < amount) return res.status(400).json({ error: 'Insufficient funds' });

    if (accountType === 'savings') {
      account.savingsBalance = account.savingsBalance - parseFloat(amount);
    } else {
      account.currentBalance = account.currentBalance - parseFloat(amount);
    }
    await account.save();

    const txn = await Transaction.create({
      userId: req.user.userId,
      type: 'debit',
      amount: parseFloat(amount),
      description: description || `Transfer to ${counterparty}`,
      category: 'Transfer',
      counterparty,
      referenceId: referenceId || `TXN${Date.now()}`,
      status: 'completed',
      accountType,
    });

    res.status(201).json({
      success: true,
      transaction: {
        id: txn._id,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        category: txn.category,
        counterparty: txn.counterparty,
        referenceId: txn.referenceId,
        status: txn.status,
        timestamp: txn.createdAt,
      },
      newBalance: {
        savings: account.savingsBalance,
        current: account.currentBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};
