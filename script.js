// Inicialização do localStorage
if (!localStorage.getItem('produtos')) {
    localStorage.setItem('produtos', JSON.stringify([]));
}
if (!localStorage.getItem('carrinho')) {
    localStorage.setItem('carrinho', JSON.stringify([]));
}

// Função para mostrar notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Background Canvas Animation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Partículas para o background
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = Array.from({ length: 100 }, () => new Particle());

function animate() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Função para salvar produto
function salvarProduto(event) {
    event.preventDefault();
    
    const categoria = document.getElementById('categoria').value;
    if (!categoria) {
        showNotification('Por favor, selecione uma categoria!', 'danger');
        return;
    }

    const id = document.getElementById('edit-id').value || Date.now().toString();
    const produto = {
        id: id,
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        imagem: document.getElementById('imagem').value,
        descricao: document.getElementById('descricao').value,
        categoria: categoria,
        dataCadastro: new Date().toISOString()
    };

    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    if (document.getElementById('edit-id').value) {
        const index = produtos.findIndex(p => p.id === id);
        produtos[index] = produto;
        showNotification('Produto atualizado com sucesso!');
    } else {
        produtos.push(produto);
        showNotification('Produto adicionado com sucesso!');
    }

    localStorage.setItem('produtos', JSON.stringify(produtos));
    document.getElementById('produto-form').reset();
    document.getElementById('edit-id').value = '';

    // Atualizar listas e estatísticas
    atualizarListaProdutos();
    atualizarListaProdutosAdmin();
    atualizarCarrosseisJogos();
    atualizarEstatisticasAdmin();
}

// Função para editar produto
function editarProduto(id) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === id);
    
    if (produto) {
        document.getElementById('edit-id').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('categoria').value = produto.categoria;
        document.getElementById('imagem').value = produto.imagem;
        document.getElementById('descricao').value = produto.descricao;
        
        // Scroll suave até o formulário
        document.getElementById('produto-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para deletar produto com SweetAlert
function deletarProduto(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Esta ação não poderá ser revertida!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#7f8c8d',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar',
        background: '#1a1a2e',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
            produtos = produtos.filter(produto => produto.id !== id);
            localStorage.setItem('produtos', JSON.stringify(produtos));
            
            atualizarListaProdutosAdmin();
            atualizarEstatisticasAdmin();
            showNotification('Produto removido com sucesso!', 'success');
        }
    });
}

// Função para inicializar a página admin
function initAdminPage() {
    console.log('Inicializando página admin...');
    atualizarListaProdutosAdmin();
    atualizarEstatisticasAdmin();
}

// Função específica para atualizar a lista no admin
function atualizarListaProdutosAdmin() {
    console.log('Atualizando lista de produtos admin...');
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produtosAdminLista = document.getElementById('produtos-admin-lista');
    
    if (!produtosAdminLista) {
        console.error('Container produtos-admin-lista não encontrado');
        return;
    }
    
    console.log(`Total de produtos: ${produtos.length}`);
    
    produtosAdminLista.innerHTML = produtos.map(produto => `
        <div class="admin-produto-card">
            <div class="produto-imagem">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <span class="categoria-tag ${produto.categoria.toUpperCase()}">
                    <i class="fas fa-tag"></i> 
                    ${produto.categoria.toUpperCase()}
                </span>
                <p class="descricao">${produto.descricao}</p>
                <div class="preco">
                    R$ ${produto.preco.toFixed(2)}
                </div>
                <div class="admin-buttons">
                    <button onclick="editarProduto('${produto.id}')" class="btn-primary">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="deletarProduto('${produto.id}')" class="btn-danger">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Função para atualizar a lista na página principal
function atualizarListaProdutos(produtosFiltrados) {
    const produtosLista = document.getElementById('produtos-lista');
    if (!produtosLista) return;

    // Se não receber produtos filtrados, usa todos os produtos
    const produtos = produtosFiltrados || JSON.parse(localStorage.getItem('produtos')) || [];
    
    produtosLista.innerHTML = produtos.map(produto => `
        <div class="produto-card">
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p class="categoria">${produto.categoria.toUpperCase()}</p>
                <p class="descricao">${produto.descricao}</p>
                <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
                <button onclick="adicionarAoCarrinho('${produto.id}')" class="btn-primary">
                    <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Função para filtrar produtos
function filtrarProdutos() {
    const categoria = document.getElementById('categoria-filtro').value;
    const precoFiltro = document.getElementById('preco-filtro').value;
    const pesquisa = document.getElementById('pesquisa').value.toLowerCase();
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

    // Array para guardar os filtros ativos
    let filtrosAtivos = [];

    // Filtrar por categoria
    if (categoria) {
        produtos = produtos.filter(p => p.categoria === categoria);
        const categoriaText = document.querySelector(`#categoria-filtro option[value="${categoria}"]`).text;
        filtrosAtivos.push(`Categoria: ${categoriaText}`);
    }

    // Filtrar por preço
    if (precoFiltro) {
        produtos = produtos.filter(p => {
            const preco = p.preco;
            switch (precoFiltro) {
                case '0-50':
                    filtrosAtivos.push('Preço: Até R$ 50');
                    return preco <= 50;
                case '50-100':
                    filtrosAtivos.push('Preço: R$ 50 - R$ 100');
                    return preco > 50 && preco <= 100;
                case '100-200':
                    filtrosAtivos.push('Preço: R$ 100 - R$ 200');
                    return preco > 100 && preco <= 200;
                case '200+':
                    filtrosAtivos.push('Preço: Acima de R$ 200');
                    return preco > 200;
                default:
                    return true;
            }
        });
    }

    // Filtrar por pesquisa
    if (pesquisa) {
        produtos = produtos.filter(p => 
            p.nome.toLowerCase().includes(pesquisa) ||
            p.descricao.toLowerCase().includes(pesquisa)
        );
        filtrosAtivos.push(`Pesquisa: "${pesquisa}"`);
    }

    // Atualizar a exibição dos filtros ativos
    atualizarFiltrosAtivos(filtrosAtivos);

    // Atualizar a exibição dos produtos
    atualizarListaProdutos(produtos);
    
    // Atualizar os carrosséis
    const recomendados = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-recomendados', recomendados);
    
    const maisVendidos = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-mais-vendidos', maisVendidos);
}

// Função para atualizar os filtros ativos
function atualizarFiltrosAtivos(filtros) {
    const filtrosContainer = document.getElementById('filtros-ativos');
    if (!filtrosContainer) return;

    if (filtros.length === 0) {
        filtrosContainer.innerHTML = '';
        filtrosContainer.style.display = 'none';
        return;
    }

    filtrosContainer.style.display = 'flex';
    filtrosContainer.innerHTML = `
        <div class="filtros-ativos-lista">
            ${filtros.map(filtro => `
                <span class="filtro-tag">
                    ${filtro}
                    <button onclick="limparFiltro('${filtro.split(':')[0].toLowerCase()}')" class="remover-filtro">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `).join('')}
            ${filtros.length > 0 ? `
                <button onclick="limparTodosFiltros()" class="limpar-filtros">
                    Limpar Todos
                </button>
            ` : ''}
        </div>
    `;
}

// Função para limpar um filtro específico
function limparFiltro(tipo) {
    switch (tipo) {
        case 'categoria':
            document.getElementById('categoria-filtro').value = '';
            break;
        case 'preço':
            document.getElementById('preco-filtro').value = '';
            break;
        case 'pesquisa':
            document.getElementById('pesquisa').value = '';
            break;
    }
    filtrarProdutos();
}

// Função para limpar todos os filtros
function limparTodosFiltros() {
    document.getElementById('categoria-filtro').value = '';
    document.getElementById('preco-filtro').value = '';
    document.getElementById('pesquisa').value = '';
    document.getElementById('ordenar-filtro').value = 'relevancia';
    filtrarProdutos();
}

// Função para filtrar por categoria
function filtrarPorCategoria(categoria) {
    // Atualiza o select de categoria
    document.getElementById('categoria-filtro').value = categoria;
    
    // Obtém todos os produtos
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    // Se categoria estiver vazia, mostra todos os jogos
    let produtosFiltrados = categoria ? produtos.filter(p => p.categoria === categoria) : produtos;
    
    // Atualiza a lista principal de produtos
    atualizarListaProdutos(produtosFiltrados);
    
    // Atualiza os carrosséis com os produtos filtrados
    const recomendados = [...produtosFiltrados].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-recomendados', recomendados);
    
    const maisVendidos = [...produtosFiltrados].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-mais-vendidos', maisVendidos);
    
    // Mostra a seção de produtos
    showSection('produtos');
}

// Função de pesquisa também atualizada
function pesquisarJogos() {
    filtrarProdutos();
}

// Função para ordenar produtos
function ordenarProdutos() {
    const ordenacao = document.getElementById('ordenar-filtro').value;
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    switch(ordenacao) {
        case 'preco-menor':
            produtos.sort((a, b) => a.preco - b.preco);
            break;
        case 'preco-maior':
            produtos.sort((a, b) => b.preco - a.preco);
            break;
        case 'nome':
            produtos.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        default:
            // Mantém a ordem original
            break;
    }
    
    // Atualizar tanto a lista quanto os carrosséis
    atualizarListaProdutos(produtos);
    
    const recomendados = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-recomendados', recomendados);
    
    const maisVendidos = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-mais-vendidos', maisVendidos);
}

// Atualizar estatísticas do admin
function atualizarEstatisticasAdmin() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    
    // Atualizar total de produtos
    const totalProdutos = produtos.length;
    document.getElementById('total-produtos').textContent = totalProdutos;
    
    // Calcular tendência (comparação com período anterior)
    const produtosAnteriores = totalProdutos - produtos.filter(p => {
        const dataAdd = new Date(p.dataCadastro);
        const hoje = new Date();
        const diffDias = Math.floor((hoje - dataAdd) / (1000 * 60 * 60 * 24));
        return diffDias <= 7; // Produtos adicionados na última semana
    }).length;
    
    const tendencia = produtosAnteriores === 0 ? 100 : 
        Math.round(((totalProdutos - produtosAnteriores) / produtosAnteriores) * 100);
    
    const trendElement = document.getElementById('produtos-trend');
    if (trendElement) {
        trendElement.textContent = `${tendencia}%`;
        trendElement.style.color = tendencia >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        
        // Atualizar ícone de tendência
        const trendIcon = trendElement.previousElementSibling;
        if (trendIcon) {
            trendIcon.className = tendencia >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            trendIcon.style.color = tendencia >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }
    }

    // Atualizar total de vendas e lucro
    const totalVendas = vendas.length;
    const lucroTotal = vendas.reduce((sum, venda) => sum + venda.total, 0);
    
    document.getElementById('total-vendas').textContent = totalVendas;
    document.getElementById('lucro-total').textContent = `R$ ${lucroTotal.toFixed(2)}`;
    
    // Atualizar total de usuários admin
    document.getElementById('total-usuarios').textContent = admins.length;
    document.getElementById('usuarios-ativos').textContent = admins.length; // Assumindo que todos estão ativos
}

// Função para navegar nos carrosséis
function navegarCarrossel(containerId, direcao) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scrollAmount = container.offsetWidth - 100; // Ajustado para melhor navegação
    const targetScroll = container.scrollLeft + (scrollAmount * direcao);
    
    container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
}

// Função para renderizar os carrosséis
function renderizarCarrosselJogos(containerId, jogos) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = jogos.map(jogo => `
        <div class="jogo-card">
            <img src="${jogo.imagem}" alt="${jogo.nome}">
            <div class="produto-info">
                <h3>${jogo.nome}</h3>
                <span class="categoria ${jogo.categoria.toUpperCase()}">
                    <i class="fas"></i>
                    ${jogo.categoria.toUpperCase()}
                </span>
                <p class="descricao">${jogo.descricao}</p>
                <div class="preco">${jogo.preco.toFixed(2)}</div>
                <button onclick="adicionarAoCarrinho('${jogo.id}')" class="btn-primary">
                    <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Função para inicializar produtos exemplo
function inicializarProdutosExemplo() {
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    if (produtos.length === 0) {
        produtos = [
            {
                id: '1',
                nome: 'God of War Ragnarök',
                preco: 299.99,
                imagem: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
                descricao: 'Continue a jornada de Kratos e Atreus nesta épica aventura nórdica.',
                categoria: 'acao',
                dataCadastro: new Date().toISOString()
            },
            {
                id: '2',
                nome: 'FIFA 24',
                preco: 299.99,
                imagem: 'https://image.api.playstation.com/vulcan/ap/rnd/202307/0710/60c686c802b85c6f5c1253b8ea0b88d0d5e5d4fa12424d37.png',
                descricao: 'O melhor simulador de futebol está de volta com novidades.',
                categoria: 'esporte',
                dataCadastro: new Date().toISOString()
            }
        ];
        localStorage.setItem('produtos', JSON.stringify(produtos));
        console.log('Produtos exemplo inicializados');
    }
    return produtos;
}

// Função para atualizar todos os carrosséis
function atualizarCarrosseisJogos() {
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    if (produtos.length === 0) {
        produtos = inicializarProdutosExemplo();
    }

    // Jogos Recomendados (aleatórios)
    const recomendados = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-recomendados', recomendados);
    
    // Mais Vendidos (por enquanto aleatórios também)
    const maisVendidos = [...produtos].sort(() => Math.random() - 0.5).slice(0, 5);
    renderizarCarrosselJogos('jogos-mais-vendidos', maisVendidos);
    
    // Atualizar lista principal
    atualizarListaProdutos(produtos);
}

// Variáveis para o carrossel principal
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const wrapper = document.querySelector('.carousel-wrapper');

// Função para navegar no carrossel principal
function navegarCarrosselPrincipal(direcao) {
    if (!wrapper) return;
    
    currentSlide = (currentSlide + direcao + slides.length) % slides.length;
    wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Função para rotação automática do carrossel principal
function autoRotateCarrossel() {
    navegarCarrosselPrincipal(1);
}

// Iniciar rotação automática
let carrosselInterval = setInterval(autoRotateCarrossel, 5000);

// Parar rotação quando o mouse está sobre o carrossel
document.querySelector('.carousel')?.addEventListener('mouseenter', () => {
    clearInterval(carrosselInterval);
});

// Retomar rotação quando o mouse sai do carrossel
document.querySelector('.carousel')?.addEventListener('mouseleave', () => {
    carrosselInterval = setInterval(autoRotateCarrossel, 5000);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Garantir que temos produtos no localStorage
    inicializarProdutosExemplo();
    
    // Atualizar todas as listas e carrosséis
    atualizarListaProdutos();
    atualizarListaProdutosAdmin();
    atualizarCarrosseisJogos();
    atualizarEstatisticasAdmin();
});

// Função para mostrar seção
function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove a classe active de todos os links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostra a seção selecionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
    
    // Adiciona a classe active ao link correspondente
    const activeLink = document.querySelector(`nav a[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Função para adicionar ao carrinho
function adicionarAoCarrinho(id) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === id);
    
    if (!produto) {
        showNotification('Produto não encontrado!', 'danger');
        return;
    }

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
        itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco;
        showNotification('Quantidade atualizada no carrinho!');
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1,
            subtotal: produto.preco
        });
        showNotification('Produto adicionado ao carrinho!');
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarContadorCarrinho();
}

// Função para atualizar o carrinho
function atualizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const carrinhoContainer = document.getElementById('carrinho-itens');
    const totalElement = document.getElementById('carrinho-total');
    
    if (!carrinhoContainer || !totalElement) return;

    carrinhoContainer.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="item-info">
                <h3>${item.nome}</h3>
                <div class="quantidade-controle">
                    <button onclick="alterarQuantidade('${item.id}', -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="alterarQuantidade('${item.id}', 1)">+</button>
                </div>
                <p class="preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
            </div>
            <button class="remover-item" onclick="removerDoCarrinho('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    totalElement.innerHTML = `
        <h3>Total: <span>R$ ${total.toFixed(2)}</span></h3>
        <button onclick="finalizarCompra()" class="btn-finalizar" ${carrinho.length === 0 ? 'disabled' : ''}>
            Finalizar Compra
        </button>
    `;
}

// Função para alterar quantidade
function alterarQuantidade(id, delta) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const item = carrinho.find(item => item.id === id);
    
    if (item) {
        item.quantidade = Math.max(1, item.quantidade + delta);
        item.subtotal = item.quantidade * item.preco;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarCarrinho();
        atualizarContadorCarrinho();
    }
}

// Função para remover do carrinho
function removerDoCarrinho(id) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarContadorCarrinho();
    showNotification('Item removido do carrinho!');
}

// Função para finalizar compra
function finalizarCompra() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        showNotification('Seu carrinho está vazio!', 'warning');
        return;
    }

    Swal.fire({
        title: 'Finalizar Compra',
        text: 'Deseja confirmar sua compra?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#00ff88',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, confirmar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Aqui você pode adicionar a lógica de processamento da compra
            localStorage.removeItem('carrinho');
            atualizarCarrinho();
            atualizarContadorCarrinho();
            showNotification('Compra realizada com sucesso!', 'success');
        }
    });
}

// Atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    const contador = document.getElementById('carrinho-contador');
    if (contador) {
        contador.textContent = total;
        if (total > 0) {
            contador.style.display = 'flex';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Inicializar carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    atualizarContadorCarrinho();
});

// Função para abrir o modal do carrinho
function abrirModalCarrinho() {
    const modalHtml = `
    <div class="modal-carrinho">
        <div class="modal-header">
            <h2>Seu Carrinho</h2>
            <button class="fechar-modal" onclick="Swal.close()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div id="modal-carrinho-itens"></div>
        <div id="modal-carrinho-total"></div>
    </div>
    `;

    Swal.fire({
        html: modalHtml,
        showConfirmButton: false,
        width: '600px',
        background: '#1a1a2e',
        customClass: {
            container: 'modal-carrinho-container',
            popup: 'modal-carrinho-popup'
        },
        didOpen: () => {
            atualizarModalCarrinho();
        }
    });
}

// Função para atualizar o modal do carrinho
function atualizarModalCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const carrinhoContainer = document.getElementById('modal-carrinho-itens');
    const totalElement = document.getElementById('modal-carrinho-total');
    
    if (!carrinhoContainer || !totalElement) return;

    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML = `
            <div class="carrinho-vazio">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        totalElement.innerHTML = '';
        return;
    }

    carrinhoContainer.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="item-info">
                <h3>${item.nome}</h3>
                <div class="quantidade-controle">
                    <button onclick="alterarQuantidadeModal('${item.id}', -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="alterarQuantidadeModal('${item.id}', 1)">+</button>
                </div>
                <p class="preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
            </div>
            <button class="remover-item" onclick="removerDoCarrinhoModal('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    totalElement.innerHTML = `
        <div class="total-info">
            <h3>Total: <span>R$ ${total.toFixed(2)}</span></h3>
            <button onclick="finalizarCompraModal()" class="btn-finalizar">
                Finalizar Compra
            </button>
        </div>
    `;
}

// Funções auxiliares para o modal
function alterarQuantidadeModal(id, delta) {
    alterarQuantidade(id, delta);
    atualizarModalCarrinho();
}

// Função para remover do carrinho com confirmação
function removerDoCarrinhoModal(id) {
    Swal.fire({
        title: 'Remover item?',
        text: "Você tem certeza que deseja remover este item do carrinho?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#1a1a2e',
        confirmButtonText: 'Sim, remover!',
        cancelButtonText: 'Cancelar',
        background: '#1a1a2e',
        color: '#ffffff',
        customClass: {
            confirmButton: 'btn-remover-item',
            cancelButton: 'btn-cancelar'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            carrinho = carrinho.filter(item => item.id !== id);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            
            atualizarModalCarrinho();
            atualizarContadorCarrinho();
            
            // Notificação de sucesso
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#1a1a2e',
                color: '#ffffff'
            });

            Toast.fire({
                icon: 'success',
                title: 'Item removido do carrinho!'
            });
        }
    });
}

function finalizarCompraModal() {
    Swal.close();
    finalizarCompra();
}
