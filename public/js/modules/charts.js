// Arquivo: /js/modules/charts.js
// Responsável por desenhar e atualizar todos os gráficos.

import { LEVEL_STYLES } from './config.js';
import { toTitleCase } from './ui.js';

// Verificar se Chart.js está disponível
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

let currentChart = null;
let schoolPerformanceChart = null;

export function drawChart(data, evaluationName) {
    console.log('Iniciando drawChart com:', { evaluationName, dataLength: data?.length });
    
    // Destruir gráfico anterior se existir
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    
    // Verificar se há dados e avaliação selecionada
    if (!evaluationName || !data || data.length === 0) {
        console.log('Sem dados para o gráfico');
        
        // Esconder a seção de resumo se não houver dados
        const summarySection = document.getElementById('summary-section');
        if (summarySection) {
            summarySection.style.display = 'none';
        }
        return;
    }
    
    // Mostrar a seção de resumo
    const summarySection = document.getElementById('summary-section');
    if (summarySection) {
        summarySection.style.display = 'block';
    }
    
    // Atualizar título do gráfico
    const chartCardTitle = document.getElementById('chart-card-title');
    if (chartCardTitle) {
        chartCardTitle.textContent = `Distribuição - ${toTitleCase(evaluationName)}`;
    }

    // Contar os níveis
    const levelCounts = data.reduce((acc, row) => {
        const level = row.resultado || row['resultado'];
        if (level) {
            acc[level] = (acc[level] || 0) + 1;
        }
        return acc;
    }, {});

    console.log('Níveis contados:', levelCounts);

    // Preparar dados para o gráfico
    const labels = Object.keys(levelCounts).sort();
    const chartData = labels.map(label => levelCounts[label]);
    const backgroundColors = labels.map(label => LEVEL_STYLES[label]?.color || '#CCCCCC');
    
    // Tentar encontrar o canvas de diferentes formas
    let canvas = document.getElementById('fluenciaChart');
    
    if (!canvas) {
        console.error('Canvas fluenciaChart não encontrado pelo ID');
        // Tentar encontrar por querySelector
        canvas = document.querySelector('#chart-card canvas');
        if (!canvas) {
            console.error('Canvas não encontrado por querySelector');
            // Criar o canvas se não existir
            const chartCard = document.getElementById('chart-card');
            if (chartCard) {
                const cardBody = chartCard.querySelector('.card-body');
                if (cardBody) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'fluenciaChart';
                    cardBody.innerHTML = '';
                    cardBody.appendChild(canvas);
                    console.log('Canvas criado dinamicamente');
                }
            }
        }
    }
    
    if (!canvas) {
        console.error('Não foi possível criar ou encontrar o canvas');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Não foi possível obter o contexto 2D do canvas');
        return;
    }

    try {
        // Criar o gráfico
        currentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels.map(toTitleCase),
                datasets: [{
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const dataset = context.chart.data.datasets[0];
                                const sum = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value * 100) / sum).toFixed(1);
                                return `${label}: ${value} alunos (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value * 100 / sum).toFixed(1);
                            // Só mostrar label se for maior que 5%
                            return percentage > 5 ? `${percentage}%` : '';
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        textStrokeColor: '#000',
                        textStrokeWidth: 2
                    }
                }
            }
        });
        
        console.log('Gráfico de pizza criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar gráfico:', error);
    }
}

export function drawSchoolPerformanceChart(data, evaluationName) {
    console.log('Iniciando drawSchoolPerformanceChart');
    
    // Destruir gráfico anterior se existir
    if (schoolPerformanceChart) {
        schoolPerformanceChart.destroy();
        schoolPerformanceChart = null;
    }
    
    const section = document.getElementById('school-performance-section');
    
    // Verificar se há dados e avaliação selecionada
    if (!evaluationName || !data || data.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }
    
    // Mostrar a seção
    if (section) section.style.display = 'block';

    // Agrupar dados por escola e nível
    const schoolLevelCounts = data.reduce((acc, row) => {
        const school = row['ESCOLA'] || row['escola'];
        const level = row['resultado'] || row['resultado'];
        
        if (school && level) {
            if (!acc[school]) acc[school] = {};
            acc[school][level] = (acc[school][level] || 0) + 1;
        }
        return acc;
    }, {});

    const schools = Object.keys(schoolLevelCounts).slice(0, 10); // Limitar a 10 escolas
    const allLevels = [...new Set(data.map(r => r.resultado || r['resultado']))].filter(Boolean).sort();

    // Criar datasets para cada nível
    const datasets = allLevels.map(level => ({
        label: toTitleCase(level),
        data: schools.map(school => {
            const total = Object.values(schoolLevelCounts[school]).reduce((a, b) => a + b, 0);
            const count = schoolLevelCounts[school][level] || 0;
            return total > 0 ? (count / total) * 100 : 0;
        }),
        rawCounts: schools.map(school => schoolLevelCounts[school][level] || 0),
        backgroundColor: LEVEL_STYLES[level]?.color || '#CCCCCC'
    }));

    // Obter contexto do canvas
    let canvas = document.getElementById('schoolPerformanceChart');
    
    if (!canvas) {
        console.error('Canvas schoolPerformanceChart não encontrado');
        // Tentar criar o canvas
        const section = document.getElementById('school-performance-section');
        if (section) {
            const container = section.querySelector('.chart-container');
            if (container) {
                canvas = document.createElement('canvas');
                canvas.id = 'schoolPerformanceChart';
                container.innerHTML = '';
                container.appendChild(canvas);
                console.log('Canvas de escolas criado dinamicamente');
            }
        }
    }
    
    if (!canvas) {
        console.error('Não foi possível criar o canvas de escolas');
        return;
    }
    
    const ctx = canvas.getContext('2d');

    try {
        // Criar o gráfico de barras empilhadas
        schoolPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: { 
                labels: schools.map(s => toTitleCase(s).substring(0, 30) + (s.length > 30 ? '...' : '')), 
                datasets: datasets 
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    x: { 
                        stacked: true, 
                        max: 100,
                        title: {
                            display: true,
                            text: 'Porcentagem (%)'
                        }
                    }, 
                    y: { 
                        stacked: true,
                        ticks: {
                            autoSkip: false
                        }
                    } 
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataset = context.dataset;
                                const label = dataset.label || '';
                                const rawCount = dataset.rawCounts[context.dataIndex];
                                const percentage = context.parsed.x.toFixed(1);
                                return `${label}: ${rawCount} aluno(s) (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        display: function(context) {
                            // Só mostrar se for maior que 10%
                            return context.dataset.data[context.dataIndex] > 10;
                        },
                        formatter: (value) => `${value.toFixed(0)}%`,
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 10
                        },
                        textStrokeColor: '#000',
                        textStrokeWidth: 1
                    }
                }
            }
        });
        
        console.log('Gráfico de escolas criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar gráfico de escolas:', error);
    }
}

// Função auxiliar para limpar os gráficos
export function clearCharts() {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    
    if (schoolPerformanceChart) {
        schoolPerformanceChart.destroy();
        schoolPerformanceChart = null;
    }
    
    // Esconder as seções
    const summarySection = document.getElementById('summary-section');
    const schoolSection = document.getElementById('school-performance-section');
    
    if (summarySection) summarySection.style.display = 'none';
    if (schoolSection) schoolSection.style.display = 'none';
}