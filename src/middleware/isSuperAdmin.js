// Arquivo: src/middleware/isSuperAdmin.js

function isSuperAdmin(req, res, next) {
    if (req.session.userId && req.session.permission === 'superadmin') {
        return next();
    }
    res.status(403).json({ error: 'Acesso negado. Requer permissão de Superadministrador.' });
};

module.exports = isSuperAdmin;