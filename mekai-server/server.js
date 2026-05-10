const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🔧 MekAI server running on port ${PORT}`);
  });
});