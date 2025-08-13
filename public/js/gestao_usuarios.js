// public/js/gestao_usuarios.js (Modularizado)

import { checkAuth } from './modules/auth.js';
import * as api from './modules/api.js';

// Garante que o usuário está logado E tem permissão de 'superadmin'
checkAuth('superadmin');

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const tableContainer = document.getElementById('users-table-container');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    const modalTitle = document.getElementById('modal-title');
    const passwordModal = document.getElementById('password-modal');
    const passwordForm = document.getElementById('password-form');
    const passwordModalUsername = document.getElementById('password-modal-username');
    const passwordModalUserId = document.getElementById('password-modal-userid');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');

    async function refreshTable() {
        try {
            const users = await api.getUsers();
            renderUsersTable(users);
        } catch (error) {
            console.error('Erro:', error);
            tableContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    };

    function renderUsersTable(users) {
        if (!users || users.length === 0) {
            tableContainer.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            return;
        }
        let tableHTML = `<table class="history-table"><thead><tr><th>ID</th><th>Nome de Usuário</th><th>Permissão</th><th>Ações</th></tr></thead><tbody>`;
        users.forEach(user => {
            tableHTML += `<tr><td>${user.id_usuario}</td><td>${user.nome_usuario}</td><td>${user.permissao}</td><td class="actions-cell"><button class="button edit-password-btn" data-id="${user.id_usuario}" data-name="${user.nome_usuario}">Alterar Senha</button><button class="button delete-btn" data-id="${user.id_usuario}">Excluir</button></td></tr>`;
        });
        tableHTML += `</tbody></table>`;
        tableContainer.innerHTML = tableHTML;
    };

    const openUserModal = () => { userForm.reset(); modalTitle.textContent = 'Adicionar Novo Usuário'; userModal.style.display = 'flex'; };
    const closeUserModal = () => userModal.style.display = 'none';
    const openPasswordModal = (userId, userName) => { passwordForm.reset(); passwordModalUserId.value = userId; passwordModalUsername.textContent = userName; passwordModal.style.display = 'flex'; };
    const closePasswordModal = () => passwordModal.style.display = 'none';
    
    tableContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este usuário?')) {
                const userId = target.dataset.id;
                api.deleteUser(userId)
                    .then(() => {
                        alert('Usuário excluído com sucesso!');
                        refreshTable();
                    })
                    .catch(error => alert(`Erro: ${error.message}`));
            }
        }
        if (target.classList.contains('edit-password-btn')) {
            const userId = target.dataset.id;
            const userName = target.dataset.name;
            openPasswordModal(userId, userName);
        }
    });

    addUserBtn.addEventListener('click', openUserModal);
    cancelUserBtn.addEventListener('click', closeUserModal);
    cancelPasswordBtn.addEventListener('click', closePasswordModal);

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        const data = Object.fromEntries(formData.entries());
        try {
            await api.createUser(data);
            alert('Usuário criado com sucesso!');
            closeUserModal();
            refreshTable();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = passwordModalUserId.value;
        const password = document.getElementById('password-modal-new-password').value;
        try {
            await api.updateUserPassword(userId, password);
            alert('Senha atualizada com sucesso!');
            closePasswordModal();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });
    
    refreshTable();
});