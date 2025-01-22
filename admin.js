class AdminManager {
    constructor() {
        const defaultAdmin = {
            id: '1',
            nome: 'Administrador Principal',
            username: 'admin',
            email: 'admin@brazucastorage.com',
            password: 'admin123',
            nivel: 'admin'
        };

        this.admins = JSON.parse(localStorage.getItem('admins')) || [defaultAdmin];
        this.initializeAdmins();
        this.setupEventListeners();
    }

    initializeAdmins() {
        if (!localStorage.getItem('admins')) {
            localStorage.setItem('admins', JSON.stringify(this.admins));
        }
        this.renderAdmins();
    }

    setupEventListeners() {
        const form = document.getElementById('admin-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAdmin();
            });
        }
    }

    saveAdmin() {
        const nome = document.getElementById('admin-nome').value.trim();
        const username = document.getElementById('admin-username').value.trim();
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value.trim();
        const nivel = document.getElementById('admin-nivel').value;
        const editId = document.getElementById('edit-admin-id').value;

        if (!nome || !username || !email || !password || !nivel) {
            showNotification('Por favor, preencha todos os campos!', 'danger');
            return;
        }

        const usernameExists = this.admins.some(a => 
            a.username === username && a.id !== editId
        );

        if (usernameExists) {
            showNotification('Este nome de usuário já está em uso!', 'danger');
            return;
        }

        const admin = {
            id: editId || Date.now().toString(),
            nome,
            username,
            email,
            password,
            nivel
        };

        if (editId) {
            const index = this.admins.findIndex(a => a.id === editId);
            if (index !== -1) {
                this.admins[index] = admin;
                showNotification('Administrador atualizado com sucesso!');
            }
        } else {
            this.admins.push(admin);
            showNotification('Administrador adicionado com sucesso!');
        }

        localStorage.setItem('admins', JSON.stringify(this.admins));
        this.renderAdmins();
        
        // Limpar formulário
        document.getElementById('admin-form').reset();
        document.getElementById('edit-admin-id').value = '';

        // Atualizar estatísticas imediatamente
        atualizarEstatisticasAdmin();
    }

    editAdmin(id) {
        console.log('Editando admin com ID:', id);
        const admin = this.admins.find(a => a.id === id);
        
        if (admin) {
            console.log('Admin encontrado:', admin);
            
            // Preencher o formulário com os dados do admin
            const fields = {
                'edit-admin-id': admin.id,
                'admin-nome': admin.nome,
                'admin-username': admin.username,
                'admin-email': admin.email,
                'admin-password': admin.password,
                'admin-nivel': admin.nivel
            };

            // Atualizar cada campo do formulário
            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                } else {
                    console.error(`Elemento não encontrado: ${id}`);
                }
            });

            // Scroll suave até o formulário
            document.getElementById('admin-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('Admin não encontrado com ID:', id);
        }
    }

    renderAdmins() {
        const adminsGrid = document.getElementById('admins-grid');
        if (!adminsGrid) {
            console.error('Container admins-grid não encontrado');
            return;
        }

        adminsGrid.innerHTML = this.admins.map(admin => `
            <div class="admin-card" data-id="${admin.id}">
                <div class="admin-info">
                    <h4>${admin.nome}</h4>
                    <p>${admin.email}</p>
                    <p class="username">@${admin.username}</p>
                    <span class="badge ${admin.nivel}">${admin.nivel.toUpperCase()}</span>
                </div>
                <div class="admin-actions">
                    <button onclick="window.adminManager.editAdmin('${admin.id}')" class="btn-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.adminManager.deleteAdmin('${admin.id}')" class="btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    deleteAdmin(id) {
        if (this.admins.length === 1) {
            showNotification('Não é possível remover o último administrador!', 'danger');
            return;
        }

        Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação não poderá ser revertida!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.admins = this.admins.filter(admin => admin.id !== id);
                localStorage.setItem('admins', JSON.stringify(this.admins));
                this.renderAdmins();
                showNotification('Administrador removido com sucesso!', 'success');
                
                // Atualizar estatísticas imediatamente após deletar
                atualizarEstatisticasAdmin();
            }
        });
    }
}

// Adicionar um observador para mudanças no localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'admins') {
        atualizarEstatisticasAdmin();
    }
});

// Inicializar o gerenciador de admins quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
    atualizarEstatisticasAdmin(); // Atualização inicial
}); 