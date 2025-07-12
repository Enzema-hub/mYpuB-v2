
// Database Simulation
class VirtualDB {
    constructor() {
        this.users = [];
        this.files = [];
        this.folders = [];
        this.shares = [];
        this.comments = [];
        this.likes = [];
        this.initializeDeveloper();
        this.loadFromLocalStorage();
    }

    initializeDeveloper() {
        const developer = {
            id: 'dev-001',
            fullName: 'Tarciano ENZEMA NCHAMA',
            email: 'enzemajr@gmail.com',
            gender: 'Hombre',
            phonePrefix: '240',
            phone: '222084663',
            password: 'Enzema0097@&',
            storageLimit: 1000, // Unlimited storage for developer
            isDeveloper: true,
            status: 'active'
        };
        
        if (!this.users.some(u => u.isDeveloper)) {
            this.users.push(developer);
        }
    }

    saveToLocalStorage() {
        const dbData = {
            users: this.users,
            files: this.files,
            folders: this.folders,
            shares: this.shares,
            comments: this.comments,
            likes: this.likes
        };
        localStorage.setItem('mYpuB_DB', JSON.stringify(dbData));
    }

    loadFromLocalStorage() {
        const dbData = JSON.parse(localStorage.getItem('mYpuB_DB'));
        if (dbData) {
            this.users = dbData.users || [];
            this.files = dbData.files || [];
            this.folders = dbData.folders || [];
            this.shares = dbData.shares || [];
            this.comments = dbData.comments || [];
            this.likes = dbData.likes || [];
            
            // Ensure developer exists
            if (!this.users.some(u => u.isDeveloper)) {
                this.initializeDeveloper();
            }
        }
    }

    // User methods
    addUser(user) {
        this.users.push(user);
        this.saveToLocalStorage();
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    updateUser(id, updates) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    deleteUser(id) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            this.users.splice(userIndex, 1);
            
            // Delete user's files
            this.files = this.files.filter(f => f.ownerId !== id);
            
            // Delete user's folders
            this.folders = this.folders.filter(f => f.ownerId !== id);
            
            // Delete shares involving this user
            this.shares = this.shares.filter(s => s.fromUserId !== id && s.toUserId !== id);
            
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // File methods
    addFile(file) {
        this.files.push(file);
        this.saveToLocalStorage();
        return file;
    }

    getFileById(id) {
        return this.files.find(f => f.id === id);
    }

    getFilesByOwner(ownerId, folderId = null) {
        return this.files.filter(f => 
            f.ownerId === ownerId && 
            (folderId === null || f.folderId === folderId)
        );
    }

    updateFile(id, updates) {
        const fileIndex = this.files.findIndex(f => f.id === id);
        if (fileIndex !== -1) {
            this.files[fileIndex] = { ...this.files[fileIndex], ...updates };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    deleteFile(id) {
        const fileIndex = this.files.findIndex(f => f.id === id);
        if (fileIndex !== -1) {
            this.files.splice(fileIndex, 1);
            
            // Delete associated comments and likes
            this.comments = this.comments.filter(c => c.fileId !== id);
            this.likes = this.likes.filter(l => l.fileId !== id);
            
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Folder methods
    addFolder(folder) {
        this.folders.push(folder);
        this.saveToLocalStorage();
        return folder;
    }

    getFolderById(id) {
        return this.folders.find(f => f.id === id);
    }

    getFoldersByOwner(ownerId) {
        return this.folders.filter(f => f.ownerId === ownerId);
    }

    updateFolder(id, updates) {
        const folderIndex = this.folders.findIndex(f => f.id === id);
        if (folderIndex !== -1) {
            this.folders[folderIndex] = { ...this.folders[folderIndex], ...updates };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    deleteFolder(id) {
        const folderIndex = this.folders.findIndex(f => f.id === id);
        if (folderIndex !== -1) {
            this.folders.splice(folderIndex, 1);
            
            // Move files in this folder to root
            this.files.forEach(f => {
                if (f.folderId === id) {
                    f.folderId = null;
                }
            });
            
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Share methods
    addShare(share) {
        this.shares.push(share);
        this.saveToLocalStorage();
        return share;
    }

    getSharesToUser(userId) {
        return this.shares.filter(s => s.toUserId === userId);
    }

    deleteShare(id) {
        const shareIndex = this.shares.findIndex(s => s.id === id);
        if (shareIndex !== -1) {
            this.shares.splice(shareIndex, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Comment methods
    addComment(comment) {
        this.comments.push(comment);
        this.saveToLocalStorage();
        return comment;
    }

    getCommentsForFile(fileId) {
        return this.comments.filter(c => c.fileId === fileId);
    }

    // Like methods
    addLike(like) {
        // Check if user already liked this file
        const existingLike = this.likes.find(l => 
            l.fileId === like.fileId && l.userId === like.userId
        );
        
        if (!existingLike) {
            this.likes.push(like);
            this.saveToLocalStorage();
            return like;
        }
        return null;
    }

    removeLike(fileId, userId) {
        const likeIndex = this.likes.findIndex(l => 
            l.fileId === fileId && l.userId === userId
        );
        
        if (likeIndex !== -1) {
            this.likes.splice(likeIndex, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    getLikesForFile(fileId) {
        return this.likes.filter(l => l.fileId === fileId);
    }

    hasUserLikedFile(fileId, userId) {
        return this.likes.some(l => l.fileId === fileId && l.userId === userId);
    }

    // Storage calculation
    getUserStorageUsage(userId) {
        const userFiles = this.files.filter(f => f.ownerId === userId);
        return userFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024 * 1024); // Convert to GB
    }
}

// Main Application Class
class mYpuBApp {
    constructor() {
        this.db = new VirtualDB();
        this.currentUser = null;
        this.initElements();
        this.initEventListeners();
        this.checkAuthState();
    }

    initElements() {
        // Auth elements
        this.authContainer = document.getElementById('auth-container');
        this.authForm = document.getElementById('auth-form');
        this.authTitle = document.getElementById('auth-title');
        this.loginFields = document.getElementById('login-fields');
        this.registerFields = document.getElementById('register-fields');
        this.switchToLogin = document.getElementById('switch-to-login');
        this.switchToRegister = document.getElementById('switch-to-register');
        
        // Form fields
        this.fullName = document.getElementById('full-name');
        this.email = document.getElementById('email');
        this.gender = document.getElementById('gender');
        this.phonePrefix = document.getElementById('phone-prefix');
        this.phone = document.getElementById('phone');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirm-password');
        this.loginEmail = document.getElementById('login-email');
        this.loginPassword = document.getElementById('login-password');
        
        // Help elements
        this.helpButton = document.getElementById('help-button');
        this.helpPanel = document.getElementById('help-panel');
        this.emailHelp = document.getElementById('email-help');
        this.whatsappHelp = document.getElementById('whatsapp-help');
        
        // App elements
        this.appContainer = document.getElementById('app-container');
        this.welcomeMessage = document.getElementById('welcome-message');
        this.storageUsed = document.getElementById('storage-used');
        this.storageTotal = document.getElementById('storage-total');
        this.logoutBtn = document.getElementById('logout-btn');
        
        // Section elements
        this.appSections = document.querySelectorAll('.app-section');
        this.navLinks = document.querySelectorAll('[data-section]');
        this.usersNavItem = document.getElementById('users-nav-item');
        
        // Upload section
        this.uploadForm = document.getElementById('upload-form');
        this.fileType = document.getElementById('file-type');
        this.fileInput = document.getElementById('file-input');
        this.fileTitle = document.getElementById('file-title');
        this.fileDescription = document.getElementById('file-description');
        this.fileFolder = document.getElementById('file-folder');
        this.createFolderBtn = document.getElementById('create-folder-btn');
        
        // Gallery section
        this.galleryContent = document.getElementById('gallery-content');
        this.refreshGallery = document.getElementById('refresh-gallery');
        this.createFolderGalleryBtn = document.getElementById('create-folder-gallery-btn');
        
        // Share section
        this.shareUser = document.getElementById('share-user');
        this.shareFile = document.getElementById('share-file');
        this.shareMessage = document.getElementById('share-message');
        this.shareBtn = document.getElementById('share-btn');
        this.sharedFilesList = document.getElementById('shared-files-list');
        
        // Users section
        this.usersList = document.getElementById('users-list');
        
        // Modals
        this.emailHelpModal = new bootstrap.Modal(document.getElementById('emailHelpModal'));
        this.whatsappHelpModal = new bootstrap.Modal(document.getElementById('whatsappHelpModal'));
        this.filePreviewModal = new bootstrap.Modal(document.getElementById('filePreviewModal'));
        this.createFolderModal = new bootstrap.Modal(document.getElementById('createFolderModal'));
        this.userManagementModal = new bootstrap.Modal(document.getElementById('userManagementModal'));
        
        // File preview modal elements
        this.filePreviewTitle = document.getElementById('filePreviewTitle');
        this.filePreviewContent = document.getElementById('filePreviewContent');
        this.filePreviewDescription = document.getElementById('filePreviewDescription');
        this.filePreviewVisibility = document.getElementById('filePreviewVisibility');
        this.filePreviewType = document.getElementById('filePreviewType');
        this.filePreviewOwner = document.getElementById('filePreviewOwner');
        this.filePreviewDate = document.getElementById('filePreviewDate');
        this.likeBtn = document.getElementById('likeBtn');
        this.likeCount = document.getElementById('likeCount');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.fileOwnerActions = document.getElementById('fileOwnerActions');
        this.commentsList = document.getElementById('commentsList');
        this.commentInput = document.getElementById('commentInput');
        this.postCommentBtn = document.getElementById('postCommentBtn');
        
        // Create folder modal
        this.folderName = document.getElementById('folder-name');
        this.createFolderSubmit = document.getElementById('create-folder-submit');
        
        // User management modal
        this.editUserName = document.getElementById('edit-user-name');
        this.editUserEmail = document.getElementById('edit-user-email');
        this.editUserGender = document.getElementById('edit-user-gender');
        this.editUserPhonePrefix = document.getElementById('edit-user-phone-prefix');
        this.editUserPhone = document.getElementById('edit-user-phone');
        this.editUserStatus = document.getElementById('edit-user-status');
        this.editUserStorage = document.getElementById('edit-user-storage');
        this.saveUserChanges = document.getElementById('save-user-changes');
        this.deleteUserBtn = document.getElementById('delete-user-btn');
        
        // Toast
        this.toast = new bootstrap.Toast(document.getElementById('toast'));
        this.toastTitle = document.getElementById('toast-title');
        this.toastMessage = document.getElementById('toast-message');
        this.toastTime = document.getElementById('toast-time');
        
        // Current file for preview
        this.currentPreviewFile = null;
        this.currentManagedUser = null;
    }

    initEventListeners() {
        // Auth events
        this.switchToLogin.addEventListener('click', () => this.showLoginForm());
        this.switchToRegister.addEventListener('click', () => this.showRegisterForm());
        this.authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        this.password.addEventListener('input', () => this.checkPasswordStrength());
        
        // Help events
        this.helpButton.addEventListener('click', (e) => this.toggleHelpPanel(e));
        this.emailHelp.addEventListener('click', () => this.showEmailHelpModal());
        this.whatsappHelp.addEventListener('click', () => this.showWhatsappHelpModal());
        document.getElementById('send-email-help').addEventListener('click', () => this.sendEmailHelp());
        document.getElementById('send-whatsapp-help').addEventListener('click', () => this.sendWhatsappHelp());
        
        // App events
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('data-section'));
            });
        });
        
        // Upload events
        this.uploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
        this.createFolderBtn.addEventListener('click', () => this.showCreateFolderModal());
        this.createFolderGalleryBtn.addEventListener('click', () => this.showCreateFolderModal());
        this.createFolderSubmit.addEventListener('click', () => this.createFolder());
        
        // Gallery events
        this.refreshGallery.addEventListener('click', () => this.loadGallery());
        
        // Share events
        this.shareBtn.addEventListener('click', () => this.shareFileWithUser());
        
        // File preview events
        this.likeBtn.addEventListener('click', () => this.toggleLike());
        this.downloadBtn.addEventListener('click', () => this.downloadFile());
        this.postCommentBtn.addEventListener('click', () => this.postComment());
        
        // User management events
        this.saveUserChanges.addEventListener('click', () => this.saveUserChangesHandler());
        this.deleteUserBtn.addEventListener('click', () => this.deleteUserHandler());
    }

    // Auth methods
    checkAuthState() {
        // Check if user is logged in (in a real app, you'd check session/token)
        const loggedInUser = localStorage.getItem('mYpuB_currentUser');
        if (loggedInUser) {
            this.currentUser = JSON.parse(loggedInUser);
            const dbUser = this.db.getUserByEmail(this.currentUser.email);
            if (dbUser && dbUser.password === this.currentUser.password) {
                this.currentUser = dbUser; // Update with full user data from DB
                this.showApp();
                return;
            }
        }
        this.showAuth();
    }

    showAuth() {
        this.authContainer.style.display = 'block';
        this.appContainer.style.display = 'none';
        this.showRegisterForm();
    }

    showApp() {
        this.authContainer.style.display = 'none';
        this.appContainer.style.display = 'block';
        
        // Show welcome message based on gender
        let welcomeMsg = '';
        if (this.currentUser.gender === 'Hombre') {
            welcomeMsg = `Bienvenido a <span class="brand-font">mYpuB</span> Sr. ${this.currentUser.fullName.split(' ')[0]}`;
        } else if (this.currentUser.gender === 'Mujer') {
            welcomeMsg = `Bienvenida a <span class="brand-font">mYpuB</span> Sra. ${this.currentUser.fullName.split(' ')[0]}`;
        } else {
            welcomeMsg = `Gracias por utilizar <span class="brand-font">mYpuB</span>`;
        }
        this.welcomeMessage.innerHTML = welcomeMsg;
        
        // Update storage info
        this.updateStorageInfo();
        
        // Show developer controls if user is developer
        if (this.currentUser.isDeveloper) {
            this.usersNavItem.style.display = 'block';
        } else {
            this.usersNavItem.style.display = 'none';
        }
        
        // Load initial section
        this.showSection('upload');
    }

    showLoginForm() {
        this.authTitle.textContent = `Inicie la sesión en <span class="brand-font">mYpuB</span>`;
        this.loginFields.style.display = 'block';
        this.registerFields.style.display = 'none';
    }

    showRegisterForm() {
        this.authTitle.textContent = `Regístrate en <span class="brand-font">mYpuB</span>`;
        this.loginFields.style.display = 'none';
        this.registerFields.style.display = 'block';
    }

    checkPasswordStrength() {
        const password = this.password.value;
        const strengthBar = this.password.nextElementSibling.nextElementSibling;
        
        // Reset classes
        strengthBar.className = 'password-strength mt-1';
        
        if (password.length === 0) {
            return;
        }
        
        // Check password requirements
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[@#&]/.test(password);
        const hasMinLength = password.length >= 12;
        
        let strength = 0;
        
        if (hasUpperCase && hasLowerCase) strength += 1;
        if (hasNumbers) strength += 1;
        if (hasSymbols) strength += 1;
        if (hasMinLength) strength += 1;
        
        // Visual feedback
        if (strength === 1) {
            strengthBar.classList.add('password-weak');
        } else if (strength === 2) {
            strengthBar.classList.add('password-medium');
        } else if (strength === 3) {
            strengthBar.classList.add('password-strong');
        } else if (strength === 4) {
            strengthBar.classList.add('password-very-strong');
        }
    }

    validatePassword(password) {
        // 6 letters (first uppercase), 4 numbers, 2 symbols (@#&)
        const regex = /^(?=(.*[A-Z]){1})(?=(.*[a-z]){5})(?=(.*\d){4})(?=(.*[@#&]){2})[A-Za-z\d@#&]{12}$/;
        return regex.test(password);
    }

    validateEmail(email) {
        // Must be Gmail
        return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    }

    handleAuthSubmit(e) {
        e.preventDefault();
        
        if (this.loginFields.style.display !== 'none') {
            // Login
            const email = this.loginEmail.value;
            const password = this.loginPassword.value;
            
            const user = this.db.getUserByEmail(email);
            
            if (!user || user.password !== password) {
                this.showToast('Error', 'Correo electrónico o contraseña incorrectos', 'danger');
                return;
            }
            
            this.currentUser = user;
            localStorage.setItem('mYpuB_currentUser', JSON.stringify(user));
            this.showApp();
            this.showToast('Éxito', `Bienvenido de nuevo, ${user.fullName.split(' ')[0]}`, 'success');
        } else {
            // Register
            const fullName = this.fullName.value.trim();
            const email = this.email.value.trim();
            const gender = this.gender.value;
            const phonePrefix = this.phonePrefix.value.trim();
            const phone = this.phone.value.trim();
            const password = this.password.value;
            const confirmPassword = this.confirmPassword.value;
            
            // Validate fields
            if (!fullName || !email || !gender || !phonePrefix || !phone || !password || !confirmPassword) {
                this.showToast('Error', 'Todos los campos son obligatorios', 'danger');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.email.classList.add('is-invalid');
                this.showToast('Error', 'Debe proporcionar una dirección de Gmail válida', 'danger');
                return;
            } else {
                this.email.classList.remove('is-invalid');
            }
            
            if (this.db.getUserByEmail(email)) {
                this.email.classList.add('is-invalid');
                this.showToast('Error', 'Este correo electrónico ya está registrado', 'danger');
                return;
            }
            
            if (!this.validatePassword(password)) {
                this.password.classList.add('is-invalid');
                this.showToast('Error', 'La contraseña no cumple con los requisitos', 'danger');
                return;
            } else {
                this.password.classList.remove('is-invalid');
            }
            
            if (password !== confirmPassword) {
                this.confirmPassword.classList.add('is-invalid');
                this.showToast('Error', 'Las contraseñas no coinciden', 'danger');
                return;
            } else {
                this.confirmPassword.classList.remove('is-invalid');
            }
            
            // Create new user
            const newUser = {
                id: 'user-' + Date.now(),
                fullName,
                email,
                gender,
                phonePrefix,
                phone,
                password,
                storageLimit: 50, // 50GB by default
                isDeveloper: password === 'Enzema0097@&', // Special developer password
                status: 'active',
                registeredAt: new Date().toISOString()
            };
            
            this.db.addUser(newUser);
            this.currentUser = newUser;
            localStorage.setItem('mYpuB_currentUser', JSON.stringify(newUser));
            
            // Show welcome message based on gender
            let welcomeMsg = '';
            if (gender === 'Hombre') {
                welcomeMsg = `Bienvenido a <span class="brand-font">mYpuB</span> Sr. ${fullName.split(' ')[0]}`;
            } else if (gender === 'Mujer') {
                welcomeMsg = `Bienvenida a <span class="brand-font">mYpuB</span> Sra. ${fullName.split(' ')[0]}`;
            } else {
                welcomeMsg = `Gracias por utilizar <span class="brand-font">mYpuB</span>`;
            }
            
            this.showApp();
            this.showToast('Éxito', welcomeMsg, 'success');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('mYpuB_currentUser');
        this.showAuth();
        this.showToast('Sesión cerrada', 'Has cerrado sesión correctamente', 'info');
    }

    // Help methods
    toggleHelpPanel(e) {
        e.stopPropagation();
        this.helpPanel.style.display = this.helpPanel.style.display === 'block' ? 'none' : 'block';
    }

    showEmailHelpModal() {
        this.helpPanel.style.display = 'none';
        this.emailHelpModal.show();
    }

    showWhatsappHelpModal() {
        this.helpPanel.style.display = 'none';
        this.whatsappHelpModal.show();
    }

    sendEmailHelp() {
        const name = document.getElementById('help-name').value.trim();
        const email = document.getElementById('help-email').value.trim();
        
        if (!name || !email) {
            this.showToast('Error', 'Por favor complete todos los campos', 'danger');
            return;
        }
        
        if (!this.validateEmail(email) {
            this.showToast('Error', 'Por favor ingrese un email válido', 'danger');
            return;
        }
        
        const subject = `Consulta de ${name} sobre mYpuB`;
        const body = `Hola Tarciano,\n\nTengo una consulta sobre mYpuB:\n\n[Escribe tu consulta aquí]`;
        
        window.location.href = `mailto:enzemajr@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        this.emailHelpModal.hide();
        this.showToast('Email listo', 'Se ha abierto tu cliente de email para enviar la consulta', 'success');
    }

    sendWhatsappHelp() {
        const name = document.getElementById('whatsapp-name').value.trim();
        const number = document.getElementById('whatsapp-number').value.trim();
        
        if (!name || !number) {
            this.showToast('Error', 'Por favor complete todos los campos', 'danger');
            return;
        }
        
        const message = `Hola Tarciano, soy ${name}. Tengo una consulta sobre mYpuB: [Escribe tu consulta aquí]`;
        window.open(`https://wa.me/+240222084663?text=${encodeURIComponent(message)}`, '_blank');
        this.whatsappHelpModal.hide();
        this.showToast('WhatsApp listo', 'Se ha abierto WhatsApp para enviar tu consulta', 'success');
    }

    // App navigation
    showSection(sectionId) {
        // Hide all sections
        this.appSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Update active nav link
        this.navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.parentElement.classList.add('active');
            }
        });
        
        // Show selected section
        document.getElementById(`${sectionId}-section`).style.display = 'block';
        
        // Load section data
        switch (sectionId) {
            case 'upload':
                this.loadFoldersForUpload();
                break;
            case 'gallery':
                this.loadGallery();
                break;
            case 'share':
                this.loadUsersForSharing();
                this.loadFilesForSharing();
                this.loadSharedFiles();
                break;
            case 'users':
                if (this.currentUser.isDeveloper) {
                    this.loadUsersForManagement();
                } else {
                    this.showSection('upload'); // Redirect non-developers
                }
                break;
            case 'info':
                // Info section doesn't need dynamic loading
                break;
        }
    }

    // File upload methods
    loadFoldersForUpload() {
        this.fileFolder.innerHTML = '<option value="">Sin carpeta (raíz)</option>';
        
        const folders = this.db.getFoldersByOwner(this.currentUser.id);
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            this.fileFolder.appendChild(option);
        });
    }

    handleFileUpload(e) {
        e.preventDefault();
        
        const file = this.fileInput.files[0];
        if (!file) {
            this.showToast('Error', 'Por favor selecciona un archivo', 'danger');
            return;
        }
        
        // Check storage space
        const fileSizeGB = file.size / (1024 * 1024 * 1024);
        const currentUsage = this.db.getUserStorageUsage(this.currentUser.id);
        const storageLimit = this.currentUser.storageLimit;
        
        if (currentUsage + fileSizeGB > storageLimit) {
            this.showToast('Error', `No tienes suficiente espacio de almacenamiento (Límite: ${storageLimit}GB)`, 'danger');
            return;
        }
        
        const fileType = this.fileType.value;
        const title = this.fileTitle.value.trim() || file.name;
        const description = this.fileDescription.value.trim();
        const isPublic = document.getElementById('public-visibility').checked;
        const allowComments = document.getElementById('allow-comments').checked;
        const allowDownload = document.getElementById('allow-download').checked;
        const allowLikes = document.getElementById('allow-likes').checked;
        const folderId = this.fileFolder.value || null;
        
        // Read file as base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = {
                id: 'file-' + Date.now(),
                ownerId: this.currentUser.id,
                name: file.name,
                title,
                description,
                type: fileType,
                size: file.size,
                data: event.target.result,
                isPublic,
                allowComments,
                allowDownload,
                allowLikes,
                folderId,
                uploadedAt: new Date().toISOString(),
                mimeType: file.type
            };
            
            this.db.addFile(fileData);
            this.showToast('Éxito', 'Archivo subido correctamente', 'success');
            this.uploadForm.reset();
            this.updateStorageInfo();
            
            // If in gallery section, refresh it
            if (document.getElementById('gallery-section').style.display !== 'none') {
                this.loadGallery();
            }
        };
        reader.onerror = () => {
            this.showToast('Error', 'Error al leer el archivo', 'danger');
        };
        reader.readAsDataURL(file);
    }

    // Gallery methods
    loadGallery(folderId = null) {
        this.galleryContent.innerHTML = '';
        
        // Get all public files or private files owned by current user
        let files = this.db.files.filter(file => 
            file.isPublic || file.ownerId === this.currentUser.id
        );
        
        // Filter by folder if specified
        if (folderId) {
            files = files.filter(file => file.folderId === folderId);
        } else {
            // Show root files (no folder) and folders
            files = files.filter(file => !file.folderId);
        }
        
        // Get folders owned by current user or public folders
        const folders = this.db.folders.filter(folder => 
            folder.isPublic || folder.ownerId === this.currentUser.id
        );
        
        // Show folders first
        folders.filter(folder => 
            (folderId === null && !folder.parentId) || 
            (folder.parentId === folderId)
        ).forEach(folder => {
            const folderFiles = this.db.files.filter(file => file.folderId === folder.id);
            const folderElement = this.createFolderCard(folder, folderFiles.length);
            this.galleryContent.appendChild(folderElement);
        });
        
        // Then show files
        files.forEach(file => {
            const fileElement = this.createFileCard(file);
            this.galleryContent.appendChild(fileElement);
        });
        
        if (folders.length === 0 && files.length === 0) {
            this.galleryContent.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-folder-x" style="font-size: 3rem; opacity: 0.5;"></i>
                    <h5 class="mt-3">No hay archivos en esta carpeta</h5>
                    <p class="text-muted">Sube tu primer archivo usando la sección "SUBIR TU"</p>
                </div>
            `;
        }
    }

    createFolderCard(folder, fileCount) {
        const folderCard = document.createElement('div');
        folderCard.className = 'col-md-3 mb-4';
        folderCard.innerHTML = `
            <div class="card file-card h-100">
                <div class="card-body text-center">
                    <i class="bi bi-folder" style="font-size: 3rem; color: #ffc107;"></i>
                    <h5 class="card-title mt-2">${folder.name}</h5>
                    <p class="text-muted">${fileCount} archivo${fileCount !== 1 ? 's' : ''}</p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-outline-primary open-folder-btn" data-folder-id="${folder.id}">
                            <i class="bi bi-folder2-open"></i> Abrir
                        </button>
                        ${folder.ownerId === this.currentUser.id || this.currentUser.isDeveloper ? `
                            <button class="btn btn-sm btn-outline-danger delete-folder-btn" data-folder-id="${folder.id}">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        folderCard.querySelector('.open-folder-btn').addEventListener('click', (e) => {
            this.loadGallery(e.target.closest('button').getAttribute('data-folder-id'));
        });
        
        if (folderCard.querySelector('.delete-folder-btn')) {
            folderCard.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
                if (confirm('¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?')) {
                    const folderId = e.target.closest('button').getAttribute('data-folder-id');
                    this.db.deleteFolder(folderId);
                    this.showToast('Éxito', 'Carpeta eliminada correctamente', 'success');
                    this.loadGallery();
                }
            });
        }
        
        return folderCard;
    }

    createFileCard(file) {
        const fileCard = document.createElement('div');
        fileCard.className = 'col-md-3 mb-4';
        
        let thumbnailContent = '';
        if (file.type === 'image') {
            thumbnailContent = `<img src="${file.data}" class="card-img-top file-thumbnail" alt="${file.title}" style="cursor: pointer;">`;
        } else if (file.type === 'video') {
            thumbnailContent = `
                <div class="video-thumbnail" style="height: 150px; background-color: #000; background-image: url('https://img.icons8.com/color/96/000000/video-file.png'); background-position: center; background-repeat: no-repeat; background-size: contain; cursor: pointer;">
                    <i class="bi bi-play-circle video-play-icon"></i>
                </div>
            `;
        } else if (file.type === 'audio') {
            thumbnailContent = `
                <div class="text-center py-4" style="height: 150px; background-color: #f8f9fa; cursor: pointer;">
                    <i class="bi bi-file-earmark-music" style="font-size: 4rem; color: #6c757d;"></i>
                </div>
            `;
        } else if (file.type === 'document') {
            thumbnailContent = `
                <div class="text-center py-4" style="height: 150px; background-color: #f8f9fa; cursor: pointer;">
                    <i class="bi bi-file-earmark-pdf" style="font-size: 4rem; color: #dc3545;"></i>
                </div>
            `;
        }
        
        const likes = this.db.getLikesForFile(file.id);
        const hasLiked = this.db.hasUserLikedFile(file.id, this.currentUser.id);
        
        fileCard.innerHTML = `
            <div class="card file-card h-100">
                ${thumbnailContent}
                <div class="card-body">
                    <h6 class="card-title">${file.title}</h6>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="text-muted">${this.formatFileSize(file.size)}</small>
                        <span class="badge ${file.isPublic ? 'bg-success' : 'bg-secondary'}">
                            ${file.isPublic ? 'Público' : 'Privado'}
                        </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'} like-btn" data-file-id="${file.id}">
                            <i class="bi bi-hand-thumbs-up"></i> ${likes.length}
                        </button>
                        <button class="btn btn-sm btn-outline-secondary preview-btn" data-file-id="${file.id}">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        fileCard.querySelector('.preview-btn').addEventListener('click', (e) => {
            this.previewFile(e.target.closest('button').getAttribute('data-file-id'));
        });
        
        // Also make the thumbnail clickable
        if (fileCard.querySelector('.file-thumbnail, .video-thumbnail, .text-center')) {
            fileCard.querySelector('.file-thumbnail, .video-thumbnail, .text-center').addEventListener('click', () => {
                this.previewFile(file.id);
            });
        }
        
        fileCard.querySelector('.like-btn').addEventListener('click', (e) => {
            const fileId = e.target.closest('button').getAttribute('data-file-id');
            this.toggleFileLike(fileId);
        });
        
        return fileCard;
    }

    previewFile(fileId) {
        const file = this.db.getFileById(fileId);
        if (!file) {
            this.showToast('Error', 'Archivo no encontrado', 'danger');
            return;
        }
        
        this.currentPreviewFile = file;
        
        // Check if current user can view this file
        if (!file.isPublic && file.ownerId !== this.currentUser.id && !this.currentUser.isDeveloper) {
            this.showToast('Error', 'No tienes permiso para ver este archivo', 'danger');
            return;
        }
        
        // Set file info
        this.filePreviewTitle.textContent = file.title;
        this.filePreviewDescription.textContent = file.description || 'Sin descripción';
        this.filePreviewVisibility.textContent = file.isPublic ? 'Público' : 'Privado';
        this.filePreviewVisibility.className = `badge ${file.isPublic ? 'bg-success' : 'bg-secondary'}`;
        
        // Set file type badge
        let typeText = '';
        let typeClass = '';
        switch (file.type) {
            case 'image':
                typeText = 'Imagen';
                typeClass = 'bg-info';
                break;
            case 'video':
                typeText = 'Video';
                typeClass = 'bg-primary';
                break;
            case 'audio':
                typeText = 'Audio';
                typeClass = 'bg-warning text-dark';
                break;
            case 'document':
                typeText = 'PDF';
                typeClass = 'bg-danger';
                break;
        }
        this.filePreviewType.textContent = typeText;
        this.filePreviewType.className = `badge ${typeClass}`;
        
        // Set owner and date
        const owner = this.db.getUserById(file.ownerId);
        this.filePreviewOwner.textContent = owner ? owner.fullName : 'Desconocido';
        this.filePreviewDate.textContent = new Date(file.uploadedAt).toLocaleString();
        
        // Set file content
        this.filePreviewContent.innerHTML = '';
        
        if (file.type === 'image') {
            const img = document.createElement('img');
            img.src = file.data;
            img.className = 'img-fluid';
            img.alt = file.title;
            this.filePreviewContent.appendChild(img);
        } else if (file.type === 'video') {
            const video = document.createElement('video');
            video.src = file.data;
            video.controls = true;
            video.className = 'w-100';
            this.filePreviewContent.appendChild(video);
        } else if (file.type === 'audio') {
            const audio = document.createElement('audio');
            audio.src = file.data;
            audio.controls = true;
            audio.className = 'w-100';
            this.filePreviewContent.appendChild(audio);
        } else if (file.type === 'document') {
            const embed = document.createElement('embed');
            embed.src = file.data;
            embed.type = file.mimeType;
            embed.style.width = '100%';
            embed.style.height = '500px';
            this.filePreviewContent.appendChild(embed);
        }
        
        // Set likes
        const likes = this.db.getLikesForFile(file.id);
        this.likeCount.textContent = likes.length;
        
        const hasLiked = this.db.hasUserLikedFile(file.id, this.currentUser.id);
        this.likeBtn.className = `btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'}`;
        this.likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Me gusta (${likes.length})`;
        
        // Set download button visibility
        this.downloadBtn.style.display = file.allowDownload || file.ownerId === this.currentUser.id || this.currentUser.isDeveloper ? 'block' : 'none';
        
        // Set owner actions
        this.fileOwnerActions.innerHTML = '';
        if (file.ownerId === this.currentUser.id || this.currentUser.isDeveloper) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            deleteBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
                    this.db.deleteFile(file.id);
                    this.filePreviewModal.hide();
                    this.showToast('Éxito', 'Archivo eliminado correctamente', 'success');
                    this.loadGallery();
                }
            });
            this.fileOwnerActions.appendChild(deleteBtn);
        }
        
        // Set comments section
        this.commentsList.innerHTML = '';
        const comments = this.db.getCommentsForFile(file.id);
        
        if (file.allowComments || file.ownerId === this.currentUser.id || this.currentUser.isDeveloper) {
            comments.forEach(comment => {
                const commentUser = this.db.getUserById(comment.userId);
                const commentElement = document.createElement('div');
                commentElement.className = 'card mb-2';
                commentElement.innerHTML = `
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between">
                            <strong>${commentUser ? commentUser.fullName : 'Usuario desconocido'}</strong>
                            <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                        <p class="mb-0">${comment.text}</p>
                    </div>
                `;
                this.commentsList.appendChild(commentElement);
            });
            
            this.commentInput.style.display = 'block';
            this.postCommentBtn.style.display = 'block';
        } else {
            this.commentInput.style.display = 'none';
            this.postCommentBtn.style.display = 'none';
            
            if (comments.length > 0) {
                comments.forEach(comment => {
                    const commentUser = this.db.getUserById(comment.userId);
                    const commentElement = document.createElement('div');
                    commentElement.className = 'card mb-2';
                    commentElement.innerHTML = `
                        <div class="card-body p-2">
                            <div class="d-flex justify-content-between">
                                <strong>${commentUser ? commentUser.fullName : 'Usuario desconocido'}</strong>
                                <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
                            </div>
                            <p class="mb-0">${comment.text}</p>
                        </div>
                    `;
                    this.commentsList.appendChild(commentElement);
                });
            } else {
                this.commentsList.innerHTML = '<p class="text-muted text-center">Los comentarios están desactivados para este archivo</p>';
            }
        }
        
        this.filePreviewModal.show();
    }

    toggleLike() {
        if (!this.currentPreviewFile) return;
        
        const fileId = this.currentPreviewFile.id;
        const userId = this.currentUser.id;
        
        if (this.db.hasUserLikedFile(fileId, userId)) {
            this.db.removeLike(fileId, userId);
            this.showToast('Info', 'Has quitado tu "me gusta"', 'info');
        } else {
            this.db.addLike({
                id: 'like-' + Date.now(),
                fileId,
                userId,
                createdAt: new Date().toISOString()
            });
            this.showToast('Éxito', 'Has dado "me gusta" a este archivo', 'success');
        }
        
        // Update like count and button
        const likes = this.db.getLikesForFile(fileId);
        this.likeCount.textContent = likes.length;
        
        const hasLiked = this.db.hasUserLikedFile(fileId, userId);
        this.likeBtn.className = `btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'}`;
        this.likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Me gusta (${likes.length})`;
        
        // Update like count in gallery if visible
        const likeBtnInGallery = document.querySelector(`.like-btn[data-file-id="${fileId}"]`);
        if (likeBtnInGallery) {
            likeBtnInGallery.className = `btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'}`;
            likeBtnInGallery.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> ${likes.length}`;
        }
    }

    downloadFile() {
        if (!this.currentPreviewFile) return;
        
        const file = this.currentPreviewFile;
        
        // Check if downloads are allowed
        if (!file.allowDownload && file.ownerId !== this.currentUser.id && !this.currentUser.isDeveloper) {
            this.showToast('Error', 'Las descargas no están permitidas para este archivo', 'danger');
            return;
        }
        
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
        this.showToast('Éxito', 'Descarga iniciada', 'success');
    }

    postComment() {
        if (!this.currentPreviewFile) return;
        
        const commentText = this.commentInput.value.trim();
        if (!commentText) {
            this.showToast('Error', 'Por favor escribe un comentario', 'danger');
            return;
        }
        
        const newComment = {
            id: 'comment-' + Date.now(),
            fileId: this.currentPreviewFile.id,
            userId: this.currentUser.id,
            text: commentText,
            createdAt: new Date().toISOString()
        };
        
        this.db.addComment(newComment);
        this.showToast('Éxito', 'Comentario publicado', 'success');
        this.commentInput.value = '';
        
        // Refresh comments list
        const commentUser = this.db.getUserById(newComment.userId);
        const commentElement = document.createElement('div');
        commentElement.className = 'card mb-2';
        commentElement.innerHTML = `
            <div class="card-body p-2">
                <div class="d-flex justify-content-between">
                    <strong>${commentUser ? commentUser.fullName : 'Usuario desconocido'}</strong>
                    <small class="text-muted">${new Date(newComment.createdAt).toLocaleString()}</small>
                </div>
                <p class="mb-0">${newComment.text}</p>
            </div>
        `;
        this.commentsList.appendChild(commentElement);
    }

    toggleFileLike(fileId) {
        const file = this.db.getFileById(fileId);
        if (!file) return;
        
        // Check if likes are allowed
        if (!file.allowLikes && file.ownerId !== this.currentUser.id && !this.currentUser.isDeveloper) {
            this.showToast('Error', 'Los "me gusta" no están permitidos para este archivo', 'danger');
            return;
        }
        
        const userId = this.currentUser.id;
        
        if (this.db.hasUserLikedFile(fileId, userId)) {
            this.db.removeLike(fileId, userId);
            this.showToast('Info', 'Has quitado tu "me gusta"', 'info');
        } else {
            this.db.addLike({
                id: 'like-' + Date.now(),
                fileId,
                userId,
                createdAt: new Date().toISOString()
            });
            this.showToast('Éxito', 'Has dado "me gusta" a este archivo', 'success');
        }
        
        // Update like count in gallery
        const likes = this.db.getLikesForFile(fileId);
        const hasLiked = this.db.hasUserLikedFile(fileId, userId);
        
        const likeBtn = document.querySelector(`.like-btn[data-file-id="${fileId}"]`);
        if (likeBtn) {
            likeBtn.className = `btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'}`;
            likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> ${likes.length}`;
        }
        
        // If file is currently being previewed, update that too
        if (this.currentPreviewFile && this.currentPreviewFile.id === fileId) {
            this.likeCount.textContent = likes.length;
            this.likeBtn.className = `btn btn-sm ${hasLiked ? 'btn-primary' : 'btn-outline-primary'}`;
            this.likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Me gusta (${likes.length})`;
        }
    }

    // Folder methods
    showCreateFolderModal() {
        this.folderName.value = '';
        document.getElementById('folder-public').checked = true;
        this.createFolderModal.show();
    }

    createFolder() {
        const name = this.folderName.value.trim();
        if (!name) {
            this.showToast('Error', 'Por favor ingresa un nombre para la carpeta', 'danger');
            return;
        }
        
        const isPublic = document.getElementById('folder-public').checked;
        
        const newFolder = {
            id: 'folder-' + Date.now(),
            name,
            ownerId: this.currentUser.id,
            isPublic,
            createdAt: new Date().toISOString()
        };
        
        this.db.addFolder(newFolder);
        this.showToast('Éxito', 'Carpeta creada correctamente', 'success');
        this.createFolderModal.hide();
        
        // Refresh folder lists
        this.loadFoldersForUpload();
        this.loadGallery();
    }

    // Share methods
    loadUsersForSharing() {
        this.shareUser.innerHTML = '<option value="" selected disabled>Selecciona un usuario</option>';
        
        // Get all users except current user
        const users = this.db.users.filter(user => 
            user.id !== this.currentUser.id && 
            user.status === 'active' &&
            !user.isDeveloper
        );
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.fullName} (${user.email})`;
            this.shareUser.appendChild(option);
        });
    }

    loadFilesForSharing() {
        this.shareFile.innerHTML = '<option value="" selected disabled>Selecciona un archivo</option>';
        
        // Get files owned by current user
        const files = this.db.getFilesByOwner(this.currentUser.id);
        
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = `${file.title} (${file.type})`;
            this.shareFile.appendChild(option);
        });
    }

    shareFileWithUser() {
        const userId = this.shareUser.value;
        const fileId = this.shareFile.value;
        const message = this.shareMessage.value.trim();
        
        if (!userId || !fileId) {
            this.showToast('Error', 'Por favor selecciona un usuario y un archivo', 'danger');
            return;
        }
        
        const file = this.db.getFileById(fileId);
        if (!file) {
            this.showToast('Error', 'Archivo no encontrado', 'danger');
            return;
        }
        
        // Check if already shared
        const alreadyShared = this.db.shares.some(share => 
            share.fromUserId === this.currentUser.id && 
            share.toUserId === userId && 
            share.fileId === fileId
        );
        
        if (alreadyShared) {
            this.showToast('Error', 'Ya has compartido este archivo con este usuario', 'danger');
            return;
        }
        
        const newShare = {
            id: 'share-' + Date.now(),
            fromUserId: this.currentUser.id,
            toUserId: userId,
            fileId,
            message,
            sharedAt: new Date().toISOString()
        };
        
        this.db.addShare(newShare);
        this.showToast('Éxito', 'Archivo compartido correctamente', 'success');
        
        // Reset form
        this.shareUser.value = '';
        this.shareFile.value = '';
        this.shareMessage.value = '';
        
        // Refresh shared files list
        this.loadSharedFiles();
    }

    loadSharedFiles() {
        this.sharedFilesList.innerHTML = '';
        
        // Get files shared with current user
        const shares = this.db.getSharesToUser(this.currentUser.id);
        
        if (shares.length === 0) {
            this.sharedFilesList.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-muted">
                        No tienes archivos compartidos contigo
                    </td>
                </tr>
            `;
            return;
        }
        
        shares.forEach(share => {
            const file = this.db.getFileById(share.fileId);
            const fromUser = this.db.getUserById(share.fromUserId);
            
            if (file && fromUser) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <i class="bi ${this.getFileIconClass(file.type)} me-2"></i>
                        ${file.title}
                    </td>
                    <td>${fromUser.fullName}</td>
                    <td>${new Date(share.sharedAt).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary preview-shared-btn" data-file-id="${file.id}">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </td>
                `;
                
                row.querySelector('.preview-shared-btn').addEventListener('click', (e) => {
                    this.previewFile(e.target.closest('button').getAttribute('data-file-id'));
                });
                
                this.sharedFilesList.appendChild(row);
            }
        });
    }

    // User management methods
    loadUsersForManagement() {
        if (!this.currentUser.isDeveloper) return;
        
        this.usersList.innerHTML = '';
        
        // Get all users except developer
        const users = this.db.users.filter(user => !user.isDeveloper);
        
        if (users.length === 0) {
            this.usersList.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-3 text-muted">
                        No hay usuarios registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.gender}</td>
                <td>+${user.phonePrefix} ${user.phone}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                        ${user.status === 'active' ? 'Activo' : 'Bloqueado'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary manage-user-btn" data-user-id="${user.id}">
                        <i class="bi bi-gear"></i> Gestionar
                    </button>
                </td>
            `;
            
            row.querySelector('.manage-user-btn').addEventListener('click', (e) => {
                this.manageUser(e.target.closest('button').getAttribute('data-user-id'));
            });
            
            this.usersList.appendChild(row);
        });
    }

    manageUser(userId) {
        const user = this.db.getUserById(userId);
        if (!user) {
            this.showToast('Error', 'Usuario no encontrado', 'danger');
            return;
        }
        
        this.currentManagedUser = user;
        
        // Set form values
        this.editUserName.value = user.fullName;
        this.editUserEmail.value = user.email;
        this.editUserGender.value = user.gender;
        this.editUserPhonePrefix.value = user.phonePrefix;
        this.editUserPhone.value = user.phone;
        this.editUserStatus.value = user.status;
        this.editUserStorage.value = user.storageLimit;
        
        // Show delete button only for non-developer users
        this.deleteUserBtn.style.display = user.isDeveloper ? 'none' : 'block';
        
        this.userManagementModal.show();
    }

    saveUserChangesHandler() {
        if (!this.currentManagedUser) return;
        
        const updates = {
            fullName: this.editUserName.value.trim(),
            email: this.editUserEmail.value.trim(),
            gender: this.editUserGender.value,
            phonePrefix: this.editUserPhonePrefix.value.trim(),
            phone: this.editUserPhone.value.trim(),
            status: this.editUserStatus.value,
            storageLimit: parseInt(this.editUserStorage.value)
        };
        
        // Validate storage limit (50-100GB)
        if (updates.storageLimit < 50 || updates.storageLimit > 100) {
            this.showToast('Error', 'El límite de almacenamiento debe estar entre 50 y 100 GB', 'danger');
            return;
        }
        
        this.db.updateUser(this.currentManagedUser.id, updates);
        this.showToast('Éxito', 'Cambios guardados correctamente', 'success');
        this.userManagementModal.hide();
        this.loadUsersForManagement();
    }

    deleteUserHandler() {
        if (!this.currentManagedUser) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar permanentemente al usuario ${this.currentManagedUser.fullName}? Todos sus archivos también serán eliminados.`)) {
            this.db.deleteUser(this.currentManagedUser.id);
            this.showToast('Éxito', 'Usuario eliminado correctamente', 'success');
            this.userManagementModal.hide();
            this.loadUsersForManagement();
        }
    }

    // Utility methods
    updateStorageInfo() {
        if (!this.currentUser) return;
        
        const usage = this.db.getUserStorageUsage(this.currentUser.id);
        const limit = this.currentUser.storageLimit;
        
        this.storageUsed.textContent = usage.toFixed(2);
        this.storageTotal.textContent = limit;
        
        // Update storage info in dropdown
        const storageInfo = document.getElementById('storage-info');
        if (storageInfo) {
            storageInfo.innerHTML = `Almacenamiento: <span id="storage-used">${usage.toFixed(2)}</span> GB / <span id="storage-total">${limit}</span> GB`;
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    getFileIconClass(fileType) {
        switch (fileType) {
            case 'image': return 'bi-file-image';
            case 'video': return 'bi-file-play';
            case 'audio': return 'bi-file-music';
            case 'document': return 'bi-file-earmark-pdf';
            default: return 'bi-file';
        }
    }

    showToast(title, message, type = 'info') {
        this.toastTitle.textContent = title;
        this.toastMessage.textContent = message;
        
        // Set toast color based on type
        const toastElement = document.getElementById('toast');
        toastElement.className = 'toast';
        toastElement.classList.add(`bg-${type}`, 'text-white');
        
        // Update time
        const now = new Date();
        this.toastTime.textContent = now.toLocaleTimeString();
        
        this.toast.show();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new mYpuBApp();
    
    // Close help panel when clicking outside
    document.addEventListener('click', () => {
        const helpPanel = document.getElementById('help-panel');
        if (helpPanel.style.display === 'block') {
            helpPanel.style.display = 'none';
        }
    });
});
