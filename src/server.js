const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/public', require('./routes/public.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/officer', require('./routes/officer.routes'));
app.use('/api/driver', require('./routes/driver.routes'));

app.get('/api/health/db', async (req, res) => {
	try { await db.query('SELECT 1'); res.json({ db: 'up' }); }
	catch (e) { res.status(500).json({ db: 'down', error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend on ${PORT}`));