require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const diagnoseRouter = require('./routes/diagnose');
const historyRouter  = require('./routes/history');
const authRouter     = require('./routes/auth');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth',    authRouter);
app.use('/api/diagnose', diagnoseRouter);
app.use('/api/history',  historyRouter);
app.use('/api/diagnose', require('./routes/rating'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;