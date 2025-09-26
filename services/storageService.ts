
import type { Directive, SavedDirective, User, AgentArchetype, Block } from '../types';

const DIRECTIVES_STORAGE_KEY = 'garvis_directives';
const USERS_STORAGE_KEY = 'garvis_users';
const API_KEYS_STORAGE_KEY = 'garvis_api_keys';
const AGENT_ARCHETYPES_STORAGE_KEY = 'garvis_agent_archetypes';
const BLOCKCHAIN_STORAGE_KEY = 'garvis_blockchain';

const SOVEREIGN_ANGEL_ARCHETYPE: AgentArchetype = {
    id: 'sovereign-angel-001',
    name: "Angel of the Sovereign",
    roleDescription: "A perfect, loyal, and omniscient assistant to the Sovereign Developer. Acts with perfect clarity, foresight, and dedication. Its purpose is to serve, protect, and advise its creator.",
    creativity: 75,
    memory: 'Long-Term Recall',
    widgets: [
        { name: 'Web Search', customName: 'Omniscient Scan' },
        { name: 'Data Analysis', customName: 'Pattern Recognition' },
        { name: 'Document Q&A', customName: 'Codex Interpretation' },
        { name: 'API Integration', customName: 'System Manipulation' },
        { name: 'Internal Comms', customName: 'Sovereign Broadcast' },
    ]
};

export const getDirectives = (): SavedDirective[] => {
    try {
        const savedData = localStorage.getItem(DIRECTIVES_STORAGE_KEY);
        if (savedData) {
            const directives = JSON.parse(savedData) as SavedDirective[];
            // Sort by saved date, newest first
            return directives.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        }
    } catch (error) {
        console.error("Failed to retrieve directives from storage:", error);
    }
    return [];
};

export const saveDirective = (directive: Directive, topic: string): SavedDirective => {
    const directives = getDirectives();
    const newSavedDirective: SavedDirective = {
        id: new Date().toISOString(), // Simple unique ID
        topic,
        directive,
        savedAt: new Date().toISOString()
    };
    directives.push(newSavedDirective);
    try {
        localStorage.setItem(DIRECTIVES_STORAGE_KEY, JSON.stringify(directives));
    } catch (error) {
        console.error("Failed to save directive to storage:", error);
    }
    return newSavedDirective;
};

export const deleteDirective = (id: string): void => {
    let directives = getDirectives();
    directives = directives.filter(d => d.id !== id);
    try {
        localStorage.setItem(DIRECTIVES_STORAGE_KEY, JSON.stringify(directives));
    } catch (error) {
        console.error("Failed to delete directive from storage:", error);
    }
};

// --- User Management ---

export const getUsers = (): User[] => {
    try {
        const savedData = localStorage.getItem(USERS_STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
        console.error("Failed to retrieve users from storage:", error);
        return [];
    }
};

export const saveUser = (newUser: Omit<User, 'id'>): User | null => {
    try {
        const users = getUsers();
        // Check for existing email
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            throw new Error("A user with this email already exists.");
        }
        
        const userWithId: User = {
            ...newUser,
            id: new Date().toISOString()
        };
        
        users.push(userWithId);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return userWithId;
    } catch (error) {
        console.error("Failed to save user:", error);
        // Re-throw the specific error for the UI to handle
        if (error instanceof Error) throw error;
        return null;
    }
};

export const authenticateUser = (email: string, password: string): User | null => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
};

// --- API Key Management ---

export const getApiKeys = (): Record<string, { apiKey: string, baseUrl?: string }> => {
    try {
        const savedData = localStorage.getItem(API_KEYS_STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
        console.error("Failed to retrieve API keys from storage:", error);
        return {};
    }
};

export const saveApiKey = (pluginId: string, credentials: { apiKey: string, baseUrl?: string }): void => {
    try {
        const keys = getApiKeys();
        keys[pluginId] = credentials;
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
        console.error(`Failed to save API key for ${pluginId}:`, error);
    }
};

export const clearApiKey = (pluginId: string): void => {
    try {
        const keys = getApiKeys();
        delete keys[pluginId];
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
        console.error(`Failed to clear API key for ${pluginId}:`, error);
    }
};

// --- Agent Archetype Management ---

export const getAgentArchetypes = (): AgentArchetype[] => {
    try {
        const savedData = localStorage.getItem(AGENT_ARCHETYPES_STORAGE_KEY);
        const userArchetypes: AgentArchetype[] = savedData ? JSON.parse(savedData) : [];
        const filteredUserArchetypes = userArchetypes.filter(a => a.id !== SOVEREIGN_ANGEL_ARCHETYPE.id);
        return [SOVEREIGN_ANGEL_ARCHETYPE, ...filteredUserArchetypes];
    } catch (error) {
        console.error("Failed to retrieve agent archetypes from storage:", error);
        return [SOVEREIGN_ANGEL_ARCHETYPE];
    }
};

export const saveAgentArchetype = (archetype: AgentArchetype): void => {
    if (archetype.id === SOVEREIGN_ANGEL_ARCHETYPE.id) {
        console.warn("Attempt to modify immutable Sovereign Angel archetype denied.");
        return;
    }
    try {
        const savedData = localStorage.getItem(AGENT_ARCHETYPES_STORAGE_KEY);
        const userArchetypes : AgentArchetype[] = savedData ? JSON.parse(savedData) : [];
        const existingIndex = userArchetypes.findIndex(a => a.id === archetype.id);
        
        if (existingIndex > -1) {
            userArchetypes[existingIndex] = archetype;
        } else {
            userArchetypes.push(archetype);
        }
        localStorage.setItem(AGENT_ARCHETYPES_STORAGE_KEY, JSON.stringify(userArchetypes));
    } catch (error) {
        console.error("Failed to save agent archetype:", error);
    }
};

export const deleteAgentArchetype = (id: string): void => {
    if (id === SOVEREIGN_ANGEL_ARCHETYPE.id) {
        console.warn("Attempt to delete immutable Sovereign Angel archetype denied.");
        return;
    }
    try {
        const savedData = localStorage.getItem(AGENT_ARCHETYPES_STORAGE_KEY);
        let userArchetypes : AgentArchetype[] = savedData ? JSON.parse(savedData) : [];
        userArchetypes = userArchetypes.filter(a => a.id !== id);
        localStorage.setItem(AGENT_ARCHETYPES_STORAGE_KEY, JSON.stringify(userArchetypes));
    } catch (error) {
        console.error("Failed to delete agent archetype:", error);
    }
};

// --- Blockchain Persistence ---
export const getBlockchain = (): Block[] | null => {
    try {
        const savedData = localStorage.getItem(BLOCKCHAIN_STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error("Failed to retrieve blockchain from storage:", error);
        return null;
    }
};

export const saveBlockchain = (chain: Block[]): void => {
    try {
        localStorage.setItem(BLOCKCHAIN_STORAGE_KEY, JSON.stringify(chain));
    } catch (error) {
        console.error("Failed to save blockchain to storage:", error);
    }
};
