const jwt = require('jsonwebtoken');

function auth(required = true) {
	return (req, res, next) => {
		const token = req.headers['authorization'];
		if (!token) return required ? res.status(401).json({ message: 'No token' }) : next();
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			req.user = payload; // { id, role, name }
			next();
		} catch {
			return res.status(403).json({ message: 'Invalid token' });
		}
	};
}

function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}

module.exports = { auth, requireRole };