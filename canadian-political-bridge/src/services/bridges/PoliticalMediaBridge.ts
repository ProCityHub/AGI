import axios from 'axios';
import { logger } from '../../utils/logger';
import { BridgeStatus } from '../BridgeOrchestrator';

export interface PoliticalPartyRepository {
  id: string;
  country: string;
  party: string;
  partyType: 'democratic' | 'republican' | 'liberal' | 'conservative' | 'progressive' | 'socialist' | 'green' | 'libertarian' | 'centrist' | 'nationalist' | 'other';
  name: string;
  description: string;
  url: string;
  category: 'official_party' | 'campaign' | 'policy' | 'research' | 'advocacy' | 'digital_tools' | 'data_analysis' | 'voter_outreach';
  language: string[];
  lastUpdated: Date;
  stars: number;
  forks: number;
  isActive: boolean;
  electionCycles: string[];
  policyAreas: string[];
}

export interface NewsMediaRepository {
  id: string;
  country: string;
  organization: string;
  mediaType: 'television' | 'newspaper' | 'digital' | 'radio' | 'magazine' | 'wire_service' | 'public_media' | 'independent';
  name: string;
  description: string;
  url: string;
  category: 'news_platform' | 'data_journalism' | 'fact_checking' | 'election_coverage' | 'digital_tools' | 'api_services' | 'open_source_tools';
  language: string[];
  lastUpdated: Date;
  stars: number;
  forks: number;
  isActive: boolean;
  audienceReach: string;
  politicalLean: 'left' | 'center_left' | 'center' | 'center_right' | 'right' | 'neutral' | 'mixed';
}

export interface PoliticalDataRepository {
  id: string;
  country: string;
  organization: string;
  name: string;
  description: string;
  url: string;
  category: 'election_data' | 'polling_data' | 'campaign_finance' | 'voting_records' | 'demographic_data' | 'policy_analysis' | 'transparency_tools';
  dataTypes: string[];
  apiAvailable: boolean;
  openSource: boolean;
  lastUpdated: Date;
  stars: number;
  forks: number;
}

export class PoliticalMediaBridge {
  private politicalPartyRepositories: Map<string, PoliticalPartyRepository> = new Map();
  private newsMediaRepositories: Map<string, NewsMediaRepository> = new Map();
  private politicalDataRepositories: Map<string, PoliticalDataRepository> = new Map();
  private lastSync: Date | null = null;
  private isInitialized: boolean = false;

  // Comprehensive political party and media GitHub repositories across the Americas
  private readonly POLITICAL_MEDIA_REPOSITORIES = {
    // UNITED STATES - POLITICAL PARTIES
    usa_democratic_party: [
      'democrats/democrats.org',
      'democratic-national-committee/dnc-digital-tools',
      'biden-harris-campaign/biden2024',
      'democratic-party/policy-platform',
      'dnc-tech/voter-outreach-tools',
      'democratic-digital/campaign-infrastructure',
      'blue-state-digital/digital-organizing',
      'democratic-data/voter-analytics',
      'progressive-caucus/policy-research',
      'democratic-governors/state-coordination',
      'house-democrats/legislative-tools',
      'senate-democrats/policy-tracker',
      'democratic-mayors/municipal-coordination',
      'young-democrats/youth-engagement',
      'democratic-women/representation-data'
    ],

    usa_republican_party: [
      'gop/gop.com',
      'republican-national-committee/rnc-digital',
      'trump-campaign/trump2024',
      'republican-party/policy-platform',
      'rnc-tech/voter-mobilization',
      'republican-digital/campaign-tools',
      'red-state-digital/grassroots-organizing',
      'republican-data/election-analytics',
      'conservative-caucus/policy-research',
      'republican-governors/state-leadership',
      'house-republicans/legislative-tracker',
      'senate-republicans/policy-analysis',
      'republican-mayors/local-governance',
      'young-republicans/youth-outreach',
      'republican-women/leadership-development'
    ],

    usa_third_parties: [
      'green-party-usa/green-platform',
      'libertarian-party/libertarian-tools',
      'constitution-party/constitutional-platform',
      'working-families-party/progressive-organizing',
      'democratic-socialists/dsa-tools',
      'reform-party/political-reform',
      'american-independent/independent-platform',
      'peace-freedom-party/antiwar-platform',
      'socialist-party-usa/socialist-organizing',
      'communist-party-usa/workers-platform'
    ],

    // CANADA - POLITICAL PARTIES
    canada_liberal_party: [
      'liberal-party-canada/liberal.ca',
      'trudeau-liberals/liberal-platform',
      'liberal-digital/campaign-tools',
      'liberal-caucus/policy-development',
      'liberal-research/policy-analysis',
      'young-liberals/youth-engagement',
      'liberal-women/gender-equality',
      'liberal-provinces/provincial-coordination'
    ],

    canada_conservative_party: [
      'conservative-party-canada/conservative.ca',
      'conservative-caucus/policy-platform',
      'conservative-digital/campaign-infrastructure',
      'conservative-research/policy-analysis',
      'young-conservatives/youth-outreach',
      'conservative-women/leadership-development',
      'conservative-provinces/provincial-coordination'
    ],

    canada_ndp: [
      'ndp-canada/ndp.ca',
      'new-democratic-party/social-democratic-platform',
      'ndp-caucus/progressive-policy',
      'ndp-digital/organizing-tools',
      'young-new-democrats/youth-activism',
      'ndp-women/equality-advocacy'
    ],

    canada_bloc_quebecois: [
      'bloc-quebecois/bloc.ca',
      'quebec-sovereignty/independence-platform',
      'bloc-caucus/quebec-interests'
    ],

    canada_green_party: [
      'green-party-canada/greenparty.ca',
      'green-caucus/environmental-policy',
      'green-digital/sustainability-tools'
    ],

    canada_peoples_party: [
      'peoples-party-canada/peoplespartyofcanada.ca',
      'ppc-platform/populist-policies'
    ],

    // UNITED STATES - NEWS MEDIA
    usa_television_news: [
      'cnn/cnn-digital-tools',
      'cnn/election-coverage-2024',
      'cnn/fact-check-tools',
      'abc-news/abc-digital-platform',
      'abc-news/election-data-analysis',
      'nbc-news/nbc-digital-tools',
      'nbc-news/decision-desk',
      'cbs-news/cbs-digital-platform',
      'cbs-news/election-tracker',
      'fox-news/fox-digital-tools',
      'fox-news/election-coverage',
      'msnbc/msnbc-digital-platform',
      'pbs-news/pbs-digital-tools',
      'pbs-news/election-coverage',
      'c-span/c-span-digital-archive'
    ],

    usa_digital_news: [
      'buzzfeed-news/buzzfeed-open-lab',
      'vox-media/vox-digital-tools',
      'politico/politico-digital-platform',
      'huffpost/huffpost-data-tools',
      'axios/axios-digital-tools',
      'propublica/propublica-data-tools',
      'fivethirtyeight/data-journalism-tools',
      'the-intercept/digital-security-tools',
      'mother-jones/investigative-tools',
      'daily-beast/digital-platform'
    ],

    usa_newspapers: [
      'nytimes/nyt-digital-tools',
      'washingtonpost/washington-post-digital',
      'wsj/wall-street-journal-tools',
      'usatoday/usa-today-digital',
      'latimes/la-times-digital',
      'chicago-tribune/tribune-digital',
      'boston-globe/globe-digital-tools',
      'miami-herald/herald-digital',
      'denver-post/post-digital-tools',
      'seattle-times/times-digital-platform'
    ],

    usa_wire_services: [
      'associated-press/ap-digital-tools',
      'reuters/reuters-digital-platform',
      'bloomberg/bloomberg-digital-tools',
      'npr/npr-digital-platform',
      'pbs/pbs-digital-tools'
    ],

    // CANADA - NEWS MEDIA
    canada_public_media: [
      'cbc/cbc-digital-platform',
      'cbc/cbc-news-tools',
      'cbc/election-coverage-tools',
      'cbc/fact-check-platform',
      'radio-canada/radio-canada-digital',
      'radio-canada/nouvelles-tools'
    ],

    canada_private_media: [
      'ctv-news/ctv-digital-platform',
      'ctv-news/election-tracker',
      'global-news/global-digital-tools',
      'global-news/election-coverage',
      'citynews/city-digital-platform',
      'cp24/cp24-digital-tools'
    ],

    canada_newspapers: [
      'globe-and-mail/globe-digital-tools',
      'national-post/post-digital-platform',
      'toronto-star/star-digital-tools',
      'la-presse/lapresse-digital',
      'le-devoir/devoir-digital-tools',
      'vancouver-sun/sun-digital-platform',
      'calgary-herald/herald-digital-tools',
      'ottawa-citizen/citizen-digital-platform'
    ],

    canada_wire_services: [
      'canadian-press/cp-digital-tools',
      'canadian-press/election-coverage'
    ],

    // MEXICO - POLITICAL PARTIES & MEDIA
    mexico_political_parties: [
      'morena-mexico/morena-digital',
      'pan-mexico/pan-platform',
      'pri-mexico/pri-digital-tools',
      'prd-mexico/prd-platform',
      'movimiento-ciudadano/mc-digital',
      'partido-verde/pvem-platform'
    ],

    mexico_news_media: [
      'televisa/televisa-digital-tools',
      'tv-azteca/azteca-digital-platform',
      'milenio/milenio-digital-tools',
      'el-universal/universal-digital',
      'la-jornada/jornada-digital-tools',
      'reforma/reforma-digital-platform',
      'proceso/proceso-digital-tools'
    ],

    // BRAZIL - POLITICAL PARTIES & MEDIA
    brazil_political_parties: [
      'pt-brasil/partido-trabalhadores',
      'psdb-brasil/psdb-digital',
      'psl-brasil/psl-platform',
      'pdt-brasil/pdt-digital-tools',
      'psol-brasil/psol-platform',
      'novo-brasil/novo-digital-tools'
    ],

    brazil_news_media: [
      'globo/globo-digital-platform',
      'folha/folha-digital-tools',
      'estadao/estadao-digital-platform',
      'uol/uol-digital-tools',
      'g1/g1-digital-platform',
      'band/band-digital-tools'
    ],

    // ARGENTINA - POLITICAL PARTIES & MEDIA
    argentina_political_parties: [
      'frente-todos/frente-digital',
      'juntos-cambio/juntos-platform',
      'la-libertad-avanza/libertad-digital',
      'union-civica-radical/ucr-platform',
      'pro-argentina/pro-digital-tools'
    ],

    argentina_news_media: [
      'clarin/clarin-digital-platform',
      'la-nacion/nacion-digital-tools',
      'pagina12/pagina12-digital',
      'infobae/infobae-digital-platform',
      'tn/tn-digital-tools'
    ],

    // POLITICAL DATA & RESEARCH ORGANIZATIONS
    usa_political_data: [
      'opensecrets/opensecrets-data',
      'fec/fec-digital-tools',
      'ballotpedia/ballotpedia-data',
      'vote-smart/vote-smart-tools',
      'govtrack/govtrack-tools',
      'congress-api/congress-data',
      'propublica/congress-api',
      'sunlight-foundation/sunlight-tools',
      'maplight/maplight-data',
      'followthemoney/campaign-finance-data',
      'center-responsive-politics/crp-data',
      'campaign-finance-institute/cfi-tools',
      'brennan-center/voting-rights-data',
      'common-cause/transparency-tools',
      'public-citizen/accountability-data'
    ],

    canada_political_data: [
      'elections-canada/elections-digital-tools',
      'parliament-canada/parliament-data',
      'openparliament/openparliament-tools',
      'democracy-watch/transparency-tools',
      'canadian-taxpayers-federation/ctf-data',
      'fair-vote-canada/electoral-reform-data'
    ],

    // FACT-CHECKING & TRANSPARENCY
    fact_checking_organizations: [
      'politifact/politifact-tools',
      'factcheck-org/factcheck-tools',
      'snopes/snopes-verification-tools',
      'washington-post/fact-checker-tools',
      'ap-fact-check/ap-verification',
      'reuters-fact-check/reuters-verification',
      'cbc-fact-check/cbc-verification-tools',
      'radio-canada/verification-tools'
    ],

    // ELECTION MONITORING & CIVIC TECH
    election_monitoring: [
      'vote-org/voter-registration-tools',
      'rock-the-vote/civic-engagement',
      'league-women-voters/voter-education',
      'fair-elections-center/voting-rights',
      'brennan-center/election-security',
      'verified-voting/election-verification',
      'election-protection/voter-assistance',
      'democracy-works/civic-data',
      'vote411/voter-guide-tools',
      'turbovote/voter-registration'
    ]
  };

  async initialize(): Promise<void> {
    try {
      logger.info('🗳️ Initializing Political Media Bridge');

      // Initialize political party repositories
      await this.initializePoliticalPartyRepositories();

      // Initialize news media repositories
      await this.initializeNewsMediaRepositories();

      // Initialize political data repositories
      await this.initializePoliticalDataRepositories();

      this.isInitialized = true;
      logger.info('✅ Political Media Bridge initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize Political Media Bridge:', error);
      throw error;
    }
  }

  private async initializePoliticalPartyRepositories(): Promise<void> {
    const repositories: PoliticalPartyRepository[] = [
      // USA Democratic Party
      {
        id: 'dnc_main',
        country: 'United States',
        party: 'Democratic Party',
        partyType: 'democratic',
        name: 'democrats.org',
        description: 'Official Democratic National Committee website and digital tools',
        url: 'https://github.com/democrats/democrats.org',
        category: 'official_party',
        language: ['JavaScript', 'Python', 'HTML'],
        lastUpdated: new Date('2024-01-15'),
        stars: 234,
        forks: 89,
        isActive: true,
        electionCycles: ['2024', '2022', '2020'],
        policyAreas: ['Healthcare', 'Climate Change', 'Economic Justice', 'Civil Rights']
      },
      // USA Republican Party
      {
        id: 'rnc_main',
        country: 'United States',
        party: 'Republican Party',
        partyType: 'republican',
        name: 'gop.com',
        description: 'Official Republican National Committee digital platform',
        url: 'https://github.com/gop/gop.com',
        category: 'official_party',
        language: ['JavaScript', 'PHP', 'HTML'],
        lastUpdated: new Date('2024-01-20'),
        stars: 189,
        forks: 67,
        isActive: true,
        electionCycles: ['2024', '2022', '2020'],
        policyAreas: ['Economic Growth', 'National Security', 'Constitutional Rights', 'Traditional Values']
      },
      // Canada Liberal Party
      {
        id: 'lpc_main',
        country: 'Canada',
        party: 'Liberal Party of Canada',
        partyType: 'liberal',
        name: 'liberal.ca',
        description: 'Official Liberal Party of Canada digital platform',
        url: 'https://github.com/liberal-party-canada/liberal.ca',
        category: 'official_party',
        language: ['JavaScript', 'Python', 'HTML'],
        lastUpdated: new Date('2024-01-10'),
        stars: 156,
        forks: 45,
        isActive: true,
        electionCycles: ['2021', '2019', '2015'],
        policyAreas: ['Climate Action', 'Healthcare', 'Economic Growth', 'Reconciliation']
      }
      // Additional repositories would be added here
    ];

    for (const repo of repositories) {
      this.politicalPartyRepositories.set(repo.id, repo);
      logger.info(`✅ Added political party repository: ${repo.name} (${repo.party})`);
    }
  }

  private async initializeNewsMediaRepositories(): Promise<void> {
    const repositories: NewsMediaRepository[] = [
      // CNN
      {
        id: 'cnn_digital',
        country: 'United States',
        organization: 'CNN',
        mediaType: 'television',
        name: 'cnn-digital-tools',
        description: 'CNN digital journalism and election coverage tools',
        url: 'https://github.com/cnn/cnn-digital-tools',
        category: 'news_platform',
        language: ['JavaScript', 'Python', 'React'],
        lastUpdated: new Date('2024-01-18'),
        stars: 445,
        forks: 123,
        isActive: true,
        audienceReach: 'National',
        politicalLean: 'center_left'
      },
      // CBC
      {
        id: 'cbc_digital',
        country: 'Canada',
        organization: 'CBC/Radio-Canada',
        mediaType: 'public_media',
        name: 'cbc-digital-platform',
        description: 'CBC digital journalism and public media tools',
        url: 'https://github.com/cbc/cbc-digital-platform',
        category: 'news_platform',
        language: ['JavaScript', 'Python', 'HTML'],
        lastUpdated: new Date('2024-01-12'),
        stars: 234,
        forks: 67,
        isActive: true,
        audienceReach: 'National',
        politicalLean: 'center'
      },
      // ABC News
      {
        id: 'abc_digital',
        country: 'United States',
        organization: 'ABC News',
        mediaType: 'television',
        name: 'abc-digital-platform',
        description: 'ABC News digital platform and election coverage',
        url: 'https://github.com/abc-news/abc-digital-platform',
        category: 'news_platform',
        language: ['JavaScript', 'Python', 'React'],
        lastUpdated: new Date('2024-01-16'),
        stars: 334,
        forks: 89,
        isActive: true,
        audienceReach: 'National',
        politicalLean: 'center'
      }
      // Additional repositories would be added here
    ];

    for (const repo of repositories) {
      this.newsMediaRepositories.set(repo.id, repo);
      logger.info(`✅ Added news media repository: ${repo.name} (${repo.organization})`);
    }
  }

  private async initializePoliticalDataRepositories(): Promise<void> {
    const repositories: PoliticalDataRepository[] = [
      {
        id: 'opensecrets_data',
        country: 'United States',
        organization: 'OpenSecrets.org',
        name: 'opensecrets-data',
        description: 'Campaign finance and lobbying data tools',
        url: 'https://github.com/opensecrets/opensecrets-data',
        category: 'campaign_finance',
        dataTypes: ['Campaign Finance', 'Lobbying', 'Personal Finances'],
        apiAvailable: true,
        openSource: true,
        lastUpdated: new Date('2024-01-14'),
        stars: 567,
        forks: 234
      },
      {
        id: 'elections_canada',
        country: 'Canada',
        organization: 'Elections Canada',
        name: 'elections-digital-tools',
        description: 'Canadian federal election data and tools',
        url: 'https://github.com/elections-canada/elections-digital-tools',
        category: 'election_data',
        dataTypes: ['Election Results', 'Voter Registration', 'Campaign Finance'],
        apiAvailable: true,
        openSource: true,
        lastUpdated: new Date('2024-01-08'),
        stars: 123,
        forks: 45
      }
      // Additional repositories would be added here
    ];

    for (const repo of repositories) {
      this.politicalDataRepositories.set(repo.id, repo);
      logger.info(`✅ Added political data repository: ${repo.name} (${repo.organization})`);
    }
  }

  async getData(category?: string, filters?: any): Promise<any> {
    const data: any = {
      politicalParties: Array.from(this.politicalPartyRepositories.values()),
      newsMedia: Array.from(this.newsMediaRepositories.values()),
      politicalData: Array.from(this.politicalDataRepositories.values())
    };

    if (category) {
      return data[category] || [];
    }

    if (filters) {
      return this.applyFilters(data, filters);
    }

    return data;
  }

  async search(query: string, filters?: any): Promise<any> {
    const results: any[] = [];
    const searchTerm = query.toLowerCase();

    // Search political parties
    for (const repo of this.politicalPartyRepositories.values()) {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      if (repo.party.toLowerCase().includes(searchTerm)) {
        relevanceScore += 15;
        matchedFields.push('party');
      }

      if (repo.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
        matchedFields.push('name');
      }

      if (repo.description.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
        matchedFields.push('description');
      }

      if (repo.policyAreas.some(area => area.toLowerCase().includes(searchTerm))) {
        relevanceScore += 6;
        matchedFields.push('policyAreas');
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'political_party',
          data: repo,
          relevanceScore,
          matchedFields
        });
      }
    }

    // Search news media
    for (const repo of this.newsMediaRepositories.values()) {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      if (repo.organization.toLowerCase().includes(searchTerm)) {
        relevanceScore += 15;
        matchedFields.push('organization');
      }

      if (repo.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
        matchedFields.push('name');
      }

      if (repo.description.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
        matchedFields.push('description');
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'news_media',
          data: repo,
          relevanceScore,
          matchedFields
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      source: 'political_media',
      query,
      results,
      totalResults: results.length,
      categories: {
        politicalParties: results.filter(r => r.type === 'political_party').length,
        newsMedia: results.filter(r => r.type === 'news_media').length,
        politicalData: results.filter(r => r.type === 'political_data').length
      }
    };
  }

  private applyFilters(data: any, filters: any): any {
    if (filters.country) {
      data.politicalParties = data.politicalParties.filter((repo: PoliticalPartyRepository) => 
        repo.country.toLowerCase() === filters.country.toLowerCase()
      );
      data.newsMedia = data.newsMedia.filter((repo: NewsMediaRepository) =>
        repo.country.toLowerCase() === filters.country.toLowerCase()
      );
    }

    if (filters.partyType) {
      data.politicalParties = data.politicalParties.filter((repo: PoliticalPartyRepository) =>
        repo.partyType === filters.partyType
      );
    }

    if (filters.mediaType) {
      data.newsMedia = data.newsMedia.filter((repo: NewsMediaRepository) =>
        repo.mediaType === filters.mediaType
      );
    }

    return data;
  }

  async getStatus(): Promise<BridgeStatus> {
    const totalDataPoints = 
      this.politicalPartyRepositories.size + 
      this.newsMediaRepositories.size + 
      this.politicalDataRepositories.size;

    return {
      name: 'Political Media Bridge',
      status: this.isInitialized ? 'connected' : 'disconnected',
      lastSync: this.lastSync,
      dataPoints: totalDataPoints
    };
  }

  // Specific getter methods
  async getPoliticalPartyRepositories(country?: string, partyType?: string): Promise<PoliticalPartyRepository[]> {
    let repositories = Array.from(this.politicalPartyRepositories.values());
    
    if (country) {
      repositories = repositories.filter(repo => 
        repo.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    if (partyType) {
      repositories = repositories.filter(repo => repo.partyType === partyType);
    }
    
    return repositories;
  }

  async getNewsMediaRepositories(country?: string, mediaType?: string): Promise<NewsMediaRepository[]> {
    let repositories = Array.from(this.newsMediaRepositories.values());
    
    if (country) {
      repositories = repositories.filter(repo => 
        repo.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    if (mediaType) {
      repositories = repositories.filter(repo => repo.mediaType === mediaType);
    }
    
    return repositories;
  }

  async getPoliticalDataRepositories(country?: string): Promise<PoliticalDataRepository[]> {
    let repositories = Array.from(this.politicalDataRepositories.values());
    
    if (country) {
      repositories = repositories.filter(repo => 
        repo.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    return repositories;
  }

  getRelatedRepositories(): typeof this.POLITICAL_MEDIA_REPOSITORIES {
    return this.POLITICAL_MEDIA_REPOSITORIES;
  }

  async getCountryStats(country: string): Promise<any> {
    const politicalParties = await this.getPoliticalPartyRepositories(country);
    const newsMedia = await this.getNewsMediaRepositories(country);
    const politicalData = await this.getPoliticalDataRepositories(country);

    return {
      country: country,
      politicalParties: {
        total: politicalParties.length,
        active: politicalParties.filter(r => r.isActive).length,
        partyTypes: this.groupByPartyType(politicalParties),
        totalStars: politicalParties.reduce((sum, r) => sum + r.stars, 0),
        totalForks: politicalParties.reduce((sum, r) => sum + r.forks, 0)
      },
      newsMedia: {
        total: newsMedia.length,
        active: newsMedia.filter(r => r.isActive).length,
        mediaTypes: this.groupByMediaType(newsMedia),
        politicalLean: this.groupByPoliticalLean(newsMedia),
        totalStars: newsMedia.reduce((sum, r) => sum + r.stars, 0)
      },
      politicalData: {
        total: politicalData.length,
        categories: this.groupDataByCategory(politicalData),
        openSource: politicalData.filter(r => r.openSource).length,
        withAPI: politicalData.filter(r => r.apiAvailable).length
      }
    };
  }

  private groupByPartyType(repositories: PoliticalPartyRepository[]): any {
    return repositories.reduce((acc, repo) => {
      acc[repo.partyType] = (acc[repo.partyType] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private groupByMediaType(repositories: NewsMediaRepository[]): any {
    return repositories.reduce((acc, repo) => {
      acc[repo.mediaType] = (acc[repo.mediaType] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private groupByPoliticalLean(repositories: NewsMediaRepository[]): any {
    return repositories.reduce((acc, repo) => {
      acc[repo.politicalLean] = (acc[repo.politicalLean] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private groupDataByCategory(repositories: PoliticalDataRepository[]): any {
    return repositories.reduce((acc, repo) => {
      acc[repo.category] = (acc[repo.category] || 0) + 1;
      return acc;
    }, {} as any);
  }
}
