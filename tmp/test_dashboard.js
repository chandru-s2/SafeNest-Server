require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Account = require('../src/models/Account');
const Transaction = require('../src/models/Transaction');
const dashboardController = require('../src/controllers/dashboardController');

async function test() {
  try {
    const user = await User.findOne({ where: { phone: '9999999999' } });
    if (!user) {
      console.log('User not found. Please run seed.js first.');
      process.exit(1);
    }

    // Mock req, res, next
    const req = { user: { userId: user.id } };
    const res = {
      json: (data) => {
        console.log('Dashboard Data:');
        console.log(JSON.stringify(data, null, 2));
        if (data.transactions && data.transactions.length > 0) {
          const t = data.transactions[0];
          if (t.merchant && t.ts) {
            console.log('\n✅  Verification Success: "merchant" and "ts" fields are present.');
          } else {
            console.log('\n❌  Verification Failed: "merchant" or "ts" fields are missing.');
          }
        }
      }
    };
    const next = (err) => console.error(err);

    await dashboardController.getDashboard(req, res, next);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
