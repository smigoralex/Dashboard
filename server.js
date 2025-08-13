// Arquivo: server.js (VERSÃO FINAL COM CORREÇÃO DE CORS E MIME TYPE)

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

// --- SETUP INICIAL ---
const app = express();
const PORT = 3000;

// --- IMPORTAÇÃO DOS MÓDULOS ---
const pageRoutes = require('./src/routes/pageRoutes.js');
const authRoutes = require('./src/routes/authRoutes.js');
const userRoutes = require('./src/routes/userRoutes.js');
const apiRoutes = require('./src/routes/apiRoutes.js');

// --- MIDDLEWARES GLOBAIS ---
// Configuração do CORS para aceitar credenciais (cookies) da nossa origem
app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));

app.use(express.json());
app.use(session({
    store: new FileStore({ path: './sessions', logFn: function(){} }),
    secret: 'um segredo muito seguro para o projeto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

// --- REGISTRO DAS ROTAS ---
app.use('/', pageRoutes);
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/usuarios', userRoutes);

// --- SERVIR ARQUIVOS ESTÁTICOS (Públicos) ---
// Adicionamos a opção 'setHeaders' para garantir o MIME type correto para JS
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: function (res, filePath) {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log('Servidor completamente modularizado e rodando!');
    console.log(`Acesse http://localhost:${PORT} no seu navegador.`);
    console.log('----------------------------------------------------');
});