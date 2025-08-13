// Arquivo: /js/modules/ui.js
// Responsável por todas as manipulações do DOM e da interface.

import { CONFIG, LEVEL_STYLES } from './config.js';
import { elements } from './dom.js';

// --- Funções Utilitárias de UI ---

// CORREÇÃO: Adicionada a palavra "export" para que a função possa ser importada
export function toTitleCase(str) {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().split(' ').map(word => 
        ['de','da','do','dos','das','e','a','o'].includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// CORREÇÃO: Adicionada a palavra "export" aqui também por consistência
export function getLevelClassName(levelValue) {
    if (!levelValue) return 'level-sem-dados';
    const style = LEVEL_STYLES[levelValue.trim()];
    return style ? `level-default ${style.className}` : 'level-sem-dados';
}

// --- Funções de Manipulação do DOM ---

export function populateSelect(selectElement, options, defaultText, valueKey = null, textKey = null) {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">-- ${defaultText} --</option>`;
    options.forEach(option => {
        const optionElement = document.createElement('option');
        if (typeof option === 'object' && valueKey && textKey) {
            optionElement.value = option[valueKey];
            optionElement.textContent = option[textKey];
        } else {
            optionElement.value = option;
            optionElement.textContent = option;
        }
        selectElement.appendChild(optionElement);
    });
}

export function renderTable(data, currentPage) {
    const container = elements.dataTableContainer;
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="info-message"><span>🔍</span> Nenhum dado encontrado. Selecione os filtros para buscar.</div>`;
        if (elements.paginationControls) elements.paginationControls.innerHTML = '';
        return;
    }

    const rowsPerPage = parseInt(elements.rowsPerPageSelect.value, 10);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

    const evaluationSelected = !!elements.evaluationFilter.value;
    let headersToShow = ['ESCOLA', CONFIG.STUDENT_NAME_HEADER, 'ETAPA DE ENSINO', 'TURMA'];
    if (evaluationSelected) {
        headersToShow = ['ESCOLA', CONFIG.STUDENT_NAME_HEADER, 'resultado', 'BENEFICIÁRIO SOCIAL?', 'COR/RAÇA', 'ALUNO PCD?', 'UTILIZA TRANSPORTE ESCOLAR'];
    }

    let tableHTML = `<table><thead><tr><th>#</th>`;
    headersToShow.forEach(h => tableHTML += `<th>${toTitleCase(h.replace(/_/g, ' '))}</th>`);
    tableHTML += `</tr></thead><tbody>`;

    paginatedData.forEach((row, index) => {
        const rowClass = getLevelClassName(row.resultado);
        tableHTML += `<tr class="${rowClass}"><td>${startIndex + index + 1}</td>`;
        headersToShow.forEach(header => {
            const cellValue = row[header] || '-';
            if (header === CONFIG.STUDENT_NAME_HEADER) {
                tableHTML += `<td><a href="#" class="student-link" data-inep="${row.INEP}">${toTitleCase(cellValue)}</a></td>`;
            } else {
                tableHTML += `<td>${toTitleCase(cellValue)}</td>`;
            }
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
    renderPaginationControls(data.length, currentPage);
}

export function renderPaginationControls(totalRows, currentPage) {
    const container = elements.paginationControls;
    if (!container) return;
    container.innerHTML = '';
    const rowsPerPage = parseInt(elements.rowsPerPageSelect.value, 10);
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.dataset.page = i; 
        container.appendChild(btn);
    }
}

export function updateSummaryCards(data, evaluationName) {
    if (!evaluationName || data.length === 0) {
        if (elements.summarySection) elements.summarySection.style.display = 'none';
        return;
    }
    if (elements.summarySection) elements.summarySection.style.display = 'grid';

    const total = data.length;
    const levelCounts = data.reduce((acc, row) => {
        const level = row.resultado;
        if (level) acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    if (elements.totalCardContent) elements.totalCardContent.innerHTML = `<span class="value">${total}</span>`;
    
    let listHTML = '<ul class="level-distribution-list">';
    Object.keys(levelCounts).sort().forEach(level => {
        const count = levelCounts[level];
        const percentage = ((count / total) * 100).toFixed(1);
        listHTML += `<li><strong>${toTitleCase(level)}:</strong> ${count} (${percentage}%)</li>`;
    });
    listHTML += '</ul>';

    if (elements.distCardContent) elements.distCardContent.innerHTML = listHTML;
}

export function showFilters(filterGroupElements) {
    filterGroupElements.forEach(el => {
        if(el) el.classList.remove('hidden-filter');
    });
}

export function hideFilters(filterGroupElements) {
    filterGroupElements.forEach(el => {
        if(el) el.classList.add('hidden-filter');
    });
}

export function resetAndHideDynamicFilters() {
    hideFilters([
        elements.evaluationFilterContainer,
        elements.mainFiltersContainer,
        elements.demographicFiltersContainer
    ]);
    elements.evaluationFilter.innerHTML = '';
}

export function displayInitialMessage() {
    if (elements.dataTableContainer) {
        elements.dataTableContainer.innerHTML = `<div class="info-message"><span>👆</span> Selecione um Ano de Aplicação para começar.</div>`;
    }
}