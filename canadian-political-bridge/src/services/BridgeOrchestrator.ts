import { logger } from '../utils/logger';
import { FederalGovernmentBridge } from './bridges/FederalGovernmentBridge';
import { ProvincialGovernmentBridge } from './bridges/ProvincialGovernmentBridge';
import { PoliticalPartyBridge } from './bridges/PoliticalPartyBridge';
import { ElectoralDataBridge } from './bridges/ElectoralDataBridge';
import { TreatyAndInternationalLawBridge } from './bridges/TreatyAndInternationalLawBridge';
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
  private treatyInternationalLawBridge: TreatyAndInternationalLawBridge;
  private aiEngine: AIAnalysisEngine;
  private dataAggregator: DataAggregator;
  private cacheManager: CacheManager;
  private isInitialized: boolean = false;

  constructor() {
    this.federalBridge = new FederalGovernmentBridge();
    this.provincialBridge = new ProvincialGovernmentBridge();
    this.politicalPartyBridge = new PoliticalPartyBridge();
    this.electoralDataBridge = new ElectoralDataBridge();
    this.treatyInternationalLawBridge = new TreatyAndInternationalLawBridge();
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
        this.electoralDataBridge.initialize(),
        this.treatyInternationalLawBridge.initialize()
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
      await this.electoralDataBridge.getStatus(),
      await this.treatyInternationalLawBridge.getStatus()
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

  // Treaty and International Law Bridge Methods
  async getTreatyInternationalLawData(category?: string, filters?: any): Promise<any> {
    const cacheKey = `treaty_intl_law_${category || 'all'}_${JSON.stringify(filters || {})}`;
    
    let data = await this.cacheManager.get(cacheKey);
    if (!data) {
      data = await this.treatyInternationalLawBridge.getData(category, filters);
      await this.cacheManager.set(cacheKey, data, 600); // 10 minutes cache for treaty data
    }
    
    return data;
  }

  async getTreaties(type?: string): Promise<any> {
    return await this.treatyInternationalLawBridge.getTreaties(type);
  }

  async getTreaty(treatyId: string): Promise<any> {
    const treaties = await this.treatyInternationalLawBridge.getTreaties();
    return treaties.find((treaty: any) => treaty.id === treatyId);
  }

  async getResidentialSchools(province?: string): Promise<any> {
    return await this.treatyInternationalLawBridge.getResidentialSchools(province);
  }

  async getIndigenousSymbols(nation?: string): Promise<any> {
    return await this.treatyInternationalLawBridge.getIndigenousSymbols(nation);
  }

  async getIndigenousSymbol(symbolId: string): Promise<any> {
    const symbols = await this.treatyInternationalLawBridge.getIndigenousSymbols();
    return symbols.find((symbol: any) => symbol.id === symbolId);
  }

  async getTruthAndReconciliationData(): Promise<any> {
    return await this.treatyInternationalLawBridge.getTruthAndReconciliationData();
  }

  async getInternationalLaws(): Promise<any> {
    const data = await this.treatyInternationalLawBridge.getData('internationalLaws');
    return data;
  }

  async getReligiousFreedoms(): Promise<any> {
    const data = await this.treatyInternationalLawBridge.getData('religiousFreedoms');
    return data;
  }

  async searchTreatyInternationalLaw(query: string, filters?: any): Promise<any> {
    return await this.treatyInternationalLawBridge.search(query, filters);
  }

  async getTreatyRelatedRepositories(): Promise<any> {
    return this.treatyInternationalLawBridge.getRelatedRepositories();
  }

  async getCeremonialTruths(nation?: string, ceremony?: string): Promise<any> {
    // This would return ceremonial and cultural truth data
    const symbols = await this.treatyInternationalLawBridge.getIndigenousSymbols(nation);
    const religiousFreedoms = await this.treatyInternationalLawBridge.getData('religiousFreedoms');
    
    return {
      symbols: symbols.filter((symbol: any) => 
        !ceremony || symbol.name.toLowerCase().includes(ceremony.toLowerCase())
      ),
      spiritualPractices: religiousFreedoms.filter((freedom: any) => 
        freedom.type === 'indigenous_spirituality'
      ),
      culturalNote: 'Ceremonial truths are sacred knowledge shared with respect for Indigenous protocols'
    };
  }
}
