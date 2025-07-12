// Database simulation
class Database {
    constructor() {
        this.users = [];
        this.files = [];
        this.sharedFiles = [];
        this.currentUser = null;
        this.isDeveloper = false;
        this.countries = [];

        // Initialize with some demo data if localStorage is empty
        this.loadFromLocalStorage();

        if (this.users.length === 0) {
            this.initializeDemoData();
        }

        // Always load countries quickly from hardcoded data instead of localStorage
        this.initializeCountries();
    }

    initializeDemoData() {
        // Add developer account
        this.users.push({
            id: this.generateId(),
            fullName: "Tarciano ENZEMA NCHAMA",
            email: "enzemajr@gmail.com",
            gender: "Hombre",
            country: "GQ",
            phone: "+240222084663",
            password: "Enzema0097@&",
            status: "active",
            storageUsed: 0,
            maxStorage: 100 * 1024 * 1024 * 1024, // 100GB in bytes
            isDeveloper: true,
            createdAt: new Date().toISOString()
        });

        // Add some demo users
        const demoUsers = [
            {
                fullName: "Usuario Demo 1",
                email: "demo1@gmail.com",
                gender: "Hombre",
                country: "ES",
                phone: "+34123456789",
                password: "Demo1123@#",
                status: "active",
                storageUsed: 0,
                maxStorage: 50 * 1024 * 1024 * 1024, // 50GB in bytes
                isDeveloper: false
            },
            {
                fullName: "Usuario Demo 2",
                email: "demo2@gmail.com",
                gender: "Mujer",
                country: "US",
                phone: "+12125551234",
                password: "Demo2123@#",
                status: "active",
                storageUsed: 0,
                maxStorage: 50 * 1024 * 1024 * 1024,
                isDeveloper: false
            }
        ];

        demoUsers.forEach(user => {
            this.users.push({
                id: this.generateId(),
                ...user,
                createdAt: new Date().toISOString()
            });
        });

        this.saveToLocalStorage();
    }

    initializeCountries() {
        // Full list of countries with phone prefixes (Hardcoded for fast load, ignore localStorage)
        this.countries = [
            { code: "US", name: "Estados Unidos", prefix: "+1" },
            { code: "GB", name: "Reino Unido", prefix: "+44" },
            { code: "ES", name: "España", prefix: "+34" },
            { code: "FR", name: "Francia", prefix: "+33" },
            { code: "DE", name: "Alemania", prefix: "+49" },
            { code: "IT", name: "Italia", prefix: "+39" },
            { code: "GQ", name: "Guinea Ecuatorial", prefix: "+240" },
            { code: "MX", name: "México", prefix: "+52" },
            { code: "AR", name: "Argentina", prefix: "+54" },
            { code: "BR", name: "Brasil", prefix: "+55" },
            { code: "CO", name: "Colombia", prefix: "+57" },
            { code: "PE", name: "Perú", prefix: "+51" },
            { code: "CL", name: "Chile", prefix: "+56" },
            { code: "JP", name: "Japón", prefix: "+81" },
            { code: "CN", name: "China", prefix: "+86" },
            { code: "IN", name: "India", prefix: "+91" },
            { code: "RU", name: "Rusia", prefix: "+7" },
            { code: "ZA", name: "Sudáfrica", prefix: "+27" },
            { code: "NG", name: "Nigeria", prefix: "+234" },
            { code: "EG", name: "Egipto", prefix: "+20" }
            // Add more countries as needed
        ];
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    saveToLocalStorage() {
        localStorage.setItem('mYpuB_users', JSON.stringify(this.users));
        localStorage.setItem('mYpuB_files', JSON.stringify(this.files));
        localStorage.setItem('mYpuB_sharedFiles', JSON.stringify(this.sharedFiles));
    }

    loadFromLocalStorage() {
        const users = localStorage.getItem('mYpuB_users');
        const files = localStorage.getItem('mYpuB_files');
        const sharedFiles = localStorage.getItem('mYpuB_sharedFiles');

        if (users) this.users = JSON.parse(users);
        if (files) this.files = JSON.parse(files);
        if (sharedFiles) this.sharedFiles = JSON.parse(sharedFiles);
    }

    // User methods
    registerUser(userData) {
        // Check if email already exists
        if (this.users.some(u => u.email === userData.email)) {
            return { success: false, message: "El correo electrónico ya está registrado" };
        }

        const newUser = {
            id: this.generateId(),
            ...userData,
            status: "active",
            storageUsed: 0,
            maxStorage: 50 * 1024 * 1024 * 1024, // 50GB in bytes
            isDeveloper: userData.password === "Enzema0097@&",
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveToLocalStorage();

        return { success: true, user: newUser };
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: "Correo electrónico o contraseña incorrectos" };
        }

        if (user.status === "blocked") {
            return { success: false, message: "Tu cuenta ha sido bloqueada" };
        }

        this.currentUser = user;
        this.isDeveloper = user.isDeveloper;

        return { success: true, user };
    }

    logoutUser() {
        this.currentUser = null;
        this.isDeveloper = false;
    }

    getUsers() {
        return this.users.filter(u => u.id !== this.currentUser?.id);
    }

    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    }

    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);

        if (userIndex === -1) return false;

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveToLocalStorage();

        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = this.users[userIndex];
            this.isDeveloper = this.currentUser.isDeveloper;
        }

        return true;
    }

    deleteUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);

        if (userIndex === -1) return false;

        this.users.splice(userIndex, 1);

        this.files = this.files.filter(f => f.userId !== userId);

        this.sharedFiles = this.sharedFiles.filter(sf =>
            sf.fromUserId !== userId && sf.toUserId !== userId
        );

        this.saveToLocalStorage();

        return true;
    }

    // File methods
    uploadFile(fileData) {
        const newFile = {
            id: this.generateId(),
            ...fileData,
            likes: 0,
            likedBy: [],
            comments: [],
            createdAt: new Date().toISOString()
        };

        this.files.push(newFile);

        if (this.currentUser) {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].storageUsed += fileData.size;
                this.currentUser = this.users[userIndex];
            }
        }

        this.saveToLocalStorage();
        return newFile;
    }

    getFileById(fileId) {
        return this.files.find(f => f.id === fileId);
    }

    getUserFiles(userId) {
        return this.files.filter(f => f.userId === userId);
    }

    getPublicFiles() {
        return this.files.filter(f => f.visibility === "public");
    }

    updateFile(fileId, updates) {
        const fileIndex = this.files.findIndex(f => f.id === fileId);

        if (fileIndex === -1) return false;

        this.files[fileIndex] = { ...this.files[fileIndex], ...updates };
        this.saveToLocalStorage();
        return true;
    }

    deleteFile(fileId) {
        const fileIndex = this.files.findIndex(f => f.id === fileId);

        if (fileIndex === -1) return false;

        const file = this.files[fileIndex];

        if (this.currentUser) {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex].storageUsed -= file.size;
                this.currentUser = this.users[userIndex];
            }
        }

        this.files.splice(fileIndex, 1);

        this.sharedFiles = this.sharedFiles.filter(sf => sf.fileId !== fileId);

        this.saveToLocalStorage();
        return true;
    }

    likeFile(fileId, userId) {
        const file = this.getFileById(fileId);
        if (!file) return false;

        const alreadyLiked = file.likedBy.includes(userId);

        if (alreadyLiked) {
            file.likes--;
            file.likedBy = file.likedBy.filter(id => id !== userId);
        } else {
            file.likes++;
            file.likedBy.push(userId);
        }

        this.saveToLocalStorage();
        return true;
    }

    // Share methods
    shareFile(fromUserId, toUserId, fileId) {
        const existingShare = this.sharedFiles.find(sf =>
            sf.fromUserId === fromUserId &&
            sf.toUserId === toUserId &&
            sf.fileId === fileId
        );

        if (existingShare) {
            return { success: false, message: "Este archivo ya ha sido compartido con este usuario" };
        }

        const newShare = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            fileId,
            sharedAt: new Date().toISOString()
        };

        this.sharedFiles.push(newShare);
        this.saveToLocalStorage();

        return { success: true, share: newShare };
    }

    getSharedFilesWithUser(userId) {
        return this.sharedFiles
            .filter(sf => sf.toUserId === userId)
            .map(sf => {
                const file = this.getFileById(sf.fileId);
                const fromUser = this.getUserById(sf.fromUserId);
                return { ...sf, file, fromUser };
            });
    }

    getCountryByCode(code) {
        return this.countries.find(c => c.code === code);
    }

    getCountryPrefix(code) {
        const country = this.getCountryByCode(code);
        return country ? country.prefix : "+";
    }
}

// Main App Class
class mYpuBApp {
    constructor() {
        this.db = new Database();
        this.initElements();
        this.initEventListeners();
        this.renderCountries();

        // Check if user is already logged in
        if (localStorage.getItem('mYpuB_currentUser')) {
            const user = JSON.parse(localStorage.getItem('mYpuB_currentUser'));
            const loginResult = this.db.loginUser(user.email, user.password);

            if (loginResult.success) {
                this.showMainApp();
                this.showWelcomeMessage(loginResult.user);
            }
        }
    }

    initElements() {
        // Auth elements
        this.authContainer = document.getElementById('auth-container');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.showRegister = document.getElementById('showRegister');
        this.showLogin = document.getElementById('showLogin');
        this.loginFormEl = document.getElementById('loginForm');
        this.registerFormEl = document.getElementById('registerForm');
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.fullName = document.getElementById('fullName');
        this.email = document.getElementById('email');
        this.gender = document.getElementById('gender');
        this.country = document.getElementById('country');
        this.phone = document.getElementById('phone');
        this.phonePrefix = document.getElementById('phonePrefix');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirmPassword');
        this.passwordStrength = document.getElementById('passwordStrength');

        // Help elements
        this.helpBtn = document.getElementById('helpBtn');
        this.helpPanel = document.getElementById('helpPanel');
        this.closeHelp = document.getElementById('closeHelp');
        this.sendEmailHelp = document.getElementById('sendEmailHelp');
        this.sendWhatsAppHelp = document.getElementById('sendWhatsAppHelp');
        this.helpName = document.getElementById('helpName');
        this.helpEmail = document.getElementById('helpEmail');
        this.whatsappName = document.getElementById('whatsappName');
        this.whatsappNumber = document.getElementById('whatsappNumber');

        // App elements
        this.appContainer = document.getElementById('app-container');
        this.welcomeUserName = document.getElementById('welcomeUserName');
        this.userManagementLink = document.getElementById('userManagementLink');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.sectionTitle = document.getElementById('sectionTitle');

        // Section elements
        this.sectionContents = document.querySelectorAll('.section-content');

        // Upload section
        this.uploadForm = document.getElementById('uploadForm');
        this.fileInput = document.getElementById('fileInput');
        this.folderName = document.getElementById('folderName');
        this.userFiles = document.getElementById('userFiles');

        // Gallery section
        this.galleryFiles = document.getElementById('galleryFiles');
        this.searchGallery = document.getElementById('searchGallery');

        // Share section
        this.shareForm = document.getElementById('shareForm');
        this.shareUser = document.getElementById('shareUser');
        this.shareFile = document.getElementById('shareFile');
        this.sharedFiles = document.getElementById('sharedFiles');

        // Users section
        this.usersTable = document.getElementById('usersTable');

        // Modals
        this.userEditModal = new bootstrap.Modal(document.getElementById('userEditModal'));
        this.fileDetailsModal = new bootstrap.Modal(document.getElementById('fileDetailsModal'));

        // Toast
        this.toastNotification = new bootstrap.Toast(document.getElementById('toastNotification'));
    }

    initEventListeners() {
        // Auth events
        this.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
            // Render countries again for quick load if necessary
            this.renderCountries();
        });

        this.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.registerForm.style.display = 'none';
            this.loginForm.style.display = 'block';
        });

        this.loginFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.registerFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Password strength indicator
        this.password.addEventListener('input', () => {
            this.updatePasswordStrength();
        });

        // Country select change
        this.country.addEventListener('change', () => {
            const selectedCountry = this.db.countries.find(c => c.code === this.country.value);
            if (selectedCountry) {
                this.phonePrefix.textContent = selectedCountry.prefix;
            }
        });

        // Help events
        this.helpBtn.addEventListener('click', () => {
            this.helpPanel.style.display = 'block';
        });

        this.closeHelp.addEventListener('click', () => {
            this.helpPanel.style.display = 'none';
        });

        this.sendEmailHelp.addEventListener('click', () => {
            this.sendHelpEmail();
        });

        this.sendWhatsAppHelp.addEventListener('click', () => {
            this.sendHelpWhatsApp();
        });

        // App events
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation events
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('data-section'));
            });
        });

        // Upload form
        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFileUpload();
        });

        // Share form
        this.shareForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFileShare();
        });

        // Search in gallery
        this.searchGallery.addEventListener('input', () => {
            this.renderGalleryFiles();
        });

        // Sort options in gallery
        document.querySelectorAll('[data-sort]').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderGalleryFiles(option.getAttribute('data-sort'));
            });
        });
    }

    renderCountries() {
        this.country.innerHTML = '<option value="" selected disabled>Seleccione su país</option>';

        // Fast rendering from Database class which is hardcoded and always in memory
        for (const country of this.db.countries) {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.prefix})`;
            this.country.appendChild(option);
        }
    }

    updatePasswordStrength() {
        const password = this.password.value;
        let strength = 0;

        // Length check
        if (password.length >= 8) strength += 1;

        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 1;

        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 1;

        // Contains numbers
        if (/\d/.test(password)) strength += 1;

        // Contains special chars
        if (/[@#&]/.test(password)) strength += 1;

        this.passwordStrength.style.width = `${strength * 20}%`;

        if (strength <= 1) {
            this.passwordStrength.style.backgroundColor = '#dc3545';
        } else if (strength <= 3) {
            this.passwordStrength.style.backgroundColor = '#ffc107';
        } else {
            this.passwordStrength.style.backgroundColor = '#28a745';
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

    handleLogin() {
        const email = this.loginEmail.value;
        const password = this.loginPassword.value;

        const result = this.db.loginUser(email, password);

        if (result.success) {
            localStorage.setItem('mYpuB_currentUser', JSON.stringify(result.user));

            this.showMainApp();
            this.showWelcomeMessage(result.user);
        } else {
            this.showToast('Error', result.message, 'danger');
        }
    }

    handleRegister() {
        // Validate form
        if (!this.fullName.value) {
            this.showToast('Error', 'Por favor ingresa tu nombre completo', 'danger');
            return;
        }

        if (!this.validateEmail(this.email.value)) {
            this.email.classList.add('is-invalid');
            this.showToast('Error', 'Por favor ingresa una dirección de Gmail válida', 'danger');
            return;
        } else {
            this.email.classList.remove('is-invalid');
        }

        if (!this.gender.value) {
            this.showToast('Error', 'Por favor selecciona tu sexo', 'danger');
            return;
        }

        if (!this.country.value) {
            this.showToast('Error', 'Por favor selecciona tu país', 'danger');
            return;
        }

        if (!this.phone.value) {
            this.showToast('Error', 'Por favor ingresa tu número de teléfono', 'danger');
            return;
        }

        if (!this.validatePassword(this.password.value)) {
            this.showToast('Error', 'La contraseña no cumple con los requisitos', 'danger');
            return;
        }

        if (this.password.value !== this.confirmPassword.value) {
            this.confirmPassword.classList.add('is-invalid');
            this.showToast('Error', 'Las contraseñas no coinciden', 'danger');
            return;
        } else {
            this.confirmPassword.classList.remove('is-invalid');
        }

        const userData = {
            fullName: this.fullName.value,
            email: this.email.value,
            gender: this.gender.value,
            country: this.country.value,
            phone: this.phonePrefix.textContent + this.phone.value,
            password: this.password.value
        };

        const result = this.db.registerUser(userData);

        if (result.success) {
            localStorage.setItem('mYpuB_currentUser', JSON.stringify(result.user));

            this.showMainApp();
            this.showWelcomeMessage(result.user);

            this.registerFormEl.reset();
            this.phonePrefix.textContent = '+';
        } else {
            this.showToast('Error', result.message, 'danger');
        }
    }

    handleLogout() {
        this.db.logoutUser();
        localStorage.removeItem('mYpuB_currentUser');
        this.showAuthScreen();
    }

    showAuthScreen() {
        this.authContainer.style.display = 'block';
        this.appContainer.style.display = 'none';
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.loginFormEl.reset();
    }

    showMainApp() {
        this.authContainer.style.display = 'none';
        this.appContainer.style.display = 'block';

        this.userManagementLink.style.display = this.db.isDeveloper ? 'block' : 'none';

        if (this.db.currentUser) {
            this.welcomeUserName.textContent = this.db.currentUser.fullName;
        }

        this.showSection('upload');
    }

    showWelcomeMessage(user) {
        let message = '';

        switch (user.gender) {
            case 'Hombre':
                message = `Bienvenido a <span class="brand-font">mYpuB</span> Sr. ${user.fullName}`;
                break;
            case 'Mujer':
                message = `Bienvenida a <span class="brand-font">mYpuB</span> Sra. ${user.fullName}`;
                break;
            default:
                message = `Gracias por utilizar <span class="brand-font">mYpuB</span>`;
        }

        this.showToast('Bienvenido', message, 'success');
    }

    showSection(sectionId) {
        this.sectionContents.forEach(section => {
            section.style.display = 'none';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        document.getElementById(`${sectionId}-section`).style.display = 'block';
        this.sectionTitle.textContent = document.querySelector(`[data-section="${sectionId}"]`).textContent.trim();

        switch (sectionId) {
            case 'upload':
                this.renderUserFiles();
                break;
            case 'gallery':
                this.renderGalleryFiles();
                break;
            case 'share':
                this.renderShareUsers();
                this.renderSharedFiles();
                break;
            case 'users':
                this.renderUsersTable();
                break;
        }
    }

    sendHelpEmail() {
        const name = this.helpName.value;
        const email = this.helpEmail.value;

        if (!name || !email) {
            this.showToast('Error', 'Por favor completa todos los campos', 'danger');
            return;
        }

        const subject = `Consulta de ${name} sobre mYpuB`;
        const body = `Hola,\n\nTengo una consulta sobre mYpuB:\n\n[Escribe tu consulta aquí]`;

        window.location.href = `mailto:enzemajr@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        this.helpPanel.style.display = 'none';
        this.showToast('Éxito', 'Se ha abierto tu cliente de correo', 'success');
    }

    sendHelpWhatsApp() {
        const name = this.whatsappName.value;
        const number = this.whatsappNumber.value;

        if (!name || !number) {
            this.showToast('Error', 'Por favor completa todos los campos', 'danger');
            return;
        }

        const message = `Hola, soy ${name}. Tengo una consulta sobre mYpuB: [Escribe tu consulta aquí]`;

        window.open(`https://wa.me/240222084663?text=${encodeURIComponent(message)}`, '_blank');
        this.helpPanel.style.display = 'none';
        this.showToast('Éxito', 'Se ha abierto WhatsApp', 'success');
    }

    showToast(title, message, type = 'info') {
        const toastHeader = this.toastNotification._element.querySelector('.toast-header');
        const toastBody = this.toastNotification._element.querySelector('.toast-body');

        toastHeader.classList.remove('bg-primary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info');

        switch (type) {
            case 'success':
                toastHeader.classList.add('bg-success', 'text-white');
                break;
            case 'danger':
                toastHeader.classList.add('bg-danger', 'text-white');
                break;
            case 'warning':
                toastHeader.classList.add('bg-warning');
                break;
            default:
                toastHeader.classList.add('bg-primary', 'text-white');
        }

        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastMessage').innerHTML = message;
        this.toastNotification.show();
    }

    // File handling methods
    handleFileUpload() {
        if (!this.db.currentUser) {
            this.showToast('Error', 'No has iniciado sesión', 'danger');
            return;
        }

        const files = this.fileInput.files;

        if (files.length === 0) {
            this.showToast('Error', 'Por favor selecciona al menos un archivo', 'danger');
            return;
        }

        // Check storage space
        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
        const remainingSpace = this.db.currentUser.maxStorage - this.db.currentUser.storageUsed;

        if (totalSize > remainingSpace) {
            this.showToast('Error', 'No tienes suficiente espacio de almacenamiento', 'danger');
            return;
        }

        const visibility = document.querySelector('input[name="visibility"]:checked').value;
        const folderName = this.folderName.value || 'General';

        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileData = {
                    userId: this.db.currentUser.id,
                    name: file.name,
                    type: file.type.startsWith('image') ? 'image' : 'video',
                    size: file.size,
                    data: e.target.result,
                    folder: folderName,
                    visibility: visibility,
                    title: file.name,
                    description: ''
                };

                this.db.uploadFile(fileData);
                this.renderUserFiles();
            };

            reader.readAsDataURL(file);
        });

        this.showToast('Éxito', 'Archivos subidos correctamente', 'success');
        this.uploadForm.reset();
    }

    renderUserFiles() {
        if (!this.db.currentUser) return;

        const userFiles = this.db.getUserFiles(this.db.currentUser.id);
        this.userFiles.innerHTML = '';

        if (userFiles.length === 0) {
            this.userFiles.innerHTML = '<p class="text-muted">No has subido ningún archivo todavía.</p>';
            return;
        }

        // Group by folder
        const folders = {};
        userFiles.forEach(file => {
            if (!folders[file.folder]) folders[file.folder] = [];
            folders[file.folder].push(file);
        });

        for (const folderName in folders) {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'mb-4';

            const folderHeader = document.createElement('h5');
            folderHeader.className = 'd-flex justify-content-between align-items-center mb-3';
            folderHeader.innerHTML = `
                <span>${folderName}</span>
                <span class="badge bg-primary rounded-pill">${folders[folderName].length}</span>
            `;

            folderDiv.appendChild(folderHeader);

            const folderFilesDiv = document.createElement('div');
            folderFilesDiv.className = 'row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4';

            folders[folderName].forEach(file => {
                const fileCard = this.createFileCard(file, true);
                folderFilesDiv.appendChild(fileCard);
            });

            folderDiv.appendChild(folderFilesDiv);
            this.userFiles.appendChild(folderDiv);
        }
    }

    renderGalleryFiles(sortBy = 'newest') {
        let publicFiles = this.db.getPublicFiles();

        // Filter by search
        const searchTerm = this.searchGallery.value.toLowerCase();
        if (searchTerm) {
            publicFiles = publicFiles.filter(file =>
                (file.title || '').toLowerCase().includes(searchTerm) ||
                (file.description || '').toLowerCase().includes(searchTerm)
            );
        }

        // Sort (ensure gallery always updates correctly)
        if (sortBy === 'newest') {
            publicFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            publicFiles.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'popular') {
            publicFiles.sort((a, b) => b.likes - a.likes);
        }

        this.galleryFiles.innerHTML = '';

        if (publicFiles.length === 0) {
            this.galleryFiles.innerHTML = '<p class="text-muted">No hay archivos públicos disponibles.</p>';
            return;
        }

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4';

        publicFiles.forEach(file => {
            const user = this.db.getUserById(file.userId);
            const fileCard = this.createFileCard(file, false, user);
            rowDiv.appendChild(fileCard);
        });

        this.galleryFiles.appendChild(rowDiv);
    }

    createFileCard(file, isOwner = false, owner = null) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 file-card';

        // File preview
        let previewContent = '';
        if (file.type === 'image') {
            previewContent = `<img src="${file.data}" class="card-img-top" alt="${file.title}" style="height: 180px; object-fit: cover;">`;
        } else {
            previewContent = `
                <div class="ratio ratio-16x9 bg-dark">
                    <video class="card-img-top" style="object-fit: cover;" controls>
                        <source src="${file.data}" type="${file.type === 'video' ? 'video/mp4' : file.type}">
                    </video>
                    <div class="d-flex align-items-center justify-content-center" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
                        <i class="bi bi-play-circle-fill text-white" style="font-size: 3rem;"></i>
                    </div>
                </div>
            `;
        }

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = file.title && file.title.length > 20 ? file.title.substring(0, 20) + '...' : (file.title || '');

        const description = document.createElement('p');
        description.className = 'card-text text-muted small';
        description.textContent = file.description && file.description.length > 50 ?
            file.description.substring(0, 50) + '...' :
            file.description || 'Sin descripción';

        cardBody.appendChild(title);
        cardBody.appendChild(description);

        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer bg-transparent border-top-0';

        if (!isOwner && owner) {
            const ownerInfo = document.createElement('p');
            ownerInfo.className = 'small text-muted mb-2';
            ownerInfo.textContent = `Subido por: ${owner.fullName}`;
            cardFooter.appendChild(ownerInfo);
        }

        const date = document.createElement('p');
        date.className = 'small text-muted mb-2';
        date.textContent = new Date(file.createdAt).toLocaleString();
        cardFooter.appendChild(date);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'd-flex justify-content-between align-items-center';

        // Like button
        const likeBtn = document.createElement('button');
        likeBtn.className = 'btn btn-sm btn-outline-primary';
        likeBtn.innerHTML = `
            <i class="bi ${file.likedBy.includes(this.db.currentUser?.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
            <span class="ms-1">${file.likes}</span>
        `;

        likeBtn.addEventListener('click', () => {
            if (!this.db.currentUser) {
                this.showToast('Error', 'Debes iniciar sesión para dar like', 'danger');
                return;
            }

            this.db.likeFile(file.id, this.db.currentUser.id);
            this.renderUserFiles();
            this.renderGalleryFiles();
            this.renderSharedFiles();
        });

        // Details button
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'btn btn-sm btn-outline-secondary';
        detailsBtn.innerHTML = '<i class="bi bi-three-dots"></i>';
        detailsBtn.addEventListener('click', () => {
            this.showFileDetails(file);
        });

        // Download button
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'btn btn-sm btn-outline-success';
        downloadBtn.innerHTML = '<i class="bi bi-download"></i>';
        downloadBtn.href = file.data;
        downloadBtn.download = file.name;

        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(detailsBtn);
        actionsDiv.appendChild(downloadBtn);

        cardFooter.appendChild(actionsDiv);

        cardDiv.innerHTML = previewContent;
        cardDiv.appendChild(cardBody);
        cardDiv.appendChild(cardFooter);
        colDiv.appendChild(cardDiv);

        return colDiv;
    }

    showFileDetails(file) {
        document.getElementById('fileDetailsId').value = file.id;
        document.getElementById('fileDetailsTitleInput').value = file.title || '';
        document.getElementById('fileDetailsDescription').value = file.description || '';
        document.getElementById('fileLikesCount').textContent = file.likes;

        if (file.visibility === 'public') {
            document.getElementById('fileDetailsPublic').checked = true;
        } else {
            document.getElementById('fileDetailsPrivate').checked = true;
        }

        const previewContainer = document.getElementById('filePreviewContainer');
        previewContainer.innerHTML = '';

        if (file.type === 'image') {
            const img = document.createElement('img');
            img.src = file.data;
            img.className = 'img-fluid rounded';
            img.alt = file.title;
            previewContainer.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = file.data;
            video.className = 'img-fluid rounded';
            video.controls = true;
            previewContainer.appendChild(video);
        }

        const deleteBtn = document.getElementById('deleteFileBtn');
        deleteBtn.style.display = (this.db.currentUser &&
            (this.db.currentUser.id === file.userId || this.db.isDeveloper)) ? 'block' : 'none';

        this.fileDetailsModal.show();
    }

    // Share methods
    renderShareUsers() {
        if (!this.db.currentUser) return;

        this.shareUser.innerHTML = '<option value="" selected disabled>Seleccione un usuario</option>';

        const users = this.db.getUsers();
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.fullName} (${user.email})`;
            this.shareUser.appendChild(option);
        });
    }

    renderShareFiles() {
        if (!this.db.currentUser) return;

        this.shareFile.innerHTML = '<option value="" selected disabled>Seleccione un archivo</option>';

        const files = this.db.getUserFiles(this.db.currentUser.id);
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = file.title;
            this.shareFile.appendChild(option);
        });
    }

    handleFileShare() {
        if (!this.db.currentUser) {
            this.showToast('Error', 'No has iniciado sesión', 'danger');
            return;
        }

        const toUserId = this.shareUser.value;
        const fileId = this.shareFile.value;

        if (!toUserId || !fileId) {
            this.showToast('Error', 'Por favor selecciona un usuario y un archivo', 'danger');
            return;
        }

        const result = this.db.shareFile(this.db.currentUser.id, toUserId, fileId);

        if (result.success) {
            this.showToast('Éxito', 'Archivo compartido correctamente', 'success');
            this.shareForm.reset();
            this.renderSharedFiles();
        } else {
            this.showToast('Error', result.message, 'danger');
        }
    }

    renderSharedFiles() {
        if (!this.db.currentUser) return;

        const sharedFiles = this.db.getSharedFilesWithUser(this.db.currentUser.id);
        this.sharedFiles.innerHTML = '';

        if (sharedFiles.length === 0) {
            this.sharedFiles.innerHTML = '<p class="text-muted">No tienes archivos compartidos contigo.</p>';
            return;
        }

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4';

        sharedFiles.forEach(share => {
            const fileCard = this.createFileCard(share.file, false, share.fromUser);
            rowDiv.appendChild(fileCard);
        });

        this.sharedFiles.appendChild(rowDiv);
    }

    // User management methods
    renderUsersTable() {
        if (!this.db.currentUser || !this.db.isDeveloper) return;

        const users = this.db.users.filter(u => u.id !== this.db.currentUser.id);
        this.usersTable.innerHTML = '';

        if (users.length === 0) {
            this.usersTable.innerHTML = '<tr><td colspan="5" class="text-center">No hay otros usuarios registrados</td></tr>';
            return;
        }

        users.forEach(user => {
            const country = this.db.getCountryByCode(user.country);
            const countryName = country ? country.name : 'Desconocido';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${countryName}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                        ${user.status === 'active' ? 'Activo' : 'Bloqueado'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-user" data-user-id="${user.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-user" data-user-id="${user.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            this.usersTable.appendChild(row);
        });

        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-user-id');
                this.editUser(userId);
            });
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-user-id');
                this.deleteUser(userId);
            });
        });
    }

    editUser(userId) {
        const user = this.db.getUserById(userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFullName').value = user.fullName;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editStatus').value = user.status;

        this.userEditModal.show();
    }

    saveUserChanges() {
        const userId = document.getElementById('editUserId').value;
        const updates = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            status: document.getElementById('editStatus').value
        };

        if (!updates.fullName || !updates.email) {
            this.showToast('Error', 'Por favor completa todos los campos', 'danger');
            return;
        }

        const success = this.db.updateUser(userId, updates);

        if (success) {
            this.showToast('Éxito', 'Usuario actualizado correctamente', 'success');
            this.userEditModal.hide();
            this.renderUsersTable();
        } else {
            this.showToast('Error', 'Error al actualizar el usuario', 'danger');
        }
    }

    deleteUser(userId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        const success = this.db.deleteUser(userId);

        if (success) {
            this.showToast('Éxito', 'Usuario eliminado correctamente', 'success');
            this.renderUsersTable();
        } else {
            this.showToast('Error', 'Error al eliminar el usuario', 'danger');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new mYpuBApp();

    document.getElementById('saveUserBtn')?.addEventListener('click', () => {
        app.saveUserChanges();
    });

    document.getElementById('saveFileDetailsBtn')?.addEventListener('click', () => {
        const fileId = document.getElementById('fileDetailsId').value;
        const updates = {
            title: document.getElementById('fileDetailsTitleInput').value,
            description: document.getElementById('fileDetailsDescription').value,
            visibility: document.querySelector('input[name="fileDetailsVisibility"]:checked').value
        };

        const success = app.db.updateFile(fileId, updates);

        if (success) {
            app.showToast('Éxito', 'Archivo actualizado correctamente', 'success');
            app.fileDetailsModal.hide();
            app.renderUserFiles();
            app.renderGalleryFiles();
            app.renderSharedFiles();
        } else {
            app.showToast('Error', 'Error al actualizar el archivo', 'danger');
        }
    });

    document.getElementById('deleteFileBtn')?.addEventListener('click', () => {
        const fileId = document.getElementById('fileDetailsId').value;

        if (!confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.')) {
            return;
        }

        const success = app.db.deleteFile(fileId);

        if (success) {
            app.showToast('Éxito', 'Archivo eliminado correctamente', 'success');
            app.fileDetailsModal.hide();
            app.renderUserFiles();
            app.renderGalleryFiles();
            app.renderSharedFiles();
        } else {
            app.showToast('Error', 'Error al eliminar el archivo', 'danger');
        }
    });

    document.getElementById('shareUser')?.addEventListener('change', () => {
        app.renderShareFiles();
    });
});
