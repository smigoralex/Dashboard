// gestao_alunos.js - VERSÃO MODERNIZADA COMPLETA
// Sistema avançado de gestão de alunos com todas as funcionalidades

import { checkAuth } from './modules/auth.js';
import * as api from './modules/api.js';

checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    // === ELEMENTOS DO DOM ===
    const elements = {
        tableContainer: document.getElementById('alunos-table-container'),
        searchInput: document.getElementById('search-aluno-input'),
        addBtn: document.getElementById('add-student-btn'),
        modal: document.getElementById('student-modal'),
        form: document.getElementById('student-form'),
        cancelBtn: document.getElementById('cancel-btn'),
        modalTitle: document.getElementById('modal-title'),
        
        // Campos do formulário
        nomeInput: document.getElementById('modal-nome_aluno'),
        inepInput: document.getElementById('modal-inep_aluno'),
        dataInput: document.getElementById('modal-data_nascimento'),
        maeInput: document.getElementById('modal-nome_mae'),
        corRacaSelect: document.getElementById('modal-cor_raca'),
        beneficiarioSelect: document.getElementById('modal-beneficiario_social'),
        pcdSelect: document.getElementById('modal-pcd'),
        pcdDetailsGroup: document.getElementById('modal-pcd-details-group'),
        pcdDetailsSelect: document.getElementById('modal-pcd_details'),
        transporteSelect: document.getElementById('modal-transporte_escolar'),
        
        // Modal de exclusão
        deleteModal: document.getElementById('delete-confirmation-modal'),
        deleteNameSpan: document.getElementById('student-name-to-delete'),
        deleteInput: document.getElementById('delete-confirmation-input'),
        cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
        confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
        
        // Modal de detalhes
        detailsModal: document.getElementById('student-details-modal'),
        detailsTitle: document.getElementById('details-modal-title'),
        detailsContent: document.getElementById('student-details-content'),
        editFromDetailsBtn: document.getElementById('edit-from-details-btn')
    };

    // === VARIÁVEIS DE ESTADO ===
    let allAlunosCache = [];
    let filteredAlunos = [];
    let currentEditingId = null;
    let studentToDelete = null;
    let searchTimeout;

    // === FUNÇÕES PRINCIPAIS ===

    async function refreshTable(searchTerm = '') {
        try {
            showLoading();
            const alunos = await api.searchAlunos(searchTerm);
            allAlunosCache = alunos;
            filteredAlunos = [...alunos];
            
            if (searchTerm === '') {
                createDynamicFilters();
                addQuickStats();
                updateQuickStats();
            }
            
            renderFilteredTable();
            updateResultsCounter();
        } catch (error) {
            console.error('Erro:', error);
            elements.tableContainer.innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
        } finally {
            hideLoading();
        }
    }

    function showLoading() {
        elements.tableContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                <p>Carregando alunos...</p>
            </div>
        `;
    }

    function hideLoading() {
        // Loading será removido quando a tabela for renderizada
    }

    function renderFilteredTable() {
        renderAlunosTable(filteredAlunos);
    }

    function renderAlunosTable(alunos) {
        if (!alunos || alunos.length === 0) {
            elements.tableContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                    <h3>Nenhum aluno encontrado</h3>
                    <p>Cadastre o primeiro aluno ou ajuste os filtros de busca.</p>
                </div>
            `;
            return;
        }
        
        let tableHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome do Aluno</th>
                        <th>INEP</th>
                        <th>Data Nasc.</th>
                        <th>Informações</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        alunos.forEach(aluno => {
            const dataNasc = aluno.data_nascimento ? formatarData(aluno.data_nascimento) : 'N/A';
            const pcdStatus = aluno.pcd === 'SIM' ? '♿' : '';
            const beneficiarioStatus = aluno.beneficiario_social === 'SIM' ? '🎫' : '';
            const transporteStatus = aluno.transporte_escolar === 'SIM' ? '🚌' : '';
            
            tableHTML += `
                <tr>
                    <td>${aluno.id_aluno}</td>
                    <td style="font-weight: 600; color: var(--primary-600);">
                        <a href="#" class="student-link" data-id="${aluno.id_aluno}" title="Ver detalhes completos">
                            ${aluno.nome_aluno}
                        </a>
                    </td>
                    <td>
                        <code style="background: var(--bg-tertiary); padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.8rem;">
                            ${aluno.inep_aluno || 'N/A'}
                        </code>
                    </td>
                    <td>${dataNasc}</td>
                    <td style="text-align: center; font-size: 1.1rem;">
                        <span title="Pessoa com Deficiência">${pcdStatus}</span>
                        <span title="Beneficiário Social">${beneficiarioStatus}</span>
                        <span title="Transporte Escolar">${transporteStatus}</span>
                    </td>
                    <td class="actions-cell">
                        <button class="button" data-id="${aluno.id_aluno}" onclick="showStudentDetails(${aluno.id_aluno})" 
                                style="background: var(--info); color: white; font-size: 0.8rem;" title="Ver detalhes completos">
                            👁️ Detalhes
                        </button>
                        <button class="button edit-btn" data-id="${aluno.id_aluno}" title="Editar este aluno">
                            ✏️ Editar
                        </button>
                        <button class="button delete-btn" data-id="${aluno.id_aluno}" data-name="${aluno.nome_aluno}" 
                                title="Excluir este aluno">
                            🗑️ Excluir
                        </button>
                    </td>
                </tr>`;
        });
        
        tableHTML += `</tbody></table>`;
        elements.tableContainer.innerHTML = tableHTML;
    }

    // === FUNCIONALIDADES AVANÇADAS ===

    async function showStudentDetails(alunoId) {
        try {
            const aluno = allAlunosCache.find(a => a.id_aluno === alunoId);
            if (!aluno) {
                alert('❌ Aluno não encontrado!');
                return;
            }

            const detailsHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="info-card">
                        <h4 style="color: var(--primary-600); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            👤 Dados Pessoais
                        </h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nome Completo:</span>
                                <span class="info-value">${aluno.nome_aluno}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">INEP:</span>
                                <span class="info-value">
                                    <code style="background: var(--bg-tertiary); padding: 0.2rem 0.4rem; border-radius: 3px;">
                                        ${aluno.inep_aluno || 'Não informado'}
                                    </code>
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Data de Nascimento:</span>
                                <span class="info-value">${aluno.data_nascimento ? formatarData(aluno.data_nascimento) : 'Não informada'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nome da Mãe:</span>
                                <span class="info-value">${aluno.nome_mae || 'Não informado'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Cor/Raça:</span>
                                <span class="info-value">${aluno.cor_raca || 'Não declarada'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h4 style="color: var(--success); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🏫 Informações Escolares
                        </h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Beneficiário Social:</span>
                                <span class="info-value">
                                    ${aluno.beneficiario_social === 'SIM' ? 
                                        '<span style="color: var(--success); font-weight: 600;">✅ Sim</span>' : 
                                        '<span style="color: var(--text-secondary);">❌ Não</span>'
                                    }
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Transporte Escolar:</span>
                                <span class="info-value">
                                    ${aluno.transporte_escolar === 'SIM' ? 
                                        '<span style="color: var(--success); font-weight: 600;">🚌 Sim</span>' : 
                                        '<span style="color: var(--text-secondary);">❌ Não</span>'
                                    }
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Aluno PCD:</span>
                                <span class="info-value">
                                    ${aluno.pcd === 'SIM' ? 
                                        `<span style="color: var(--warning); font-weight: 600;">♿ Sim</span>
                                         ${aluno.pcd !== 'SIM' ? '' : `<br><small style="color: var(--text-secondary);">Tipo: ${aluno.pcd}</small>`}` : 
                                        '<span style="color: var(--text-secondary);">❌ Não</span>'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 6px;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); text-align: center;">
                        💡 <strong>ID do Aluno:</strong> ${aluno.id_aluno} • 
                        <strong>Cadastrado em:</strong> Sistema de Gestão Educacional
                    </p>
                </div>
            `;

            elements.detailsTitle.innerHTML = `👤 ${aluno.nome_aluno}`;
            elements.detailsContent.innerHTML = detailsHTML;
            elements.editFromDetailsBtn.onclick = () => {
                elements.detailsModal.style.display = 'none';
                openModal(aluno);
            };
            
            elements.detailsModal.style.display = 'flex';
            
        } catch (error) {
            alert(`❌ Erro ao buscar detalhes: ${error.message}`);
        }
    }

    // === FILTROS E BUSCA ===

    function applyFilters() {
        const searchTerm = elements.searchInput?.value.toLowerCase() || '';
        const corRacaFilter = document.getElementById('filter-cor-raca')?.value || '';
        const beneficiarioFilter = document.getElementById('filter-beneficiario')?.value || '';
        const pcdFilter = document.getElementById('filter-pcd')?.value || '';
        const transporteFilter = document.getElementById('filter-transporte')?.value || '';

        filteredAlunos = allAlunosCache.filter(aluno => {
            const matchesSearch = !searchTerm || 
                aluno.nome_aluno.toLowerCase().includes(searchTerm) ||
                (aluno.inep_aluno && aluno.inep_aluno.includes(searchTerm)) ||
                (aluno.nome_mae && aluno.nome_mae.toLowerCase().includes(searchTerm));
            
            const matchesCorRaca = !corRacaFilter || aluno.cor_raca === corRacaFilter;
            const matchesBeneficiario = !beneficiarioFilter || aluno.beneficiario_social === beneficiarioFilter;
            const matchesPcd = !pcdFilter || aluno.pcd === pcdFilter;
            const matchesTransporte = !transporteFilter || aluno.transporte_escolar === transporteFilter;

            return matchesSearch && matchesCorRaca && matchesBeneficiario && matchesPcd && matchesTransporte;
        });

        renderFilteredTable();
        updateResultsCounter();
    }

    function createDynamicFilters() {
        const coresRaca = [...new Set(allAlunosCache.map(a => a.cor_raca).filter(Boolean))].sort();
        
        if (!document.getElementById('filters-container')) {
            const filtersHTML = `
                <div id="filters-container" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-primary);">
                    <div class="filter-group">
                        <label for="filter-cor-raca" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">🎨 Cor/Raça:</label>
                        <select id="filter-cor-raca" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-beneficiario" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">🎫 Beneficiário:</label>
                        <select id="filter-beneficiario" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todos</option>
                            <option value="SIM">Sim</option>
                            <option value="NÃO">Não</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-pcd" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">♿ PCD:</label>
                        <select id="filter-pcd" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todos</option>
                            <option value="SIM">Sim</option>
                            <option value="NÃO">Não</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-transporte" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">🚌 Transporte:</label>
                        <select id="filter-transporte" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todos</option>
                            <option value="SIM">Sim</option>
                            <option value="NÃO">Não</option>
                        </select>
                    </div>
                    <button id="clear-filters" style="padding: 0.5rem 1rem; background: var(--error); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
                        🗑️ Limpar
                    </button>
                </div>
            `;
            
            elements.tableContainer.insertAdjacentHTML('beforebegin', filtersHTML);
        }

        const corRacaSelect = document.getElementById('filter-cor-raca');
        corRacaSelect.innerHTML = '<option value="">Todas</option>';
        coresRaca.forEach(cor => {
            const option = document.createElement('option');
            option.value = cor;
            option.textContent = cor;
            corRacaSelect.appendChild(option);
        });

        // Event listeners para filtros
        document.getElementById('filter-cor-raca')?.addEventListener('change', applyFilters);
        document.getElementById('filter-beneficiario')?.addEventListener('change', applyFilters);
        document.getElementById('filter-pcd')?.addEventListener('change', applyFilters);
        document.getElementById('filter-transporte')?.addEventListener('change', applyFilters);
        document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);
    }

    function clearAllFilters() {
        if (elements.searchInput) elements.searchInput.value = '';
        document.getElementById('filter-cor-raca').value = '';
        document.getElementById('filter-beneficiario').value = '';
        document.getElementById('filter-pcd').value = '';
        document.getElementById('filter-transporte').value = '';
        
        filteredAlunos = [...allAlunosCache];
        renderFilteredTable();
        updateResultsCounter();
    }

    function updateResultsCounter() {
        const total = allAlunosCache.length;
        const filtered = filteredAlunos.length;
        
        let counterElement = document.getElementById('results-counter');
        if (!counterElement) {
            counterElement = document.createElement('div');
            counterElement.id = 'results-counter';
            counterElement.style.cssText = `
                background: var(--bg-tertiary);
                padding: 0.5rem 1rem;
                border-radius: 6px;
                border: 1px solid var(--border-primary);
                font-weight: 500;
                text-align: center;
                margin-bottom: 1rem;
                color: var(--text-secondary);
            `;
            
            elements.tableContainer.parentNode.insertBefore(counterElement, elements.tableContainer);
        }
        
        if (total === filtered) {
            counterElement.innerHTML = `👥 <strong>${total}</strong> aluno(s) cadastrado(s)`;
        } else {
            counterElement.innerHTML = `🔍 <strong>${filtered}</strong> de <strong>${total}</strong> aluno(s) • <em>filtros aplicados</em>`;
        }
    }

    function addQuickStats() {
        if (document.getElementById('quick-stats')) return;
        
        const statsHTML = `
            <div id="quick-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: linear-gradient(135deg, var(--primary-500), var(--primary-600)); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="total-alunos">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">👥 Total de Alunos</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--success), #059669); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="beneficiarios-count">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">🎫 Beneficiários Sociais</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--warning), #d97706); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="pcd-count">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">♿ Alunos PCD</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--info), #1d4ed8); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="transporte-count">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">🚌 Transporte Escolar</div>
                </div>
            </div>
        `;
        
        const section = document.querySelector('.management-section');
        section.insertAdjacentHTML('afterbegin', statsHTML);
    }

    function updateQuickStats() {
    if (!allAlunosCache.length) {
        // Se não há alunos, zerar todos os contadores
        document.getElementById('total-alunos').textContent = '0';
        document.getElementById('beneficiarios-count').textContent = '0';
        document.getElementById('pcd-count').textContent = '0';
        document.getElementById('transporte-count').textContent = '0';
        return;
    }
    
    console.log('Atualizando estatísticas...', allAlunosCache.length, 'alunos');
    
    // Debug: verificar os dados dos alunos
    allAlunosCache.forEach((aluno, index) => {
        if (index < 3) { // Mostrar apenas os primeiros 3 para debug
            console.log(`Aluno ${index + 1}:`, {
                nome: aluno.nome_aluno,
                beneficiario: aluno.beneficiario_social,
                pcd: aluno.pcd,
                transporte: aluno.transporte_escolar
            });
        }
    });
    
    const beneficiarios = allAlunosCache.filter(a => 
        a.beneficiario_social === 'SIM' || a.beneficiario_social === 'Sim'
    ).length;
    
    const pcd = allAlunosCache.filter(a => 
        (a.pcd === 'SIM' || a.pcd === 'Sim') || 
        (a.pcd && a.pcd !== 'NÃO' && a.pcd !== 'Não' && a.pcd !== 'NÃƒO')
    ).length;
    
    const transporte = allAlunosCache.filter(a => 
        a.transporte_escolar === 'SIM' || a.transporte_escolar === 'Sim'
    ).length;
    
    console.log('Estatísticas calculadas:', {
        total: allAlunosCache.length,
        beneficiarios,
        pcd,
        transporte
    });
    
    // Atualizar os elementos
    const totalEl = document.getElementById('total-alunos');
    const beneficiariosEl = document.getElementById('beneficiarios-count');
    const pcdEl = document.getElementById('pcd-count');
    const transporteEl = document.getElementById('transporte-count');
    
    if (totalEl) totalEl.textContent = allAlunosCache.length;
    if (beneficiariosEl) beneficiariosEl.textContent = beneficiarios;
    if (pcdEl) pcdEl.textContent = pcd;
    if (transporteEl) transporteEl.textContent = transporte;
    
    console.log('Elementos atualizados!');
}

    // === MODAL DE CRIAR/EDITAR ===

    function openModal(student = null) {
        elements.form.reset();
        
        if (student) {
            currentEditingId = student.id_aluno;
            elements.modalTitle.textContent = '✏️ Editar Aluno';
            elements.form.querySelector('[type="submit"]').textContent = 'Salvar Alterações';
            
            elements.nomeInput.value = student.nome_aluno || '';
            elements.inepInput.value = student.inep_aluno || '';
            
            if (student.data_nascimento && student.data_nascimento.includes('/')) {
                const [day, month, year] = student.data_nascimento.split('/');
                elements.dataInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            elements.maeInput.value = student.nome_mae || '';
            elements.corRacaSelect.value = student.cor_raca || 'Não Declarada';
            elements.beneficiarioSelect.value = student.beneficiario_social || 'NÃO';
            elements.transporteSelect.value = student.transporte_escolar || 'NÃO';
            
            if (student.pcd === 'NÃO' || !student.pcd) {
                elements.pcdSelect.value = 'NÃO';
                elements.pcdDetailsGroup.style.display = 'none';
            } else {
                elements.pcdSelect.value = 'SIM';
                elements.pcdDetailsGroup.style.display = 'block';
                elements.pcdDetailsSelect.value = student.pcd;
            }
        } else {
            currentEditingId = null;
            elements.modalTitle.textContent = '➕ Adicionar Novo Aluno';
            elements.form.querySelector('[type="submit"]').textContent = 'Salvar Aluno';
            elements.pcdDetailsGroup.style.display = 'none';
        }
        
        elements.modal.style.display = 'flex';
    }

    function closeModal() {
        elements.modal.style.display = 'none';
        currentEditingId = null;
    }

    // === MODAL DE EXCLUSÃO ===

    function openDeleteModal(id, name) {
        studentToDelete = { id, name };
        elements.deleteNameSpan.textContent = name;
        elements.deleteInput.value = '';
        elements.confirmDeleteBtn.disabled = true;
        elements.deleteModal.style.display = 'flex';
    }

    function closeDeleteModal() {
        elements.deleteModal.style.display = 'none';
        studentToDelete = null;
    }

    // === UTILITÁRIOS ===

    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        
        // Se já está no formato DD/MM/YYYY
        if (dataString.includes('/')) {
            return dataString;
        }
        
        // Se está no formato YYYY-MM-DD
        if (dataString.includes('-')) {
            const [year, month, day] = dataString.split('-');
            return `${day}/${month}/${year}`;
        }
        
        return dataString;
    }

    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    // === EVENT LISTENERS ===

    elements.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (elements.searchInput.value.length >= 3 || elements.searchInput.value.length === 0) {
                applyFilters();
            }
        }, 300);
    });

    elements.addBtn.addEventListener('click', () => openModal());

    elements.tableContainer.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-btn')) {
            const studentId = parseInt(target.dataset.id, 10);
            const studentToEdit = allAlunosCache.find(aluno => aluno.id_aluno === studentId);
            if (studentToEdit) openModal(studentToEdit);
        }

        if (target.classList.contains('delete-btn')) {
            const studentId = parseInt(target.dataset.id, 10);
            const studentName = target.dataset.name;
            openDeleteModal(studentId, studentName);
        }
        
        if (target.closest('.student-link')) {
            e.preventDefault();
            const studentId = parseInt(target.closest('.student-link').dataset.id, 10);
            showStudentDetails(studentId);
        }
    });

    elements.cancelBtn.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });
    
    elements.inepInput.addEventListener('input', () => {
        elements.inepInput.value = elements.inepInput.value.replace(/\D/g, '');
    });
    
    elements.pcdSelect.addEventListener('change', (e) => {
        elements.pcdDetailsGroup.style.display = (e.target.value === 'SIM') ? 'block' : 'none';
    });

    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Salvando...';
        
        const formData = new FormData(elements.form);
        const studentData = Object.fromEntries(formData.entries());
        
        if (!/^\d{12}$/.test(studentData.inep_aluno)) {
            alert('⚠️ O INEP é obrigatório e deve conter exatamente 12 números.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        if (studentData.pcd_status === 'SIM') {
            studentData.pcd = studentData.pcd_details;
        } else {
            studentData.pcd = 'NÃO';
        }
        delete studentData.pcd_status;
        delete studentData.pcd_details;
        
        if (studentData.data_nascimento) {
            const [year, month, day] = studentData.data_nascimento.split('-');
            if(year && month && day) {
                studentData.data_nascimento = `${day}/${month}/${year}`;
            }
        }
        
        try {
            if (currentEditingId) {
                await api.updateAluno(currentEditingId, studentData);
                alert('✅ Aluno atualizado com sucesso!');
            } else {
                await api.createAluno(studentData);
                alert('✅ Aluno cadastrado com sucesso!');
            }
            
            closeModal();
            refreshTable();
        } catch (error) {
            alert(`❌ Erro ao salvar: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Event listeners para exclusão
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.deleteModal.addEventListener('click', (e) => { 
        if (e.target === elements.deleteModal) closeDeleteModal(); 
    });

    elements.deleteInput.addEventListener('input', () => {
        elements.confirmDeleteBtn.disabled = elements.deleteInput.value !== studentToDelete?.name;
    });

    elements.confirmDeleteBtn.addEventListener('click', async () => {
        if (!studentToDelete) return;
        
        const originalText = elements.confirmDeleteBtn.textContent;
        elements.confirmDeleteBtn.disabled = true;
        elements.confirmDeleteBtn.textContent = '⏳ Excluindo...';
        
        try {
            await api.deleteAluno(studentToDelete.id);
            alert(`✅ Aluno "${studentToDelete.name}" foi excluído com sucesso.`);
            closeDeleteModal();
            refreshTable();
        } catch (error) {
            alert(`❌ Erro ao excluir aluno: ${error.message}`);
        } finally {
            elements.confirmDeleteBtn.disabled = false;
            elements.confirmDeleteBtn.textContent = originalText;
        }
    });

    // === FUNÇÕES GLOBAIS ===
    window.showStudentDetails = showStudentDetails;

    // === INICIALIZAÇÃO ===
    refreshTable();

    // Adicionar estilos CSS para os cards de informação
    const style = document.createElement('style');
    style.textContent = `
        .info-card {
            background: var(--bg-tertiary);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-primary);
        }
        
        .info-grid {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .info-label {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 0.95rem;
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .student-link {
            color: var(--primary-600);
            text-decoration: none;
            font-weight: 600;
            transition: color var(--transition-fast);
        }
        
        .student-link:hover {
            color: var(--primary-500);
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .info-card {
                padding: 1rem;
            }
            
            #student-details-modal .modal-content > div {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});