// Arquivo: src/middleware/isAuthenticated.js

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    // Para requisições de página, redireciona. Para API, retorna erro.
    if (req.headers.accept && req.headers.accept.includes('html')) {
        return res.redirect('/login.html');
    }
    res.status(401).json({ error: 'Acesso não autorizado.' });
};

module.exports = isAuthenticated;