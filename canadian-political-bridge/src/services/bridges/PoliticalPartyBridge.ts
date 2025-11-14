import axios from 'axios';
import { logger } from '../../utils/logger';
import { BridgeStatus } from '../BridgeOrchestrator';

export interface PoliticalParty {
  id: string;
  name: string;
  shortName: string;
  leader: string;
  founded: number;
  ideology: string[];
  colors: string[];
  website: string;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  currentSeats: {
    house: number;
    senate: number;
  };
  polling: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
  };
}

export interface PollingData {
  party: string;
  support: number;
  date: Date;
  pollster: string;
  sampleSize: number;
  marginOfError: number;
  region?: string;
}

export class PoliticalPartyBridge {
  private parties: Map<string, PoliticalParty> = new Map();
  private pollingData: PollingData[] = [];
  private lastSync: Date | null = null;
  private isInitialized: boolean = false;

  // Canadian Political Parties Configuration
  private readonly PARTY_CONFIG = {
    liberal: {
      name: 'Liberal Party of Canada',
      shortName: 'LPC',
      apiEndpoints: {
        official: 'https://liberal.ca',
        polling: 'https://api.pollsteraudit.ca/polls/liberal',
        github: 'https://github.com/liberal-party-canada' // If exists
      },
      colors: ['#FF0000', '#FFFFFF'],
      ideology: ['Liberalism', 'Social liberalism', 'Centrism']
    },
    conservative: {
      name: 'Conservative Party of Canada',
      shortName: 'CPC',
      apiEndpoints: {
        official: 'https://conservative.ca',
        polling: 'https://api.pollsteraudit.ca/polls/conservative',
        github: 'https://github.com/conservative-party-canada' // If exists
      },
      colors: ['#1A4480', '#FFFFFF'],
      ideology: ['Conservatism', 'Economic liberalism', 'Social conservatism']
    },
    ndp: {
      name: 'New Democratic Party',
      shortName: 'NDP',
      apiEndpoints: {
        official: 'https://ndp.ca',
        polling: 'https://api.pollsteraudit.ca/polls/ndp',
        github: 'https://github.com/ndp-canada' // If exists
      },
      colors: ['#FF6600', '#FFFFFF'],
      ideology: ['Social democracy', 'Democratic socialism']
    },
    bloc: {
      name: 'Bloc Québécois',
      shortName: 'BQ',
      apiEndpoints: {
        official: 'https://blocquebecois.org',
        polling: 'https://api.pollsteraudit.ca/polls/bloc',
        github: 'https://github.com/bloc-quebecois' // If exists
      },
      colors: ['#87CEEB', '#FFFFFF'],
      ideology: ['Quebec nationalism', 'Social democracy']
    },
    green: {
      name: 'Green Party of Canada',
      shortName: 'GPC',
      apiEndpoints: {
        official: 'https://greenparty.ca',
        polling: 'https://api.pollsteraudit.ca/polls/green',
        github: 'https://github.com/green-party-canada' // If exists
      },
      colors: ['#6AB023', '#FFFFFF'],
      ideology: ['Green politics', 'Environmentalism', 'Social democracy']
    },
    ppc: {
      name: "People's Party of Canada",
      shortName: 'PPC',
      apiEndpoints: {
        official: 'https://peoplespartyofcanada.ca',
        polling: 'https://api.pollsteraudit.ca/polls/ppc',
        github: 'https://github.com/peoples-party-canada' // If exists
      },
      colors: ['#800080', '#FFFFFF'],
      ideology: ['Right-wing populism', 'Libertarianism', 'Classical liberalism']
    }
  };

  async initialize(): Promise<void> {
    try {
      logger.info('🗳️ Initializing Political Party Bridge');

      // Initialize party data
      await this.initializePartyData();

      // Load initial polling data
      await this.loadPollingData();

      this.isInitialized = true;
      logger.info('✅ Political Party Bridge initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize Political Party Bridge:', error);
      throw error;
    }
  }

  private async initializePartyData(): Promise<void> {
    for (const [key, config] of Object.entries(this.PARTY_CONFIG)) {
      try {
        // Create party object with available data
        const party: PoliticalParty = {
          id: key,
          name: config.name,
          shortName: config.shortName,
          leader: await this.fetchPartyLeader(key),
          founded: await this.fetchPartyFoundedYear(key),
          ideology: config.ideology,
          colors: config.colors,
          website: config.apiEndpoints.official,
          socialMedia: await this.fetchSocialMediaLinks(key),
          currentSeats: await this.fetchCurrentSeats(key),
          polling: {
            current: 0,
            trend: 'stable',
            lastUpdated: new Date()
          }
        };

        this.parties.set(key, party);
        logger.info(`✅ Initialized ${config.name} data`);

      } catch (error) {
        logger.warn(`⚠️ Failed to initialize ${config.name}:`, error);
      }
    }
  }

  private async fetchPartyLeader(partyKey: string): Promise<string> {
    // This would typically fetch from official APIs or scrape websites
    const leaders: Record<string, string> = {
      liberal: 'Justin Trudeau',
      conservative: 'Pierre Poilievre',
      ndp: 'Jagmeet Singh',
      bloc: 'Yves-François Blanchet',
      green: 'Elizabeth May',
      ppc: 'Maxime Bernier'
    };
    
    return leaders[partyKey] || 'Unknown';
  }

  private async fetchPartyFoundedYear(partyKey: string): Promise<number> {
    const foundedYears: Record<string, number> = {
      liberal: 1867,
      conservative: 2003,
      ndp: 1961,
      bloc: 1991,
      green: 1983,
      ppc: 2018
    };
    
    return foundedYears[partyKey] || 0;
  }

  private async fetchSocialMediaLinks(partyKey: string): Promise<any> {
    // This would fetch real social media links
    return {
      twitter: `@${this.PARTY_CONFIG[partyKey as keyof typeof this.PARTY_CONFIG]?.shortName}`,
      facebook: `/${partyKey}party`,
      instagram: `@${partyKey}party`
    };
  }

  private async fetchCurrentSeats(partyKey: string): Promise<{ house: number; senate: number }> {
    // This would fetch from Parliament API or Elections Canada
    const currentSeats: Record<string, { house: number; senate: number }> = {
      liberal: { house: 158, senate: 0 },
      conservative: { house: 119, senate: 0 },
      ndp: { house: 25, senate: 0 },
      bloc: { house: 32, senate: 0 },
      green: { house: 2, senate: 0 },
      ppc: { house: 0, senate: 0 }
    };
    
    return currentSeats[partyKey] || { house: 0, senate: 0 };
  }

  private async loadPollingData(): Promise<void> {
    try {
      // Fetch from PollsterAudit API
      const response = await axios.get('https://api.pollsteraudit.ca/polls/latest', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Canadian-Political-Bridge/1.0'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        this.pollingData = response.data.map((poll: any) => ({
          party: poll.party?.toLowerCase() || 'unknown',
          support: poll.support || 0,
          date: new Date(poll.date),
          pollster: poll.pollster || 'Unknown',
          sampleSize: poll.sampleSize || 0,
          marginOfError: poll.marginOfError || 0,
          region: poll.region
        }));

        // Update party polling data
        this.updatePartyPollingData();
      }

    } catch (error) {
      logger.warn('⚠️ Failed to load polling data:', error);
      // Use mock data for development
      this.loadMockPollingData();
    }
  }

  private loadMockPollingData(): void {
    this.pollingData = [
      { party: 'liberal', support: 32.5, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 },
      { party: 'conservative', support: 35.2, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 },
      { party: 'ndp', support: 18.7, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 },
      { party: 'bloc', support: 7.8, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 },
      { party: 'green', support: 4.2, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 },
      { party: 'ppc', support: 1.6, date: new Date(), pollster: 'Mock Poll', sampleSize: 1000, marginOfError: 3.1 }
    ];
    
    this.updatePartyPollingData();
  }

  private updatePartyPollingData(): void {
    for (const poll of this.pollingData) {
      const party = this.parties.get(poll.party);
      if (party) {
        party.polling.current = poll.support;
        party.polling.lastUpdated = poll.date;
        // Simple trend calculation (would be more sophisticated in production)
        party.polling.trend = poll.support > 30 ? 'up' : poll.support < 20 ? 'down' : 'stable';
      }
    }
  }

  async syncData(): Promise<void> {
    try {
      logger.info('🔄 Syncing political party data');

      // Reload polling data
      await this.loadPollingData();

      // Update party information
      await this.updatePartyInformation();

      this.lastSync = new Date();
      logger.info('✅ Political party data sync completed');

    } catch (error) {
      logger.error('❌ Political party data sync failed:', error);
      throw error;
    }
  }

  private async updatePartyInformation(): Promise<void> {
    // Update party leaders, seat counts, etc.
    for (const [key, party] of this.parties) {
      try {
        party.leader = await this.fetchPartyLeader(key);
        party.currentSeats = await this.fetchCurrentSeats(key);
      } catch (error) {
        logger.warn(`⚠️ Failed to update ${party.name} information:`, error);
      }
    }
  }

  async getData(party?: string, filters?: any): Promise<any> {
    if (party) {
      const partyData = this.parties.get(party.toLowerCase());
      if (!partyData) {
        throw new Error(`Party '${party}' not found`);
      }
      return partyData;
    }

    // Return all parties
    const allParties = Array.from(this.parties.values());
    
    if (filters) {
      return this.applyFilters(allParties, filters);
    }
    
    return allParties;
  }

  async getPollingData(party?: string): Promise<PollingData[]> {
    if (party) {
      return this.pollingData.filter(poll => poll.party === party.toLowerCase());
    }
    
    return this.pollingData;
  }

  async search(query: string, filters?: any): Promise<any> {
    const results: any[] = [];
    const searchTerm = query.toLowerCase();

    for (const party of this.parties.values()) {
      let relevanceScore = 0;

      // Search in party name
      if (party.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
      }

      // Search in leader name
      if (party.leader.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
      }

      // Search in ideology
      if (party.ideology.some(ideology => ideology.toLowerCase().includes(searchTerm))) {
        relevanceScore += 6;
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'political_party',
          party: party,
          relevanceScore,
          matchedFields: this.getMatchedFields(party, searchTerm)
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      source: 'political_parties',
      query,
      results,
      totalResults: results.length
    };
  }

  private getMatchedFields(party: PoliticalParty, searchTerm: string): string[] {
    const matched: string[] = [];
    
    if (party.name.toLowerCase().includes(searchTerm)) matched.push('name');
    if (party.leader.toLowerCase().includes(searchTerm)) matched.push('leader');
    if (party.ideology.some(ideology => ideology.toLowerCase().includes(searchTerm))) matched.push('ideology');
    
    return matched;
  }

  private applyFilters(parties: PoliticalParty[], filters: any): PoliticalParty[] {
    let filtered = [...parties];

    if (filters.minSeats) {
      filtered = filtered.filter(party => party.currentSeats.house >= filters.minSeats);
    }

    if (filters.ideology) {
      filtered = filtered.filter(party => 
        party.ideology.some(ideology => 
          ideology.toLowerCase().includes(filters.ideology.toLowerCase())
        )
      );
    }

    if (filters.minPolling) {
      filtered = filtered.filter(party => party.polling.current >= filters.minPolling);
    }

    return filtered;
  }

  async getStatus(): Promise<BridgeStatus> {
    return {
      name: 'Political Party Bridge',
      status: this.isInitialized ? 'connected' : 'disconnected',
      lastSync: this.lastSync,
      dataPoints: this.parties.size + this.pollingData.length
    };
  }

  getAllParties(): PoliticalParty[] {
    return Array.from(this.parties.values());
  }

  getPartyByName(name: string): PoliticalParty | undefined {
    for (const party of this.parties.values()) {
      if (party.name.toLowerCase() === name.toLowerCase() || 
          party.shortName.toLowerCase() === name.toLowerCase()) {
        return party;
      }
    }
    return undefined;
  }
}
