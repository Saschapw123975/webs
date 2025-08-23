

class CrymsonApp {
    constructor() {
        this.currentTab = 'game-generator';
        this.bypasses = []; // Will be loaded from C# backend
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupHeaderControls();
        this.loadBypasses();
        this.addLogMessage('Application initialized successfully');
        this.startLoadingSequence();
    }

    startLoadingSequence() {
        const loadingMessages = [
            'Initializing application...',
            'Connecting to database...',
            'Loading game data...',
            'Preparing Steam integration...',
            'Setting up Discord Rich Presence...',
            'Initializing KeyAuth system...',
            'Loading bypasses...',
            'Starting WebView2...',
            'Application ready!'
        ];

        let messageIndex = 0;
        const loadingMessage = document.getElementById('loadingMessage');
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');

        const updateMessage = () => {
            if (messageIndex < loadingMessages.length) {
                loadingMessage.textContent = loadingMessages[messageIndex];
                messageIndex++;
                setTimeout(updateMessage, 800);
            } else {
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainApp.style.display = 'flex';
                }, 1000);
            }
        };

        updateMessage();
    }

    setupEventListeners() {
        
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateGame());
        }

        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bypass-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.downloadBypass(index);
            }
        });

        document.getElementById('appId')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateGame();
        });

        document.getElementById('downloadCreamBtn')?.addEventListener('click', () => {
            this.downloadCreamInstaller();
        });
    }

    setupHeaderControls() {
        
        const minimizeBtn = document.getElementById('minimizeBtn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.sendMessage('minimize', {});
            });
        }

        
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.sendMessage('close', {});
            });
        }

        
        const header = document.querySelector('.app-header');
        if (header) {
            let isDragging = false;
            let startX, startY;

            header.addEventListener('mousedown', (e) => {
                if (!e.target.classList.contains('header-btn')) {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    this.sendMessage('startDrag', { x: startX, y: startY });
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    this.sendMessage('dragWindow', { deltaX, deltaY });
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    this.sendMessage('endDrag', {});
                }
            });
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;
        this.addLogMessage(`Switched to ${tabId.replace('-', ' ')} tab`);
    }

    generateGame() {
        const appId = document.getElementById('appId')?.value?.trim();
        
        if (!appId) {
            this.addLogMessage('Please enter a valid Steam App ID', 'error');
            return;
        }

        this.addLogMessage(`Starting game generation for App ID: ${appId}`);
        this.sendMessage('generateGame', { appId });
    }

    loadBypasses() {
        // Request bypasses from C# backend
        this.sendMessage('getBypasses', {});
    }

    displayBypasses(bypassesData) {
        const bypassesList = document.getElementById('bypassesList');
        if (!bypassesList) return;

        // Clear existing content
        bypassesList.innerHTML = '';
        
        // Update the global bypasses array
        this.bypasses = bypassesData;

        this.bypasses.forEach((bypass, index) => {
            const bypassCard = document.createElement('div');
            bypassCard.className = 'bypass-card';
            bypassCard.innerHTML = `
                <div class="bypass-info">
                    <h3>${bypass.Name}</h3>
                    <p class="size">Size: <span>${bypass.Size}</span></p>
                </div>
                <button class="btn btn-secondary" onclick="window.crymsonApp.extractBypass('${bypass.Url}', '${bypass.Name}')">
                    <i class="fas fa-download"></i>
                    Extract
                </button>
            `;
            bypassesList.appendChild(bypassCard);
        });
    }

    filterBypasses(searchTerm) {
        const bypassCards = document.querySelectorAll('.bypass-card');
        const searchLower = searchTerm.toLowerCase();

        bypassCards.forEach(card => {
            const bypassName = card.querySelector('h3').textContent.toLowerCase();
            if (bypassName.includes(searchLower)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    extractBypass(url, name) {
        this.addLogMessage(`Extracting bypass: ${name}`);
        this.sendMessage('extractBypass', { url: url, name: name });
    }

    downloadCreamInstaller() {
        this.addLogMessage('Starting Cream Installer download...');
        this.sendMessage('downloadCreamInstaller', { 
            url: 'https://drive.google.com/file/d/1OSOAImJH08nTJcr29NjqXofeX5FqxYTc/view?usp=drive_link',
            filename: 'CreamInstaller v5.0.0.zip'
        });
    }

    addLogMessage(message, type = 'info') {
        const gameLog = document.getElementById('gameLog');
        if (!gameLog) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = `[${timestamp}]`;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'log-message';
        messageSpan.textContent = message;
        
        if (type === 'error') {
            messageSpan.style.color = '#ff6b6b';
        } else if (type === 'success') {
            messageSpan.style.color = '#51cf66';
        }

        logEntry.appendChild(timeSpan);
        logEntry.appendChild(messageSpan);
        
        gameLog.appendChild(logEntry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }

    sendMessage(action, data = {}) {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage(JSON.stringify({
                Action: action,
                Data: data
            }));
        } else {
        }
    }

    openUrl(url, title = "Browser") {
        this.sendMessage('openUrl', { url: url, title: title });
    }

    handleMessage(message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.action) {
                case 'log':
                    this.addLogMessage(data.message, data.type);
                    break;
                case 'updateProgress':
                    this.updateProgress(data.progress, data.message);
                    break;
                case 'displayBypasses':
                    this.displayBypasses(data.data);
                    break;
                case 'updateStatus':
                    this.addLogMessage(data.message, 'info');
                    break;
                default:
            }
        } catch (error) {
        }
    }

    updateProgress(progress, message) {
        this.addLogMessage(`${message} (${progress}%)`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.crymsonApp = new CrymsonApp();

    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.addEventListener('message', (event) => {
            window.crymsonApp.handleMessage(event.data);
        });
    }
});

window.addLogMessage = function(message, type) {
    if (window.crymsonApp) {
        window.crymsonApp.addLogMessage(message, type);
    }
};

window.switchTab = function(tabId) {
    if (window.crymsonApp) {
        window.crymsonApp.switchTab(tabId);
    }
};

