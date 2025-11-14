import { logger } from '../../utils/logger';
import { cacheManager } from '../../utils/CacheManager';

export interface Province {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  capital: string;
  premier: string;
  population: number;
  area: number; // km²
  gdp: number; // CAD billions
  website: string;
  githubOrg?: string;
  isActive: boolean;
}

export interface ProvincialDepartment {
  id: string;
  name: string;
  province: string;
  minister: string;
  mandate: string;
  budget: number;
  employees: number;
  website: string;
  digitalServices: {
    total: number;
    active: number;
    mobile: number;
  };
  isActive: boolean;
}

export interface ProvincialProgram {
  id: string;
  name: string;
  province: string;
  department: string;
  description: string;
  budget: number;
  beneficiaries: number;
  status: 'active' | 'completed' | 'suspended';
}

export class ProvincialGovernmentBridge {
  private provinces: Map<string, Province> = new Map();
  private departments: Map<string, ProvincialDepartment> = new Map();
  private programs: Map<string, ProvincialProgram> = new Map();

  constructor() {
    logger.info('ProvincialGovernmentBridge initialized');
    this.initializeData();
  }

  private initializeData(): void {
    this.initializeProvinces();
    this.initializeDepartments();
    this.initializePrograms();
  }

  private initializeProvinces(): void {
    const provinces: Province[] = [
      {
        id: 'on',
        name: 'Ontario',
        nameEn: 'Ontario',
        nameFr: 'Ontario',
        capital: 'Toronto',
        premier: 'Doug Ford',
        population: 15608000,
        area: 1076395,
        gdp: 857.4,
        website: 'https://ontario.ca',
        githubOrg: 'ontario-government',
        isActive: true
      },
      {
        id: 'qc',
        name: 'Quebec',
        nameEn: 'Quebec',
        nameFr: 'Québec',
        capital: 'Quebec City',
        premier: 'François Legault',
        population: 8604495,
        area: 1542056,
        gdp: 439.4,
        website: 'https://quebec.ca',
        githubOrg: 'quebec-government',
        isActive: true
      },
      {
        id: 'bc',
        name: 'British Columbia',
        nameEn: 'British Columbia',
        nameFr: 'Colombie-Britannique',
        capital: 'Victoria',
        premier: 'David Eby',
        population: 5399118,
        area: 944735,
        gdp: 295.4,
        website: 'https://gov.bc.ca',
        githubOrg: 'bcgov',
        isActive: true
      },
      {
        id: 'ab',
        name: 'Alberta',
        nameEn: 'Alberta',
        nameFr: 'Alberta',
        capital: 'Edmonton',
        premier: 'Danielle Smith',
        population: 4756408,
        area: 661848,
        gdp: 334.2,
        website: 'https://alberta.ca',
        githubOrg: 'alberta-government',
        isActive: true
      },
      {
        id: 'mb',
        name: 'Manitoba',
        nameEn: 'Manitoba',
        nameFr: 'Manitoba',
        capital: 'Winnipeg',
        premier: 'Wab Kinew',
        population: 1431792,
        area: 647797,
        gdp: 72.7,
        website: 'https://manitoba.ca',
        githubOrg: 'manitoba-government',
        isActive: true
      },
      {
        id: 'sk',
        name: 'Saskatchewan',
        nameEn: 'Saskatchewan',
        nameFr: 'Saskatchewan',
        capital: 'Regina',
        premier: 'Scott Moe',
        population: 1218976,
        area: 651036,
        gdp: 80.7,
        website: 'https://saskatchewan.ca',
        githubOrg: 'saskatchewan-government',
        isActive: true
      },
      {
        id: 'ns',
        name: 'Nova Scotia',
        nameEn: 'Nova Scotia',
        nameFr: 'Nouvelle-Écosse',
        capital: 'Halifax',
        premier: 'Tim Houston',
        population: 1030281,
        area: 55284,
        gdp: 44.9,
        website: 'https://novascotia.ca',
        githubOrg: 'nova-scotia-government',
        isActive: true
      },
      {
        id: 'nb',
        name: 'New Brunswick',
        nameEn: 'New Brunswick',
        nameFr: 'Nouveau-Brunswick',
        capital: 'Fredericton',
        premier: 'Blaine Higgs',
        population: 842725,
        area: 72908,
        gdp: 36.9,
        website: 'https://gnb.ca',
        githubOrg: 'new-brunswick-government',
        isActive: true
      },
      {
        id: 'nl',
        name: 'Newfoundland and Labrador',
        nameEn: 'Newfoundland and Labrador',
        nameFr: 'Terre-Neuve-et-Labrador',
        capital: 'St. John\'s',
        premier: 'Andrew Furey',
        population: 540418,
        area: 405212,
        gdp: 33.2,
        website: 'https://gov.nl.ca',
        githubOrg: 'newfoundland-government',
        isActive: true
      },
      {
        id: 'pe',
        name: 'Prince Edward Island',
        nameEn: 'Prince Edward Island',
        nameFr: 'Île-du-Prince-Édouard',
        capital: 'Charlottetown',
        premier: 'Dennis King',
        population: 175853,
        area: 5660,
        gdp: 7.3,
        website: 'https://princeedwardisland.ca',
        githubOrg: 'pei-government',
        isActive: true
      }
    ];

    provinces.forEach(province => this.provinces.set(province.id, province));
    logger.info('Provinces initialized', { count: provinces.length });
  }

  private initializeDepartments(): void {
    const departments: ProvincialDepartment[] = [
      // Ontario departments
      {
        id: 'on-health',
        name: 'Ministry of Health',
        province: 'on',
        minister: 'Sylvia Jones',
        mandate: 'Ensure Ontarians have access to quality health care services',
        budget: 75000000000,
        employees: 8500,
        website: 'https://health.gov.on.ca',
        digitalServices: { total: 45, active: 40, mobile: 25 },
        isActive: true
      },
      {
        id: 'on-education',
        name: 'Ministry of Education',
        province: 'on',
        minister: 'Stephen Lecce',
        mandate: 'Provide leadership in education to ensure student success',
        budget: 32000000000,
        employees: 6200,
        website: 'https://edu.gov.on.ca',
        digitalServices: { total: 35, active: 32, mobile: 20 },
        isActive: true
      },
      // Quebec departments
      {
        id: 'qc-sante',
        name: 'Ministère de la Santé et des Services sociaux',
        province: 'qc',
        minister: 'Christian Dubé',
        mandate: 'Assurer l\'accès aux services de santé et services sociaux',
        budget: 58000000000,
        employees: 7800,
        website: 'https://msss.gouv.qc.ca',
        digitalServices: { total: 42, active: 38, mobile: 22 },
        isActive: true
      },
      {
        id: 'qc-education',
        name: 'Ministère de l\'Éducation',
        province: 'qc',
        minister: 'Bernard Drainville',
        mandate: 'Assurer l\'éducation préscolaire, primaire et secondaire',
        budget: 28000000000,
        employees: 5500,
        website: 'https://education.gouv.qc.ca',
        digitalServices: { total: 38, active: 35, mobile: 18 },
        isActive: true
      },
      // British Columbia departments
      {
        id: 'bc-health',
        name: 'Ministry of Health',
        province: 'bc',
        minister: 'Adrian Dix',
        mandate: 'Lead, plan and innovate to ensure British Columbians are supported to be as healthy as possible',
        budget: 28000000000,
        employees: 4200,
        website: 'https://gov.bc.ca/health',
        digitalServices: { total: 38, active: 35, mobile: 20 },
        isActive: true
      },
      {
        id: 'bc-education',
        name: 'Ministry of Education and Child Care',
        province: 'bc',
        minister: 'Rachna Singh',
        mandate: 'Ensure students receive a quality education in safe, inclusive learning environments',
        budget: 8500000000,
        employees: 3800,
        website: 'https://gov.bc.ca/education',
        digitalServices: { total: 32, active: 28, mobile: 15 },
        isActive: true
      }
    ];

    departments.forEach(dept => this.departments.set(dept.id, dept));
    logger.info('Provincial departments initialized', { count: departments.length });
  }

  private initializePrograms(): void {
    const programs: ProvincialProgram[] = [
      {
        id: 'on-ohip',
        name: 'Ontario Health Insurance Plan',
        province: 'on',
        department: 'on-health',
        description: 'Universal health insurance coverage for Ontario residents',
        budget: 65000000000,
        beneficiaries: 15000000,
        status: 'active'
      },
      {
        id: 'qc-ramq',
        name: 'Régie de l\'assurance maladie du Québec',
        province: 'qc',
        department: 'qc-sante',
        description: 'Régime d\'assurance maladie universel du Québec',
        budget: 52000000000,
        beneficiaries: 8500000,
        status: 'active'
      },
      {
        id: 'bc-msp',
        name: 'Medical Services Plan',
        province: 'bc',
        department: 'bc-health',
        description: 'British Columbia\'s mandatory medical insurance program',
        budget: 25000000000,
        beneficiaries: 5200000,
        status: 'active'
      },
      {
        id: 'ab-ahcip',
        name: 'Alberta Health Care Insurance Plan',
        province: 'ab',
        department: 'ab-health',
        description: 'Universal health insurance for Alberta residents',
        budget: 22000000000,
        beneficiaries: 4600000,
        status: 'active'
      }
    ];

    programs.forEach(program => this.programs.set(program.id, program));
    logger.info('Provincial programs initialized', { count: programs.length });
  }

  // Public API methods
  async getData(category?: string, filters?: any): Promise<any> {
    const cacheKey = `provincial-government:${category || 'all'}:${JSON.stringify(filters || {})}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = {
      provinces: category === 'provinces' || !category ? Array.from(this.provinces.values()) : [],
      departments: category === 'departments' || !category ? Array.from(this.departments.values()) : [],
      programs: category === 'programs' || !category ? Array.from(this.programs.values()) : [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalProvinces: this.provinces.size,
        totalDepartments: this.departments.size,
        totalPrograms: this.programs.size
      }
    };

    // Apply filters if provided
    if (filters) {
      if (filters.province) {
        data.departments = data.departments.filter(d => d.province === filters.province);
        data.programs = data.programs.filter(p => p.province === filters.province);
      }
      if (filters.isActive !== undefined) {
        data.provinces = data.provinces.filter(p => p.isActive === filters.isActive);
        data.departments = data.departments.filter(d => d.isActive === filters.isActive);
      }
      if (filters.minBudget) {
        data.departments = data.departments.filter(d => d.budget >= filters.minBudget);
        data.programs = data.programs.filter(p => p.budget >= filters.minBudget);
      }
    }

    cacheManager.set(cacheKey, data, 30 * 60 * 1000); // Cache for 30 minutes
    return data;
  }

  async getProvinces(filters?: any): Promise<Province[]> {
    const data = await this.getData('provinces', filters);
    return data.provinces;
  }

  async getDepartments(filters?: any): Promise<ProvincialDepartment[]> {
    const data = await this.getData('departments', filters);
    return data.departments;
  }

  async getPrograms(filters?: any): Promise<ProvincialProgram[]> {
    const data = await this.getData('programs', filters);
    return data.programs;
  }

  async getProvinceById(id: string): Promise<Province | null> {
    return this.provinces.get(id) || null;
  }

  async getDepartmentById(id: string): Promise<ProvincialDepartment | null> {
    return this.departments.get(id) || null;
  }

  async getProgramById(id: string): Promise<ProvincialProgram | null> {
    return this.programs.get(id) || null;
  }

  async search(query: string, filters?: any): Promise<any> {
    const searchTerm = query.toLowerCase();
    
    const provinces = Array.from(this.provinces.values()).filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.capital.toLowerCase().includes(searchTerm) ||
      p.premier.toLowerCase().includes(searchTerm)
    );

    const departments = Array.from(this.departments.values()).filter(d =>
      d.name.toLowerCase().includes(searchTerm) ||
      d.minister.toLowerCase().includes(searchTerm) ||
      d.mandate.toLowerCase().includes(searchTerm)
    );

    const programs = Array.from(this.programs.values()).filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );

    return {
      query,
      results: {
        provinces,
        departments,
        programs
      },
      totalResults: provinces.length + departments.length + programs.length
    };
  }

  async getStats(): Promise<any> {
    const provinces = Array.from(this.provinces.values());
    const departments = Array.from(this.departments.values());
    const programs = Array.from(this.programs.values());

    return {
      overview: {
        totalProvinces: provinces.length,
        totalDepartments: departments.length,
        totalPrograms: programs.length,
        activeProvinces: provinces.filter(p => p.isActive).length,
        activeDepartments: departments.filter(d => d.isActive).length,
        activePrograms: programs.filter(p => p.status === 'active').length
      },
      demographics: {
        totalPopulation: provinces.reduce((sum, p) => sum + p.population, 0),
        totalArea: provinces.reduce((sum, p) => sum + p.area, 0),
        totalGDP: provinces.reduce((sum, p) => sum + p.gdp, 0)
      },
      budget: {
        totalDepartmentBudget: departments.reduce((sum, d) => sum + d.budget, 0),
        totalProgramBudget: programs.reduce((sum, p) => sum + p.budget, 0),
        averageDepartmentBudget: departments.reduce((sum, d) => sum + d.budget, 0) / departments.length
      },
      employees: {
        totalEmployees: departments.reduce((sum, d) => sum + d.employees, 0),
        averageEmployeesPerDepartment: departments.reduce((sum, d) => sum + d.employees, 0) / departments.length
      },
      digital: {
        totalDigitalServices: departments.reduce((sum, d) => sum + d.digitalServices.total, 0),
        activeDigitalServices: departments.reduce((sum, d) => sum + d.digitalServices.active, 0),
        mobileServices: departments.reduce((sum, d) => sum + d.digitalServices.mobile, 0)
      }
    };
  }

  getRelatedRepositories(): any {
    return {
      categories: [
        'Provincial Governments',
        'Provincial Departments',
        'Provincial Programs',
        'Digital Services',
        'Open Data Initiatives'
      ],
      repositories: [
        'https://github.com/bcgov/digital-toolkit',
        'https://github.com/ontario-government/design-system',
        'https://github.com/quebec-government/open-data',
        'https://github.com/alberta-government/digital-services'
      ]
    };
  }
}
