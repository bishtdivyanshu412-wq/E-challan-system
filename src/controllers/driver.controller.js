const db = require('../config/db');

async function myVehicles(req, res) {
	const driver_id = req.user.id;
	const [rows] = await db.query('SELECT * FROM Vehicles WHERE driver_id=?', [driver_id]);
	return res.json(rows);
}

async function myViolations(req, res) {
	const driver_id = req.user.id;
	const [rows] = await db.query(
		`SELECT v.id, v.date, v.location, v.status, t.name as type, f.id as fine_id, f.amount, f.status as fine_status
     FROM Violations v
     JOIN ViolationTypes t ON v.type_id = t.id
     JOIN Fines f ON f.violation_id = v.id
     WHERE v.driver_id=? ORDER BY v.id DESC`, [driver_id]);
	return res.json(rows);
}

async function myPayments(req, res) {
	const driver_id = req.user.id;
	const [rows] = await db.query(
		`SELECT p.id, p.amount, p.date, p.method, f.id as fine_id
     FROM Payments p JOIN Fines f ON p.fine_id=f.id
     JOIN Violations v ON f.violation_id=v.id
     WHERE v.driver_id=? ORDER BY p.id DESC`, [driver_id]);
	return res.json(rows);
}

async function payFine(req, res) {
	const driver_id = req.user.id;
	const { fine_id, method } = req.body || {};
	if (!fine_id) return res.status(400).json({ message: 'fine_id required' });
	const conn = await db.getConnection();
	try {
		await conn.beginTransaction();
		const [fineRows] = await conn.query(
			`SELECT f.id, f.amount, f.status, v.driver_id FROM Fines f 
       JOIN Violations v ON f.violation_id=v.id WHERE f.id=?`, [fine_id]);
		if (!fineRows.length) throw new Error('Fine not found');
		const fine = fineRows[0];
		if (fine.driver_id !== driver_id) throw new Error('Not your fine');
		if (fine.status === 'Paid') throw new Error('Already paid');

		await conn.query('INSERT INTO Payments(fine_id, amount, method) VALUES (?,?,?)', [fine_id, fine.amount, method || 'Online']);
		await conn.query('UPDATE Fines SET status="Paid" WHERE id=?', [fine_id]);
		await conn.query('UPDATE Violations v JOIN Fines f ON f.violation_id=v.id SET v.status="Paid" WHERE f.id=?', [fine_id]);

		await conn.commit();
		return res.status(201).json({ message: 'Payment successful' });
	} catch (e) {
		await conn.rollback();
		return res.status(400).json({ message: e.message });
	} finally {
		conn.release();
	}
}

module.exports = { myVehicles, myViolations, myPayments, payFine };