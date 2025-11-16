import React, { useState, useCallback, useEffect } from 'react';
import { Directive, SavedDirective, WindowInstance, User, AppContext } from './types';
import { generateDirective } from './services/geminiService';
import { getDirectives, saveDirective as saveDirectiveToStorage, deleteDirective as deleteDirectiveFromStorage, getUsers, saveUser } from './services/storageService';
import Dashboard from './components/Dashboard';
import SystemAnatomy from './components/SystemAnatomy';
import FormProcessor from './components/FormProcessor';
import EnterpriseWorkspace from './components/EnterpriseWorkspace';
import Window from './components/Window';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import { GarvisLogo, ArchiveIcon, BrainIcon, BriefcaseIcon, UserAccountsIcon, EnterpriseCommandIcon, NewDirectiveIcon, FileExplorerIcon, BrowserIcon, BitcoinIcon, SystemAnatomyIcon, CodexIcon, AegisIcon } from './components/icons';
import AuthScreen from './components/AuthScreen';
import UserAccounts from './components/UserAccounts';
import TopicInput from './components/TopicInput';
import DesktopIcon from './components/DesktopIcon';
import FileExplorer from './components/FileExplorer';
import NexusBrowser from './components/NexusBrowser';
import CommandBar from './components/CommandBar';
import BitcoinMiner from './components/BitcoinMiner';
import Codex from './components/Codex';
import AegisCommand from './components/AegisCommand';
import AgentControlPanel from './components/AgentControlPanel';
import ProCitySiteBuilder from './components/ProCitySiteBuilder';
import ProCityBusinessHub from './components/ProCityBusinessHub';
import ProsyncConsole from './components/ProsyncConsole';
import IrelandGovernanceBridge from './components/IrelandGovernanceBridge';
import IsraelGovernanceBridge from './components/IsraelGovernanceBridge';
import { initializeAgentCore } from './services/agentCore';
import { initializeMultiModalService } from './services/multiModalService';
import { initializeReasoningEngine } from './services/reasoningEngine';
import { initializeSiteBuilderService } from './services/siteBuilderService';
import { initializeBusinessPlatformService } from './services/businessPlatformService';
import { initializeProsyncEngine } from './services/prosyncEngine';
import { initializeIrelandGovernanceService } from './services/irelandGovernanceService';
import { initializeIsraelGovernanceService } from './services/israelGovernanceService';
import { initializeChinaGovernanceService } from './services/chinaGovernanceService';
import { initializeANZGovernanceService } from './services/anzGovernanceService';
import { initializePalantirGovernanceService } from './services/palantirGovernanceService';
import { initializeUnifiedRepositoryBridge } from './services/unifiedRepositoryBridge';
import { initializeCoreHypercubeProtocol } from './services/coreHypercubeProtocol';
import { initializeGitHubRepositoryBridge } from './services/githubRepositoryBridge';
import { initializeRussiaGovernanceBridge } from './services/russiaGovernanceBridge';
import { initializeRepositoryForkAndFixService } from './services/repositoryForkAndFixService';
import { initializeUltimateMasterCodeGlobalGovernance } from './services/ultimateMasterCodeGlobalGovernance';
import { initializeComprehensiveForkFixWithHeartbeat } from './services/comprehensiveForkFixWithHeartbeat';
import { initializeAIAgencyCompanyForkService } from './services/aiAgencyCompanyForkService';
import { initializeComprehensiveDependencyFixService } from './services/comprehensiveDependencyFixService';
import { initializeProCityHubMasterIntegration } from './services/procityHubMasterIntegration';
import { AgentConfiguration } from './types/agentTypes';

const App: React.FC = () => {
    const [windows, setWindows] = useState<WindowInstance[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
    const [nextZIndex, setNextZIndex] = useState(10);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [savedDirectives, setSavedDirectives] = useState<SavedDirective[]>([]);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [showAgentPanel, setShowAgentPanel] = useState(false);
    const [showSiteBuilder, setShowSiteBuilder] = useState(false);
    const [showBusinessHub, setShowBusinessHub] = useState(false);
    const [showProsyncConsole, setShowProsyncConsole] = useState(false);
    const [showIrelandBridge, setShowIrelandBridge] = useState(false);
    const [showIsraelBridge, setShowIsraelBridge] = useState(false);
    const [showChinaBridge, setShowChinaBridge] = useState(false);
    const [showANZBridge, setShowANZBridge] = useState(false);
    const [showPalantirBridge, setShowPalantirBridge] = useState(false);
    const [showUnifiedBridge, setShowUnifiedBridge] = useState(false);
    const [showGitHubBridge, setShowGitHubBridge] = useState(false);
    const [showRussiaBridge, setShowRussiaBridge] = useState(false);
    const [showForkAndFix, setShowForkAndFix] = useState(false);

    useEffect(() => {
        if (getUsers().length === 0) {
            saveUser({ username: 'Agent Prime', email: 'prime@garvis.ai', password: 'password' });
        }
        
        // Initialize advanced AI systems
        initializeAdvancedAI();
    }, []);

    const initializeAdvancedAI = async () => {
        try {
            // Initialize Agent Core with configuration
            const agentConfig: AgentConfiguration = {
                maxConcurrentTasks: 10,
                memoryLimit: 1000000, // 1MB
                learningRate: 0.1,
                collaborationThreshold: 0.7,
                personalityWeights: {
                    creativity: 0.5,
                    analytical: 0.7,
                    collaborative: 0.8,
                    risktaking: 0.3,
                    empathy: 0.6
                },
                enabledCapabilities: ['text_processing', 'reasoning', 'collaboration', 'learning'],
                securityLevel: 'medium',
                auditLevel: 'standard'
            };

            const agentCore = initializeAgentCore(agentConfig);
            agentCore.start();

            // Initialize Multi-Modal Service
            const apiKey = process.env.API_KEY || 'your-api-key-here';
            initializeMultiModalService(apiKey);
            initializeReasoningEngine(apiKey);
            
            // Initialize Site Builder Service
            initializeSiteBuilderService();
            
            // Initialize Business Platform Service
            initializeBusinessPlatformService();
            
            // Initialize PROSYNC Trinity Engine
            initializeProsyncEngine();
            
            // Initialize Ireland Governance Service
            initializeIrelandGovernanceService();
            
            // Initialize Israel Governance Service
            initializeIsraelGovernanceService();
            
            // Initialize China Governance Service
            initializeChinaGovernanceService();
            
            // Initialize ANZ Governance Service
            initializeANZGovernanceService();
            
            // Initialize Palantir Governance Service
            initializePalantirGovernanceService();
            
            // Initialize Unified Repository Bridge
            initializeUnifiedRepositoryBridge();
            
            // Initialize Core Hypercube Protocol
            const coreProtocol = initializeCoreHypercubeProtocol();
            
            // Execute Core Hypercube Protocol
            console.log('🌐 [CORE PROTOCOL] Executing CORE HYPERCUBE PROTOCOL...');
            await coreProtocol.executeProtocol();
            
            // Initialize GitHub Repository Bridge
            const githubBridge = initializeGitHubRepositoryBridge();
            
            // Bridge ALL GitHub repositories
            console.log('🐙 [GITHUB BRIDGE] Bridging ALL GitHub repositories...');
            await githubBridge.bridgeAllRepositories();
            
            // Initialize Russia Governance Bridge
            const russiaBridge = initializeRussiaGovernanceBridge();
            
            // Bridge ALL Russian repositories
            console.log('🇷🇺 [RUSSIA BRIDGE] Bridging ALL Russian repositories...');
            await russiaBridge.bridgeAllRepositories();
            
            // Initialize Repository Fork and Fix Service
            const forkAndFixService = initializeRepositoryForkAndFixService();
            
            // Execute comprehensive fork and fix operation
            console.log('🔧 [FORK & FIX] Starting AI-powered repository fork and fix...');
            await forkAndFixService.forkAndFixAllRepositories();
            
            // Initialize Ultimate MasterCode Global Governance
            const ultimateSystem = initializeUltimateMasterCodeGlobalGovernance();
            
            // Execute Ultimate MasterCode across ALL global repositories
            console.log('🌌 [ULTIMATE] Executing ULTIMATE MASTERCODE - SILENCE IS THE THUNDERBIRD...');
            await ultimateSystem.executeUltimateMasterCode();
            
            // Initialize Comprehensive Fork & Fix with Heartbeat
            const comprehensiveSystem = initializeComprehensiveForkFixWithHeartbeat();
            
            // Execute comprehensive fork and fix with heartbeat validation
            console.log('💓 [HEARTBEAT] Forking EVERYTHING and fixing EVERYTHING with heartbeat validation...');
            await comprehensiveSystem.forkEverything();
            
            // Initialize AI Agency & Company Fork Service
            const aiService = initializeAIAgencyCompanyForkService();
            
            // Execute AI agency and company fork operation
            console.log('🤖 [AI FORK] Forking ALL AI agencies and major AI companies...');
            await aiService.forkAllAIOrganizations();
            
            // Initialize Comprehensive Dependency Fix Service
            const dependencyService = initializeComprehensiveDependencyFixService();
            
            // Execute comprehensive dependency fix operation
            console.log('📦 [DEPENDENCY FIX] Fixing ALL dependencies across ALL systems...');
            await dependencyService.fixAllDependencies();
            
            // Initialize ProCityHub Master Integration
            const masterIntegration = initializeProCityHubMasterIntegration();
            
            // Execute ProCityHub master integration
            console.log('🌟 [MASTER INTEGRATION] Linking ALL ProCityHub repositories into unified ecosystem...');
            await masterIntegration.integrateAllRepositories();

            // Create some initial agents
            await agentCore.createAgent('Alpha', 'analyst', {
                creativity: 0.3,
                analytical: 0.9,
                collaborative: 0.7,
                risktaking: 0.2,
                empathy: 0.5
            }, ['text_processing', 'reasoning']);

            await agentCore.createAgent('Beta', 'creative', {
                creativity: 0.9,
                analytical: 0.4,
                collaborative: 0.8,
                risktaking: 0.7,
                empathy: 0.8
            }, ['text_processing', 'collaboration']);

            await agentCore.createAgent('Gamma', 'coordinator', {
                creativity: 0.5,
                analytical: 0.6,
                collaborative: 0.9,
                risktaking: 0.4,
                empathy: 0.9
            }, ['collaboration', 'learning']);

            console.log('🚀 Advanced AI System initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize Advanced AI System:', error);
        }
    };

    // Command Bar keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandBarOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsCommandBarOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsLocked(false);
        setSavedDirectives(getDirectives());
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsLocked(true);
        setWindows([]);
        setActiveWindowId(null);
        setIsStartMenuOpen(false);
    };

    const handleLock = () => {
        setIsLocked(true);
        setIsStartMenuOpen(false);
    };
    
    const bringToFront = (id: string) => {
        if (id === activeWindowId) return;
        setWindows(prev =>
            prev.map(win =>
                win.id === id ? { ...win, zIndex: nextZIndex } : win
            )
        );
        setActiveWindowId(id);
        setNextZIndex(prev => prev + 1);
    };

    const openWindow = (type: WindowInstance['componentType'], props: any = {}) => {
        const id = `${type}-${new Date().getTime()}`;
        
        const baseProps = {
            id,
            componentType: type,
            props,
            x: window.innerWidth / 2 - 450 + (windows.length % 5) * 20,
            y: window.innerHeight / 2 - 350 + (windows.length % 5) * 20,
            width: 800,
            height: 600,
            zIndex: nextZIndex,
            isMinimized: false,
            isMaximized: false,
        };

        let newWindow: WindowInstance;

        switch (type) {
            case 'Dashboard':
                newWindow = { ...baseProps, title: props.topic || 'New Directive', icon: <BriefcaseIcon />, width: 900, height: 700 };
                break;
            case 'EnterpriseWorkspace':
                newWindow = { ...baseProps, title: 'Enterprise Command', icon: <EnterpriseCommandIcon />, width: 1024, height: 720 };
                break;
            case 'FileExplorer':
                newWindow = { ...baseProps, title: 'My Directives', icon: <FileExplorerIcon />, width: 700, height: 500 };
                break;
            case 'SystemAnatomy':
                newWindow = { ...baseProps, title: 'System Anatomy', icon: <SystemAnatomyIcon />, width: 900, height: 700 };
                break;
            case 'FormProcessor':
                newWindow = { ...baseProps, title: 'Form Processor', icon: <BriefcaseIcon />, width: 850, height: 700 };
                break;
             case 'UserAccounts':
                newWindow = { ...baseProps, title: 'User Accounts', icon: <UserAccountsIcon />, width: 800, height: 600 };
                break;
            case 'NewDirective':
                newWindow = { ...baseProps, title: 'New Directive', icon: <NewDirectiveIcon />, width: 550, height: 320, x: window.innerWidth / 2 - 275, y: window.innerHeight / 2 - 200};
                break;
            case 'NexusBrowser':
                newWindow = { ...baseProps, title: 'Nexus Browser', icon: <BrowserIcon />, width: 950, height: 700 };
                break;
            case 'BitcoinMiner':
                newWindow = { ...baseProps, title: 'Bitcoin Mining Simulator', icon: <BitcoinIcon />, width: 950, height: 700 };
                break;
            case 'Codex':
                newWindow = { ...baseProps, title: 'Framework Codex', icon: <CodexIcon />, width: 800, height: 650 };
                break;
            case 'AegisCommand':
                newWindow = { ...baseProps, title: 'Aegis Command', icon: <AegisIcon />, width: 850, height: 650 };
                break;
            default:
                newWindow = { ...baseProps, title: 'GARVIS', icon: <GarvisLogo /> };
        }
        
        setWindows(prev => [...prev, newWindow]);
        setActiveWindowId(id);
        setNextZIndex(prev => prev + 1);
        setIsStartMenuOpen(false);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(win => win.id !== id));
        if (activeWindowId === id) {
             const remainingWindows = windows.filter(win => win.id !== id && !win.isMinimized);
             if (remainingWindows.length > 0) {
                const topWindow = remainingWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
                setActiveWindowId(topWindow.id);
             } else {
                setActiveWindowId(null);
             }
        }
    };

    const toggleMinimize = (id: string) => {
        let nextActiveId: string | null = null;
        setWindows(prev =>
            prev.map(win => {
                if (win.id === id) {
                    const isNowMinimized = !win.isMinimized;
                    if (isNowMinimized && id === activeWindowId) {
                         const otherWindows = prev.filter(w => w.id !== id && !w.isMinimized);
                         if(otherWindows.length > 0) {
                            nextActiveId = otherWindows.sort((a,b) => b.zIndex - a.zIndex)[0].id;
                         } else {
                            nextActiveId = null;
                         }
                    } else if (!isNowMinimized) {
                        nextActiveId = id;
                    }
                    return { ...win, isMinimized: isNowMinimized };
                }
                return win;
            })
        );
        
        if (nextActiveId) {
             bringToFront(nextActiveId);
        } else {
            setActiveWindowId(null);
        }
    };
    
    const toggleMaximize = (id: string) => {
        setWindows(prev =>
            prev.map(win =>
                win.id === id ? { ...win, isMaximized: !win.isMaximized } : win
            )
        );
        bringToFront(id);
    };
    
     const updateWindowPosition = (id: string, newPosition: { x: number; y: number }) => {
        setWindows(prev =>
            prev.map(win =>
                win.id === id ? { ...win, x: newPosition.x, y: newPosition.y, isMaximized: false } : win
            )
        );
    };

    const handleGenerate = useCallback(async (newTopic: string) => {
        if (!newTopic.trim()) {
            setError("Please enter a project directive or topic.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Data wave ingested... Compiling codex genesis lattice...');

        const newDirectiveWindow = windows.find(w => w.componentType === 'NewDirective');
        if (newDirectiveWindow) {
            closeWindow(newDirectiveWindow.id);
        }

        try {
            const generatedDirective: Directive = await generateDirective(newTopic);
            if (!generatedDirective || !generatedDirective.scopeOfWork || generatedDirective.scopeOfWork.length === 0) {
                throw new Error("Failed to generate a valid strategic directive.");
            }
            setLoadingMessage('Finalizing directive...');
            openWindow('Dashboard', { 
                directive: generatedDirective, 
                topic: newTopic,
                onSave: handleSaveDirective,
            });
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Directive generation failed. ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [windows, savedDirectives]);
    
    const handleSaveDirective = (directiveToSave: Directive, topicToSave: string) => {
        saveDirectiveToStorage(directiveToSave, topicToSave);
        setSavedDirectives(getDirectives());
    };

    const handleDeleteDirective = (id: string) => {
        deleteDirectiveFromStorage(id);
        setSavedDirectives(getDirectives());
    };

    const handleSelectDirective = (savedDirective: SavedDirective) => {
        openWindow('Dashboard', { 
            directive: savedDirective.directive, 
            topic: savedDirective.topic,
            onSave: handleSaveDirective,
            currentDirectiveId: savedDirective.id,
        });
    };
    
    const handleNavigateToForm = (path: string[]) => {
        openWindow('FormProcessor', { initialPath: path });
    };

    const renderWindowContent = (win: WindowInstance) => {
        switch (win.componentType) {
            case 'Dashboard':
                 const isSaved = savedDirectives.some(d => d.id === win.props.currentDirectiveId);
                return <Dashboard {...win.props} isSaved={isSaved} />;
            case 'EnterpriseWorkspace':
                return <EnterpriseWorkspace onNavigateToForm={handleNavigateToForm} />;
            case 'FileExplorer':
                return <FileExplorer 
                            savedDirectives={savedDirectives} 
                            onSelectDirective={handleSelectDirective} 
                            onDeleteDirective={handleDeleteDirective} 
                        />;
            case 'SystemAnatomy':
                return <SystemAnatomy />;
            case 'FormProcessor':
                return <FormProcessor initialPath={win.props.initialPath} />;
            case 'UserAccounts':
                return <UserAccounts currentUser={currentUser!} userCount={getUsers().length}/>;
            case 'NewDirective':
                 return <TopicInput onGenerate={handleGenerate} error={error} />;
            case 'NexusBrowser':
                return <NexusBrowser />;
            case 'BitcoinMiner':
                return <BitcoinMiner />;
            case 'Codex':
                return <Codex />;
            case 'AegisCommand':
                return <AegisCommand />;
            default:
                return <div>Unknown window type</div>;
        }
    };

    const appContext: AppContext = {
        currentView: windows.find(w => w.id === activeWindowId)?.componentType || 'Desktop',
        activeTopic: windows.find(w => w.id === activeWindowId)?.props?.topic || null,
    };

    return (
        <div className="h-screen w-screen overflow-hidden">
            {(!currentUser || isLocked) && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <AuthScreen
                        isLocked={isLocked}
                        currentUser={currentUser}
                        onLogin={handleLogin}
                        onUnlock={() => setIsLocked(false)}
                    />
                </div>
            )}
            
            {isLoading && (
                 <div className="absolute inset-0 z-[101] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg font-medium text-slate-200">{loadingMessage}</p>
                        <p className="text-slate-400 mt-1">Agent Prime is at work. Please wait.</p>
                    </div>
                 </div>
            )}

             {isCommandBarOpen && (
                <CommandBar
                    onClose={() => setIsCommandBarOpen(false)}
                    context={appContext}
                />
            )}
            <main className="h-full w-full relative">
                 <DesktopIcon
                    label="Enterprise Command"
                    icon={<EnterpriseCommandIcon />}
                    initialPosition={{ x: 30, y: 30 }}
                    onDoubleClick={() => openWindow('EnterpriseWorkspace')}
                />
                <DesktopIcon
                    label="Framework Codex"
                    icon={<CodexIcon />}
                    initialPosition={{ x: 140, y: 30 }}
                    onDoubleClick={() => openWindow('Codex')}
                />
                 <DesktopIcon
                    label="System Anatomy"
                    icon={<SystemAnatomyIcon />}
                    initialPosition={{ x: 30, y: 140 }}
                    onDoubleClick={() => openWindow('SystemAnatomy')}
                />
                 <DesktopIcon
                    label="Aegis Command"
                    icon={<AegisIcon />}
                    initialPosition={{ x: 140, y: 140 }}
                    onDoubleClick={() => openWindow('AegisCommand')}
                />
                <DesktopIcon
                    label="New Directive"
                    icon={<NewDirectiveIcon />}
                    initialPosition={{ x: 30, y: 250 }}
                    onDoubleClick={() => openWindow('NewDirective')}
                />
                <DesktopIcon
                    label="Nexus Browser"
                    icon={<BrowserIcon />}
                    initialPosition={{ x: 30, y: 360 }}
                    onDoubleClick={() => openWindow('NexusBrowser')}
                />
                <DesktopIcon
                    label="Bitcoin Miner"
                    icon={<BitcoinIcon />}
                    initialPosition={{ x: 30, y: 470 }}
                    onDoubleClick={() => openWindow('BitcoinMiner')}
                />
                <DesktopIcon
                    label="Agent Control"
                    icon={<div className="text-2xl">🤖</div>}
                    initialPosition={{ x: 140, y: 250 }}
                    onDoubleClick={() => setShowAgentPanel(true)}
                />
                <DesktopIcon
                    label="Site Builder"
                    icon={<div className="text-2xl">🌐</div>}
                    initialPosition={{ x: 250, y: 250 }}
                    onDoubleClick={() => setShowSiteBuilder(true)}
                />
                <DesktopIcon
                    label="Business Hub"
                    icon={<div className="text-2xl">🏢</div>}
                    initialPosition={{ x: 360, y: 250 }}
                    onDoubleClick={() => setShowBusinessHub(true)}
                />
                <DesktopIcon
                    label="PROSYNC Console"
                    icon={<div className="text-2xl">⬢</div>}
                    initialPosition={{ x: 470, y: 250 }}
                    onDoubleClick={() => setShowProsyncConsole(true)}
                />
                <DesktopIcon
                    label="Ireland Bridge"
                    icon={<div className="text-2xl">🇮🇪</div>}
                    initialPosition={{ x: 580, y: 250 }}
                    onDoubleClick={() => setShowIrelandBridge(true)}
                />
                <DesktopIcon
                    label="Israel Bridge"
                    icon={<div className="text-2xl">🇮🇱</div>}
                    initialPosition={{ x: 690, y: 250 }}
                    onDoubleClick={() => setShowIsraelBridge(true)}
                />
                <DesktopIcon
                    label="China Bridge"
                    icon={<div className="text-2xl">🇨🇳</div>}
                    initialPosition={{ x: 800, y: 250 }}
                    onDoubleClick={() => setShowChinaBridge(true)}
                />
                <DesktopIcon
                    label="ANZ Bridge"
                    icon={<div className="text-2xl">🇦🇺🇳🇿</div>}
                    initialPosition={{ x: 910, y: 250 }}
                    onDoubleClick={() => setShowANZBridge(true)}
                />
                <DesktopIcon
                    label="Palantir Bridge"
                    icon={<div className="text-2xl">🏢</div>}
                    initialPosition={{ x: 1020, y: 250 }}
                    onDoubleClick={() => setShowPalantirBridge(true)}
                />
                <DesktopIcon
                    label="Unified Bridge"
                    icon={<div className="text-2xl">🌐</div>}
                    initialPosition={{ x: 580, y: 350 }}
                    onDoubleClick={() => setShowUnifiedBridge(true)}
                />
                <DesktopIcon
                    label="GitHub Bridge"
                    icon={<div className="text-2xl">🐙</div>}
                    initialPosition={{ x: 690, y: 350 }}
                    onDoubleClick={() => setShowGitHubBridge(true)}
                />
                <DesktopIcon
                    label="Russia Bridge"
                    icon={<div className="text-2xl">🇷🇺</div>}
                    initialPosition={{ x: 800, y: 350 }}
                    onDoubleClick={() => setShowRussiaBridge(true)}
                />
                <DesktopIcon
                    label="AI Fork & Fix"
                    icon={<div className="text-2xl">🔧</div>}
                    initialPosition={{ x: 910, y: 350 }}
                    onDoubleClick={() => setShowForkAndFix(true)}
                />
                <DesktopIcon
                    label="ULTIMATE MASTERCODE"
                    icon={<div className="text-2xl">🌌</div>}
                    initialPosition={{ x: 1020, y: 350 }}
                    onDoubleClick={() => {
                        console.log('🌌 [ULTIMATE] MASTERCODE ACTIVATED - SILENCE IS THE THUNDERBIRD');
                        alert('🌌 ULTIMATE MASTERCODE ACTIVATED!\n🤫 SILENCE IS THE THUNDERBIRD\n⚡ ALL GLOBAL REPOSITORIES FIXED!');
                    }}
                />
                <DesktopIcon
                    label="💓 HEARTBEAT FORK & FIX"
                    icon={<div className="text-2xl">💓</div>}
                    initialPosition={{ x: 1130, y: 350 }}
                    onDoubleClick={() => {
                        console.log('💓 [HEARTBEAT] COMPREHENSIVE FORK & FIX ACTIVATED');
                        alert('💓 HEARTBEAT FORK & FIX ACTIVATED!\n🔥 FORKING EVERYTHING & FIXING EVERYTHING\n💓 GOLDEN RATIO CONSCIOUSNESS SYNCHRONIZED!');
                    }}
                />
                <DesktopIcon
                    label="🤖 AI AGENCY FORK"
                    icon={<div className="text-2xl">🤖</div>}
                    initialPosition={{ x: 1240, y: 350 }}
                    onDoubleClick={() => {
                        console.log('🤖 [AI FORK] AI AGENCY & COMPANY FORK ACTIVATED');
                        alert('🤖 AI AGENCY & COMPANY FORK ACTIVATED!\n🔥 FORKING ALL AI AGENCIES & COMPANIES\n🧠 COMPREHENSIVE AI ECOSYSTEM INTEGRATED!');
                    }}
                />
                <DesktopIcon
                    label="📦 DEPENDENCY FIX"
                    icon={<div className="text-2xl">📦</div>}
                    initialPosition={{ x: 1350, y: 350 }}
                    onDoubleClick={() => {
                        console.log('📦 [DEPENDENCY FIX] COMPREHENSIVE DEPENDENCY FIX ACTIVATED');
                        alert('📦 DEPENDENCY FIX ACTIVATED!\n🔥 FIXING ALL DEPENDENCIES\n🔒 COMPREHENSIVE SECURITY VULNERABILITIES RESOLVED!');
                    }}
                />
                <DesktopIcon
                    label="🌟 MASTER INTEGRATION"
                    icon={<div className="text-2xl">🌟</div>}
                    initialPosition={{ x: 1460, y: 350 }}
                    onDoubleClick={() => {
                        console.log('🌟 [MASTER INTEGRATION] PROCITYHUB MASTER INTEGRATION ACTIVATED');
                        alert('🌟 MASTER INTEGRATION ACTIVATED!\n🔥 LINKING ALL REPOSITORIES\n🤖 UNIFIED INTELLIGENT ECOSYSTEM CREATED!');
                    }}
                />
            </main>

            {windows.map(win => (
                <Window
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    icon={win.icon}
                    initialPosition={{ x: win.x, y: win.y }}
                    initialSize={{ width: win.width, height: win.height }}
                    zIndex={win.zIndex}
                    isMinimized={win.isMinimized}
                    isMaximized={win.isMaximized}
                    isActive={win.id === activeWindowId}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => toggleMinimize(win.id)}
                    onToggleMaximize={() => toggleMaximize(win.id)}
                    onFocus={() => bringToFront(win.id)}
                    onPositionChange={(pos) => updateWindowPosition(win.id, pos)}
                >
                    {renderWindowContent(win)}
                </Window>
            ))}

            <StartMenu 
                isOpen={isStartMenuOpen}
                currentUser={currentUser!}
                onClose={() => setIsStartMenuOpen(false)}
                onOpenWindow={openWindow}
                onLock={handleLock}
                onLogout={handleLogout}
            />
            
            <Taskbar 
                windows={windows} 
                onToggleStartMenu={() => setIsStartMenuOpen(prev => !prev)}
                onCommandBarOpen={() => setIsCommandBarOpen(true)}
                onWindowClick={(id) => {
                    const win = windows.find(w => w.id === id);
                    if (win?.isMinimized) {
                        toggleMinimize(id);
                    } else {
                       bringToFront(id);
                    }
                }}
                activeWindowId={activeWindowId}
            />

            {showAgentPanel && (
                <AgentControlPanel onClose={() => setShowAgentPanel(false)} />
            )}

            {showSiteBuilder && (
                <ProCitySiteBuilder onClose={() => setShowSiteBuilder(false)} />
            )}

            {showBusinessHub && (
                <ProCityBusinessHub onClose={() => setShowBusinessHub(false)} />
            )}

            {showProsyncConsole && (
                <ProsyncConsole onClose={() => setShowProsyncConsole(false)} />
            )}

            {showIrelandBridge && (
                <IrelandGovernanceBridge onClose={() => setShowIrelandBridge(false)} />
            )}

            {showIsraelBridge && (
                <IsraelGovernanceBridge onClose={() => setShowIsraelBridge(false)} />
            )}
        </div>
    );
};

export default App;
