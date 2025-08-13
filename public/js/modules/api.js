// Arquivo: /js/modules/api.js
import { CONFIG } from './config.js';

// Função auxiliar genérica para todas as chamadas fetch
async function fetchData(endpoint, options = {}) {
    // Adiciona 'credentials: include' como padrão a todas as requisições
    const defaultOptions = {
        credentials: 'include'
    };
    
    // Mescla as opções padrão com as opções específicas da chamada
    const mergedOptions = { ...defaultOptions, ...options };
    mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };

    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, mergedOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Falha na comunicação com a API: ${response.statusText}`);
    }
    
    // Retorna null para respostas sem conteúdo, mas que são um sucesso
    if (response.status === 204 || (response.headers.get('content-length') === '0' && response.status !== 201)) { 
        return { message: 'Operação bem-sucedida.' }; 
    }
    
    return await response.json();
}

// --- Funções de Autenticação ---
export async function loginUser(username, password) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    };
    return fetchData('/login', options);
}

export async function logoutUser() {
    const options = { method: 'POST' };
    return fetchData('/logout', options);
}

// --- Funções do Dashboard ---
export function fetchApplicationYears() { return fetchData('/filtros/anos'); }
export function fetchEvaluationsByYear(year) { return fetchData(`/filtros/avaliacoes-por-ano?ano=${year}`); }
export function fetchSchools() { return fetchData('/filtros/escolas'); }
export function fetchGeneralFilters() { return fetchData('/filtros/gerais'); }
export function fetchDemographicFilters() { return fetchData('/filtros/demograficos'); }
export function fetchNiveisByEvaluation(evaluationId) { return fetchData(`/niveis-por-avaliacao?id_avaliacao=${evaluationId}`); }
export function fetchTurmas(idEscola, idEtapa) { return fetchData(`/turmas?id_escola=${idEscola}&id_etapa=${idEtapa}`); }
export function fetchDashboardData(params) { const endpoint = `/dados-dashboard?${params.toString()}`; return fetchData(endpoint); }

// --- Funções de Gestão de Alunos ---
export function searchAlunos(term = '') { return fetchData(`/alunos?busca=${encodeURIComponent(term)}`); }
export function createAluno(studentData) {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentData), };
    return fetchData('/alunos', options);
}
export function updateAluno(id, studentData) {
    const options = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentData), };
    return fetchData(`/alunos/${id}`, options);
}
export function deleteAluno(id) {
    const options = { method: 'DELETE', };
    return fetchData(`/alunos/${id}`, options);
}

// --- Funções de Gestão de Avaliações ---
export function getAvaliacoes() { return fetchData('/avaliacoes'); }
export function createAvaliacao(avaliacaoData) {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(avaliacaoData) };
    return fetchData('/avaliacoes', options);
}
export function deleteAvaliacao(id) {
    const options = { method: 'DELETE' };
    return fetchData(`/avaliacoes/${id}`, options);
}

// === NOVAS FUNÇÕES PARA EDIÇÃO DE AVALIAÇÕES ===
export function getAvaliacaoById(id) {
    return fetchData(`/avaliacoes/${id}`);
}
export function updateAvaliacao(id, avaliacaoData) {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avaliacaoData)
    };
    return fetchData(`/avaliacoes/${id}`, options);
}

export function getEscalaModelos() { return fetchData('/escalas'); }
export function getEscalaDetalhes(id) { return fetchData(`/escalas/${id}`); }

// --- Funções de Gestão de Usuários ---
export function getUsers() { return fetchData('/usuarios'); }
export function createUser(userData) {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) };
    return fetchData('/usuarios', options);
}
export function deleteUser(userId) {
    const options = { method: 'DELETE' };
    return fetchData(`/usuarios/${userId}`, options);
}
export function updateUserPassword(userId, password) {
    const options = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: password }) };
    return fetchData(`/usuarios/${userId}/password`, options);
}

// --- Funções de Lançamento de Resultados ---
export function createResultado(resultData) {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resultData) };
    return fetchData('/resultados', options);
}
export function deleteResultado(id) {
    const options = { method: 'DELETE' };
    return fetchData(`/resultados/${id}`, options);
}

// --- Funções do Histórico do Aluno ---
export function getStudentHistory(inep) { return fetchData(`/aluno/${inep}`); }