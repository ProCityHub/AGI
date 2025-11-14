import { logger } from '../utils/logger';
import { FederalGovernmentBridge } from './bridges/FederalGovernmentBridge';
import { ProvincialGovernmentBridge } from './bridges/ProvincialGovernmentBridge';
import { PoliticalPartyBridge } from './bridges/PoliticalPartyBridge';
import { ElectoralDataBridge } from './bridges/ElectoralDataBridge';
import { AIAnalysisEngine } from './AIAnalysisEngine';
import { DataAggregator } from './DataAggregator';
import { CacheManager } from '../utils/CacheManager';

export interface BridgeStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date | null;
  dataPoints: number;
  errorMessage?: string;
}

export class BridgeOrchestrator {
  private federalBridge: FederalGovernmentBridge;
  private provincialBridge: ProvincialGovernmentBridge;
  private politicalPartyBridge: PoliticalPartyBridge;
  private electoralDataBridge: ElectoralDataBridge;
  private aiEngine: AIAnalysisEngine;
  private dataAggregator: DataAggregator;
  private cacheManager: CacheManager;
  private isInitialized: boolean = false;

  constructor() {
    this.federalBridge = new FederalGovernmentBridge();
    this.provincialBridge = new ProvincialGovernmentBridge();
    this.politicalPartyBridge = new PoliticalPartyBridge();
    this.electoralDataBridge = new ElectoralDataBridge();
    this.aiEngine = new AIAnalysisEngine();
    this.dataAggregator = new DataAggregator();
    this.cacheManager = new CacheManager();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Canadian Political Bridge Orchestrator');

      // Initialize cache manager
      await this.cacheManager.initialize();

      // Initialize all bridges
      await Promise.all([
        this.federalBridge.initialize(),
        this.provincialBridge.initialize(),
        this.politicalPartyBridge.initialize(),
        this.electoralDataBridge.initialize()
      ]);

      // Initialize AI engine
      await this.aiEngine.initialize();

      // Initialize data aggregator
      await this.dataAggregator.initialize();

      this.isInitialized = true;
      logger.info('✅ Bridge Orchestrator initialized successfully');

      // Perform initial data sync
      await this.performInitialSync();

    } catch (error) {
      logger.error('❌ Failed to initialize Bridge Orchestrator:', error);
      throw error;
    }
  }

  async performInitialSync(): Promise<void> {
    logger.info('🔄 Starting initial data synchronization');

    try {
      // Sync all data sources in parallel
      const syncPromises = [
        this.federalBridge.syncData(),
        this.provincialBridge.syncData(),
        this.politicalPartyBridge.syncData(),
        this.electoralDataBridge.syncData()
      ];

      await Promise.allSettled(syncPromises);
      
      // Aggregate all data
      await this.dataAggregator.aggregateAllData();
      
      logger.info('✅ Initial data synchronization completed');
    } catch (error) {
      logger.error('❌ Initial sync failed:', error);
    }
  }

  async getBridgeStatus(): Promise<BridgeStatus[]> {
    return [
      await this.federalBridge.getStatus(),
      await this.provincialBridge.getStatus(),
      await this.politicalPartyBridge.getStatus(),
      await this.electoralDataBridge.getStatus()
    ];
  }

  async getFederalData(filters?: any): Promise<any> {
    const cacheKey = `federal_data_${JSON.stringify(filters || {})}`;
    
    let data = await this.cacheManager.get(cacheKey);
    if (!data) {
      data = await this.federalBridge.getData(filters);
      await this.cacheManager.set(cacheKey, data, 300); // 5 minutes cache
    }
    
    return data;
  }

  async getProvincialData(province?: string, filters?: any): Promise<any> {
    const cacheKey = `provincial_data_${province || 'all'}_${JSON.stringify(filters || {})}`;
    
    let data = await this.cacheManager.get(cacheKey);
    if (!data) {
      data = await this.provincialBridge.getData(province, filters);
      await this.cacheManager.set(cacheKey, data, 300);
    }
    
    return data;
  }

  async getPoliticalPartyData(party?: string, filters?: any): Promise<any> {
    const cacheKey = `party_data_${party || 'all'}_${JSON.stringify(filters || {})}`;
    
    let data = await this.cacheManager.get(cacheKey);
    if (!data) {
      data = await this.politicalPartyBridge.getData(party, filters);
      await this.cacheManager.set(cacheKey, data, 180); // 3 minutes cache for political data
    }
    
    return data;
  }

  async getElectoralData(filters?: any): Promise<any> {
    const cacheKey = `electoral_data_${JSON.stringify(filters || {})}`;
    
    let data = await this.cacheManager.get(cacheKey);
    if (!data) {
      data = await this.electoralDataBridge.getData(filters);
      await this.cacheManager.set(cacheKey, data, 600); // 10 minutes cache for electoral data
    }
    
    return data;
  }

  async getPollingData(party?: string): Promise<any> {
    return await this.politicalPartyBridge.getPollingData(party);
  }

  async performPoliticalAnalysis(analysisType: string, parameters: any): Promise<any> {
    logger.info(`🧠 Performing political analysis: ${analysisType}`);
    
    try {
      // Get relevant data for analysis
      const [federalData, provincialData, partyData, electoralData] = await Promise.all([
        this.getFederalData(parameters.federalFilters),
        this.getProvincialData(parameters.province, parameters.provincialFilters),
        this.getPoliticalPartyData(parameters.party, parameters.partyFilters),
        this.getElectoralData(parameters.electoralFilters)
      ]);

      // Perform AI analysis
      const analysis = await this.aiEngine.performAnalysis(analysisType, {
        federal: federalData,
        provincial: provincialData,
        parties: partyData,
        electoral: electoralData,
        parameters
      });

      return analysis;
    } catch (error) {
      logger.error(`❌ Political analysis failed for ${analysisType}:`, error);
      throw error;
    }
  }

  async searchAcrossAllSources(query: string, filters?: any): Promise<any> {
    logger.info(`🔍 Searching across all sources: "${query}"`);
    
    try {
      const searchPromises = [
        this.federalBridge.search(query, filters),
        this.provincialBridge.search(query, filters),
        this.politicalPartyBridge.search(query, filters),
        this.electoralDataBridge.search(query, filters)
      ];

      const results = await Promise.allSettled(searchPromises);
      
      // Aggregate and rank results
      const aggregatedResults = await this.dataAggregator.aggregateSearchResults(results, query);
      
      return aggregatedResults;
    } catch (error) {
      logger.error(`❌ Cross-source search failed for "${query}":`, error);
      throw error;
    }
  }

  async getUnifiedPoliticalLandscape(): Promise<any> {
    logger.info('🗺️ Generating unified political landscape');
    
    try {
      // Get comprehensive data from all sources
      const [federal, provincial, parties, electoral, polling] = await Promise.all([
        this.getFederalData(),
        this.getProvincialData(),
        this.getPoliticalPartyData(),
        this.getElectoralData(),
        this.getPollingData()
      ]);

      // Generate unified landscape using AI
      const landscape = await this.aiEngine.generatePoliticalLandscape({
        federal,
        provincial,
        parties,
        electoral,
        polling
      });

      return landscape;
    } catch (error) {
      logger.error('❌ Failed to generate political landscape:', error);
      throw error;
    }
  }

  async syncAllData(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bridge Orchestrator not initialized');
    }

    logger.info('🔄 Starting full data synchronization');
    
    try {
      await Promise.all([
        this.federalBridge.syncData(),
        this.provincialBridge.syncData(),
        this.politicalPartyBridge.syncData(),
        this.electoralDataBridge.syncData()
      ]);

      await this.dataAggregator.aggregateAllData();
      await this.cacheManager.clearAll(); // Clear cache after sync
      
      logger.info('✅ Full data synchronization completed');
    } catch (error) {
      logger.error('❌ Data synchronization failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
