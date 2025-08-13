// Arquivo: /js/modules/auth.js
// Centraliza a lógica de verificação de autenticação para as páginas de gestão.

import { CONFIG } from './config.js';

/**
 * Verifica se o usuário está logado. Se não estiver, redireciona para a página de login.
 * @param {string} requiredPermission - Opcional. A permissão necessária ('superadmin', etc.). Se não for atendida, redireciona para o painel.
 */
export async function checkAuth(requiredPermission = null) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/check-auth`);
        const data = await response.json();
        
        if (!data.loggedIn) {
            window.location.href = '/login.html';
            return; // Interrompe a execução
        }

        if (requiredPermission && data.permission !== requiredPermission) {
            alert(`Acesso negado. Requer permissão de '${requiredPermission}'.`);
            window.location.href = '/painel_gestao.html';
        }

    } catch (error) {
        console.error('Erro ao verificar autenticação, redirecionando para login.');
        window.location.href = '/login.html';
    }
}