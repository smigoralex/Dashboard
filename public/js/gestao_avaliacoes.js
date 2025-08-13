// gestao_avaliacoes.js - VERSÃO FINAL COMPLETA
// Sistema completo de gestão de avaliações com todas as funcionalidades

import { checkAuth } from './modules/auth.js';
import * as api from './modules/api.js';

checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    // === ELEMENTOS DO DOM ===
    const elements = {
        tableContainer: document.getElementById('avaliacoes-table-container'),
        addBtn: document.getElementById('add-avaliacao-btn'),
        modal: document.getElementById('avaliacao-modal'),
        form: document.getElementById('avaliacao-form'),
        cancelBtn: document.getElementById('cancel-btn'),
        addNivelBtn: document.getElementById('add-nivel-btn'),
        niveisContainer: document.getElementById('niveis-container'),
        escalaSelect: document.getElementById('escala-modelo-select'),
        modalTitle: document.getElementById('modal-title'),
        searchInput: document.getElementById('search-avaliacoes'),
        
        // Elementos de exclusão
        deleteModal: document.getElementById('delete-avaliacao-modal'),
        deleteNameSpan: document.getElementById('avaliacao-name-to-delete'),
        deleteInput: document.getElementById('delete-avaliacao-input'),
        cancelDeleteBtn: document.getElementById('cancel-delete-avaliacao-btn'),
        confirmDeleteBtn: document.getElementById('confirm-delete-avaliacao-btn')
    };

    // === VARIÁVEIS DE ESTADO ===
    let allAvaliacoesCache = [];
    let filteredAvaliacoes = [];
    let currentEditingId = null;
    let avaliacaoToDelete = null;

    // === FUNÇÕES PRINCIPAIS ===

    async function refreshTable() {
        try {
            showLoading();
            const avaliacoes = await api.getAvaliacoes();
            allAvaliacoesCache = avaliacoes;
            filteredAvaliacoes = [...avaliacoes];
            
            createDynamicFilters();
            addQuickStats();
            renderFilteredTable();
            updateResultsCounter();
            updateQuickStats();
        } catch (error) {
            elements.tableContainer.innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
        } finally {
            hideLoading();
        }
    }

    function showLoading() {
        elements.tableContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                <p>Carregando avaliações...</p>
            </div>
        `;
    }

    function hideLoading() {
        // Loading será removido quando a tabela for renderizada
    }

    function renderFilteredTable() {
        renderAvaliacoesTable(filteredAvaliacoes);
    }

    function renderAvaliacoesTable(avaliacoes) {
        if (!avaliacoes || avaliacoes.length === 0) {
            elements.tableContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <h3>Nenhuma avaliação encontrada</h3>
                    <p>Crie sua primeira avaliação ou ajuste os filtros de busca.</p>
                </div>
            `;
            return;
        }
        
        let tableHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome da Avaliação</th>
                        <th>Ano</th>
                        <th>Área de Conhecimento</th>
                        <th>Níveis</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        avaliacoes.forEach(av => {
            tableHTML += `
                <tr>
                    <td>${av.id_avaliacao}</td>
                    <td style="font-weight: 600; color: var(--primary-600);">
                        ${av.nome_avaliacao}
                    </td>
                    <td>
                        <span style="background: var(--primary-50); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 500;">
                            ${av.ano_aplicacao}
                        </span>
                    </td>
                    <td>${av.etapa_de_conhecimento || 'N/A'}</td>
                    <td>
                        <button class="button" data-id="${av.id_avaliacao}" onclick="showNiveisDetails(${av.id_avaliacao})" 
                                style="font-size: 0.8rem; padding: 0.3rem 0.6rem; background: var(--info); color: white;" 
                                title="Visualizar níveis desta avaliação">
                            👁️ Ver Níveis
                        </button>
                    </td>
                    <td class="actions-cell">
                        <button class="button edit-btn" data-id="${av.id_avaliacao}" title="Editar esta avaliação">
                            ✏️ Editar
                        </button>
                        <button class="button" data-id="${av.id_avaliacao}" onclick="duplicateAvaliacao(${av.id_avaliacao})" 
                                style="background-color: var(--success); color: white;" title="Criar uma cópia desta avaliação">
                            📋 Duplicar
                        </button>
                        <button class="button delete-btn" data-id="${av.id_avaliacao}" data-name="${av.nome_avaliacao}" 
                                title="Excluir esta avaliação permanentemente">
                            🗑️ Excluir
                        </button>
                    </td>
                </tr>`;
        });
        
        tableHTML += `</tbody></table>`;
        elements.tableContainer.innerHTML = tableHTML;
    }

    // === FUNCIONALIDADES AVANÇADAS ===

    async function showNiveisDetails(avaliacaoId) {
        try {
            const avaliacao = await api.getAvaliacaoById(avaliacaoId);
            
            let detailsHTML = `
                <div style="max-width: 600px;">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <h4 style="color: var(--primary-600); margin-bottom: 0.5rem;">
                            📊 Níveis de "${avaliacao.nome_avaliacao}"
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            ${avaliacao.ano_aplicacao} • ${avaliacao.etapa_de_conhecimento}
                        </p>
                    </div>
                    
                    <table class="history-table" style="margin-top: 1rem;">
                        <thead>
                            <tr>
                                <th style="width: 80px;">Ordem</th>
                                <th>Descrição do Nível</th>
                                <th style="width: 100px;">Cor</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            avaliacao.niveis.forEach((nivel, index) => {
                detailsHTML += `
                    <tr style="background: ${nivel.cor}20;">
                        <td style="text-align: center; font-weight: bold;">
                            <span style="background: var(--primary-500); color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem;">
                                ${nivel.ordem}
                            </span>
                        </td>
                        <td style="font-weight: 500;">${nivel.descricao_resultado}</td>
                        <td style="text-align: center;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: ${nivel.cor}; border: 2px solid #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>
                                <code style="font-size: 0.7rem; color: var(--text-secondary);">${nivel.cor}</code>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            detailsHTML += `
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 6px;">
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">
                            💡 <strong>Total:</strong> ${avaliacao.niveis.length} níveis configurados
                        </p>
                    </div>
                </div>
            `;
            
            const detailModal = document.createElement('div');
            detailModal.className = 'modal-overlay';
            detailModal.innerHTML = `
                <div class="modal-content">
                    ${detailsHTML}
                    <div class="modal-actions">
                        <button class="button cancel-button" onclick="this.closest('.modal-overlay').remove()">
                            Fechar
                        </button>
                        <button class="button action-button" onclick="editAvaliacao(${avaliacaoId}); this.closest('.modal-overlay').remove();">
                            ✏️ Editar Avaliação
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(detailModal);
            detailModal.style.display = 'flex';
            
        } catch (error) {
            alert(`❌ Erro ao buscar detalhes: ${error.message}`);
        }
    }

    async function duplicateAvaliacao(originalId) {
        try {
            const originalData = await api.getAvaliacaoById(originalId);
            
            const duplicateModal = document.createElement('div');
            duplicateModal.className = 'modal-overlay';
            duplicateModal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <h3 style="text-align: center; color: var(--success);">📋 Duplicar Avaliação</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; text-align: center;">
                        Criando uma cópia de "<strong style="color: var(--primary-600);">${originalData.nome_avaliacao}</strong>"
                    </p>
                    
                    <form id="duplicate-form">
                        <div class="form-group">
                            <label for="dup-nome">Nome da Nova Avaliação *</label>
                            <input type="text" id="dup-nome" value="${originalData.nome_avaliacao} (Cópia)" required maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="dup-ano">Ano de Aplicação *</label>
                            <input type="number" id="dup-ano" value="${new Date().getFullYear()}" required min="2000" max="2100">
                        </div>
                        <div class="form-group">
                            <label for="dup-area">Área de Conhecimento *</label>
                            <select id="dup-area" required>
                                <option value="Língua Portuguesa" ${originalData.etapa_de_conhecimento === 'Língua Portuguesa' ? 'selected' : ''}>Língua Portuguesa</option>
                                <option value="Leitura" ${originalData.etapa_de_conhecimento === 'Leitura' ? 'selected' : ''}>Leitura</option>
                                <option value="Matemática" ${originalData.etapa_de_conhecimento === 'Matemática' ? 'selected' : ''}>Matemática</option>
                                <option value="Ciências" ${originalData.etapa_de_conhecimento === 'Ciências' ? 'selected' : ''}>Ciências</option>
                                <option value="História" ${originalData.etapa_de_conhecimento === 'História' ? 'selected' : ''}>História</option>
                                <option value="Geografia" ${originalData.etapa_de_conhecimento === 'Geografia' ? 'selected' : ''}>Geografia</option>
                                <option value="Educação Física" ${originalData.etapa_de_conhecimento === 'Educação Física' ? 'selected' : ''}>Educação Física</option>
                                <option value="Arte" ${originalData.etapa_de_conhecimento === 'Arte' ? 'selected' : ''}>Arte</option>
                                <option value="Inglês" ${originalData.etapa_de_conhecimento === 'Inglês' ? 'selected' : ''}>Inglês</option>
                            </select>
                        </div>
                        
                        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--primary-600);">
                                📊 Níveis que serão copiados (${originalData.niveis.length}):
                            </h4>
                            <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem; color: var(--text-secondary); max-height: 120px; overflow-y: auto;">
                                ${originalData.niveis.map(nivel => `<li><strong>${nivel.ordem}.</strong> ${nivel.descricao_resultado}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="cancel-button" onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="action-button">
                                📋 Criar Cópia
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(duplicateModal);
            duplicateModal.style.display = 'flex';

            const duplicateForm = document.getElementById('duplicate-form');
            duplicateForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = e.target.querySelector('[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Criando...';
                
                const newAvaliacaoData = {
                    nome_avaliacao: document.getElementById('dup-nome').value,
                    ano_aplicacao: parseInt(document.getElementById('dup-ano').value, 10),
                    etapa_de_conhecimento: document.getElementById('dup-area').value,
                    niveis: originalData.niveis.map(nivel => ({
                        descricao_resultado: nivel.descricao_resultado,
                        ordem: nivel.ordem,
                        cor: nivel.cor
                    }))
                };

                try {
                    await api.createAvaliacao(newAvaliacaoData);
                    alert('✅ Avaliação duplicada com sucesso!');
                    duplicateModal.remove();
                    refreshTable();
                } catch (error) {
                    alert(`❌ Erro ao duplicar: ${error.message}`);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '📋 Criar Cópia';
                }
            });

        } catch (error) {
            alert(`❌ Erro ao carregar dados para duplicação: ${error.message}`);
        }
    }

    // === FILTROS E BUSCA ===

    function applyFilters() {
        const searchTerm = elements.searchInput?.value.toLowerCase() || '';
        const yearFilter = document.getElementById('filter-year')?.value || '';
        const areaFilter = document.getElementById('filter-area')?.value || '';

        filteredAvaliacoes = allAvaliacoesCache.filter(avaliacao => {
            const matchesSearch = !searchTerm || 
                avaliacao.nome_avaliacao.toLowerCase().includes(searchTerm) ||
                avaliacao.etapa_de_conhecimento.toLowerCase().includes(searchTerm);
            
            const matchesYear = !yearFilter || avaliacao.ano_aplicacao.toString() === yearFilter;
            const matchesArea = !areaFilter || avaliacao.etapa_de_conhecimento === areaFilter;

            return matchesSearch && matchesYear && matchesArea;
        });

        renderFilteredTable();
        updateResultsCounter();
    }

    function createDynamicFilters() {
        const years = [...new Set(allAvaliacoesCache.map(av => av.ano_aplicacao))].sort().reverse();
        const areas = [...new Set(allAvaliacoesCache.map(av => av.etapa_de_conhecimento))].sort();

        if (!document.getElementById('filters-container')) {
            const filtersHTML = `
                <div id="filters-container" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-primary);">
                    <div class="filter-group">
                        <label for="filter-year" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">📅 Ano:</label>
                        <select id="filter-year" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todos os anos</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-area" style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">📚 Área:</label>
                        <select id="filter-area" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary);">
                            <option value="">Todas as áreas</option>
                        </select>
                    </div>
                    <button id="clear-filters" style="padding: 0.5rem 1rem; background: var(--error); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
                        🗑️ Limpar
                    </button>
                </div>
            `;
            
            elements.tableContainer.insertAdjacentHTML('beforebegin', filtersHTML);
        }

        const yearSelect = document.getElementById('filter-year');
        const areaSelect = document.getElementById('filter-area');
        
        yearSelect.innerHTML = '<option value="">Todos os anos</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        areaSelect.innerHTML = '<option value="">Todas as áreas</option>';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });

        elements.searchInput?.addEventListener('input', debounce(applyFilters, 300));
        yearSelect.addEventListener('change', applyFilters);
        areaSelect.addEventListener('change', applyFilters);
        document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);
    }

    function clearAllFilters() {
        if (elements.searchInput) elements.searchInput.value = '';
        const yearFilter = document.getElementById('filter-year');
        const areaFilter = document.getElementById('filter-area');
        if (yearFilter) yearFilter.value = '';
        if (areaFilter) areaFilter.value = '';
        
        filteredAvaliacoes = [...allAvaliacoesCache];
        renderFilteredTable();
        updateResultsCounter();
    }

    function updateResultsCounter() {
        const total = allAvaliacoesCache.length;
        const filtered = filteredAvaliacoes.length;
        
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
            counterElement.innerHTML = `📊 <strong>${total}</strong> avaliação(ões) encontrada(s)`;
        } else {
            counterElement.innerHTML = `🔍 <strong>${filtered}</strong> de <strong>${total}</strong> avaliação(ões) • <em>filtros aplicados</em>`;
        }
    }

    function addQuickStats() {
        if (document.getElementById('quick-stats')) return;
        
        const statsHTML = `
            <div id="quick-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: linear-gradient(135deg, var(--primary-500), var(--primary-600)); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="total-avaliacoes">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">📊 Total de Avaliações</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--success), #059669); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="current-year-count">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">📅 Avaliações ${new Date().getFullYear()}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, var(--info), #1d4ed8); color: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: var(--shadow-md);">
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.25rem;" id="areas-count">0</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">📚 Áreas Diferentes</div>
                </div>
            </div>
        `;
        
        const section = document.querySelector('.management-section');
        section.insertAdjacentHTML('afterbegin', statsHTML);
    }

    function updateQuickStats() {
        if (!allAvaliacoesCache.length) return;
        
        const currentYear = new Date().getFullYear();
        const currentYearCount = allAvaliacoesCache.filter(av => av.ano_aplicacao === currentYear).length;
        const areasCount = new Set(allAvaliacoesCache.map(av => av.etapa_de_conhecimento)).size;
        
        const totalEl = document.getElementById('total-avaliacoes');
        const yearEl = document.getElementById('current-year-count');
        const areasEl = document.getElementById('areas-count');
        
        if (totalEl) totalEl.textContent = allAvaliacoesCache.length;
        if (yearEl) yearEl.textContent = currentYearCount;
        if (areasEl) areasEl.textContent = areasCount;
    }

    // === MODAL DE CRIAR/EDITAR ===

    function createNivelInputRow(nivel = {}) {
        const row = document.createElement('div');
        row.className = 'nivel-input-row';
        row.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 80px 60px 40px; 
            gap: 0.75rem; 
            align-items: center; 
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 6px;
            position: relative;
        `;
        
        row.innerHTML = `
            <input type="text" placeholder="Descrição do nível (ex: Básico, Proficiente...)" 
                   name="nivel_descricao" required value="${nivel.descricao_resultado || ''}"
                   style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px;">
            <input type="number" placeholder="Ordem" name="nivel_ordem" required 
                   value="${nivel.ordem ?? ''}" min="1" max="20"
                   style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; text-align: center;">
            <input type="color" name="nivel_cor" value="${nivel.cor || '#e8f5e9'}"
                   style="width: 50px; height: 40px; border: none; border-radius: 6px; cursor: pointer;">
            <button type="button" class="remove-nivel-btn"
                    style="background: var(--error); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 1.1rem;">
                ×
            </button>
        `;
        
        elements.niveisContainer.appendChild(row);
        
        row.querySelector('.remove-nivel-btn').addEventListener('click', () => {
            if (elements.niveisContainer.children.length > 1) {
                row.remove();
                reorderNiveis();
            } else {
                alert('⚠️ A avaliação deve ter pelo menos um nível.');
            }
        });
        
        reorderNiveis();
        return row;
    }

    function reorderNiveis() {
        const rows = Array.from(elements.niveisContainer.children);
        rows.forEach((row, index) => {
            const ordemInput = row.querySelector('input[name="nivel_ordem"]');
            if (ordemInput) {
                ordemInput.value = index + 1;
            }
        });
    }

    async function populateEscalaSelect() {
        try {
            const modelos = await api.getEscalaModelos();
            elements.escalaSelect.innerHTML = '<option value="">-- Começar do zero --</option>';
            modelos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo.id_escala;
                option.textContent = modelo.nome_escala;
                elements.escalaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('❌ Erro ao buscar modelos:', error);
        }
    }

    function openModal(avaliacaoData = null) {
        elements.form.reset();
        elements.niveisContainer.innerHTML = '';
        elements.escalaSelect.value = '';
        
        if (avaliacaoData) {
            currentEditingId = avaliacaoData.id_avaliacao;
            elements.modalTitle.textContent = '✏️ Editar Avaliação';
            elements.form.querySelector('[type="submit"]').textContent = 'Salvar Alterações';
            
            elements.form.elements['nome_avaliacao'].value = avaliacaoData.nome_avaliacao;
            elements.form.elements['ano_aplicacao'].value = avaliacaoData.ano_aplicacao;
            elements.form.elements['etapa_de_conhecimento'].value = avaliacaoData.etapa_de_conhecimento;
            
            if (avaliacaoData.niveis && avaliacaoData.niveis.length > 0) {
                avaliacaoData.niveis.forEach(nivel => createNivelInputRow(nivel));
            } else {
                createNivelInputRow();
            }
        } else {
            currentEditingId = null;
            elements.modalTitle.textContent = '➕ Criar Nova Avaliação';
            elements.form.querySelector('[type="submit"]').textContent = 'Salvar Avaliação';
            createNivelInputRow();
        }
        
        elements.modal.style.display = 'flex';
    }

    function closeModal() {
        elements.modal.style.display = 'none';
        currentEditingId = null;
    }

    // === MODAL DE EXCLUSÃO ===

    function openDeleteModal(id, name) {
        avaliacaoToDelete = { id, name };
        elements.deleteNameSpan.textContent = name;
        elements.deleteInput.value = '';
        elements.confirmDeleteBtn.disabled = true;
        elements.deleteModal.style.display = 'flex';
    }

    function closeDeleteModal() {
        elements.deleteModal.style.display = 'none';
        avaliacaoToDelete = null;
    }

    // === UTILITÁRIOS ===

    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    // === EVENT LISTENERS ===

    elements.addBtn.addEventListener('click', () => openModal());

    elements.tableContainer.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        if (target.classList.contains('edit-btn')) {
            const avaliacaoId = parseInt(target.dataset.id, 10);
            try {
                const avaliacaoData = await api.getAvaliacaoById(avaliacaoId);
                openModal(avaliacaoData);
            } catch (error) {
                alert(`❌ Erro ao carregar avaliação: ${error.message}`);
            }
        }

        if (target.classList.contains('delete-btn')) {
            const avaliacaoId = parseInt(target.dataset.id, 10);
            const avaliacaoName = target.dataset.name;
            openDeleteModal(avaliacaoId, avaliacaoName);
        }
    });

    elements.cancelBtn.addEventListener('click', closeModal);
    elements.addNivelBtn.addEventListener('click', () => createNivelInputRow());
    elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });

    elements.escalaSelect.addEventListener('change', async (e) => {
        const modeloId = e.target.value;
        elements.niveisContainer.innerHTML = '';
        
        if (!modeloId) {
            createNivelInputRow();
            return;
        }
        
        try {
            const niveisDoModelo = await api.getEscalaDetalhes(modeloId);
            if (niveisDoModelo.length > 0) {
                niveisDoModelo.forEach(nivel => createNivelInputRow(nivel));
            } else {
                createNivelInputRow();
            }
        } catch (error) {
            alert('❌ Não foi possível carregar os detalhes do modelo de escala.');
            createNivelInputRow();
        }
    });

    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Salvando...';
        
        const formData = new FormData(elements.form);
        const avaliacaoData = {
            nome_avaliacao: formData.get('nome_avaliacao'),
            ano_aplicacao: parseInt(formData.get('ano_aplicacao'), 10),
            etapa_de_conhecimento: formData.get('etapa_de_conhecimento'),
            niveis: []
        };

        const descricoes = formData.getAll('nivel_descricao');
        const ordens = formData.getAll('nivel_ordem');
        const cores = formData.getAll('nivel_cor');

        for (let i = 0; i < descricoes.length; i++) {
            if (descricoes[i]) {
                avaliacaoData.niveis.push({
                    descricao_resultado: descricoes[i],
                    ordem: parseInt(ordens[i], 10),
                    cor: cores[i]
                });
            }
        }

        if (avaliacaoData.niveis.length === 0) {
            alert('⚠️ Você deve adicionar pelo menos um nível de desempenho.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        try {
            if (currentEditingId) {
                await api.updateAvaliacao(currentEditingId, avaliacaoData);
                alert('✅ Avaliação atualizada com sucesso!');
            } else {
                await api.createAvaliacao(avaliacaoData);
                alert('✅ Avaliação criada com sucesso!');
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
    elements.deleteModal.addEventListener('click', (e) => { if (e.target === elements.deleteModal) closeDeleteModal(); });

    elements.deleteInput.addEventListener('input', () => {
        elements.confirmDeleteBtn.disabled = elements.deleteInput.value !== avaliacaoToDelete?.name;
    });

    elements.confirmDeleteBtn.addEventListener('click', async () => {
        if (!avaliacaoToDelete) return;
        
        const originalText = elements.confirmDeleteBtn.textContent;
        elements.confirmDeleteBtn.disabled = true;
        elements.confirmDeleteBtn.textContent = '⏳ Excluindo...';
        
        try {
            await api.deleteAvaliacao(avaliacaoToDelete.id);
            alert(`✅ Avaliação "${avaliacaoToDelete.name}" foi excluída com sucesso.`);
            closeDeleteModal();
            refreshTable();
        } catch (error) {
            alert(`❌ Erro ao excluir avaliação: ${error.message}`);
        } finally {
            elements.confirmDeleteBtn.disabled = false;
            elements.confirmDeleteBtn.textContent = originalText;
        }
    });

    // === FUNÇÕES GLOBAIS ===
    window.showNiveisDetails = showNiveisDetails;
    window.duplicateAvaliacao = duplicateAvaliacao;
    window.editAvaliacao = async (id) => {
        try {
            const avaliacaoData = await api.getAvaliacaoById(id);
            openModal(avaliacaoData);
        } catch (error) {
            alert(`❌ Erro ao carregar avaliação: ${error.message}`);
        }
    };

    // === INICIALIZAÇÃO ===
    refreshTable();
    populateEscalaSelect();
});