import { logger } from '../utils/logger';
import { cacheManager } from '../utils/CacheManager';

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream';
  url?: string;
  credentials?: any;
  refreshInterval?: number; // in milliseconds
  lastUpdated?: Date;
  isActive: boolean;
}

export interface AggregationRule {
  sourceIds: string[];
  targetField: string;
  aggregationType: 'merge' | 'sum' | 'average' | 'count' | 'latest' | 'custom';
  customFunction?: (data: any[]) => any;
  filters?: Record<string, any>;
}

export interface AggregatedData {
  id: string;
  sources: string[];
  data: any;
  metadata: {
    aggregatedAt: Date;
    sourceCount: number;
    recordCount: number;
    freshness: number; // percentage of fresh data
  };
}

export class DataAggregator {
  private dataSources: Map<string, DataSource> = new Map();
  private aggregationRules: Map<string, AggregationRule> = new Map();
  private aggregatedData: Map<string, AggregatedData> = new Map();

  constructor() {
    logger.info('DataAggregator initialized');
    this.initializeDefaultSources();
    this.initializeDefaultRules();
  }

  private initializeDefaultSources(): void {
    // Political data sources
    this.addDataSource({
      id: 'political-parties-ca',
      name: 'Canadian Political Parties',
      type: 'api',
      url: 'https://api.elections.ca/parties',
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      isActive: true
    });

    this.addDataSource({
      id: 'political-parties-us',
      name: 'US Political Parties',
      type: 'api',
      url: 'https://api.fec.gov/v1/committees',
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      isActive: true
    });

    // Government data sources
    this.addDataSource({
      id: 'government-departments-ca',
      name: 'Canadian Government Departments',
      type: 'api',
      url: 'https://open.canada.ca/data/api/departments',
      refreshInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      isActive: true
    });

    // Indigenous data sources
    this.addDataSource({
      id: 'indigenous-communities-ca',
      name: 'Canadian Indigenous Communities',
      type: 'api',
      url: 'https://fnp-ppn.aadnc-aandc.gc.ca/api/communities',
      refreshInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      isActive: true
    });

    // Treaty data sources
    this.addDataSource({
      id: 'treaties-international',
      name: 'International Treaties',
      type: 'api',
      url: 'https://treaties.un.org/api/treaties',
      refreshInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      isActive: true
    });

    // Media data sources
    this.addDataSource({
      id: 'news-media-ca',
      name: 'Canadian News Media',
      type: 'api',
      url: 'https://crtc.gc.ca/api/media-outlets',
      refreshInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      isActive: true
    });

    this.addDataSource({
      id: 'news-media-us',
      name: 'US News Media',
      type: 'api',
      url: 'https://fcc.gov/api/media-outlets',
      refreshInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      isActive: true
    });
  }

  private initializeDefaultRules(): void {
    // Political parties aggregation
    this.addAggregationRule('political-parties-all', {
      sourceIds: ['political-parties-ca', 'political-parties-us'],
      targetField: 'politicalParties',
      aggregationType: 'merge'
    });

    // Government departments aggregation
    this.addAggregationRule('government-departments-all', {
      sourceIds: ['government-departments-ca'],
      targetField: 'governmentDepartments',
      aggregationType: 'merge'
    });

    // Indigenous communities aggregation
    this.addAggregationRule('indigenous-communities-all', {
      sourceIds: ['indigenous-communities-ca'],
      targetField: 'indigenousCommunities',
      aggregationType: 'merge'
    });

    // Treaties aggregation
    this.addAggregationRule('treaties-all', {
      sourceIds: ['treaties-international'],
      targetField: 'treaties',
      aggregationType: 'merge'
    });

    // News media aggregation
    this.addAggregationRule('news-media-all', {
      sourceIds: ['news-media-ca', 'news-media-us'],
      targetField: 'newsMedia',
      aggregationType: 'merge'
    });
  }

  addDataSource(source: DataSource): void {
    this.dataSources.set(source.id, source);
    logger.info('Data source added', { sourceId: source.id, name: source.name });
  }

  removeDataSource(sourceId: string): boolean {
    const removed = this.dataSources.delete(sourceId);
    if (removed) {
      logger.info('Data source removed', { sourceId });
    }
    return removed;
  }

  addAggregationRule(ruleId: string, rule: AggregationRule): void {
    this.aggregationRules.set(ruleId, rule);
    logger.info('Aggregation rule added', { ruleId, targetField: rule.targetField });
  }

  removeAggregationRule(ruleId: string): boolean {
    const removed = this.aggregationRules.delete(ruleId);
    if (removed) {
      logger.info('Aggregation rule removed', { ruleId });
    }
    return removed;
  }

  async aggregateData(ruleId?: string): Promise<AggregatedData[]> {
    const rulesToProcess = ruleId 
      ? [this.aggregationRules.get(ruleId)].filter(Boolean) as AggregationRule[]
      : Array.from(this.aggregationRules.values());

    const results: AggregatedData[] = [];

    for (const rule of rulesToProcess) {
      try {
        const aggregatedData = await this.processAggregationRule(rule);
        results.push(aggregatedData);
        this.aggregatedData.set(aggregatedData.id, aggregatedData);
      } catch (error) {
        logger.error('Aggregation rule processing failed', { 
          targetField: rule.targetField, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private async processAggregationRule(rule: AggregationRule): Promise<AggregatedData> {
    const startTime = Date.now();
    const cacheKey = `aggregation:${rule.targetField}`;

    // Check cache first
    const cachedData = cacheManager.get<AggregatedData>(cacheKey);
    if (cachedData && this.isCacheValid(cachedData, rule)) {
      logger.debug('Returning cached aggregated data', { targetField: rule.targetField });
      return cachedData;
    }

    logger.info('Processing aggregation rule', { 
      targetField: rule.targetField, 
      sourceCount: rule.sourceIds.length 
    });

    // Fetch data from all sources
    const sourceData: Array<{ sourceId: string; data: any }> = [];
    let freshDataCount = 0;

    for (const sourceId of rule.sourceIds) {
      const source = this.dataSources.get(sourceId);
      if (!source || !source.isActive) {
        logger.warn('Skipping inactive or missing data source', { sourceId });
        continue;
      }

      try {
        const data = await this.fetchDataFromSource(source);
        sourceData.push({ sourceId, data });
        
        // Check if data is fresh (updated within refresh interval)
        if (source.lastUpdated && 
            Date.now() - source.lastUpdated.getTime() < (source.refreshInterval || 24 * 60 * 60 * 1000)) {
          freshDataCount++;
        }
      } catch (error) {
        logger.error('Failed to fetch data from source', { 
          sourceId, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Apply filters if specified
    const filteredData = rule.filters 
      ? sourceData.map(item => ({
          ...item,
          data: this.applyFilters(item.data, rule.filters!)
        }))
      : sourceData;

    // Aggregate the data
    const aggregatedResult = this.performAggregation(
      filteredData.map(item => item.data),
      rule.aggregationType,
      rule.customFunction
    );

    const result: AggregatedData = {
      id: rule.targetField,
      sources: rule.sourceIds,
      data: aggregatedResult,
      metadata: {
        aggregatedAt: new Date(),
        sourceCount: sourceData.length,
        recordCount: this.countRecords(aggregatedResult),
        freshness: sourceData.length > 0 ? (freshDataCount / sourceData.length) * 100 : 0
      }
    };

    // Cache the result
    const cacheTime = Math.min(...rule.sourceIds.map(id => {
      const source = this.dataSources.get(id);
      return source?.refreshInterval || 60 * 60 * 1000; // Default 1 hour
    }));
    cacheManager.set(cacheKey, result, cacheTime);

    logger.info('Aggregation completed', {
      targetField: rule.targetField,
      duration: Date.now() - startTime,
      recordCount: result.metadata.recordCount,
      freshness: result.metadata.freshness
    });

    return result;
  }

  private async fetchDataFromSource(source: DataSource): Promise<any> {
    const cacheKey = `source:${source.id}`;
    
    // Check if we have cached data that's still fresh
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData && source.lastUpdated && 
        Date.now() - source.lastUpdated.getTime() < (source.refreshInterval || 24 * 60 * 60 * 1000)) {
      return cachedData;
    }

    // Simulate data fetching (in real implementation, this would make actual API calls)
    const mockData = this.generateMockData(source);
    
    // Update last updated timestamp
    source.lastUpdated = new Date();
    
    // Cache the data
    cacheManager.set(cacheKey, mockData, source.refreshInterval || 60 * 60 * 1000);
    
    return mockData;
  }

  private generateMockData(source: DataSource): any {
    // Generate mock data based on source type
    switch (source.id) {
      case 'political-parties-ca':
        return {
          parties: [
            { id: 'liberal', name: 'Liberal Party of Canada', type: 'federal' },
            { id: 'conservative', name: 'Conservative Party of Canada', type: 'federal' },
            { id: 'ndp', name: 'New Democratic Party', type: 'federal' }
          ]
        };
      
      case 'political-parties-us':
        return {
          parties: [
            { id: 'democratic', name: 'Democratic Party', type: 'federal' },
            { id: 'republican', name: 'Republican Party', type: 'federal' }
          ]
        };
      
      case 'government-departments-ca':
        return {
          departments: [
            { id: 'pch', name: 'Canadian Heritage', type: 'federal' },
            { id: 'dnd', name: 'National Defence', type: 'federal' },
            { id: 'vac', name: 'Veterans Affairs', type: 'federal' }
          ]
        };
      
      case 'indigenous-communities-ca':
        return {
          communities: [
            { id: 'mohawk', name: 'Mohawk Nation', region: 'Ontario' },
            { id: 'cree', name: 'Cree Nation', region: 'Quebec' },
            { id: 'inuit', name: 'Inuit Tapiriit Kanatami', region: 'Arctic' }
          ]
        };
      
      case 'treaties-international':
        return {
          treaties: [
            { id: 'undrip', name: 'UN Declaration on the Rights of Indigenous Peoples', year: 2007 },
            { id: 'iccpr', name: 'International Covenant on Civil and Political Rights', year: 1966 }
          ]
        };
      
      case 'news-media-ca':
        return {
          outlets: [
            { id: 'cbc', name: 'CBC/Radio-Canada', type: 'public' },
            { id: 'ctv', name: 'CTV News', type: 'private' },
            { id: 'global', name: 'Global News', type: 'private' }
          ]
        };
      
      case 'news-media-us':
        return {
          outlets: [
            { id: 'cnn', name: 'CNN', type: 'private' },
            { id: 'fox', name: 'Fox News', type: 'private' },
            { id: 'pbs', name: 'PBS', type: 'public' }
          ]
        };
      
      default:
        return { data: [], timestamp: new Date().toISOString() };
    }
  }

  private applyFilters(data: any, filters: Record<string, any>): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Simple filter implementation
    if (Array.isArray(data)) {
      return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    // For objects, filter nested arrays
    const filtered = { ...data };
    Object.keys(filtered).forEach(key => {
      if (Array.isArray(filtered[key])) {
        filtered[key] = this.applyFilters(filtered[key], filters);
      }
    });

    return filtered;
  }

  private performAggregation(dataArray: any[], type: string, customFunction?: (data: any[]) => any): any {
    if (dataArray.length === 0) {
      return null;
    }

    switch (type) {
      case 'merge':
        return this.mergeData(dataArray);
      
      case 'sum':
        return this.sumData(dataArray);
      
      case 'average':
        return this.averageData(dataArray);
      
      case 'count':
        return this.countData(dataArray);
      
      case 'latest':
        return this.getLatestData(dataArray);
      
      case 'custom':
        if (customFunction) {
          return customFunction(dataArray);
        }
        throw new Error('Custom aggregation function not provided');
      
      default:
        throw new Error(`Unsupported aggregation type: ${type}`);
    }
  }

  private mergeData(dataArray: any[]): any {
    const merged: any = {};
    
    dataArray.forEach(data => {
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          if (!merged[key]) {
            merged[key] = [];
          }
          merged[key].push(...data[key]);
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          if (!merged[key]) {
            merged[key] = {};
          }
          Object.assign(merged[key], data[key]);
        } else {
          merged[key] = data[key];
        }
      });
    });

    return merged;
  }

  private sumData(dataArray: any[]): number {
    return dataArray.reduce((sum, data) => {
      if (typeof data === 'number') {
        return sum + data;
      }
      return sum;
    }, 0);
  }

  private averageData(dataArray: any[]): number {
    const sum = this.sumData(dataArray);
    return dataArray.length > 0 ? sum / dataArray.length : 0;
  }

  private countData(dataArray: any[]): number {
    return dataArray.reduce((count, data) => {
      if (Array.isArray(data)) {
        return count + data.length;
      } else if (typeof data === 'object' && data !== null) {
        return count + Object.keys(data).length;
      }
      return count + 1;
    }, 0);
  }

  private getLatestData(dataArray: any[]): any {
    // Return the data with the most recent timestamp
    return dataArray.reduce((latest, current) => {
      const currentTime = current.timestamp || current.lastUpdated || 0;
      const latestTime = latest.timestamp || latest.lastUpdated || 0;
      return currentTime > latestTime ? current : latest;
    });
  }

  private countRecords(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    } else if (typeof data === 'object' && data !== null) {
      return Object.keys(data).reduce((count, key) => {
        return count + this.countRecords(data[key]);
      }, 0);
    }
    return 1;
  }

  private isCacheValid(cachedData: AggregatedData, rule: AggregationRule): boolean {
    // Check if cached data is still valid based on source refresh intervals
    const maxAge = Math.min(...rule.sourceIds.map(id => {
      const source = this.dataSources.get(id);
      return source?.refreshInterval || 60 * 60 * 1000; // Default 1 hour
    }));

    const age = Date.now() - cachedData.metadata.aggregatedAt.getTime();
    return age < maxAge;
  }

  // Public methods for accessing aggregated data
  getAggregatedData(targetField?: string): AggregatedData[] {
    if (targetField) {
      const data = this.aggregatedData.get(targetField);
      return data ? [data] : [];
    }
    return Array.from(this.aggregatedData.values());
  }

  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  getAggregationRules(): Array<{ id: string; rule: AggregationRule }> {
    return Array.from(this.aggregationRules.entries()).map(([id, rule]) => ({ id, rule }));
  }

  async refreshAllData(): Promise<void> {
    logger.info('Refreshing all aggregated data');
    await this.aggregateData();
    logger.info('All data refreshed');
  }

  getAggregationStats(): {
    totalSources: number;
    activeSources: number;
    totalRules: number;
    totalAggregatedDatasets: number;
    averageFreshness: number;
  } {
    const sources = Array.from(this.dataSources.values());
    const aggregatedDatasets = Array.from(this.aggregatedData.values());
    
    const totalFreshness = aggregatedDatasets.reduce((sum, data) => sum + data.metadata.freshness, 0);
    
    return {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.isActive).length,
      totalRules: this.aggregationRules.size,
      totalAggregatedDatasets: aggregatedDatasets.length,
      averageFreshness: aggregatedDatasets.length > 0 ? totalFreshness / aggregatedDatasets.length : 0
    };
  }
}
