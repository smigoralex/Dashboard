// Arquivo: /js/script.js (VERSÃO COMPLETA CORRIGIDA)
// Importa as funções dos módulos e orquestra a aplicação.

import { CONFIG } from './modules/config.js';
import { elements } from './modules/dom.js';
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as charts from './modules/charts.js';

// --- Variáveis de Estado da Aplicação ---
let allFetchedData = [];
let filteredData = [];
let currentPage = 1;

// --- Classes Utilitárias ---
class LoadingManager { 
    constructor() { 
        this.loadingElement = document.getElementById('loading-indicator'); 
        this.messageElement = document.getElementById('loading-message'); 
    } 
    show(message = 'Carregando...') { 
        if (this.messageElement) this.messageElement.textContent = message; 
        if (this.loadingElement) this.loadingElement.style.display = 'flex'; 
    } 
    hide() { 
        if (this.loadingElement) this.loadingElement.style.display = 'none'; 
    } 
}

class NotificationManager { 
    constructor() { 
        this.container = document.getElementById('notification-container'); 
    } 
    show(message, type = 'info', duration = 5000) { 
        const notification = document.createElement('div'); 
        notification.className = `notification ${type}`; 
        notification.innerHTML = `<div class="notification-content"><span>${message}</span></div>`; 
        this.container.appendChild(notification); 
        if (duration > 0) setTimeout(() => notification.remove(), duration); 
    } 
}

const loadingManager = new LoadingManager();
const notificationManager = new NotificationManager();

// --- Funções para Estatísticas do Dashboard ---
async function loadDashboardStats() {
    try {
        // Buscar total de alunos únicos (com INEP)
        const alunosResponse = await fetch('/api/alunos');
        const alunosData = await alunosResponse.json();
        const totalAlunos = alunosData.length;
        
        // Buscar total de escolas
        const escolasResponse = await fetch('/api/filtros/escolas');
        const escolasData = await escolasResponse.json();
        const totalEscolas = escolasData.length;
        
        // Buscar total de avaliações únicas
        const avaliacoesResponse = await fetch('/api/avaliacoes');
        const avaliacoesData = await avaliacoesResponse.json();
        const totalAvaliacoes = avaliacoesData.length;
        
        // Atualizar os números no dashboard com animação
        animateNumber(document.getElementById('total-students'), totalAlunos);
        animateNumber(document.getElementById('total-schools'), totalEscolas);
        animateNumber(document.getElementById('total-evaluations'), totalAvaliacoes);
        
        // Taxa de proficiência (placeholder por enquanto)
        document.getElementById('proficiency-rate').textContent = '67%';
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Valores padrão em caso de erro
        document.getElementById('total-students').textContent = '0';
        document.getElementById('total-schools').textContent = '0';
        document.getElementById('total-evaluations').textContent = '0';
        document.getElementById('proficiency-rate').textContent = '0%';
    }
}

// Função de animação de números
function animateNumber(element, target) {
    if (!element) return;
    
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, 16);
}

// --- Funções auxiliares para mostrar/esconder filtros ---
function hideAllSubsequentFilters() {
    const evalContainer = document.getElementById('evaluation-filter-container');
    const locationFilters = document.getElementById('location-filters');
    const demographicFilters = document.getElementById('demographic-filters');
    
    if (evalContainer) evalContainer.style.display = 'none';
    if (locationFilters) locationFilters.style.display = 'none';
    if (demographicFilters) demographicFilters.style.display = 'none';
}

function showLocationFilters() {
    const locationFilters = document.getElementById('location-filters');
    if (locationFilters) locationFilters.style.display = 'block';
}

function showDemographicFilters() {
    const demographicFilters = document.getElementById('demographic-filters');
    if (demographicFilters) demographicFilters.style.display = 'block';
}

// --- Lógica Principal de Orquestração ---
async function handleYearChange() {
    const selectedYear = elements.applicationYearFilter.value;
    
    // Esconder todos os filtros subsequentes
    hideAllSubsequentFilters();
    
    if (!selectedYear) { 
        clearFilters(false);
        ui.displayInitialMessage();
        return; 
    }
    
    if (selectedYear === 'all') { 
        await populateAllFiltersAndShow(); 
        return; 
    }
    
    loadingManager.show('Carregando avaliações...');
    
    try {
        const evaluations = await api.fetchEvaluationsByYear(selectedYear);
        ui.populateSelect(elements.evaluationFilter, evaluations, 'Selecione uma avaliação', 'id_avaliacao', 'nome_avaliacao');
        
        // Mostrar o container de avaliação
        const evalContainer = document.getElementById('evaluation-filter-container');
        if (evalContainer) evalContainer.style.display = 'block';
        
    } catch (error) {
        notificationManager.show(error.message, 'error');
    } finally {
        loadingManager.hide();
    }
}

async function handleEvaluationChange() {
    const evaluationId = elements.evaluationFilter.value;
    const yearIsAll = elements.applicationYearFilter.value === 'all';
    
    if (yearIsAll) { 
        if (evaluationId) { 
            applyFiltersAndSearch(); 
        } else { 
            clearFilters(false); 
            populateAllFiltersAndShow(); 
        } 
        return; 
    }
    
    if (!evaluationId) { 
        // Esconder filtros de localização e demográficos
        const locationFilters = document.getElementById('location-filters');
        const demographicFilters = document.getElementById('demographic-filters');
        if (locationFilters) locationFilters.style.display = 'none';
        if (demographicFilters) demographicFilters.style.display = 'none';
        return; 
    }
    
    await populateAllFiltersAndShow(evaluationId);
}

async function populateAllFiltersAndShow(evaluationId = null) {
    loadingManager.show('Carregando filtros...');
    
    try {
        const [escolas, gerais, demograficos] = await Promise.all([
            api.fetchSchools(),
            api.fetchGeneralFilters(),
            api.fetchDemographicFilters()
        ]);
        
        // Popular os selects de localização
        ui.populateSelect(elements.schoolFilter, escolas, 'Todas as Escolas', 'id_escola', 'nome_escola');
        ui.populateSelect(elements.yearFilter, gerais.etapas, 'Todas as Etapas', 'id_etapa', 'nome_etapa');
        elements.turmaFilter.innerHTML = '<option value="">-- Escolha escola e etapa --</option>';
        elements.turmaFilter.disabled = true;
        
        // Popular filtros demográficos
        ui.populateSelect(elements.nseFilter, demograficos.beneficiario, 'Todos');
        ui.populateSelect(elements.corRacaFilter, demograficos.cor_raca, 'Todas');
        ui.populateSelect(elements.inclusaoFilter, demograficos.pcd, 'Todos');
        ui.populateSelect(elements.transporteFilter, demograficos.transporte, 'Todos');
        
        // Buscar níveis se houver avaliação selecionada
        const currentEvalId = evaluationId || elements.evaluationFilter.value;
        if (currentEvalId) {
            const niveis = await api.fetchNiveisByEvaluation(currentEvalId);
            ui.populateSelect(elements.levelFilter, niveis, 'Todos os Níveis', 'id_nivel', 'descricao_resultado');
        }
        
        // Mostrar os filtros
        showLocationFilters();
        showDemographicFilters();
        
        // Aplicar filtros automaticamente
        applyFiltersAndSearch();
        
    } catch (error) {
        notificationManager.show(error.message, 'error');
    } finally {
        loadingManager.hide();
    }
}

async function applyFiltersAndSearch() {
    loadingManager.show('Buscando dados...');
    const params = new URLSearchParams();
    
    if (elements.evaluationFilter.value) params.append('avaliacao', elements.evaluationFilter.options[elements.evaluationFilter.selectedIndex].text);
    if (elements.schoolFilter.value) params.append('escola', elements.schoolFilter.options[elements.schoolFilter.selectedIndex].text);
    if (elements.turmaFilter.value) params.append('turma', elements.turmaFilter.options[elements.turmaFilter.selectedIndex].text);
    if (elements.yearFilter.value) params.append('etapa', elements.yearFilter.options[elements.yearFilter.selectedIndex].text);
    if (elements.levelFilter.value) params.append('nivel', elements.levelFilter.options[elements.levelFilter.selectedIndex].text);
    if (elements.nseFilter.value) params.append('beneficiario', elements.nseFilter.value);
    if (elements.corRacaFilter.value) params.append('cor_raca', elements.corRacaFilter.value);
    if (elements.inclusaoFilter.value) params.append('pcd', elements.inclusaoFilter.value);
    if (elements.transporteFilter.value) params.append('transporte', elements.transporteFilter.value);
    
    try {
        allFetchedData = await api.fetchDashboardData(params);
        filterLocalData();
        const evalName = elements.evaluationFilter.value ? elements.evaluationFilter.options[elements.evaluationFilter.selectedIndex].text : null;
        ui.updateSummaryCards(filteredData, evalName);
        charts.drawChart(filteredData, evalName);
        charts.drawSchoolPerformanceChart(filteredData, evalName);
        notificationManager.show(`${filteredData.length} registros encontrados.`, 'info');
    } catch (error) {
        notificationManager.show("Erro ao buscar dados.", "error");
    } finally {
        loadingManager.hide();
    }
}

function filterLocalData() {
    const searchQuery = elements.studentSearch.value.toLowerCase().trim();
    if (searchQuery) { 
        filteredData = allFetchedData.filter(row => row[CONFIG.STUDENT_NAME_HEADER].toLowerCase().includes(searchQuery)); 
    } else { 
        filteredData = [...allFetchedData]; 
    }
    currentPage = 1;
    ui.renderTable(filteredData, currentPage);
}

function clearFilters(reloadPage = true) { 
    if (reloadPage) { 
        window.location.reload(); 
    } else { 
        hideAllSubsequentFilters();
        if (elements.applicationYearFilter.value === '') { 
            ui.displayInitialMessage(); 
        } 
    } 
}

async function fetchAndPopulateTurmas() { 
    const idEscola = elements.schoolFilter.value; 
    const idEtapa = elements.yearFilter.value; 
    
    if (idEscola && idEtapa) { 
        elements.turmaFilter.disabled = true; 
        elements.turmaFilter.innerHTML = '<option value="">-- Carregando turmas... --</option>'; 
        
        try { 
            const turmas = await api.fetchTurmas(idEscola, idEtapa); 
            ui.populateSelect(elements.turmaFilter, turmas, 'Todas as Turmas', 'id_turma', 'nome_turma'); 
            elements.turmaFilter.disabled = false; 
        } catch (error) { 
            notificationManager.show(error.message, 'error'); 
        } 
    } else { 
        elements.turmaFilter.innerHTML = '<option value="">-- Escolha uma escola e etapa --</option>'; 
        elements.turmaFilter.disabled = true; 
    } 
}

function debounce(func, delay) { 
    let timeout; 
    return (...args) => { 
        clearTimeout(timeout); 
        timeout = setTimeout(() => func.apply(this, args), delay); 
    }; 
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    // Tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { 
        document.documentElement.setAttribute('data-theme', 'dark'); 
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) themeSwitch.checked = true;
    }
    
    // Theme switch handler
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) { 
        themeSwitch.addEventListener('change', () => { 
            const isDark = themeSwitch.checked; 
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light'); 
            localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
        }); 
    }
    
    // Carregar estatísticas do dashboard
    loadDashboardStats();
    
    // Carregar anos disponíveis
    loadingManager.show('Carregando filtros...');
    api.fetchApplicationYears()
        .then(years => { 
            ui.populateSelect(elements.applicationYearFilter, years, 'Selecione um ano'); 
            const allYearsOption = document.createElement('option'); 
            allYearsOption.value = 'all'; 
            allYearsOption.textContent = 'Todos os anos'; 
            elements.applicationYearFilter.add(allYearsOption, 1); 
        })
        .catch(error => notificationManager.show(error.message, 'error'))
        .finally(() => { 
            loadingManager.hide(); 
            ui.displayInitialMessage(); 
        });
    
    // Event Listeners
    elements.applicationYearFilter.addEventListener('change', handleYearChange);
    elements.evaluationFilter.addEventListener('change', handleEvaluationChange);
    elements.schoolFilter.addEventListener('change', fetchAndPopulateTurmas);
    elements.yearFilter.addEventListener('change', fetchAndPopulateTurmas);
    elements.studentSearch.addEventListener('input', debounce(filterLocalData, CONFIG.DEBOUNCE_DELAY));
    elements.rowsPerPageSelect.addEventListener('change', () => { 
        currentPage = 1; 
        ui.renderTable(filteredData, currentPage); 
    });
    
    if(elements.clearFiltersButton) elements.clearFiltersButton.addEventListener('click', clearFilters);
    
    const otherFilters = [elements.turmaFilter, elements.levelFilter, elements.nseFilter, elements.corRacaFilter, elements.inclusaoFilter, elements.transporteFilter];
    otherFilters.forEach(filter => { 
        if(filter) filter.addEventListener('change', debounce(applyFiltersAndSearch, CONFIG.DEBOUNCE_DELAY)); 
    });

    if(elements.paginationControls) { 
        elements.paginationControls.addEventListener('click', (e) => { 
            if(e.target.tagName === 'BUTTON' && e.target.dataset.page) { 
                currentPage = parseInt(e.target.dataset.page, 10); 
                ui.renderTable(filteredData, currentPage); 
            } 
        }); 
    }

    // Links dos alunos
    if(elements.dataTableContainer) {
        elements.dataTableContainer.addEventListener('click', (e) => {
            const targetLink = e.target.closest('.student-link');
            if (targetLink) {
                e.preventDefault();
                const inep = targetLink.dataset.inep;
                if (inep) {
                    window.open(`student_detail.html?inep=${inep}`, '_blank');
                }
            }
        });
    }
    
    // Toggle de filtros
    document.getElementById('toggle-filters')?.addEventListener('click', function() {
        const content = document.getElementById('filters-content');
        const icon = this.querySelector('i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            content.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    });
    
    // Fullscreen toggle
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    // Refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        location.reload();
    });
    
    // Apply filters button
    document.getElementById('apply-filters')?.addEventListener('click', () => {
        applyFiltersAndSearch();
    });
});