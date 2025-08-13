// Arquivo: /js/student_script.js (Modularizado com lógica condicional correta)

import * as api from './modules/api.js';
import { LEVEL_SCORES, LEVEL_STYLES } from './modules/config.js';
import { toTitleCase } from './modules/ui.js';

// Variáveis globais
let studentData = null;
let progressionChart = null;
let isUserLoggedIn = false; // Guarda o status do login

const elements = { 
    studentName: document.getElementById('student-name'),
    studentSchool: document.getElementById('student-school'),
    studentYear: document.getElementById('student-year'),
    studentTurma: document.getElementById('student-turma'),
    historyTableContainer: document.getElementById('history-table-container'),
    mainContent: document.getElementById('main-content'),
    errorMessage: document.getElementById('error-message'),
    errorDetails: document.getElementById('error-details'),
    areaFilter: document.getElementById('area-filter'),
    totalEvaluations: document.getElementById('total-evaluations'),
    improvementTrend: document.getElementById('improvement-trend'),
    totalEvaluationsLabel: document.getElementById('total-evaluations-label'),
    improvementTrendLabel: document.getElementById('improvement-trend-label'),
};

function getLevelClassName(levelValue) {
    if (!levelValue) return 'level-sem-dados';
    const style = LEVEL_STYLES[levelValue.trim()];
    return style ? `level-default ${style.className}` : 'level-sem-dados';
}

function showError(message) {
    if (elements.mainContent) elements.mainContent.style.display = 'none';
    if (elements.errorDetails) elements.errorDetails.textContent = message;
    if (elements.errorMessage) elements.errorMessage.style.display = 'block';
}

// Função de verificação "silenciosa" que NÃO redireciona
async function checkLoginStatus() {
    try {
        // Usando fetch direto para evitar dependências complexas com o módulo de API nesta fase
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();
        isUserLoggedIn = data.loggedIn;
    } catch (error) {
        isUserLoggedIn = false;
        console.error("Não foi possível verificar o status de login, continuando como visitante.");
    }
}

async function loadAndDisplayStudentHistory(inep) {
    try {
        studentData = await api.getStudentHistory(inep);
        updateStudentInfo(studentData.dadosCadastrais, studentData.historicoResultados);
        populateAreaFilter(studentData.historicoResultados);
        updateVisualizations();
    } catch (error) {
        showError(error.message);
    }
}

function updateStudentInfo(dadosCadastrais, historico) {
    if (!dadosCadastrais) return;
    const nomeAluno = toTitleCase(dadosCadastrais.nome_aluno || 'Aluno');
    elements.studentName.textContent = nomeAluno;
    document.title = `Histórico de ${nomeAluno}`;
    const registroMaisRecente = historico?.length > 0 ? historico[historico.length - 1] : null;
    if (registroMaisRecente) {
        elements.studentSchool.textContent = toTitleCase(registroMaisRecente.nome_escola || 'Não informado');
        elements.studentYear.textContent = toTitleCase(registroMaisRecente.nome_etapa || 'Não informado');
        elements.studentTurma.textContent = toTitleCase(registroMaisRecente.nome_turma || 'Não informado');
    }
}

function populateAreaFilter(historico) {
    elements.areaFilter.innerHTML = '<option value="todas">Todas as Áreas</option>';
    const areas = [...new Set(historico.map(item => item.etapa_de_conhecimento))];
    areas.sort().forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = toTitleCase(area);
        elements.areaFilter.appendChild(option);
    });
}

function updateVisualizations() {
    const selectedArea = elements.areaFilter.value;
    const historicoCompleto = studentData.historicoResultados || [];
    const filteredHistory = selectedArea === 'todas'
        ? historicoCompleto
        : historicoCompleto.filter(item => item.etapa_de_conhecimento === selectedArea);
    
    renderHistoryTable(filteredHistory, isUserLoggedIn);
    drawProgressionChart(filteredHistory, selectedArea);
    updateSummaryCards(filteredHistory, selectedArea);
}

function updateSummaryCards(historico, selectedArea) {
    const areaText = selectedArea === 'todas' ? 'Geral' : `em ${toTitleCase(selectedArea)}`;
    elements.totalEvaluationsLabel.textContent = `Total de Avaliações (${areaText})`;
    elements.improvementTrendLabel.textContent = `Tendência (${areaText})`;
    elements.totalEvaluations.textContent = historico.length;
    elements.improvementTrend.innerHTML = calculateImprovementTrend(historico);
}

function calculateImprovementTrend(historico) {
    const scoredResults = historico.map(item => ({ year: item.ano_aplicacao, score: LEVEL_SCORES[item.resultado] || 0 })).filter(item => item.score > 0);
    if (scoredResults.length < 2) return 'Insuficiente';
    const firstYear = Math.min(...scoredResults.map(r => r.year));
    const lastYear = Math.max(...scoredResults.map(r => r.year));
    if (firstYear === lastYear) return 'Insuficiente';
    const firstYearScores = scoredResults.filter(r => r.year === firstYear).map(r => r.score);
    const lastYearScores = scoredResults.filter(r => r.year === lastYear).map(r => r.score);
    const firstAvg = firstYearScores.reduce((a, b) => a + b, 0) / firstYearScores.length;
    const lastAvg = lastYearScores.reduce((a, b) => a + b, 0) / lastYearScores.length;
    if (lastAvg > firstAvg) return 'Melhorando ↗️';
    if (lastAvg < firstAvg) return 'Declinando ↘️';
    return 'Estável ➡️';
}

function renderHistoryTable(historico, loggedIn) {
    if (!historico || historico.length === 0) {
        elements.historyTableContainer.innerHTML = `<div class="info-message"><span>📭</span> Não há avaliações para a área selecionada.</div>`;
        return;
    }
    
    let tableHTML = `<table class="history-table"><thead><tr><th>Ano</th><th>Avaliação</th><th>Área</th><th>Etapa</th><th>Turma</th><th>Resultado</th>`;
    if (loggedIn) {
        tableHTML += `<th>Ações</th>`;
    }
    tableHTML += `</tr></thead><tbody>`;

    historico.forEach(item => {
        const levelClass = getLevelClassName(item.resultado);
        tableHTML += `<tr>
            <td>${item.ano_aplicacao || '-'}</td>
            <td>${toTitleCase(item.nome_avaliacao) || '-'}</td>
            <td>${toTitleCase(item.etapa_de_conhecimento) || '-'}</td>
            <td>${toTitleCase(item.nome_etapa) || '-'}</td>
            <td>${toTitleCase(item.nome_turma) || '-'}</td>
            <td class="${levelClass}">${toTitleCase(item.resultado) || '-'}</td>`;
        
        if (loggedIn) {
            tableHTML += `<td class="actions-cell"><button class="button delete-btn" data-id="${item.id_resultado}">Excluir</button></td>`;
        }
        tableHTML += `</tr>`;
    });
    tableHTML += `</tbody></table>`;
    elements.historyTableContainer.innerHTML = tableHTML;
}

function drawProgressionChart(historico, selectedArea) {
    if (progressionChart) { progressionChart.destroy(); }
    const ctx = document.getElementById('progression-chart')?.getContext('2d');
    if (!ctx || !historico || historico.length === 0) return;
    
    const chartData = historico.map(item => ({ 
        x: `${item.nome_avaliacao}`, 
        y: LEVEL_SCORES[item.resultado] || 0, 
        label: item.resultado 
    })).filter(item => item.y > 0);
    if (chartData.length === 0) { ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); return; }
    
    const scoreToLabelMap = {};
    chartData.forEach(d => { scoreToLabelMap[d.y] = d.label; });
    const labels = chartData.map(d => d.x.replace(/Avaliação /i, '').replace(/ de /i, '/ '));
    const dataPoints = chartData.map(d => d.y);
    const maxScore = Math.max(...dataPoints);
    
    progressionChart = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: `Progressão em ${toTitleCase(selectedArea)}`, data: dataPoints, borderColor: '#0096C7', backgroundColor: 'rgba(0, 150, 199, 0.2)', fill: true, tension: 0.1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: maxScore + 1, ticks: { stepSize: 1, callback: function(value) { return scoreToLabelMap[value] ? toTitleCase(scoreToLabelMap[value]) : ''; } } } }, plugins: { tooltip: { callbacks: { label: function(context) { const originalLabel = chartData[context.dataIndex]?.label || ''; return `Resultado: ${toTitleCase(originalLabel)}`; } } } } } });
}

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    // Primeiro, verifica silenciosamente se o usuário está logado
    await checkLoginStatus();

    const params = new URLSearchParams(window.location.search);
    const inep = params.get('inep');
    if (!inep) {
        showError("Nenhum INEP de aluno foi fornecido na URL.");
        return;
    }
    
    loadAndDisplayStudentHistory(inep);
    
    elements.areaFilter.addEventListener('change', updateVisualizations);

    elements.historyTableContainer.addEventListener('click', async (e) => {
        const target = e.target.closest('.delete-btn');
        if (target && isUserLoggedIn) {
            const resultadoId = target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este resultado? Esta ação não pode ser desfeita.')) {
                try {
                    await api.deleteResultado(resultadoId);
                    alert('Resultado excluído com sucesso.');
                    loadAndDisplayStudentHistory(inep); 
                } catch (error) {
                    alert(`Erro ao excluir resultado: ${error.message}`);
                }
            }
        }
    });
});