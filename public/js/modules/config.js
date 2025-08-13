// Arquivo: /js/modules/config.js
// Centraliza as constantes e configurações do dashboard.

// A palavra "export" permite que outras partes do código importem estas constantes.
export const CONFIG = {
    API_BASE_URL: '/api',
    ROWS_PER_PAGE: 15,
    DEBOUNCE_DELAY: 400,
    STUDENT_NAME_HEADER: 'nome_aluno'
};

export const LEVEL_STYLES = {
    'Pré Leitor 1': { color: '#B00020', className: 'level-pre-leitor-1' },
    'Pré Leitor 2': { color: '#C62828', className: 'level-pre-leitor-2' },
    'Pré Leitor 3': { color: '#E53935', className: 'level-pre-leitor-3' },
    'Pré Leitor 4': { color: '#F57C00', className: 'level-pre-leitor-4' },
    'Pré Leitor 5': { color: '#E65100', className: 'level-pre-leitor-5' },
    'Pré Leitor 6': { color: '#689F38', className: 'level-pre-leitor-6' },
    'Abaixo do Básico': { color: '#B00020', className: 'level-abaixo-do-basico' },
    'Básico': { color: '#F4C542', className: 'level-basico' },
    'Proficiente': { color: '#43A047', className: 'level-proficiente' },
    'Avançado': { color: '#2E7D32', className: 'level-avancado' },
    'Muito Baixo': { color: '#C62828', className: 'level-muito-baixo' },
    'Baixo': { color: '#EF6C00', className: 'level-baixo' },
    'Médio': { color: '#FBC02D', className: 'level-medio' },
    'Alto': { color: '#2E7D32', className: 'level-alto' },
    'Nível 1': { color: '#B71C1C', className: 'level-nivel-1' },
    'Nível 2': { color: '#F57C00', className: 'level-nivel-2' },
    'Nível 3': { color: '#FBC02D', className: 'level-nivel-3' },
    'Nível 4': { color: '#2E7D32', className: 'level-nivel-4' },
    'Leitor 1': { color: '#C62828', className: 'level-leitor-1' },
    'Leitor 2': { color: '#EF6C00', className: 'level-leitor-2' },
    'Leitor 3': { color: '#FDD835', className: 'level-leitor-3' },
    'Leitor 4': { color: '#43A047', className: 'level-leitor-4' },
    'Defasado': { color: '#D32F2F', className: 'level-defasado' },
    'Intermediário': { color: '#FFB300', className: 'level-intermediario' },
    'Adequado': { color: '#388E3C', className: 'level-adequado' },
    'Iniciante': { color: '#29B6F6', className: 'level-iniciante-blue-2' },
    'Fluente': { color: '#1E88E5', className: 'level-fluente-blue-2' }
};

// NOVA CONSTANTE ADICIONADA
export const LEVEL_SCORES = {
    'Pré Leitor 1': 1, 'Pré Leitor 2': 2, 'Pré Leitor 3': 3, 'Pré Leitor 4': 4, 'Pré Leitor 5': 5, 'Pré Leitor 6': 6,
    'Abaixo do Básico': 1, 'Básico': 2, 'Proficiente': 3, 'Avançado': 4,
    'Muito Baixo': 1, 'Baixo': 2, 'Médio': 3, 'Alto': 4,
    'Nível 1': 1, 'Nível 2': 2, 'Nível 3': 3, 'Nível 4': 4,
    'Leitor 1': 1, 'Leitor 2': 2, 'Leitor 3': 3, 'Leitor 4': 4,
    'Defasado': 1, 'Intermediário': 2, 'Adequado': 3,
    'Iniciante': 7, 'Fluente': 8,
};