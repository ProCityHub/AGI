import { logger } from '../../utils/logger';
import { cacheManager } from '../../utils/CacheManager';

export interface Election {
  id: string;
  name: string;
  type: 'federal' | 'provincial' | 'municipal' | 'referendum';
  level: 'federal' | 'provincial' | 'municipal';
  jurisdiction: string; // Country, province, or municipality
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  turnout?: number; // Percentage
  eligibleVoters?: number;
  totalVotes?: number;
  results?: ElectionResult[];
  isActive: boolean;
}

export interface ElectionResult {
  candidateId: string;
  candidateName: string;
  party: string;
  votes: number;
  percentage: number;
  elected: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  election: string;
  biography?: string;
  platform?: string[];
  website?: string;
  isActive: boolean;
}

export interface PoliticalParty {
  id: string;
  name: string;
  nameEn: string;
  nameFr?: string;
  abbreviation: string;
  leader: string;
  founded: string;
  ideology: string[];
  website: string;
  headquarters: string;
  seats?: {
    current: number;
    previous: number;
  };
  popularVote?: {
    current: number;
    previous: number;
  };
  isActive: boolean;
}

export interface Constituency {
  id: string;
  name: string;
  type: 'federal' | 'provincial';
  province: string;
  population: number;
  area: number; // km²
  currentMP?: string;
  currentMPP?: string;
  lastElection: string;
  marginOfVictory?: number;
  isActive: boolean;
}

export interface Poll {
  id: string;
  pollster: string;
  date: string;
  sampleSize: number;
  marginOfError: number;
  methodology: string;
  results: PollResult[];
  election?: string;
  isActive: boolean;
}

export interface PollResult {
  party: string;
  support: number; // Percentage
  change?: number; // Change from previous poll
}

export class ElectoralDataBridge {
  private elections: Map<string, Election> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private parties: Map<string, PoliticalParty> = new Map();
  private constituencies: Map<string, Constituency> = new Map();
  private polls: Map<string, Poll> = new Map();

  constructor() {
    logger.info('ElectoralDataBridge initialized');
    this.initializeData();
  }

  private initializeData(): void {
    this.initializeElections();
    this.initializeCandidates();
    this.initializeParties();
    this.initializeConstituencies();
    this.initializePolls();
  }

  private initializeElections(): void {
    const elections: Election[] = [
      {
        id: 'ca-federal-2021',
        name: '2021 Canadian Federal Election',
        type: 'federal',
        level: 'federal',
        jurisdiction: 'Canada',
        date: '2021-09-20',
        status: 'completed',
        turnout: 62.0,
        eligibleVoters: 27411782,
        totalVotes: 17001047,
        results: [
          { candidateId: 'trudeau-2021', candidateName: 'Justin Trudeau', party: 'Liberal', votes: 5556629, percentage: 32.6, elected: true },
          { candidateId: 'otoole-2021', candidateName: 'Erin O\'Toole', party: 'Conservative', votes: 5747410, percentage: 33.7, elected: false },
          { candidateId: 'singh-2021', candidateName: 'Jagmeet Singh', party: 'NDP', votes: 3036348, percentage: 17.8, elected: false },
          { candidateId: 'blanchet-2021', candidateName: 'Yves-François Blanchet', party: 'Bloc Québécois', votes: 1281103, percentage: 7.5, elected: false }
        ],
        isActive: true
      },
      {
        id: 'ca-federal-2019',
        name: '2019 Canadian Federal Election',
        type: 'federal',
        level: 'federal',
        jurisdiction: 'Canada',
        date: '2019-10-21',
        status: 'completed',
        turnout: 67.0,
        eligibleVoters: 27059993,
        totalVotes: 18350359,
        results: [
          { candidateId: 'trudeau-2019', candidateName: 'Justin Trudeau', party: 'Liberal', votes: 6018728, percentage: 33.1, elected: true },
          { candidateId: 'scheer-2019', candidateName: 'Andrew Scheer', party: 'Conservative', votes: 6239227, percentage: 34.3, elected: false },
          { candidateId: 'singh-2019', candidateName: 'Jagmeet Singh', party: 'NDP', votes: 2903722, percentage: 15.9, elected: false },
          { candidateId: 'blanchet-2019', candidateName: 'Yves-François Blanchet', party: 'Bloc Québécois', votes: 1387030, percentage: 7.6, elected: false }
        ],
        isActive: true
      },
      {
        id: 'on-provincial-2022',
        name: '2022 Ontario General Election',
        type: 'provincial',
        level: 'provincial',
        jurisdiction: 'Ontario',
        date: '2022-06-02',
        status: 'completed',
        turnout: 43.5,
        eligibleVoters: 10733304,
        totalVotes: 4674345,
        results: [
          { candidateId: 'ford-2022', candidateName: 'Doug Ford', party: 'Progressive Conservative', votes: 1915455, percentage: 40.8, elected: true },
          { candidateId: 'del-duca-2022', candidateName: 'Steven Del Duca', party: 'Liberal', votes: 1116891, percentage: 23.8, elected: false },
          { candidateId: 'horwath-2022', candidateName: 'Andrea Horwath', party: 'NDP', votes: 1114799, percentage: 23.7, elected: false }
        ],
        isActive: true
      },
      {
        id: 'ca-federal-2025',
        name: '2025 Canadian Federal Election',
        type: 'federal',
        level: 'federal',
        jurisdiction: 'Canada',
        date: '2025-10-20',
        status: 'upcoming',
        eligibleVoters: 28500000,
        isActive: true
      }
    ];

    elections.forEach(election => this.elections.set(election.id, election));
    logger.info('Elections initialized', { count: elections.length });
  }

  private initializeCandidates(): void {
    const candidates: Candidate[] = [
      {
        id: 'trudeau-2021',
        name: 'Justin Trudeau',
        party: 'Liberal',
        constituency: 'Papineau',
        election: 'ca-federal-2021',
        biography: 'Prime Minister of Canada since 2015',
        platform: ['Climate action', 'Affordable childcare', 'Reconciliation'],
        website: 'https://liberal.ca',
        isActive: true
      },
      {
        id: 'poilievre-2025',
        name: 'Pierre Poilievre',
        party: 'Conservative',
        constituency: 'Carleton',
        election: 'ca-federal-2025',
        biography: 'Leader of the Conservative Party of Canada',
        platform: ['Axe the tax', 'Build the homes', 'Fix the budget'],
        website: 'https://conservative.ca',
        isActive: true
      },
      {
        id: 'singh-2025',
        name: 'Jagmeet Singh',
        party: 'NDP',
        constituency: 'Burnaby South',
        election: 'ca-federal-2025',
        biography: 'Leader of the New Democratic Party',
        platform: ['Universal healthcare', 'Affordable housing', 'Climate justice'],
        website: 'https://ndp.ca',
        isActive: true
      },
      {
        id: 'blanchet-2025',
        name: 'Yves-François Blanchet',
        party: 'Bloc Québécois',
        constituency: 'Beloeil—Chambly',
        election: 'ca-federal-2025',
        biography: 'Leader of the Bloc Québécois',
        platform: ['Quebec sovereignty', 'French language protection', 'Quebec interests'],
        website: 'https://blocquebecois.org',
        isActive: true
      }
    ];

    candidates.forEach(candidate => this.candidates.set(candidate.id, candidate));
    logger.info('Candidates initialized', { count: candidates.length });
  }

  private initializeParties(): void {
    const parties: PoliticalParty[] = [
      {
        id: 'liberal',
        name: 'Liberal Party of Canada',
        nameEn: 'Liberal Party of Canada',
        nameFr: 'Parti libéral du Canada',
        abbreviation: 'LPC',
        leader: 'Justin Trudeau',
        founded: '1867',
        ideology: ['Liberalism', 'Social liberalism', 'Centrism'],
        website: 'https://liberal.ca',
        headquarters: 'Ottawa, ON',
        seats: { current: 158, previous: 177 },
        popularVote: { current: 32.6, previous: 33.1 },
        isActive: true
      },
      {
        id: 'conservative',
        name: 'Conservative Party of Canada',
        nameEn: 'Conservative Party of Canada',
        nameFr: 'Parti conservateur du Canada',
        abbreviation: 'CPC',
        leader: 'Pierre Poilievre',
        founded: '2003',
        ideology: ['Conservatism', 'Economic liberalism', 'Social conservatism'],
        website: 'https://conservative.ca',
        headquarters: 'Ottawa, ON',
        seats: { current: 119, previous: 121 },
        popularVote: { current: 33.7, previous: 34.3 },
        isActive: true
      },
      {
        id: 'ndp',
        name: 'New Democratic Party',
        nameEn: 'New Democratic Party',
        nameFr: 'Nouveau Parti démocratique',
        abbreviation: 'NDP',
        leader: 'Jagmeet Singh',
        founded: '1961',
        ideology: ['Social democracy', 'Democratic socialism', 'Progressivism'],
        website: 'https://ndp.ca',
        headquarters: 'Ottawa, ON',
        seats: { current: 25, previous: 24 },
        popularVote: { current: 17.8, previous: 15.9 },
        isActive: true
      },
      {
        id: 'bloc',
        name: 'Bloc Québécois',
        nameEn: 'Bloc Québécois',
        nameFr: 'Bloc Québécois',
        abbreviation: 'BQ',
        leader: 'Yves-François Blanchet',
        founded: '1991',
        ideology: ['Quebec nationalism', 'Social democracy', 'Sovereigntism'],
        website: 'https://blocquebecois.org',
        headquarters: 'Montreal, QC',
        seats: { current: 32, previous: 32 },
        popularVote: { current: 7.5, previous: 7.6 },
        isActive: true
      },
      {
        id: 'green',
        name: 'Green Party of Canada',
        nameEn: 'Green Party of Canada',
        nameFr: 'Parti vert du Canada',
        abbreviation: 'GPC',
        leader: 'Elizabeth May',
        founded: '1983',
        ideology: ['Green politics', 'Environmentalism', 'Social progressivism'],
        website: 'https://greenparty.ca',
        headquarters: 'Ottawa, ON',
        seats: { current: 2, previous: 3 },
        popularVote: { current: 2.3, previous: 6.5 },
        isActive: true
      }
    ];

    parties.forEach(party => this.parties.set(party.id, party));
    logger.info('Political parties initialized', { count: parties.length });
  }

  private initializeConstituencies(): void {
    const constituencies: Constituency[] = [
      {
        id: 'papineau',
        name: 'Papineau',
        type: 'federal',
        province: 'Quebec',
        population: 112460,
        area: 9.2,
        currentMP: 'Justin Trudeau',
        lastElection: 'ca-federal-2021',
        marginOfVictory: 52.6,
        isActive: true
      },
      {
        id: 'carleton',
        name: 'Carleton',
        type: 'federal',
        province: 'Ontario',
        population: 132245,
        area: 1878.5,
        currentMP: 'Pierre Poilievre',
        lastElection: 'ca-federal-2021',
        marginOfVictory: 61.2,
        isActive: true
      },
      {
        id: 'burnaby-south',
        name: 'Burnaby South',
        type: 'federal',
        province: 'British Columbia',
        population: 119675,
        area: 23.8,
        currentMP: 'Jagmeet Singh',
        lastElection: 'ca-federal-2021',
        marginOfVictory: 48.9,
        isActive: true
      },
      {
        id: 'beloeil-chambly',
        name: 'Beloeil—Chambly',
        type: 'federal',
        province: 'Quebec',
        population: 118542,
        area: 601.2,
        currentMP: 'Yves-François Blanchet',
        lastElection: 'ca-federal-2021',
        marginOfVictory: 56.8,
        isActive: true
      }
    ];

    constituencies.forEach(constituency => this.constituencies.set(constituency.id, constituency));
    logger.info('Constituencies initialized', { count: constituencies.length });
  }

  private initializePolls(): void {
    const polls: Poll[] = [
      {
        id: 'nanos-2024-11-01',
        pollster: 'Nanos Research',
        date: '2024-11-01',
        sampleSize: 1200,
        marginOfError: 2.8,
        methodology: 'Random telephone survey',
        results: [
          { party: 'Conservative', support: 42.1, change: 1.2 },
          { party: 'Liberal', support: 24.8, change: -0.8 },
          { party: 'NDP', support: 18.5, change: 0.3 },
          { party: 'Bloc Québécois', support: 8.2, change: -0.2 },
          { party: 'Green', support: 4.1, change: 0.1 }
        ],
        election: 'ca-federal-2025',
        isActive: true
      },
      {
        id: 'leger-2024-10-28',
        pollster: 'Léger',
        date: '2024-10-28',
        sampleSize: 1547,
        marginOfError: 2.5,
        methodology: 'Online panel survey',
        results: [
          { party: 'Conservative', support: 40.9, change: 0.8 },
          { party: 'Liberal', support: 25.6, change: -1.1 },
          { party: 'NDP', support: 18.2, change: 0.5 },
          { party: 'Bloc Québécois', support: 8.4, change: 0.2 },
          { party: 'Green', support: 4.0, change: -0.1 }
        ],
        election: 'ca-federal-2025',
        isActive: true
      },
      {
        id: 'abacus-2024-10-25',
        pollster: 'Abacus Data',
        date: '2024-10-25',
        sampleSize: 2200,
        marginOfError: 2.1,
        methodology: 'Online survey',
        results: [
          { party: 'Conservative', support: 41.5, change: 1.5 },
          { party: 'Liberal', support: 23.9, change: -1.3 },
          { party: 'NDP', support: 19.1, change: 0.7 },
          { party: 'Bloc Québécois', support: 8.1, change: -0.3 },
          { party: 'Green', support: 4.2, change: 0.2 }
        ],
        election: 'ca-federal-2025',
        isActive: true
      }
    ];

    polls.forEach(poll => this.polls.set(poll.id, poll));
    logger.info('Polls initialized', { count: polls.length });
  }

  // Public API methods
  async getData(category?: string, filters?: any): Promise<any> {
    const cacheKey = `electoral-data:${category || 'all'}:${JSON.stringify(filters || {})}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = {
      elections: category === 'elections' || !category ? Array.from(this.elections.values()) : [],
      candidates: category === 'candidates' || !category ? Array.from(this.candidates.values()) : [],
      parties: category === 'parties' || !category ? Array.from(this.parties.values()) : [],
      constituencies: category === 'constituencies' || !category ? Array.from(this.constituencies.values()) : [],
      polls: category === 'polls' || !category ? Array.from(this.polls.values()) : [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalElections: this.elections.size,
        totalCandidates: this.candidates.size,
        totalParties: this.parties.size,
        totalConstituencies: this.constituencies.size,
        totalPolls: this.polls.size
      }
    };

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        data.elections = data.elections.filter(e => e.status === filters.status);
      }
      if (filters.level) {
        data.elections = data.elections.filter(e => e.level === filters.level);
        data.constituencies = data.constituencies.filter(c => c.type === filters.level);
      }
      if (filters.party) {
        data.candidates = data.candidates.filter(c => c.party === filters.party);
      }
      if (filters.province) {
        data.constituencies = data.constituencies.filter(c => c.province === filters.province);
      }
      if (filters.isActive !== undefined) {
        data.elections = data.elections.filter(e => e.isActive === filters.isActive);
        data.candidates = data.candidates.filter(c => c.isActive === filters.isActive);
        data.parties = data.parties.filter(p => p.isActive === filters.isActive);
        data.constituencies = data.constituencies.filter(c => c.isActive === filters.isActive);
        data.polls = data.polls.filter(p => p.isActive === filters.isActive);
      }
    }

    cacheManager.set(cacheKey, data, 15 * 60 * 1000); // Cache for 15 minutes
    return data;
  }

  async getElections(filters?: any): Promise<Election[]> {
    const data = await this.getData('elections', filters);
    return data.elections;
  }

  async getCandidates(filters?: any): Promise<Candidate[]> {
    const data = await this.getData('candidates', filters);
    return data.candidates;
  }

  async getParties(filters?: any): Promise<PoliticalParty[]> {
    const data = await this.getData('parties', filters);
    return data.parties;
  }

  async getConstituencies(filters?: any): Promise<Constituency[]> {
    const data = await this.getData('constituencies', filters);
    return data.constituencies;
  }

  async getPolls(filters?: any): Promise<Poll[]> {
    const data = await this.getData('polls', filters);
    return data.polls;
  }

  async getElectionById(id: string): Promise<Election | null> {
    return this.elections.get(id) || null;
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return this.candidates.get(id) || null;
  }

  async getPartyById(id: string): Promise<PoliticalParty | null> {
    return this.parties.get(id) || null;
  }

  async getConstituencyById(id: string): Promise<Constituency | null> {
    return this.constituencies.get(id) || null;
  }

  async getPollById(id: string): Promise<Poll | null> {
    return this.polls.get(id) || null;
  }

  async search(query: string, filters?: any): Promise<any> {
    const searchTerm = query.toLowerCase();
    
    const elections = Array.from(this.elections.values()).filter(e =>
      e.name.toLowerCase().includes(searchTerm) ||
      e.jurisdiction.toLowerCase().includes(searchTerm)
    );

    const candidates = Array.from(this.candidates.values()).filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.party.toLowerCase().includes(searchTerm) ||
      c.constituency.toLowerCase().includes(searchTerm)
    );

    const parties = Array.from(this.parties.values()).filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.leader.toLowerCase().includes(searchTerm) ||
      p.ideology.some(i => i.toLowerCase().includes(searchTerm))
    );

    const constituencies = Array.from(this.constituencies.values()).filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.province.toLowerCase().includes(searchTerm) ||
      c.currentMP?.toLowerCase().includes(searchTerm) ||
      c.currentMPP?.toLowerCase().includes(searchTerm)
    );

    const polls = Array.from(this.polls.values()).filter(p =>
      p.pollster.toLowerCase().includes(searchTerm)
    );

    return {
      query,
      results: {
        elections,
        candidates,
        parties,
        constituencies,
        polls
      },
      totalResults: elections.length + candidates.length + parties.length + constituencies.length + polls.length
    };
  }

  async getStats(): Promise<any> {
    const elections = Array.from(this.elections.values());
    const candidates = Array.from(this.candidates.values());
    const parties = Array.from(this.parties.values());
    const constituencies = Array.from(this.constituencies.values());
    const polls = Array.from(this.polls.values());

    return {
      overview: {
        totalElections: elections.length,
        totalCandidates: candidates.length,
        totalParties: parties.length,
        totalConstituencies: constituencies.length,
        totalPolls: polls.length,
        upcomingElections: elections.filter(e => e.status === 'upcoming').length,
        completedElections: elections.filter(e => e.status === 'completed').length,
        activeParties: parties.filter(p => p.isActive).length
      },
      elections: {
        byLevel: {
          federal: elections.filter(e => e.level === 'federal').length,
          provincial: elections.filter(e => e.level === 'provincial').length,
          municipal: elections.filter(e => e.level === 'municipal').length
        },
        byStatus: {
          upcoming: elections.filter(e => e.status === 'upcoming').length,
          ongoing: elections.filter(e => e.status === 'ongoing').length,
          completed: elections.filter(e => e.status === 'completed').length,
          cancelled: elections.filter(e => e.status === 'cancelled').length
        }
      },
      parties: {
        averageSeats: parties.filter(p => p.seats).reduce((sum, p) => sum + p.seats!.current, 0) / parties.filter(p => p.seats).length,
        totalSeats: parties.filter(p => p.seats).reduce((sum, p) => sum + p.seats!.current, 0),
        averagePopularVote: parties.filter(p => p.popularVote).reduce((sum, p) => sum + p.popularVote!.current, 0) / parties.filter(p => p.popularVote).length
      },
      constituencies: {
        byProvince: constituencies.reduce((acc, c) => {
          acc[c.province] = (acc[c.province] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: {
          federal: constituencies.filter(c => c.type === 'federal').length,
          provincial: constituencies.filter(c => c.type === 'provincial').length
        },
        totalPopulation: constituencies.reduce((sum, c) => sum + c.population, 0),
        totalArea: constituencies.reduce((sum, c) => sum + c.area, 0)
      },
      polls: {
        recentPolls: polls.filter(p => new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        averageSampleSize: polls.reduce((sum, p) => sum + p.sampleSize, 0) / polls.length,
        pollsters: [...new Set(polls.map(p => p.pollster))].length
      }
    };
  }

  async getPollAggregation(filters?: any): Promise<any> {
    let relevantPolls = Array.from(this.polls.values());
    
    // Apply filters
    if (filters?.election) {
      relevantPolls = relevantPolls.filter(p => p.election === filters.election);
    }
    if (filters?.days) {
      const cutoffDate = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000);
      relevantPolls = relevantPolls.filter(p => new Date(p.date) > cutoffDate);
    }

    // Aggregate poll results by party
    const partySupport: Record<string, { total: number; count: number; polls: Poll[] }> = {};
    
    relevantPolls.forEach(poll => {
      poll.results.forEach(result => {
        if (!partySupport[result.party]) {
          partySupport[result.party] = { total: 0, count: 0, polls: [] };
        }
        partySupport[result.party].total += result.support;
        partySupport[result.party].count += 1;
        partySupport[result.party].polls.push(poll);
      });
    });

    // Calculate averages
    const aggregatedResults = Object.entries(partySupport).map(([party, data]) => ({
      party,
      averageSupport: Math.round((data.total / data.count) * 10) / 10,
      pollCount: data.count,
      trend: this.calculateTrend(data.polls, party)
    })).sort((a, b) => b.averageSupport - a.averageSupport);

    return {
      aggregation: aggregatedResults,
      metadata: {
        pollsIncluded: relevantPolls.length,
        dateRange: {
          from: relevantPolls.length > 0 ? Math.min(...relevantPolls.map(p => new Date(p.date).getTime())) : null,
          to: relevantPolls.length > 0 ? Math.max(...relevantPolls.map(p => new Date(p.date).getTime())) : null
        },
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private calculateTrend(polls: Poll[], party: string): 'up' | 'down' | 'stable' {
    if (polls.length < 2) return 'stable';
    
    const sortedPolls = polls.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recent = sortedPolls.slice(-3);
    const older = sortedPolls.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, poll) => {
      const result = poll.results.find(r => r.party === party);
      return sum + (result?.support || 0);
    }, 0) / recent.length;
    
    const olderAvg = older.reduce((sum, poll) => {
      const result = poll.results.find(r => r.party === party);
      return sum + (result?.support || 0);
    }, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 1) return 'up';
    if (difference < -1) return 'down';
    return 'stable';
  }

  getRelatedRepositories(): any {
    return {
      categories: [
        'Electoral Data',
        'Polling Data',
        'Election Results',
        'Candidate Information',
        'Political Party Data',
        'Constituency Information'
      ],
      repositories: [
        'https://github.com/elections-canada/election-data',
        'https://github.com/canadian-polling/poll-aggregator',
        'https://github.com/political-data/canada-elections',
        'https://github.com/open-elections/canada'
      ]
    };
  }
}
