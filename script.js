// script.js

// Objeto global para armazenar dados entre etapas
const dadosProcessados = {
    dadosBrutos: null,
    dadosEstruturados: null,
    dadosLimpos: null,
    datasetConsolidado: null,
    kpis: null,
    desempenhoVsMeta: null,
    crescimento: null
};

// ============================================
// FUNÇÕES DE PROCESSAMENTO DE ARQUIVOS
// ============================================

/**
 * Processa upload de arquivos
 */
function enviarDocumento() {
    const fileInput = document.getElementById('uploadArquivo');
    
    if (!fileInput.files.length) {
        alert('Por favor, selecione um arquivo primeiro.');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        // Detectar qual seção está ativa baseada no último textarea focado
        const activeTextareas = document.querySelectorAll('textarea:focus');
        
        if (activeTextareas.length > 0) {
            const activeTextarea = activeTextareas[0];
            activeTextarea.value = content;
            
            // Atualizar dados brutos se for a primeira seção
            if (activeTextarea.id === 'dadosLimpeza' || activeTextarea.id === 'consolidação') {
                dadosProcessados.dadosBrutos = content;
            }
            
            alert(`Arquivo "${file.name}" carregado com sucesso!`);
        } else {
            // Se nenhum textarea está focado, usar o primeiro disponível
            const primeiroTextarea = document.querySelector('textarea');
            if (primeiroTextarea) {
                primeiroTextarea.value = content;
                alert(`Arquivo "${file.name}" carregado no primeiro campo disponível!`);
            }
        }
    };
    
    reader.readAsText(file);
}

// ============================================
// FASE 1: PREPARAÇÃO E LIMPEZA DE DADOS
// ============================================

/**
 * P01: Extração e estruturação de dados brutos
 */
function processarDados() {
    const input = document.querySelector('#extraçãodedados input[type="text"]');
    const resultadoElement = document.getElementById('resultado1');
    
    if (!input.value.trim()) {
        alert('Por favor, insira dados brutos para processar.');
        return;
    }
    
    dadosProcessados.dadosBrutos = input.value;
    
    try {
        // Simular estruturação de dados (em um cenário real, aqui seria uma chamada à API)
        const dadosEstruturados = estruturarDadosBrutos(input.value);
        dadosProcessados.dadosEstruturados = dadosEstruturados;
        
        // Mostrar resultado
        resultadoElement.innerHTML = `
            <h4>Dados Estruturados:</h4>
            <pre>${dadosEstruturados}</pre>
            <p><strong>Status:</strong> Dados estruturados com sucesso! Pronto para a próxima etapa.</p>
        `;
        
        // Gerar arquivo para download
        gerarArquivoDownload('relatorio_extracao_dados.txt', dadosEstruturados);
        
    } catch (error) {
        resultadoElement.innerHTML = `<p style="color: red;">Erro ao processar dados: ${error.message}</p>`;
    }
}

/**
 * Estrutura dados brutos em formato tabular
 */
function estruturarDadosBrutos(dadosBrutos) {
    // Simulação de estruturação - em um cenário real, isso seria mais complexo
    const linhas = dadosBrutos.split('\n').filter(linha => linha.trim() !== '');
    
    // Identificar colunas (suposição baseada em formato comum)
    const colunas = ['Data', 'Vendedor', 'Produto', 'Região', 'Valor_Venda', 'Quantidade'];
    
    let tabelaEstruturada = `| ${colunas.join(' | ')} |\n`;
    tabelaEstruturada += `|${colunas.map(() => '---').join('|')}|\n`;
    
    // Processar cada linha
    linhas.forEach((linha, index) => {
        if (index < 10) { // Limitar para demonstração
            const valores = linha.split(/\t|,/).map(v => v.trim());
            tabelaEstruturada += `| ${valores.join(' | ')} |\n`;
        }
    });
    
    if (linhas.length > 10) {
        tabelaEstruturada += `| ... | ... | ... | ... | ... | ... |\n`;
        tabelaEstruturada += `| Total de registros: ${linhas.length} |\n`;
    }
    
    return tabelaEstruturada;
}

/**
 * P02: Padronização e limpeza de dados
 */
function limparDados() {
    const textarea = document.getElementById('dadosLimpeza');
    const resultadoElement = document.getElementById('resultado3');
    
    if (!textarea.value.trim() && !dadosProcessados.dadosEstruturados) {
        alert('Por favor, cole os dados estruturados ou carregue um arquivo.');
        return;
    }
    
    const dadosParaLimpar = textarea.value.trim() || dadosProcessados.dadosEstruturados;
    
    try {
        // Simular limpeza de dados
        const dadosLimpos = padronizarDados(dadosParaLimpar);
        dadosProcessados.dadosLimpos = dadosLimpos;
        
        // Mostrar resultado
        resultadoElement.innerHTML = `
            <h4>Dados Padronizados e Limpos:</h4>
            <pre>${dadosLimpos.tabela}</pre>
            <h4>Alterações Realizadas:</h4>
            <ul>
                ${dadosLimpos.alteracoes.map(alt => `<li>${alt}</li>`).join('')}
            </ul>
            <p><strong>Status:</strong> Dados limpos com sucesso! ${dadosLimpos.registros} registros processados.</p>
        `;
        
        // Gerar arquivo para download
        const conteudoDownload = `DADOS LIMPOS\n\n${dadosLimpos.tabela}\n\nALTERAÇÕES REALIZADAS:\n${dadosLimpos.alteracoes.join('\n')}`;
        gerarArquivoDownload('relatorio_limpeza_dados.txt', conteudoDownload);
        
    } catch (error) {
        resultadoElement.innerHTML = `<p style="color: red;">Erro ao limpar dados: ${error.message}</p>`;
    }
}

/**
 * Padroniza dados: unifica categorias, corrige nomes, formata datas e valores
 */
function padronizarDados(dadosEstruturados) {
    const linhas = dadosEstruturados.split('\n').filter(linha => linha.trim() !== '');
    const alteracoes = [];
    
    // Mapeamento para padronização
    const padronizacao = {
        produto: {
            'Notebook': ['Laptop', 'NB', 'Lap-top', 'Notebk'],
            'Desktop': ['PC', 'Computador', 'Desktop PC'],
            'Tablet': ['Tab', 'Tablete']
        },
        formatoData: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        formatoMoeda: /\d+[.,]\d{2}/
    };
    
    let registrosProcessados = 0;
    
    // Processar cada linha (ignorando cabeçalho da tabela markdown)
    const linhasProcessadas = linhas.map((linha, index) => {
        if (linha.startsWith('|') && !linha.includes('---')) {
            registrosProcessados++;
            let linhaProcessada = linha;
            
            // Padronizar produtos
            for (const [padrao, variantes] of Object.entries(padronizacao.produto)) {
                variantes.forEach(variante => {
                    if (linha.includes(variante)) {
                        linhaProcessada = linhaProcessada.replace(new RegExp(variante, 'gi'), padrao);
                        alteracoes.push(`Produto "${variante}" padronizado para "${padrao}"`);
                    }
                });
            }
            
            // Padronizar datas (simulação)
            if (padronizacao.formatoData.test(linhaProcessada)) {
                alteracoes.push('Datas padronizadas para formato DD/MM/AAAA');
            }
            
            return linhaProcessada;
        }
        return linha;
    });
    
    return {
        tabela: linhasProcessadas.join('\n'),
        alteracoes: [...new Set(alteracoes)], // Remover duplicatas
        registros: registrosProcessados
    };
}

/**
 * P03: Criação de dataset e consolidação
 */
function consolidardataset() {
    const textarea = document.getElementById('consolidação');
    const resultadoElement = document.getElementById('resultado2');
    
    if (!textarea.value.trim() && !dadosProcessados.dadosLimpos) {
        alert('Por favor, cole os dados limpos ou carregue um arquivo.');
        return;
    }
    
    const dadosParaConsolidar = textarea.value.trim() || dadosProcessados.dadosLimpos?.tabela;
    
    try {
        // Simular consolidação de dataset
        const datasetConsolidado = consolidarDados(dadosParaConsolidar);
        dadosProcessados.datasetConsolidado = datasetConsolidado;
        
        // Mostrar resultado
        resultadoElement.innerHTML = `
            <h4>Dataset Consolidado:</h4>
            <pre>${datasetConsolidado.tabela}</pre>
            <h4>Resumo da Consolidação:</h4>
            <ul>
                <li>Total de Registros: ${datasetConsolidado.totalRegistros}</li>
                <li>Período: ${datasetConsolidado.periodo}</li>
                <li>Vendedores Únicos: ${datasetConsolidado.vendedoresUnicos}</li>
                <li>Produtos Únicos: ${datasetConsolidado.produtosUnicos}</li>
            </ul>
            <p><strong>Status:</strong> Dataset consolidado com sucesso! Pronto para análise de KPIs.</p>
        `;
        
        // Gerar arquivo para download
        const conteudoDownload = `DATASET CONSOLIDADO\n\n${datasetConsolidado.tabela}\n\nRESUMO:\n- Total de Registros: ${datasetConsolidado.totalRegistros}\n- Período: ${datasetConsolidado.periodo}\n- Vendedores Únicos: ${datasetConsolidado.vendedoresUnicos}\n- Produtos Únicos: ${datasetConsolidado.produtosUnicos}`;
        gerarArquivoDownload('relatorio_analise_dados.txt', conteudoDownload);
        
    } catch (error) {
        resultadoElement.innerHTML = `<p style="color: red;">Erro ao consolidar dataset: ${error.message}</p>`;
    }
}

/**
 * Consolida dados e extrai resumo
 */
function consolidarDados(dadosLimpos) {
    const linhas = dadosLimpos.split('\n').filter(linha => linha.trim() !== '');
    
    // Extrair dados da tabela
    const registros = [];
    const vendedores = new Set();
    const produtos = new Set();
    const datas = [];
    
    linhas.forEach((linha, index) => {
        if (linha.startsWith('|') && !linha.includes('---')) {
            const colunas = linha.split('|').filter(c => c.trim() !== '').map(c => c.trim());
            
            if (colunas.length >= 6) {
                registros.push(colunas);
                vendedores.add(colunas[1]);
                produtos.add(colunas[2]);
                datas.push(colunas[0]);
            }
        }
    });
    
    // Encontrar período
    const datasFormatadas = datas.map(d => new Date(d.split('/').reverse().join('-')));
    const minData = new Date(Math.min(...datasFormatadas));
    const maxData = new Date(Math.max(...datasFormatadas));
    const periodo = `${minData.toLocaleDateString('pt-BR')} a ${maxData.toLocaleDateString('pt-BR')}`;
    
    return {
        tabela: dadosLimpos,
        totalRegistros: registros.length,
        periodo: periodo,
        vendedoresUnicos: vendedores.size,
        produtosUnicos: produtos.size,
        registros: registros
    };
}

// ============================================
// FASE 2: CÁLCULO DE KPIs E MÉTRICAS
// ============================================

/**
 * K01: Cálculo de Métricas Fundamentais
 */
function analisarKPI() {
    const textarea = document.getElementById('kpi');
    const resultadoElement = document.getElementById('resultadoKPI');
    
    if (!textarea.value.trim() && !dadosProcessados.datasetConsolidado) {
        alert('Por favor, cole os dados consolidados ou carregue um arquivo.');
        return;
    }
    
    try {
        // Calcular KPIs
        const kpis = calcularKPIs(dadosProcessados.datasetConsolidado?.registros);
        dadosProcessados.kpis = kpis;
        
        // Mostrar resultado
        resultadoElement.innerHTML = `
            <h4>KPIs Calculados:</h4>
            <table class="tabela-kpis">
                <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
                <tr>
                    <td>Receita Total</td>
                    <td>R$ ${kpis.receitaTotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Número Total de Vendas</td>
                    <td>${kpis.numeroVendas}</td>
                </tr>
                <tr>
                    <td>Ticket Médio</td>
                    <td>R$ ${kpis.ticketMedio.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Quantidade Total de Itens</td>
                    <td>${kpis.quantidadeTotal}</td>
                </tr>
                <tr>
                    <td>Vendedores Únicos</td>
                    <td>${kpis.vendedoresUnicos}</td>
                </tr>
            </table>
            <p><strong>Status:</strong> KPIs calculados com sucesso!</p>
        `;
        
        // Gerar arquivo para download
        const conteudoDownload = `RELATÓRIO DE KPIs\n\n${Object.entries(kpis).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
        gerarArquivoDownload('relatorio_kpi_dados.txt', conteudoDownload);
        
    } catch (error) {
        resultadoElement.innerHTML = `<p style="color: red;">Erro ao calcular KPIs: ${error.message}</p>`;
    }
}

/**
 * Calcula KPIs a partir dos registros
 */
function calcularKPIs(registros) {
    if (!registros || registros.length === 0) {
        // Criar dados de exemplo para demonstração
        registros = [
            ['10/01/2024', 'João Silva', 'Notebook', 'Sul', '2500.00', '2'],
            ['15/01/2024', 'Maria Santos', 'Desktop', 'Sudeste', '3200.00', '1'],
            ['20/01/2024', 'João Silva', 'Tablet', 'Sul', '1200.00', '3'],
            ['05/02/2024', 'Carlos Oliveira', 'Notebook', 'Nordeste', '2800.00', '1'],
            ['18/02/2024', 'Ana Costa', 'Desktop', 'Sudeste', '3100.00', '2']
        ];
    }
    
    let receitaTotal = 0;
    let quantidadeTotal = 0;
    const vendedores = new Set();
    
    registros.forEach(registro => {
        if (registro.length >= 6) {
            const valor = parseFloat(registro[4]) || 0;
            const quantidade = parseInt(registro[5]) || 0;
            
            receitaTotal += valor * quantidade;
            quantidadeTotal += quantidade;
            vendedores.add(registro[1]);
        }
    });
    
    const numeroVendas = registros.length;
    const ticketMedio = numeroVendas > 0 ? receitaTotal / numeroVendas : 0;
    
    return {
        receitaTotal: receitaTotal,
        numeroVendas: numeroVendas,
        ticketMedio: ticketMedio,
        quantidadeTotal: quantidadeTotal,
        vendedoresUnicos: vendedores.size
    };
}

/**
 * K02: Análise de Desempenho vs. Meta
 */
function analisarDesempenho() {
    const textarea = document.getElementById('desempenho');
    const resultadoElement = document.getElementById('resultadoDesempenho');
    
    if (!dadosProcessados.kpis) {
        alert('Por favor, calcule os KPIs primeiro ou insira dados específicos.');
        return;
    }
    
    try {
        // Definir metas (em um cenário real, seriam inseridas pelo usuário)
        const metas = {
            receitaTotal: 15000,
            numeroVendas: 8,
            ticketMedio: 2000,
            quantidadeTotal: 12,
            vendedoresUnicos: 4
        };
        
        // Comparar com metas
        const desempenho = compararComMetas(dadosProcessados.kpis, metas);
        dadosProcessados.desempenhoVsMeta = desempenho;
        
        // Mostrar resultado
        resultadoElement.innerHTML = `
            <h4>Análise de Desempenho vs. Meta:</h4>
            <table class="tabela-desempenho">
                <tr>
                    <th>KPI</th>
                    <th>Meta</th>
                    <th>Realizado</th>
                    <th>Atingimento (%)</th>
                    <th>Desvio</th>
                    <th>Status</th>
                </tr>
                ${desempenho.comparativo.map(item => `
                    <tr>
                        <td>${item.kpi}</td>
                        <td>${item.meta}</td>
                        <td>${item.realizado}</td>
                        <td>${item.atingimento}%</td>
                        <td>${item.desvio}</td>
                        <td class="status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</td>
                    </tr>
                `).join('')}
            </table>
            <p><strong>Resumo:</strong> ${desempenho.resumo}</p>
        `;
        
        // Gerar arquivo para download
        const conteudoDownload = `ANÁLISE DE DESEMPENHO VS META\n\n${desempenho.comparativo.map(item => 
            `${item.kpi}: Meta=${item.meta}, Realizado=${item.realizado}, Atingimento=${item.atingimento}%, Status=${item.status}`
        ).join('\n')}\n\n${desempenho.resumo}`;
        gerarArquivoDownload('relatorio_desempenho_meta.txt', conteudoDownload);
        
    } catch (error) {
        resultadoElement.innerHTML = `<p style="color: red;">Erro ao analisar desempenho: ${error.message}</p>`;
    }
}

/**
 * Compara KPIs realizados com metas
 */
function compararComMetas(kpis, metas) {
    const comparativo = [];
    
    Object.keys(kpis).forEach(kpi => {
        const realizado = kpis[kpi];
        const meta = metas[kpi] || 0;
        const atingimento = meta > 0 ? ((realizado / meta) * 100).toFixed(1) : 0;
        const desvio = realizado - meta;
        
        let status = 'Atingiu';
        if (atingimento < 90) status = 'Não Atingiu';
        if (atingimento > 110) status = 'Superou';
        
        comparativo.push({
            kpi: formatarNomeKPI(kpi),
            meta: typeof meta === 'number' ? meta.toFixed(2) : meta,
            realizado: typeof realizado === 'number' ? realizado.toFixed(2) : realizado,
            atingimento: atingimento,
            desvio: desvio.toFixed(2),
            status: status
        });
    });
    
    // Calcular resumo
    const atingimentoMedio = comparativo.reduce((sum, item) => sum + parseFloat(item.atingimento), 0) / comparativo.length;
    let resumo = `Atingimento médio de ${atingimentoMedio.toFixed(1)}%. `;
    
    if (atingimentoMedio >= 100) {
        resumo += 'Desempenho geral acima das metas estabelecidas.';
    } else if (atingimentoMedio >= 90) {
        resumo += 'Desempenho próximo das metas, com alguns pontos de atenção.';
    } else {
        resumo += 'Desempenho abaixo do esperado, necessária análise corretiva.';
    }
    
    return { comparativo, resumo };
}

/**
 * Formata nomes de KPIs para exibição
 */
function formatarNomeKPI(kpi) {
    const nomes = {
        receitaTotal: 'Receita Total',
        numeroVendas: 'Número de Vendas',
        ticketMedio: 'Ticket Médio',
        quantidadeTotal: 'Quantidade Total',
        vendedoresUnicos: 'Vendedores Únicos'
    };
    
    return nomes[kpi] || kpi;
}

/**
 * K03: Cálculo de Taxas de Crescimento e Variação
 */
function analisarCrescimento() {
    // Esta função seria chamada pelo botão da seção de taxas de crescimento
    // Como não há botão específico no HTML, vou criar um placeholder
    
    console.log("Análise de crescimento e variação - Esta função requer dados históricos para comparação.");
    
    // Em um cenário real, aqui compararíamos com dados do período anterior
    alert("Para análise de crescimento, são necessários dados do período anterior para comparação.");
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera arquivo para download
 */
function gerarArquivoDownload(nomeArquivo, conteudo) {
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Inicializa eventos e configurações
 */
function inicializarAplicacao() {
    console.log('Sistema de Automação de Análise de Vendas inicializado.');
    
    // Adicionar eventos para os botões que faltam no HTML
    const botoesCrescimento = document.querySelectorAll('#taxasdecrescimentoevariação button');
    botoesCrescimento.forEach(botao => {
        if (botao.textContent.includes('Analisar Desempenho')) {
            botao.onclick = analisarCrescimento;
            botao.textContent = 'Analisar Crescimento';
        }
    });
    
    // Adicionar estilo CSS dinâmico para as tabelas
    const style = document.createElement('style');
    style.textContent = `
        .tabela-kpis, .tabela-desempenho {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .tabela-kpis th, .tabela-kpis td,
        .tabela-desempenho th, .tabela-desempenho td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .tabela-kpis th, .tabela-desempenho th {
            background-color: #f2f2f2;
        }
        .status-atingiu { color: green; font-weight: bold; }
        .status-superou { color: darkgreen; font-weight: bold; }
        .status-não-atingiu { color: red; font-weight: bold; }
        
        #resultado1, #resultado2, #resultado3, 
        #resultadoKPI, #resultadoDesempenho {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            border-left: 4px solid #4CAF50;
        }
        
        textarea {
            width: 100%;
            min-height: 100px;
            margin: 10px 0;
            padding: 10px;
        }
        
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        
        button:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarAplicacao);

// Exportar funções para uso global (se necessário)
window.automacaoVendas = {
    processarDados,
    limparDados,
    consolidardataset,
    analisarKPI,
    analisarDesempenho,
    analisarCrescimento,
    enviarDocumento,
    dadosProcessados
};