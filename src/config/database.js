const mongoose = require('mongoose');
const dns = require('dns');

// Force Google public DNS to help with SRV record lookups
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safenest';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄  MongoDB connecting... (attempt ${attempt}/${retries})`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,  // 30s to find a server
        connectTimeoutMS: 30000,           // 30s for initial TCP connect
        socketTimeoutMS: 60000,            // 60s for socket inactivity
        tls: true,                         // explicitly enable TLS for Atlas
        tlsAllowInvalidCertificates: false,
      });
      console.log(`✅  MongoDB connected → ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌  MongoDB connection failed (attempt ${attempt}):`, err.message);
      if (attempt < retries) {
        const delay = attempt * 3000; // 3s, 6s backoff
        console.log(`⏳  Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
};

module.exports = { connectDB, mongoose };
