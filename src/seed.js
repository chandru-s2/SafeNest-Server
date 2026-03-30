require('dotenv').config();
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Complaint = require('./models/Complaint');
const Alert = require('./models/Alert');

const now = new Date();
const daysAgo = (d) => new Date(now - d * 86400000);

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('🗄️  Database reset');

    // ── Demo User ────────────────────────────────────────────────────────────
    const user = await User.create({
      phone: '9999999999',
      email: 'demo@safenest.in',
      name: 'Rahul Sharma',
      accountNumber: '50201234567890',
    });
    console.log(`👤  User created: ${user.phone}`);

    // ── Account ───────────────────────────────────────────────────────────────
    await Account.create({ userId: user.id, savingsBalance: 125000.50, currentBalance: 45000.00 });
    console.log('💰  Account created');

    // ── Transactions ──────────────────────────────────────────────────────────
    const transactions = [
      { type: 'credit', amount: 50000, description: 'Salary - Virtusa India Pvt Ltd', category: 'Transfer', counterparty: 'Virtusa Payroll', referenceId: 'TXN001', createdAt: daysAgo(2) },
      { type: 'debit',  amount: 1200,  description: 'Swiggy Order #88241',            category: 'Food',     counterparty: 'Swiggy',          referenceId: 'TXN002', createdAt: daysAgo(1) },
      { type: 'debit',  amount: 3499,  description: 'Amazon Prime Renewal',            category: 'Shopping', counterparty: 'Amazon',          referenceId: 'TXN003', createdAt: daysAgo(1) },
      { type: 'debit',  amount: 850,   description: 'Reliance Jio Recharge',           category: 'Bills',    counterparty: 'Jio',             referenceId: 'TXN004', createdAt: daysAgo(3) },
      { type: 'credit', amount: 5000,  description: 'UPI Received from Priya',        category: 'Transfer', counterparty: 'Priya Mehta',      referenceId: 'TXN005', createdAt: daysAgo(4) },
      { type: 'debit',  amount: 12000, description: 'HDFC Credit Card Bill',           category: 'Bills',    counterparty: 'HDFC Bank',        referenceId: 'TXN006', createdAt: daysAgo(5) },
      { type: 'debit',  amount: 500,   description: 'ATM Withdrawal - Andheri',        category: 'ATM',      counterparty: 'SBI ATM',          referenceId: 'TXN007', createdAt: daysAgo(6) },
      { type: 'debit',  amount: 2300,  description: 'Apollo Pharmacy',                 category: 'Medical',  counterparty: 'Apollo Pharmacy',  referenceId: 'TXN008', createdAt: daysAgo(7) },
      { type: 'credit', amount: 2000,  description: 'Google Pay Transfer',             category: 'Transfer', counterparty: 'Amit Kumar',       referenceId: 'TXN009', createdAt: daysAgo(8) },
      { type: 'debit',  amount: 8500,  description: 'BookMyShow - Concert Tickets',    category: 'Entertainment', counterparty: 'BookMyShow', referenceId: 'TXN010', createdAt: daysAgo(9) },
      { type: 'debit',  amount: 18000, description: 'IndiGo Flight Booking',           category: 'Travel',   counterparty: 'IndiGo Airlines',  referenceId: 'TXN011', createdAt: daysAgo(10) },
      { type: 'credit', amount: 1500,  description: 'Cashback - HDFC Rewards',        category: 'Other',    counterparty: 'HDFC Rewards',     referenceId: 'TXN012', createdAt: daysAgo(12) },
    ];

    for (const t of transactions) {
      await Transaction.create({ userId: user.id, status: 'completed', accountType: 'savings', ...t });
    }
    console.log(`📊  ${transactions.length} transactions created`);

    // ── Complaints ────────────────────────────────────────────────────────────
    await Complaint.create({
      userId: user.id,
      complaintId: 'SNT-2026-MUM-788234',
      category: 'Transaction',
      description: 'Duplicate debit of ₹3,499 on Amazon Prime from my savings account.',
      referenceId: 'TXN003',
      status: 'InProgress',
      escalationTier: 2,
      createdAt: daysAgo(3),
    });
    await Complaint.create({
      userId: user.id,
      complaintId: 'SNT-2026-MUM-521901',
      category: 'Service',
      description: 'Unable to update email address in the app profile section.',
      status: 'Open',
      escalationTier: 1,
      createdAt: daysAgo(1),
    });
    console.log('📝  2 complaints created');

    // ── Alerts ────────────────────────────────────────────────────────────────
    const alertData = [
      { type: 'Fraud',    severity: 'high',   read: false, message: 'Unusual login attempt detected from a new device in Delhi. Please verify.', ts: '2h ago' },
      { type: 'Spending', severity: 'medium', read: false, message: 'You have spent ₹8,500 on Entertainment this month — 42% above your average.', ts: '5h ago' },
      { type: 'Tips',     severity: 'low',    read: true,  message: 'Tip: Enable biometric authentication for faster and safer login.', ts: '1d ago' },
      { type: 'Fraud',    severity: 'medium', read: true,  message: 'Your card was used in a contactless transaction at BigBazaar, Mumbai.', ts: '2d ago' },
      { type: 'Spending', severity: 'low',    read: true,  message: 'Monthly spending summary: ₹47,549 spent in March 2026.', ts: '3d ago' },
    ];

    for (const a of alertData) {
      await Alert.create({ userId: user.id, ...a });
    }
    console.log('🔔  5 alerts created');

    console.log('\n✅  Seed complete!');
    console.log('📱  Login with phone: 9999999999 | OTP: 123456');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  }
}

seed();
