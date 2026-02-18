// Virtual Platform - Main Application
class VirtualPlatform {
    constructor() {
        this.currentUser = null;
        this.notifications = [];
        this.tasks = [];
        this.projects = [];
        this.teamMembers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadMockData();
        this.simulateRealTimeUpdates();
        
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
            }, 300);
        }, 2000);
    }

    setupEventListeners() {
        // Skill selection
        document.querySelectorAll('.skill-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleSkill(tag));
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });

            // Close user dropdown
            const dropdown = document.getElementById('userDropdown');
            if (dropdown.classList.contains('show') && !e.target.closest('.user-menu')) {
                dropdown.classList.remove('show');
            }
        });
    }

    // ==================== AUTHENTICATION ====================
    checkAuth() {
        const savedUser = localStorage.getItem('virtual_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        } else {
            this.showAuth();
        }
    }

    showAuth() {
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('dashboardScreen').style.display = 'none';
        this.updateRoleMenu(false);
    }

    showDashboard() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        this.updateRoleMenu(true);
        this.loadDashboardData();
        this.updateUserInfo();
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showToast('Error', 'Please fill in all fields', 'error');
            return;
        }

        // Mock login - In production, this would be an API call
        const mockUser = {
            id: 'user_' + Date.now(),
            name: 'John Doe',
            email: email,
            role: 'crate', // Default role for demo
            freelancingField: ['Video Editing', 'Graphic Design'],
            completedProjects: 5,
            totalEarnings: 2500,
            supervisor: 'Jane Smith',
            avatar: 'JD'
        };

        this.currentUser = mockUser;
        localStorage.setItem('virtual_user', JSON.stringify(mockUser));
        
        this.showToast('Welcome Back!', 'Login successful', 'success');
        this.showDashboard();
    }

    handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const dob = document.getElementById('signupDob').value;
        const selectedSkills = Array.from(document.querySelectorAll('.skill-tag.selected'))
            .map(tag => tag.dataset.skill);

        // Validation
        if (!name || !email || !password || !dob) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        // Age validation
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 16) {
            this.showToast('Error', 'You must be at least 16 years old', 'error');
            return;
        }

        if (selectedSkills.length === 0) {
            this.showToast('Error', 'Please select at least one skill', 'error');
            return;
        }

        // Mock registration - In production, this would be an API call
        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            role: 'precrate', // Start as precrate
            freelancingField: selectedSkills,
            completedProjects: 0,
            totalEarnings: 0,
            supervisor: null,
            avatar: name.charAt(0).toUpperCase(),
            dateOfBirth: dob
        };

        this.currentUser = newUser;
        localStorage.setItem('virtual_user', JSON.stringify(newUser));
        
        this.showToast('Welcome to Virtual!', 'Account created successfully', 'success');
        this.showDashboard();
    }

    logout() {
        localStorage.removeItem('virtual_user');
        this.currentUser = null;
        this.showToast('Logged Out', 'You have been logged out', 'success');
        this.showAuth();
        this.closeUserMenu();
    }

    // ==================== USER INTERFACE ====================
    toggleSkill(tag) {
        tag.classList.toggle('selected');
        this.updateSelectedSkills();
    }

    updateSelectedSkills() {
        const selected = Array.from(document.querySelectorAll('.skill-tag.selected'))
            .map(tag => tag.dataset.skill);
        
        const container = document.getElementById('selectedSkills');
        container.innerHTML = selected.map(skill => `
            <div class="selected-skill">
                ${skill}
                <i class="fas fa-times" onclick="virtual.removeSkill('${skill}')"></i>
            </div>
        `).join('');
    }

    removeSkill(skill) {
        const tag = Array.from(document.querySelectorAll('.skill-tag'))
            .find(t => t.dataset.skill === skill);
        if (tag) {
            tag.classList.remove('selected');
            this.updateSelectedSkills();
        }
    }

    showLogin() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('signupForm').classList.remove('active');
        document.querySelectorAll('.auth-tab').forEach((tab, index) => {
            tab.classList.toggle('active', index === 0);
        });
    }

    showSignup() {
        document.getElementById('signupForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        document.querySelectorAll('.auth-tab').forEach((tab, index) => {
            tab.classList.toggle('active', index === 1);
        });
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.parentNode.querySelector('.toggle-password');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    closeUserMenu() {
        document.getElementById('userDropdown').classList.remove('show');
    }

    toggleNotifications() {
        // Toggle notification panel (to be implemented)
        this.showToast('Notifications', 'Showing notifications panel', 'info');
    }

    showToast(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    // ==================== DASHBOARD ====================
    loadDashboardData() {
        this.updateStats();
        this.loadRecentTasks();
        this.loadActiveProjects();
        this.loadNotifications();
        this.loadTeamMembers();
        this.updatePromotionProgress();
    }

    updateStats() {
        const user = this.currentUser;
        document.getElementById('statTasks').textContent = this.tasks.length;
        document.getElementById('statEarnings').textContent = `$${user.totalEarnings}`;
        document.getElementById('statProjects').textContent = user.completedProjects;
        
        // Calculate promotion progress
        let progress = 0;
        if (user.role === 'precrate') {
            progress = 0;
        } else if (user.role === 'crate') {
            progress = Math.min((user.completedProjects / 10) * 100, 100);
        } else if (user.role === 'project_initiator') {
            progress = Math.min((user.completedProjects / 15) * 100, 100);
        }
        document.getElementById('statProgress').textContent = `${Math.round(progress)}%`;
    }

    loadRecentTasks() {
        const container = document.getElementById('recentTasks');
        if (!container) return;

        const recentTasks = this.tasks.slice(0, 5);
        container.innerHTML = recentTasks.map(task => `
            <div class="task-item" onclick="virtual.showTaskDetail('${task.id}')">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.project} • Due: ${task.dueDate}</p>
                </div>
                <div class="task-status status-${task.status}">${task.status.replace('_', ' ')}</div>
            </div>
        `).join('');
    }

    loadActiveProjects() {
        const container = document.getElementById('activeProjects');
        if (!container) return;

        const activeProjects = this.projects.filter(p => p.status === 'active').slice(0, 3);
        container.innerHTML = activeProjects.map(project => `
            <div class="project-item" onclick="virtual.showProjectDetail('${project.id}')">
                <div class="project-header">
                    <div class="project-title">${project.title}</div>
                    <div class="project-type type-${project.type}">${project.type}</div>
                </div>
                <p>${project.description}</p>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Progress</span>
                        <span>${project.progress}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadNotifications() {
        const container = document.getElementById('dashboardNotifications');
        if (!container) return;

        const recentNotifications = this.notifications.slice(0, 5);
        container.innerHTML = recentNotifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                onclick="virtual.markNotificationAsRead('${notification.id}')">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `).join('');

        // Update notification count
        const unreadCount = this.notifications.filter(n => !n.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        document.getElementById('taskBadge').textContent = this.tasks.filter(t => t.status === 'pending').length;
    }

    loadTeamMembers() {
        const container = document.getElementById('teamMembersList');
        if (!container) return;

        container.innerHTML = this.teamMembers.map(member => `
            <div class="team-member">
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `).join('');
    }

    updatePromotionProgress() {
        const user = this.currentUser;
        const roles = ['precrate', 'crate', 'project_initiator', 'momentum_supervisor', 'admin'];
        const currentIndex = roles.indexOf(user.role);
        const nextRole = currentIndex < roles.length - 1 ? roles[currentIndex + 1] : user.role;

        document.getElementById('currentRoleName').textContent = user.role.replace('_', ' ');
        document.getElementById('nextRoleName').textContent = nextRole.replace('_', ' ');

        let projectsNeeded = 0, earningsNeeded = 0, currentProjects = 0, currentEarnings = 0;

        switch (user.role) {
            case 'precrate':
                projectsNeeded = 0;
                earningsNeeded = 0;
                currentProjects = 0;
                currentEarnings = 0;
                break;
            case 'crate':
                projectsNeeded = 10;
                earningsNeeded = 5000;
                currentProjects = user.completedProjects;
                currentEarnings = user.totalEarnings;
                break;
            case 'project_initiator':
                projectsNeeded = 15;
                earningsNeeded = 10000;
                currentProjects = user.completedProjects;
                currentEarnings = user.totalEarnings;
                break;
            default:
                projectsNeeded = 0;
                earningsNeeded = 0;
        }

        const projectProgress = Math.min((currentProjects / projectsNeeded) * 100, 100);
        const earningsProgress = Math.min((currentEarnings / earningsNeeded) * 100, 100);
        const overallProgress = Math.round((projectProgress + earningsProgress) / 2);

        document.getElementById('promotionBar').style.width = `${overallProgress}%`;
        document.getElementById('promotionProjects').textContent = `${currentProjects}/${projectsNeeded}`;
        document.getElementById('promotionEarnings').textContent = `$${currentEarnings}/$${earningsNeeded}`;
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const user = this.currentUser;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = user.avatar;
        document.getElementById('currentRole').textContent = user.role.replace('_', ' ');
        document.getElementById('roleStatus').textContent = user.role === 'precrate' ? 'Learning' : 'Earning';
        
        // Update role icon
        const roleIcon = document.getElementById('roleIcon');
        const icons = {
            precrate: 'fas fa-user-graduate',
            crate: 'fas fa-user',
            project_initiator: 'fas fa-user-tie',
            momentum_supervisor: 'fas fa-user-shield',
            admin: 'fas fa-user-cog'
        };
        roleIcon.className = icons[user.role] || 'fas fa-user';
    }

    updateRoleMenu(show) {
        const menu = document.getElementById('roleSpecificMenu');
        const roleTitle = document.getElementById('roleTitle');
        
        if (show && this.currentUser) {
            menu.style.display = 'block';
            
            const role = this.currentUser.role;
            const roleNames = {
                precrate: 'Learning Path',
                crate: 'Work Dashboard',
                project_initiator: 'Project Management',
                momentum_supervisor: 'Supervision',
                admin: 'Administration'
            };
            
            roleTitle.textContent = roleNames[role] || 'Role Tools';
            document.getElementById('roleDashboardText').textContent = `${role.replace('_', ' ')} Dashboard`;
            
            // Show/hide role-specific items
            document.getElementById('manageProjectsItem').style.display = 
                ['project_initiator', 'momentum_supervisor', 'admin'].includes(role) ? 'flex' : 'none';
            document.getElementById('teamManagementItem').style.display = 
                ['momentum_supervisor', 'admin'].includes(role) ? 'flex' : 'none';
        } else {
            menu.style.display = 'none';
        }
    }

    // ==================== SCREEN NAVIGATION ====================
    showProjects() {
        this.showScreen('projectsScreen', 'Projects');
        this.loadProjectsScreen();
    }

    showTasks() {
        this.showScreen('tasksScreen', 'My Tasks');
        this.loadTasksScreen();
    }

    showEarnings() {
        this.showScreen('earningsScreen', 'Earnings');
        this.loadEarningsScreen();
    }

    showProfile() {
        this.showScreen('profileScreen', 'My Profile');
        this.loadProfileScreen();
    }

    showLearning() {
        this.showToast('Learning Center', 'Learning resources will be available soon', 'info');
    }

    showPromotions() {
        this.showToast('Promotion Path', 'Showing your promotion progress', 'info');
    }

    showTeam() {
        this.showToast('Team', 'Showing team members', 'info');
    }

    showRoleDashboard() {
        const role = this.currentUser.role;
        const titles = {
            precrate: 'Learning Dashboard',
            crate: 'Work Dashboard',
            project_initiator: 'Project Dashboard',
            momentum_supervisor: 'Supervisor Dashboard',
            admin: 'Admin Dashboard'
        };
        this.showToast(titles[role], `Showing ${role.replace('_', ' ')} dashboard`, 'info');
    }

    showScreen(screenId, title) {
        // Hide all screens
        document.querySelectorAll('.screen, .dashboard-screen').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show requested screen
        document.getElementById(screenId).style.display = 'block';
        document.getElementById('dashboardTitle').textContent = title;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    // ==================== MODALS ====================
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showCreateProject() {
        if (!this.currentUser || this.currentUser.role === 'precrate') {
            this.showToast('Permission Denied', 'Precrates cannot create projects', 'error');
            return;
        }
        
        this.showModal('createProjectModal');
        this.loadCreateProjectForm();
    }

    showQuickTask() {
        this.showToast('Quick Task', 'Quick task creation will be available soon', 'info');
    }

    showTaskDetail(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.showModal('taskDetailModal');
            this.loadTaskDetail(task);
        }
    }

    showProjectDetail(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.showToast(project.title, `Project: ${project.description}`, 'info');
        }
    }

    // ==================== MOCK DATA ====================
    loadMockData() {
        // Mock tasks
        this.tasks = [
            {
                id: 'task1',
                title: 'Video Editing - Intro Sequence',
                project: 'YouTube Channel Rebrand',
                status: 'in_progress',
                dueDate: 'Tomorrow',
                payment: 50,
                description: 'Create a 10-second intro sequence with logo animation',
                priority: 'high'
            },
            {
                id: 'task2',
                title: 'Color Grading - Vlog Footage',
                project: 'Travel Vlog Series',
                status: 'pending',
                dueDate: 'Dec 15',
                payment: 75,
                description: 'Apply color grading to 30 minutes of vlog footage',
                priority: 'medium'
            },
            {
                id: 'task3',
                title: 'Sound Effects Addition',
                project: 'Corporate Training Video',
                status: 'completed',
                dueDate: 'Dec 10',
                payment: 40,
                description: 'Add appropriate sound effects to training video',
                priority: 'low'
            },
            {
                id: 'task4',
                title: 'Thumbnail Design',
                project: 'YouTube Channel Rebrand',
                status: 'pending',
                dueDate: 'Dec 20',
                payment: 30,
                description: 'Design engaging thumbnails for 5 videos',
                priority: 'medium'
            }
        ];

        // Mock projects
        this.projects = [
            {
                id: 'project1',
                title: 'YouTube Channel Rebrand',
                type: 'team',
                status: 'active',
                progress: 60,
                description: 'Complete rebranding of cooking YouTube channel',
                budget: 2000
            },
            {
                id: 'project2',
                title: 'Travel Vlog Series',
                type: 'personal',
                status: 'active',
                progress: 30,
                description: 'Edit 10-part travel vlog series from Europe trip',
                budget: 1500
            },
            {
                id: 'project3',
                title: 'Corporate Training Video',
                type: 'main',
                status: 'completed',
                progress: 100,
                description: 'Training video for company onboarding process',
                budget: 5000
            }
        ];

        // Mock notifications
        this.notifications = [
            {
                id: 'notif1',
                title: 'New Task Assigned',
                message: 'You have been assigned a new video editing task',
                time: '2 hours ago',
                read: false
            },
            {
                id: 'notif2',
                title: 'Project Deadline Approaching',
                message: 'Travel Vlog Series deadline is in 3 days',
                time: '1 day ago',
                read: false
            },
            {
                id: 'notif3',
                title: 'Payment Received',
                message: '$40 has been credited to your account',
                time: '2 days ago',
                read: true
            },
            {
                id: 'notif4',
                title: 'New Team Member',
                message: 'Sarah Johnson joined your project team',
                time: '3 days ago',
                read: true
            }
        ];

        // Mock team members
        this.teamMembers = [
            { name: 'Jane Smith', role: 'Project Initiator', avatar: 'JS' },
            { name: 'Mike Johnson', role: 'Crate', avatar: 'MJ' },
            { name: 'Sarah Wilson', role: 'Crate', avatar: 'SW' },
            { name: 'Alex Chen', role: 'Momentum Supervisor', avatar: 'AC' }
        ];
    }

    // ==================== SCREEN LOADERS ====================
    loadCreateProjectForm() {
        const modalBody = document.querySelector('#createProjectModal .modal-body');
        modalBody.innerHTML = `
            <div class="form-group">
                <label for="projectTitle">Project Title</label>
                <input type="text" id="projectTitle" class="w-100" placeholder="Enter project title" style="width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--radius);">
            </div>
            
            <div class="form-group">
                <label for="projectType">Project Type</label>
                <select id="projectType" class="w-100" style="width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--radius);">
                    <option value="personal">Personal Project</option>
                    <option value="team">Team Project</option>
                    ${this.currentUser.role !== 'crate' ? '<option value="main">Main Project</option>' : ''}
                </select>
            </div>
            
            <div class="form-group">
                <label for="projectDescription">Description</label>
                <textarea id="projectDescription" class="w-100" rows="4" placeholder="Describe the project..." style="width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--radius);"></textarea>
            </div>
            
            <div class="form-group">
                <label for="projectBudget">Budget ($)</label>
                <input type="number" id="projectBudget" class="w-100" placeholder="1000" style="width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--radius);">
            </div>
            
            <div class="form-group">
                <label for="projectDeadline">Deadline</label>
                <input type="date" id="projectDeadline" class="w-100" style="width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: var(--radius);">
            </div>
            
            <div class="d-flex justify-between mt-4">
                <button class="btn btn-outline" onclick="virtual.closeModal('createProjectModal')">Cancel</button>
                <button class="btn btn-primary" onclick="virtual.createProject()">Create Project</button>
            </div>
        `;
    }

    loadTaskDetail(task) {
        const modalBody = document.querySelector('#taskDetailModal .modal-body');
        modalBody.innerHTML = `
            <div class="task-detail">
                <h3>${task.title}</h3>
                <div class="d-flex align-center gap-3 mb-4">
                    <span class="task-status status-${task.status}">${task.status.replace('_', ' ')}</span>
                    <span><i class="fas fa-calendar"></i> Due: ${task.dueDate}</span>
                    <span><i class="fas fa-dollar-sign"></i> ${task.payment}</span>
                </div>
                
                <div class="mb-4">
                    <h4>Description</h4>
                    <p>${task.description}</p>
                </div>
                
                <div class="mb-4">
                    <h4>Project</h4>
                    <p>${task.project}</p>
                </div>
                
                <div class="task-actions">
                    ${task.status === 'pending' ? `
                        <button class="btn btn-primary" onclick="virtual.startTask('${task.id}')">
                            <i class="fas fa-play"></i> Start Task
                        </button>
                    ` : task.status === 'in_progress' ? `
                        <button class="btn btn-primary" onclick="virtual.completeTask('${task.id}')">
                            <i class="fas fa-check"></i> Mark Complete
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="virtual.closeModal('taskDetailModal')">
                        Close
                    </button>
                </div>
            </div>
        `;
    }

    loadProjectsScreen() {
        const screen = document.getElementById('projectsScreen');
        screen.innerHTML = `
            <div class="dashboard-header">
                <h1>Projects</h1>
                <div class="dashboard-actions">
                    <button class="btn btn-primary" onclick="virtual.showCreateProject()">
                        <i class="fas fa-plus-circle"></i> New Project
                    </button>
                </div>
            </div>
            
            <div class="projects-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                ${this.projects.map(project => `
                    <div class="project-item">
                        <div class="project-header">
                            <div class="project-title">${project.title}</div>
                            <div class="project-type type-${project.type}">${project.type}</div>
                        </div>
                        <p>${project.description}</p>
                        <div class="project-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.progress}%"></div>
                            </div>
                            <div class="progress-text">
                                <span>Progress</span>
                                <span>${project.progress}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadTasksScreen() {
        const screen = document.getElementById('tasksScreen');
        const pendingTasks = this.tasks.filter(t => t.status === 'pending');
        const inProgressTasks = this.tasks.filter(t => t.status === 'in_progress');
        const completedTasks = this.tasks.filter(t => t.status === 'completed');

        screen.innerHTML = `
            <div class="dashboard-header">
                <h1>My Tasks</h1>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
                <div>
                    <h3>Pending (${pendingTasks.length})</h3>
                    ${pendingTasks.map(task => this.renderTaskCard(task)).join('')}
                </div>
                
                <div>
                    <h3>In Progress (${inProgressTasks.length})</h3>
                    ${inProgressTasks.map(task => this.renderTaskCard(task)).join('')}
                </div>
                
                <div>
                    <h3>Completed (${completedTasks.length})</h3>
                    ${completedTasks.map(task => this.renderTaskCard(task)).join('')}
                </div>
            </div>
        `;
    }

    loadEarningsScreen() {
        const screen = document.getElementById('earningsScreen');
        
        screen.innerHTML = `
            <div class="dashboard-header">
                <h1>Earnings</h1>
                <div class="dashboard-actions">
                    <button class="btn btn-primary" onclick="virtual.requestPayout()">
                        <i class="fas fa-money-check"></i> Request Payout
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #10b981;">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Total Earned</div>
                        <div class="stat-value">$${this.currentUser.totalEarnings}</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f59e0b;">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">This Month</div>
                        <div class="stat-value">$500</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #ef4444;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Pending</div>
                        <div class="stat-value">$125</div>
                    </div>
                </div>
            </div>
        `;
    }

    loadProfileScreen() {
        const screen = document.getElementById('profileScreen');
        const user = this.currentUser;

        screen.innerHTML = `
            <div class="dashboard-header">
                <h1>My Profile</h1>
                <button class="btn btn-outline" onclick="virtual.editProfile()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            </div>
            
            <div class="dashboard-section">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                    <div style="width: 100px; height: 100px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold;">
                        ${user.avatar}
                    </div>
                    <div>
                        <h2>${user.name}</h2>
                        <p style="color: var(--gray-500);">${user.email}</p>
                        <span class="project-type" style="margin-right: 10px;">${user.role.replace('_', ' ')}</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${user.completedProjects}</div>
                        <div style="color: var(--gray-500); font-size: 14px;">Projects Completed</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary);">$${user.totalEarnings}</div>
                        <div style="color: var(--gray-500); font-size: 14px;">Total Earnings</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${this.tasks.length}</div>
                        <div style="color: var(--gray-500); font-size: 14px;">Active Tasks</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary);">98%</div>
                        <div style="color: var(--gray-500); font-size: 14px;">Success Rate</div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid var(--gray-200); padding-top: 20px;">
                    <h3 style="margin-bottom: 15px;">Skills</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${user.freelancingField.map(skill => `
                            <span class="project-type">${skill}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== HELPER METHODS ====================
    renderTaskCard(task) {
        return `
            <div class="task-item" onclick="virtual.showTaskDetail('${task.id}')" style="margin-bottom: 12px;">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.project} • ${task.dueDate}</p>
                </div>
                <span class="task-status status-${task.status}">${task.status.replace('_', ' ')}</span>
            </div>
        `;
    }

    getSkillIcon(skill) {
        const icons = {
            'Video Editing': 'fa-video',
            'Graphic Design': 'fa-paint-brush',
            'Web Development': 'fa-code',
            'Content Writing': 'fa-pen',
            'Digital Marketing': 'fa-bullhorn',
            'Animation': 'fa-film',
            'Sound Design': 'fa-music',
            'Color Grading': 'fa-palette'
        };
        return icons[skill] || 'fa-star';
    }

    // ==================== ACTION METHODS ====================
    createProject() {
        const title = document.getElementById('projectTitle').value;
        const type = document.getElementById('projectType').value;
        const description = document.getElementById('projectDescription').value;
        const budget = document.getElementById('projectBudget').value;
        const deadline = document.getElementById('projectDeadline').value;

        if (!title || !description || !budget || !deadline) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        const newProject = {
            id: 'project_' + Date.now(),
            title: title,
            type: type,
            status: 'active',
            progress: 0,
            description: description,
            budget: parseInt(budget),
            deadline: deadline
        };

        this.projects.unshift(newProject);
        this.closeModal('createProjectModal');
        this.showToast('Success', 'Project created successfully', 'success');
        
        // Add notification
        this.addNotification('Project Created', `You created a new ${type} project: ${title}`);
        
        // Update dashboard
        this.loadDashboardData();
    }

    startTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'in_progress';
            this.showToast('Task Started', 'You have started working on this task', 'success');
            this.addNotification('Task Started', `You started working on: ${task.title}`);
            this.closeModal('taskDetailModal');
            this.loadDashboardData();
        }
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            this.currentUser.completedProjects++;
            this.currentUser.totalEarnings += task.payment;
            localStorage.setItem('virtual_user', JSON.stringify(this.currentUser));
            
            this.showToast('Task Completed', 'Task submitted for review', 'success');
            this.addNotification('Task Completed', `You completed: ${task.title}. Payment: $${task.payment}`);
            this.closeModal('taskDetailModal');
            this.loadDashboardData();
        }
    }

    manageProject(projectId) {
        this.showToast('Project Management', 'Opening project management tools', 'info');
    }

    filterTasks(filter) {
        this.showToast('Filter Tasks', `Showing ${filter} tasks`, 'info');
    }

    requestPayout() {
        this.showToast('Payout Request', 'Payout request submitted. Processing time: 3-5 business days', 'success');
    }

    editProfile() {
        this.showToast('Edit Profile', 'Profile editing will be available soon', 'info');
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.loadDashboardData();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.loadDashboardData();
        this.showToast('Notifications', 'All notifications marked as read', 'success');
    }

    handleSearch(query) {
        if (query.length > 2) {
            this.showToast('Search', `Searching for: ${query}`, 'info');
        }
    }

    addNotification(title, message) {
        const notification = {
            id: 'notif_' + Date.now(),
            title: title,
            message: message,
            time: 'Just now',
            read: false
        };
        this.notifications.unshift(notification);
        this.loadDashboardData();
    }

    // ==================== REAL-TIME SIMULATION ====================
    simulateRealTimeUpdates() {
        // Simulate new notifications
        setInterval(() => {
            if (Math.random() > 0.7 && this.currentUser) { // 30% chance
                const notifications = [
                    { title: 'New Project Available', message: 'A new video editing project is available' },
                    { title: 'Team Update', message: 'Your team has been updated' },
                    { title: 'Payment Alert', message: 'Payment is pending for your completed task' },
                    { title: 'Deadline Reminder', message: 'Task deadline is approaching' }
                ];
                const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
                this.addNotification(randomNotif.title, randomNotif.message);
            }
        }, 30000); // Every 30 seconds

        // Simulate task updates
        setInterval(() => {
            if (Math.random() > 0.8 && this.currentUser) { // 20% chance
                const pendingTasks = this.tasks.filter(t => t.status === 'pending');
                if (pendingTasks.length > 0) {
                    const task = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
                    task.dueDate = 'Today';
                    this.loadDashboardData();
                }
            }
        }, 60000); // Every minute
    }
}

// Initialize the application
const virtual = new VirtualPlatform();

// Make methods available globally for onclick handlers
window.virtual = virtual;

// Helper functions for inline onclick handlers
window.showLogin = () => virtual.showLogin();
window.showSignup = () => virtual.showSignup();
window.showDashboard = () => virtual.showDashboard();
window.showProjects = () => virtual.showProjects();
window.showTasks = () => virtual.showTasks();
window.showEarnings = () => virtual.showEarnings();
window.showProfile = () => virtual.showProfile();
window.showLearning = () => virtual.showLearning();
window.showPromotions = () => virtual.showPromotions();
window.showTeam = () => virtual.showTeam();
window.showRoleDashboard = () => virtual.showRoleDashboard();
window.showCreateProject = () => virtual.showCreateProject();
window.showQuickTask = () => virtual.showQuickTask();
window.showSettings = () => virtual.showToast('Settings', 'Settings panel will be available soon', 'info');
window.showHelp = () => virtual.showToast('Help', 'Help center will be available soon', 'info');
window.showManageProjects = () => virtual.showToast('Manage Projects', 'Project management tools', 'info');
window.showTeamManagement = () => virtual.showToast('Team Management', 'Team management tools', 'info');
window.toggleUserMenu = () => virtual.toggleUserMenu();
window.toggleNotifications = () => virtual.toggleNotifications();
window.logout = () => virtual.logout();
window.togglePassword = (id) => virtual.togglePassword(id);
window.closeModal = (id) => virtual.closeModal(id);
window.markAllAsRead = () => virtual.markAllAsRead();

// Additional global helpers
window.handleLogin = () => virtual.handleLogin();
window.handleSignup = () => virtual.handleSignup();
