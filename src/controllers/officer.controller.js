const db = require('../config/db');

async function lookupByVehicle(req, res) {
	const { vehicle_number } = req.query;
	if (!vehicle_number) return res.status(400).json({ message: 'vehicle_number required' });
	const [rows] = await db.query(
		`SELECT v.id as vehicle_id, v.vehicle_number, v.model, d.id as driver_id, d.name, d.license_number, d.phone 
     FROM Vehicles v JOIN Drivers d ON v.driver_id = d.id WHERE v.vehicle_number = ?`, [vehicle_number]);
	if (!rows.length) return res.status(404).json({ message: 'Not found' });
	return res.json(rows[0]);
}

async function addViolation(req, res) {
	const { vehicle_id, driver_id, type_id, date, location, notes } = req.body || {};
	if (!vehicle_id || !driver_id || !type_id || !date) return res.status(400).json({ message: 'missing fields' });
	const officer_id = req.user.id;
	const conn = await db.getConnection();
	try {
		await conn.beginTransaction();
		const [types] = await conn.query('SELECT fine_amount FROM ViolationTypes WHERE id=?', [type_id]);
		if (!types.length) throw new Error('Invalid type_id');
		const amount = types[0].fine_amount;

		const [insV] = await conn.query(
			'INSERT INTO Violations(driver_id, vehicle_id, type_id, date, location, notes, officer_id, status) VALUES (?,?,?,?,?,?,?,?)',
			[driver_id, vehicle_id, type_id, date, location || '', notes || '', officer_id, 'Pending']
		);
		const violation_id = insV.insertId;

		await conn.query(
			'INSERT INTO Fines(violation_id, amount, status, due_date) VALUES (?,?,?, DATE_ADD(CURDATE(), INTERVAL 15 DAY))',
			[violation_id, amount, 'Pending']
		);

		await conn.commit();
		return res.status(201).json({ violation_id, amount, status: 'Pending' });
	} catch (e) {
		await conn.rollback();
		return res.status(500).json({ message: 'Failed to create violation', error: e.message });
	} finally {
		conn.release();
	}
}

async function listViolations(req, res) {
	const [rows] = await db.query(
		`SELECT v.id, v.date, v.location, v.status, d.name as driver_name, ve.vehicle_number, t.name as type, f.amount, f.status as fine_status
		 FROM Violations v
		 JOIN Drivers d ON v.driver_id = d.id
		 JOIN Vehicles ve ON v.vehicle_id = ve.id
		 JOIN ViolationTypes t ON v.type_id = t.id
		 JOIN Fines f ON f.violation_id = v.id
		 ORDER BY v.id DESC`);
	return res.json(rows);
}

module.exports = { lookupByVehicle, addViolation, listViolations };