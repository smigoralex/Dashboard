// Arquivo: /js/painel_gestao.js (Modularizado)

import { checkAuth } from './modules/auth.js';
import { logoutUser } from './modules/api.js';

// 1. Garante que o usuário está logado para ver a página
checkAuth();

// 2. Adiciona os eventos da página
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Erro ao tentar fazer logout:', error);
                alert('Falha ao fazer logout.');
            }
        });
    }
});