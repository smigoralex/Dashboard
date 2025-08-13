// Arquivo: /js/modules/dom.js
// Centraliza a seleção de todos os elementos do DOM.

export const elements = { 
    // Filtros principais
    applicationYearFilter: document.getElementById('application-year-filter'),
    evaluationFilterContainer: document.getElementById('evaluation-filter-container'),
    evaluationFilter: document.getElementById('evaluation-filter'),
    
    // Filtros de localização
    schoolFilter: document.getElementById('school-filter'),
    yearFilter: document.getElementById('year-filter'),
    turmaFilter: document.getElementById('turma-filter'),
    
    // Filtros demográficos
    levelFilterGroup: document.getElementById('level-filter-group'), 
    levelFilter: document.getElementById('level-filter'), 
    nseFilterGroup: document.getElementById('nse-filter-group'),
    nseFilter: document.getElementById('nse-filter'), 
    corRacaFilterGroup: document.getElementById('cor-raca-filter-group'),
    corRacaFilter: document.getElementById('cor-raca-filter'), 
    inclusaoFilterGroup: document.getElementById('inclusao-filter-group'),
    inclusaoFilter: document.getElementById('inclusao-filter'), 
    transporteFilterGroup: document.getElementById('transporte-filter-group'),
    transporteFilter: document.getElementById('transporte-filter'), 
    
    // Botões
    clearFiltersButton: document.getElementById('clear-filters'), 
    applyFiltersButton: document.getElementById('apply-filters'),
    
    // Tabela e controles
    dataTableContainer: document.getElementById('data-table-container'),
    paginationControls: document.getElementById('pagination-controls'), 
    studentSearch: document.getElementById('student-search'), 
    rowsPerPageSelect: document.getElementById('rows-per-page'),
    
    // Theme
    themeToggle: document.getElementById('theme-switch'), 
    
    // Seções
    summarySection: document.getElementById('summary-section'), 
    schoolPerformanceSection: document.getElementById('school-performance-section'), 
    
    // Cards de resumo
    totalCardContent: document.getElementById('total-card-content'), 
    distCardContent: document.getElementById('dist-card-content'), 
    chartCardTitle: document.getElementById('chart-card-title'),
    
    // Canvas dos gráficos
    fluenciaChart: document.getElementById('fluenciaChart'),
    schoolPerformanceChart: document.getElementById('schoolPerformanceChart'),
    
    // Outros elementos
    topScrollContainer: document.getElementById('top-scroll-container'), 
    topScrollBar: document.getElementById('top-scroll-bar')
};