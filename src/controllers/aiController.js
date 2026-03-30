const axios = require('axios');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const Alert = require('../models/Alert');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Helper: Tool handlers
const toolHandlers = {
  get_account_summary: async (userId) => {
    const account = await Account.findOne({ userId });
    return account
      ? { savingsBalance: account.savingsBalance, currentBalance: account.currentBalance, currency: 'INR' }
      : { error: 'Account not found' };
  },

  get_recent_transactions: async (userId, args) => {
    const limit = args.limit || 5;
    const txns = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    return txns;
  },

  initiate_complaint: async (userId, args) => {
    const year = new Date().getFullYear();
    const num = Math.floor(100000 + Math.random() * 900000);
    const complaintId = `SNT-${year}-MUM-${num}`;
    const complaint = await Complaint.create({
      userId,
      complaintId,
      category: args.category || 'Other',
      description: args.description || 'AI generated complaint',
      status: 'Open',
    });
    return { success: true, complaintId: complaint.complaintId };
  },

  check_spending_summary: async (userId) => {
    const txns = await Transaction.find({ userId, type: 'debit' });
    const total = txns.reduce((sum, t) => sum + t.amount, 0);
    return { totalMonthlySpending: total, currency: 'INR' };
  },

  flag_suspicious_activity: async (userId, args) => {
    await Alert.create({
      userId,
      type: 'Fraud',
      severity: 'high',
      message: `AI Flagged: ${args.reason || 'Suspicious patterns detected'}`,
      read: false,
      ts: 'Just now',
    });
    return { success: true, message: 'Escalated to security team' };
  },
};

exports.chat = async (req, res, next) => {
  try {
    const { messages, currentScreen } = req.body;
    const userId = req.user.userId;

    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      return res.status(500).json({ error: 'AI Service not configured' });
    }

    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        system: `You are SafeNest's Customer Advisor, an intelligent banking assistant.
        User is currently on the ${currentScreen || 'Home'} screen.
        Rules:
        - Respond in friendly English under 3 sentences.
        - For account data, transactions, or complaints: use the provided tools first.
        - Be warm and reassuring.`,
        messages,
        tools: [
          { name: 'get_account_summary', description: 'Get user account balance and summary' },
          { name: 'get_recent_transactions', description: 'Get last N transactions', input_schema: { type: 'object', properties: { limit: { type: 'integer' } } } },
          { name: 'initiate_complaint',    description: 'File a complaint', input_schema: { type: 'object', properties: { category: { type: 'string' }, description: { type: 'string' } } } },
          { name: 'check_spending_summary', description: 'Get monthly spending breakdown' },
          { name: 'flag_suspicious_activity', description: 'Escalate fraud concern', input_schema: { type: 'object', properties: { reason: { type: 'string' } } } },
        ],
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    let finalResponse = anthropicResponse.data;

    // Handle single tool call
    if (finalResponse.stop_reason === 'tool_use') {
      const toolUse = finalResponse.content.find((c) => c.type === 'tool_use');
      if (toolUse) {
        const result = await toolHandlers[toolUse.name](userId, toolUse.input);

        const followUp = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 500,
            system: `You are SafeNest's Advisor. Friendly, short responses.`,
            messages: [
              ...messages,
              { role: 'assistant', content: finalResponse.content },
              { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) }] },
            ],
          },
          {
            headers: {
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          }
        );
        finalResponse = followUp.data;
      }
    }

    res.json(finalResponse);
  } catch (err) {
    console.error('AI Controller Error:', err.response?.data || err.message);
    next(err);
  }
};
