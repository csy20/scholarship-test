require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./backend/config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/students',  require('./backend/routes/students'));
app.use('/api/questions', require('./backend/routes/questions'));

app.get('/test',   (req, res) => res.sendFile(path.join(__dirname, 'public/test.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));
app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
