// Arquivo: /js/login.js (Versão Final com onclick)

import { loginUser } from './modules/api.js';

// A função é definida para ser chamada pelo HTML
async function handleLoginAttempt(event) {
    // Impede o envio padrão do formulário que causa o recarregamento da página
    event.preventDefault(); 

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    const username = loginForm.username.value;
    const password = loginForm.password.value;
    
    try {
        // Chama a função de login do módulo de API
        await loginUser(username, password);
        
        // Se a chamada acima for bem-sucedida, redireciona para o painel
        window.location.href = '/painel_gestao.html';

    } catch (error) {
        // Se a chamada falhar, exibe a mensagem de erro retornada pela API
        errorMessage.textContent = error.message || 'Erro de conexão. Verifique se o servidor está online.';
        errorMessage.style.display = 'block';
    }
}

// Anexa a função à janela global (window) para que o "onclick" no HTML possa encontrá-la.
window.handleLoginAttempt = handleLoginAttempt;