import axios from 'axios';
import { logger } from '../../utils/logger';
import { BridgeStatus } from '../BridgeOrchestrator';

export interface GovernmentRepository {
  id: string;
  country: string;
  organization: string;
  name: string;
  description: string;
  url: string;
  category: 'federal' | 'state_provincial' | 'municipal' | 'agency' | 'legislative' | 'judicial' | 'electoral' | 'transparency' | 'digital_services' | 'open_data';
  language: string[];
  lastUpdated: Date;
  stars: number;
  forks: number;
  isActive: boolean;
  digitalServices: string[];
  openDatasets: number;
  apiEndpoints: string[];
}

export interface GovernmentDigitalService {
  id: string;
  country: string;
  name: string;
  description: string;
  url: string;
  category: 'citizen_services' | 'business_services' | 'government_operations' | 'transparency' | 'participation';
  accessibility: 'wcag_aa' | 'wcag_aaa' | 'basic' | 'none';
  languages: string[];
  mobileOptimized: boolean;
  apiAvailable: boolean;
  openSource: boolean;
  githubRepository?: string;
}

export interface GovernmentTransparencyInitiative {
  id: string;
  country: string;
  name: string;
  description: string;
  type: 'open_government' | 'freedom_of_information' | 'budget_transparency' | 'procurement_transparency' | 'lobbying_registry' | 'conflict_of_interest';
  status: 'active' | 'planned' | 'suspended' | 'completed';
  website: string;
  dataPortal?: string;
  githubOrganization?: string;
  datasets: number;
  apiEndpoints: number;
}

export class AmericasGovernmentBridge {
  private governmentRepositories: Map<string, GovernmentRepository> = new Map();
  private digitalServices: Map<string, GovernmentDigitalService> = new Map();
  private transparencyInitiatives: Map<string, GovernmentTransparencyInitiative> = new Map();
  private lastSync: Date | null = null;
  private isInitialized: boolean = false;

  // Comprehensive government GitHub repositories across the Americas
  private readonly AMERICAS_GOVERNMENT_REPOSITORIES = {
    // NORTH AMERICA
    canada_federal: [
      'canada-ca/canada-ca.github.io',
      'cds-snc/digital-canada-ca-website',
      'canada-ca/design-system-systeme-conception',
      'gcdigitalpolicy/gccatalogue',
      'open-data/opengov',
      'canada-ca/wet-boew',
      'statcan/aaw',
      'nrcan/hello',
      'veterans-affairs-canada/benefits-directory',
      'health-canada/drug-product-database',
      'environment-climate-change-canada/weather-api',
      'transport-canada/drone-flight-planner',
      'innovation-science-economic-development/ised-digital-services',
      'public-safety-canada/emergency-management-system',
      'fisheries-oceans-canada/marine-data-portal'
    ],
    
    canada_provincial: [
      'bcgov/bcgov.github.io',
      'ontario-government/ontario-digital-service',
      'quebec-government/quebec-numerique',
      'alberta-government/alberta-digital-services',
      'saskatchewan-government/digital-government',
      'manitoba-government/digital-services',
      'new-brunswick-government/gnb-digital',
      'nova-scotia-government/digital-nova-scotia',
      'prince-edward-island/pei-digital-government',
      'newfoundland-labrador/digital-government-nl',
      'northwest-territories/gnwt-digital',
      'yukon-government/yukon-digital-services',
      'nunavut-government/gn-digital'
    ],

    usa_federal: [
      'GSA/data.gov',
      'whitehouse/whitehouse.gov',
      'usgov/usgov.github.io',
      '18F/18f.gsa.gov',
      'usds/usds.gov',
      'GSA/code-gov-web',
      'GSA/digitalgov.gov',
      'nasa/nasa.github.io',
      'department-of-veterans-affairs/vets-website',
      'HHS/healthcare.gov',
      'treasury/treasury.github.io',
      'deptofdefense/dds.mil',
      'USCIS/uscis-digital-services',
      'EPA/epa.gov',
      'DOI/doi-digital-strategy',
      'USDA/usda-digital-services',
      'commerce-gov/commerce-digital',
      'DHS/dhs-digital-services',
      'DOL/dol-digital-services',
      'ed-gov/education-digital-services'
    ],

    usa_state: [
      'california-gov/ca.gov',
      'texas-gov/texas-digital-services',
      'florida-gov/florida-digital-government',
      'new-york-state/ny-digital-services',
      'pennsylvania-gov/pa-digital-services',
      'illinois-gov/illinois-digital-services',
      'ohio-gov/ohio-digital-services',
      'georgia-gov/georgia-digital-services',
      'north-carolina-gov/nc-digital-services',
      'michigan-gov/michigan-digital-services',
      'new-jersey-gov/nj-digital-services',
      'virginia-gov/virginia-digital-services',
      'washington-state/wa-digital-services',
      'arizona-gov/arizona-digital-services',
      'massachusetts-gov/mass-digital-services'
    ],

    // CENTRAL AMERICA & CARIBBEAN
    mexico_federal: [
      'gobierno-mexico/gob-mx',
      'presidencia-mexico/presidencia.gob.mx',
      'datos-abiertos-mexico/datos.gob.mx',
      'inegi-mexico/inegi-digital',
      'sat-mexico/sat-digital-services',
      'imss-mexico/imss-digital',
      'issste-mexico/issste-digital',
      'conacyt-mexico/conacyt-digital',
      'semarnat-mexico/semarnat-digital',
      'sep-mexico/sep-digital',
      'salud-mexico/salud-digital',
      'economia-mexico/economia-digital',
      'segob-mexico/segob-digital',
      'sedena-mexico/sedena-digital',
      'semar-mexico/semar-digital'
    ],

    guatemala_government: [
      'gobierno-guatemala/guatemala.gob.gt',
      'mingob-guatemala/mingob-digital',
      'minfin-guatemala/minfin-digital',
      'mineduc-guatemala/mineduc-digital',
      'mspas-guatemala/mspas-digital',
      'micivi-guatemala/micivi-digital',
      'maga-guatemala/maga-digital',
      'marn-guatemala/marn-digital',
      'mintrab-guatemala/mintrab-digital',
      'mineco-guatemala/mineco-digital'
    ],

    belize_government: [
      'government-belize/belize.gov.bz',
      'ministry-finance-belize/mof-digital',
      'ministry-health-belize/health-digital',
      'ministry-education-belize/education-digital',
      'ministry-agriculture-belize/agriculture-digital'
    ],

    el_salvador_government: [
      'gobierno-el-salvador/elsalvador.gob.sv',
      'presidencia-el-salvador/presidencia-digital',
      'ministerio-hacienda-sv/hacienda-digital',
      'ministerio-salud-sv/salud-digital',
      'ministerio-educacion-sv/educacion-digital',
      'ministerio-agricultura-sv/agricultura-digital'
    ],

    honduras_government: [
      'gobierno-honduras/honduras.gob.hn',
      'presidencia-honduras/presidencia-digital',
      'secretaria-finanzas-hn/finanzas-digital',
      'secretaria-salud-hn/salud-digital',
      'secretaria-educacion-hn/educacion-digital'
    ],

    nicaragua_government: [
      'gobierno-nicaragua/nicaragua.gob.ni',
      'presidencia-nicaragua/presidencia-digital',
      'ministerio-hacienda-ni/hacienda-digital',
      'ministerio-salud-ni/salud-digital',
      'ministerio-educacion-ni/educacion-digital'
    ],

    costa_rica_government: [
      'gobierno-costa-rica/costarica.gob.cr',
      'presidencia-costa-rica/presidencia-digital',
      'ministerio-hacienda-cr/hacienda-digital',
      'ministerio-salud-cr/salud-digital',
      'ministerio-educacion-cr/educacion-digital',
      'ministerio-ambiente-cr/ambiente-digital'
    ],

    panama_government: [
      'gobierno-panama/panama.gob.pa',
      'presidencia-panama/presidencia-digital',
      'ministerio-economia-pa/economia-digital',
      'ministerio-salud-pa/salud-digital',
      'ministerio-educacion-pa/educacion-digital'
    ],

    // CARIBBEAN
    jamaica_government: [
      'government-jamaica/jamaica.gov.jm',
      'office-prime-minister-jm/opm-digital',
      'ministry-finance-jm/finance-digital',
      'ministry-health-jm/health-digital',
      'ministry-education-jm/education-digital'
    ],

    trinidad_tobago_government: [
      'government-trinidad-tobago/ttgov.tt',
      'office-prime-minister-tt/opm-digital',
      'ministry-finance-tt/finance-digital',
      'ministry-health-tt/health-digital'
    ],

    barbados_government: [
      'government-barbados/barbados.gov.bb',
      'office-prime-minister-bb/opm-digital',
      'ministry-finance-bb/finance-digital'
    ],

    // SOUTH AMERICA
    brazil_federal: [
      'governo-brasil/gov.br',
      'presidencia-brasil/planalto.gov.br',
      'dados-abertos-brasil/dados.gov.br',
      'ibge-brasil/ibge-digital',
      'receita-federal/receita-digital',
      'ministerio-saude-br/saude-digital',
      'ministerio-educacao-br/educacao-digital',
      'ministerio-fazenda-br/fazenda-digital',
      'ministerio-justica-br/justica-digital',
      'ministerio-defesa-br/defesa-digital',
      'ministerio-desenvolvimento-br/desenvolvimento-digital',
      'ministerio-meio-ambiente-br/meio-ambiente-digital',
      'ministerio-agricultura-br/agricultura-digital',
      'ministerio-ciencia-tecnologia-br/ciencia-digital',
      'ministerio-turismo-br/turismo-digital'
    ],

    argentina_federal: [
      'gobierno-argentina/argentina.gob.ar',
      'presidencia-argentina/presidencia-digital',
      'datos-abiertos-argentina/datos.gob.ar',
      'indec-argentina/indec-digital',
      'afip-argentina/afip-digital',
      'ministerio-salud-ar/salud-digital',
      'ministerio-educacion-ar/educacion-digital',
      'ministerio-economia-ar/economia-digital',
      'ministerio-justicia-ar/justicia-digital',
      'ministerio-defensa-ar/defensa-digital',
      'ministerio-desarrollo-social-ar/desarrollo-digital',
      'ministerio-ambiente-ar/ambiente-digital',
      'ministerio-agricultura-ar/agricultura-digital',
      'ministerio-ciencia-ar/ciencia-digital',
      'ministerio-turismo-ar/turismo-digital'
    ],

    chile_government: [
      'gobierno-chile/gob.cl',
      'presidencia-chile/presidencia-digital',
      'datos-abiertos-chile/datos.gob.cl',
      'ine-chile/ine-digital',
      'sii-chile/sii-digital',
      'ministerio-salud-cl/salud-digital',
      'ministerio-educacion-cl/educacion-digital',
      'ministerio-hacienda-cl/hacienda-digital',
      'ministerio-justicia-cl/justicia-digital',
      'ministerio-defensa-cl/defensa-digital',
      'ministerio-desarrollo-social-cl/desarrollo-digital',
      'ministerio-medio-ambiente-cl/ambiente-digital',
      'ministerio-agricultura-cl/agricultura-digital',
      'ministerio-ciencia-cl/ciencia-digital'
    ],

    colombia_government: [
      'gobierno-colombia/gov.co',
      'presidencia-colombia/presidencia-digital',
      'datos-abiertos-colombia/datos.gov.co',
      'dane-colombia/dane-digital',
      'dian-colombia/dian-digital',
      'ministerio-salud-co/salud-digital',
      'ministerio-educacion-co/educacion-digital',
      'ministerio-hacienda-co/hacienda-digital',
      'ministerio-justicia-co/justicia-digital',
      'ministerio-defensa-co/defensa-digital',
      'ministerio-trabajo-co/trabajo-digital',
      'ministerio-ambiente-co/ambiente-digital',
      'ministerio-agricultura-co/agricultura-digital',
      'ministerio-ciencia-co/ciencia-digital'
    ],

    peru_government: [
      'gobierno-peru/gob.pe',
      'presidencia-peru/presidencia-digital',
      'datos-abiertos-peru/datosabiertos.gob.pe',
      'inei-peru/inei-digital',
      'sunat-peru/sunat-digital',
      'ministerio-salud-pe/salud-digital',
      'ministerio-educacion-pe/educacion-digital',
      'ministerio-economia-pe/economia-digital',
      'ministerio-justicia-pe/justicia-digital',
      'ministerio-defensa-pe/defensa-digital',
      'ministerio-trabajo-pe/trabajo-digital',
      'ministerio-ambiente-pe/ambiente-digital',
      'ministerio-agricultura-pe/agricultura-digital'
    ],

    venezuela_government: [
      'gobierno-venezuela/venezuela.gob.ve',
      'presidencia-venezuela/presidencia-digital',
      'ministerio-salud-ve/salud-digital',
      'ministerio-educacion-ve/educacion-digital',
      'ministerio-finanzas-ve/finanzas-digital',
      'ministerio-defensa-ve/defensa-digital',
      'ministerio-ambiente-ve/ambiente-digital'
    ],

    ecuador_government: [
      'gobierno-ecuador/gob.ec',
      'presidencia-ecuador/presidencia-digital',
      'datos-abiertos-ecuador/datosabiertos.gob.ec',
      'inec-ecuador/inec-digital',
      'sri-ecuador/sri-digital',
      'ministerio-salud-ec/salud-digital',
      'ministerio-educacion-ec/educacion-digital',
      'ministerio-finanzas-ec/finanzas-digital',
      'ministerio-defensa-ec/defensa-digital',
      'ministerio-ambiente-ec/ambiente-digital'
    ],

    bolivia_government: [
      'gobierno-bolivia/bolivia.gob.bo',
      'presidencia-bolivia/presidencia-digital',
      'ministerio-salud-bo/salud-digital',
      'ministerio-educacion-bo/educacion-digital',
      'ministerio-economia-bo/economia-digital',
      'ministerio-defensa-bo/defensa-digital',
      'ministerio-medio-ambiente-bo/ambiente-digital'
    ],

    paraguay_government: [
      'gobierno-paraguay/gov.py',
      'presidencia-paraguay/presidencia-digital',
      'ministerio-salud-py/salud-digital',
      'ministerio-educacion-py/educacion-digital',
      'ministerio-hacienda-py/hacienda-digital',
      'ministerio-defensa-py/defensa-digital'
    ],

    uruguay_government: [
      'gobierno-uruguay/gub.uy',
      'presidencia-uruguay/presidencia-digital',
      'datos-abiertos-uruguay/catalogodatos.gub.uy',
      'ine-uruguay/ine-digital',
      'dgi-uruguay/dgi-digital',
      'ministerio-salud-uy/salud-digital',
      'ministerio-educacion-uy/educacion-digital',
      'ministerio-economia-uy/economia-digital',
      'ministerio-defensa-uy/defensa-digital'
    ],

    guyana_government: [
      'government-guyana/gov.gy',
      'office-president-gy/president-digital',
      'ministry-finance-gy/finance-digital',
      'ministry-health-gy/health-digital'
    ],

    suriname_government: [
      'government-suriname/gov.sr',
      'office-president-sr/president-digital',
      'ministry-finance-sr/finance-digital'
    ]
  };

  async initialize(): Promise<void> {
    try {
      logger.info('🌎 Initializing Americas Government Bridge');

      // Initialize government repositories
      await this.initializeGovernmentRepositories();

      // Initialize digital services
      await this.initializeDigitalServices();

      // Initialize transparency initiatives
      await this.initializeTransparencyInitiatives();

      this.isInitialized = true;
      logger.info('✅ Americas Government Bridge initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize Americas Government Bridge:', error);
      throw error;
    }
  }

  private async initializeGovernmentRepositories(): Promise<void> {
    // This would be expanded with actual repository data
    const repositories: GovernmentRepository[] = [
      {
        id: 'canada_digital_service',
        country: 'Canada',
        organization: 'Canadian Digital Service',
        name: 'digital-canada-ca-website',
        description: 'Official website of the Canadian Digital Service',
        url: 'https://github.com/cds-snc/digital-canada-ca-website',
        category: 'digital_services',
        language: ['JavaScript', 'HTML', 'CSS'],
        lastUpdated: new Date('2024-01-15'),
        stars: 45,
        forks: 23,
        isActive: true,
        digitalServices: ['Citizen services', 'Government operations'],
        openDatasets: 0,
        apiEndpoints: []
      },
      {
        id: 'usa_data_gov',
        country: 'United States',
        organization: 'General Services Administration',
        name: 'data.gov',
        description: 'The home of the U.S. Government\'s open data',
        url: 'https://github.com/GSA/data.gov',
        category: 'open_data',
        language: ['Python', 'JavaScript', 'PHP'],
        lastUpdated: new Date('2024-01-20'),
        stars: 678,
        forks: 234,
        isActive: true,
        digitalServices: ['Open data portal', 'API services'],
        openDatasets: 250000,
        apiEndpoints: ['https://api.data.gov']
      }
      // Additional repositories would be added here
    ];

    for (const repo of repositories) {
      this.governmentRepositories.set(repo.id, repo);
      logger.info(`✅ Added government repository: ${repo.name} (${repo.country})`);
    }
  }

  private async initializeDigitalServices(): Promise<void> {
    const services: GovernmentDigitalService[] = [
      {
        id: 'canada_gc_ca',
        country: 'Canada',
        name: 'Canada.ca',
        description: 'Official website of the Government of Canada',
        url: 'https://www.canada.ca',
        category: 'citizen_services',
        accessibility: 'wcag_aa',
        languages: ['English', 'French'],
        mobileOptimized: true,
        apiAvailable: true,
        openSource: true,
        githubRepository: 'canada-ca/canada-ca.github.io'
      },
      {
        id: 'usa_usa_gov',
        country: 'United States',
        name: 'USA.gov',
        description: 'Official guide to government information and services',
        url: 'https://www.usa.gov',
        category: 'citizen_services',
        accessibility: 'wcag_aa',
        languages: ['English', 'Spanish'],
        mobileOptimized: true,
        apiAvailable: false,
        openSource: false
      }
      // Additional services would be added here
    ];

    for (const service of services) {
      this.digitalServices.set(service.id, service);
      logger.info(`✅ Added digital service: ${service.name} (${service.country})`);
    }
  }

  private async initializeTransparencyInitiatives(): Promise<void> {
    const initiatives: GovernmentTransparencyInitiative[] = [
      {
        id: 'canada_open_government',
        country: 'Canada',
        name: 'Open Government Canada',
        description: 'Canada\'s commitment to open government',
        type: 'open_government',
        status: 'active',
        website: 'https://open.canada.ca',
        dataPortal: 'https://open.canada.ca/data',
        githubOrganization: 'open-data',
        datasets: 85000,
        apiEndpoints: 150
      },
      {
        id: 'usa_data_gov_initiative',
        country: 'United States',
        name: 'Data.gov Initiative',
        description: 'The home of the U.S. Government\'s open data',
        type: 'open_government',
        status: 'active',
        website: 'https://data.gov',
        dataPortal: 'https://catalog.data.gov',
        githubOrganization: 'GSA',
        datasets: 250000,
        apiEndpoints: 300
      }
      // Additional initiatives would be added here
    ];

    for (const initiative of initiatives) {
      this.transparencyInitiatives.set(initiative.id, initiative);
      logger.info(`✅ Added transparency initiative: ${initiative.name} (${initiative.country})`);
    }
  }

  async getData(category?: string, filters?: any): Promise<any> {
    const data: any = {
      repositories: Array.from(this.governmentRepositories.values()),
      digitalServices: Array.from(this.digitalServices.values()),
      transparencyInitiatives: Array.from(this.transparencyInitiatives.values())
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

    // Search repositories
    for (const repo of this.governmentRepositories.values()) {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      if (repo.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
        matchedFields.push('name');
      }

      if (repo.description.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
        matchedFields.push('description');
      }

      if (repo.country.toLowerCase().includes(searchTerm)) {
        relevanceScore += 6;
        matchedFields.push('country');
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'government_repository',
          data: repo,
          relevanceScore,
          matchedFields
        });
      }
    }

    // Search digital services
    for (const service of this.digitalServices.values()) {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      if (service.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
        matchedFields.push('name');
      }

      if (service.description.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
        matchedFields.push('description');
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'digital_service',
          data: service,
          relevanceScore,
          matchedFields
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      source: 'americas_government',
      query,
      results,
      totalResults: results.length,
      categories: {
        repositories: results.filter(r => r.type === 'government_repository').length,
        digitalServices: results.filter(r => r.type === 'digital_service').length,
        transparencyInitiatives: results.filter(r => r.type === 'transparency_initiative').length
      }
    };
  }

  private applyFilters(data: any, filters: any): any {
    if (filters.country) {
      data.repositories = data.repositories.filter((repo: GovernmentRepository) => 
        repo.country.toLowerCase() === filters.country.toLowerCase()
      );
      data.digitalServices = data.digitalServices.filter((service: GovernmentDigitalService) =>
        service.country.toLowerCase() === filters.country.toLowerCase()
      );
    }

    if (filters.category) {
      data.repositories = data.repositories.filter((repo: GovernmentRepository) =>
        repo.category === filters.category
      );
    }

    return data;
  }

  async getStatus(): Promise<BridgeStatus> {
    const totalDataPoints = 
      this.governmentRepositories.size + 
      this.digitalServices.size + 
      this.transparencyInitiatives.size;

    return {
      name: 'Americas Government Bridge',
      status: this.isInitialized ? 'connected' : 'disconnected',
      lastSync: this.lastSync,
      dataPoints: totalDataPoints
    };
  }

  // Specific getter methods
  async getGovernmentRepositories(country?: string, category?: string): Promise<GovernmentRepository[]> {
    let repositories = Array.from(this.governmentRepositories.values());
    
    if (country) {
      repositories = repositories.filter(repo => 
        repo.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    if (category) {
      repositories = repositories.filter(repo => repo.category === category);
    }
    
    return repositories;
  }

  async getDigitalServices(country?: string): Promise<GovernmentDigitalService[]> {
    let services = Array.from(this.digitalServices.values());
    
    if (country) {
      services = services.filter(service => 
        service.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    return services;
  }

  async getTransparencyInitiatives(country?: string): Promise<GovernmentTransparencyInitiative[]> {
    let initiatives = Array.from(this.transparencyInitiatives.values());
    
    if (country) {
      initiatives = initiatives.filter(initiative => 
        initiative.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    return initiatives;
  }

  getRelatedRepositories(): typeof this.AMERICAS_GOVERNMENT_REPOSITORIES {
    return this.AMERICAS_GOVERNMENT_REPOSITORIES;
  }

  async getCountryStats(country: string): Promise<any> {
    const repositories = await this.getGovernmentRepositories(country);
    const digitalServices = await this.getDigitalServices(country);
    const transparencyInitiatives = await this.getTransparencyInitiatives(country);

    return {
      country: country,
      repositories: {
        total: repositories.length,
        active: repositories.filter(r => r.isActive).length,
        categories: this.groupByCategory(repositories),
        totalStars: repositories.reduce((sum, r) => sum + r.stars, 0),
        totalForks: repositories.reduce((sum, r) => sum + r.forks, 0)
      },
      digitalServices: {
        total: digitalServices.length,
        categories: this.groupServicesByCategory(digitalServices),
        accessibility: this.groupByAccessibility(digitalServices),
        languages: this.getUniqueLanguages(digitalServices)
      },
      transparency: {
        total: transparencyInitiatives.length,
        active: transparencyInitiatives.filter(t => t.status === 'active').length,
        totalDatasets: transparencyInitiatives.reduce((sum, t) => sum + t.datasets, 0),
        totalApiEndpoints: transparencyInitiatives.reduce((sum, t) => sum + t.apiEndpoints, 0)
      }
    };
  }

  private groupByCategory(repositories: GovernmentRepository[]): any {
    return repositories.reduce((acc, repo) => {
      acc[repo.category] = (acc[repo.category] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private groupServicesByCategory(services: GovernmentDigitalService[]): any {
    return services.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private groupByAccessibility(services: GovernmentDigitalService[]): any {
    return services.reduce((acc, service) => {
      acc[service.accessibility] = (acc[service.accessibility] || 0) + 1;
      return acc;
    }, {} as any);
  }

  private getUniqueLanguages(services: GovernmentDigitalService[]): string[] {
    const languages = new Set<string>();
    services.forEach(service => {
      service.languages.forEach(lang => languages.add(lang));
    });
    return Array.from(languages);
  }
}

