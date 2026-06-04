const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️  Server will run without database (diagnostics will not be saved)');
    // Ne pas arrêter le serveur, juste loguer l'erreur
  }
};

module.exports = connectDB;