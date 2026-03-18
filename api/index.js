require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('../backend/config/db');

const app = express();

let isConnected = false;
const connectOnce = async () => {
  if (!isConnected) { await connectDB(); isConnected = true; }
};

app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => { await connectOnce(); next(); });

app.use('/api/students',  require('../backend/routes/students'));
app.use('/api/questions', require('../backend/routes/questions'));

module.exports = app;
