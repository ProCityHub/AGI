import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function americasGovernmentRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const americasPath = `${basePath}/americas-government`;

  // Get all Americas government data
  app.get(americasPath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, country } = req.query;
      
      const filters: any = {};
      if (country) filters.country = country as string;
      if (category) filters.category = category as string;

      const data = await orchestrator.getAmericasGovernmentData(category as string, filters);
      
      res.json({
        success: true,
        data: data,
        metadata: {
          category: category || 'all',
          country: country || 'all',
          filters: filters,
          totalRepositories: data.repositories?.length || 0,
          totalDigitalServices: data.digitalServices?.length || 0,
          totalTransparencyInitiatives: data.transparencyInitiatives?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Americas government data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Americas government data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get government repositories
  app.get(`${americasPath}/repositories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, category, active } = req.query;
      const repositories = await orchestrator.getAmericasGovernmentRepositories(
        country as string, 
        category as string
      );
      
      let filteredRepos = repositories;
      if (active !== undefined) {
        filteredRepos = repositories.filter((repo: any) => 
          repo.isActive === (active === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredRepos,
        metadata: {
          country: country || 'all',
          category: category || 'all',
          active: active || 'all',
          totalRepositories: filteredRepos.length,
          countries: [...new Set(filteredRepos.map((r: any) => r.country))],
          categories: {
            federal: filteredRepos.filter((r: any) => r.category === 'federal').length,
            state_provincial: filteredRepos.filter((r: any) => r.category === 'state_provincial').length,
            municipal: filteredRepos.filter((r: any) => r.category === 'municipal').length,
            agency: filteredRepos.filter((r: any) => r.category === 'agency').length,
            legislative: filteredRepos.filter((r: any) => r.category === 'legislative').length,
            judicial: filteredRepos.filter((r: any) => r.category === 'judicial').length,
            electoral: filteredRepos.filter((r: any) => r.category === 'electoral').length,
            transparency: filteredRepos.filter((r: any) => r.category === 'transparency').length,
            digital_services: filteredRepos.filter((r: any) => r.category === 'digital_services').length,
            open_data: filteredRepos.filter((r: any) => r.category === 'open_data').length
          },
          totalStars: filteredRepos.reduce((sum: number, r: any) => sum + r.stars, 0),
          totalForks: filteredRepos.reduce((sum: number, r: any) => sum + r.forks, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching government repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch government repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get digital services
  app.get(`${americasPath}/digital-services`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, category, accessibility, mobile_optimized } = req.query;
      const services = await orchestrator.getAmericasDigitalServices(country as string);
      
      let filteredServices = services;
      if (category) {
        filteredServices = filteredServices.filter((service: any) => 
          service.category === category
        );
      }
      if (accessibility) {
        filteredServices = filteredServices.filter((service: any) => 
          service.accessibility === accessibility
        );
      }
      if (mobile_optimized !== undefined) {
        filteredServices = filteredServices.filter((service: any) => 
          service.mobileOptimized === (mobile_optimized === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredServices,
        metadata: {
          country: country || 'all',
          category: category || 'all',
          accessibility: accessibility || 'all',
          totalServices: filteredServices.length,
          countries: [...new Set(filteredServices.map((s: any) => s.country))],
          categories: {
            citizen_services: filteredServices.filter((s: any) => s.category === 'citizen_services').length,
            business_services: filteredServices.filter((s: any) => s.category === 'business_services').length,
            government_operations: filteredServices.filter((s: any) => s.category === 'government_operations').length,
            transparency: filteredServices.filter((s: any) => s.category === 'transparency').length,
            participation: filteredServices.filter((s: any) => s.category === 'participation').length
          },
          accessibility: {
            wcag_aa: filteredServices.filter((s: any) => s.accessibility === 'wcag_aa').length,
            wcag_aaa: filteredServices.filter((s: any) => s.accessibility === 'wcag_aaa').length,
            basic: filteredServices.filter((s: any) => s.accessibility === 'basic').length,
            none: filteredServices.filter((s: any) => s.accessibility === 'none').length
          },
          mobileOptimized: filteredServices.filter((s: any) => s.mobileOptimized).length,
          apiAvailable: filteredServices.filter((s: any) => s.apiAvailable).length,
          openSource: filteredServices.filter((s: any) => s.openSource).length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching digital services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch digital services',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get transparency initiatives
  app.get(`${americasPath}/transparency`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, type, status } = req.query;
      const initiatives = await orchestrator.getAmericasTransparencyInitiatives(country as string);
      
      let filteredInitiatives = initiatives;
      if (type) {
        filteredInitiatives = filteredInitiatives.filter((initiative: any) => 
          initiative.type === type
        );
      }
      if (status) {
        filteredInitiatives = filteredInitiatives.filter((initiative: any) => 
          initiative.status === status
        );
      }

      res.json({
        success: true,
        data: filteredInitiatives,
        metadata: {
          country: country || 'all',
          type: type || 'all',
          status: status || 'all',
          totalInitiatives: filteredInitiatives.length,
          countries: [...new Set(filteredInitiatives.map((i: any) => i.country))],
          types: {
            open_government: filteredInitiatives.filter((i: any) => i.type === 'open_government').length,
            freedom_of_information: filteredInitiatives.filter((i: any) => i.type === 'freedom_of_information').length,
            budget_transparency: filteredInitiatives.filter((i: any) => i.type === 'budget_transparency').length,
            procurement_transparency: filteredInitiatives.filter((i: any) => i.type === 'procurement_transparency').length,
            lobbying_registry: filteredInitiatives.filter((i: any) => i.type === 'lobbying_registry').length,
            conflict_of_interest: filteredInitiatives.filter((i: any) => i.type === 'conflict_of_interest').length
          },
          statuses: {
            active: filteredInitiatives.filter((i: any) => i.status === 'active').length,
            planned: filteredInitiatives.filter((i: any) => i.status === 'planned').length,
            suspended: filteredInitiatives.filter((i: any) => i.status === 'suspended').length,
            completed: filteredInitiatives.filter((i: any) => i.status === 'completed').length
          },
          totalDatasets: filteredInitiatives.reduce((sum: number, i: any) => sum + i.datasets, 0),
          totalApiEndpoints: filteredInitiatives.reduce((sum: number, i: any) => sum + i.apiEndpoints, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching transparency initiatives:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transparency initiatives',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get country statistics
  app.get(`${americasPath}/countries/:country/stats`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country } = req.params;
      const stats = await orchestrator.getAmericasCountryStats(country);
      
      res.json({
        success: true,
        data: stats,
        metadata: {
          country: country,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching country statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch country statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search Americas government data
  app.get(`${americasPath}/search`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { q, country, category } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Missing search query',
          message: 'Please provide a search query using the "q" parameter'
        });
      }

      const filters: any = {};
      if (country) filters.country = country as string;
      if (category) filters.category = category as string;

      const results = await orchestrator.searchAmericasGovernment(q as string, filters);
      
      res.json({
        success: true,
        data: results,
        metadata: {
          query: q,
          country: country || 'all',
          category: category || 'all',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error searching Americas government data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search Americas government data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get regional statistics
  app.get(`${americasPath}/regions/:region/stats`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const validRegions = ['north_america', 'central_america', 'caribbean', 'south_america'];
      
      if (!validRegions.includes(region)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid region',
          message: `Region must be one of: ${validRegions.join(', ')}`
        });
      }

      const stats = await orchestrator.getAmericasRegionalStats(region);
      
      res.json({
        success: true,
        data: stats,
        metadata: {
          region: region,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching regional statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch regional statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all repository categories
  app.get(`${americasPath}/repository-categories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const repositories = orchestrator.getAmericasRepositoryCategories();
      
      res.json({
        success: true,
        data: repositories,
        metadata: {
          totalCategories: Object.keys(repositories).length,
          totalRepositories: Object.values(repositories).flat().length,
          regions: {
            north_america: Object.keys(repositories).filter(key => 
              key.includes('canada') || key.includes('usa')
            ).length,
            central_america: Object.keys(repositories).filter(key => 
              key.includes('mexico') || key.includes('guatemala') || key.includes('belize') || 
              key.includes('el_salvador') || key.includes('honduras') || key.includes('nicaragua') || 
              key.includes('costa_rica') || key.includes('panama')
            ).length,
            caribbean: Object.keys(repositories).filter(key => 
              key.includes('jamaica') || key.includes('trinidad') || key.includes('barbados')
            ).length,
            south_america: Object.keys(repositories).filter(key => 
              key.includes('brazil') || key.includes('argentina') || key.includes('chile') || 
              key.includes('colombia') || key.includes('peru') || key.includes('venezuela') || 
              key.includes('ecuador') || key.includes('bolivia') || key.includes('paraguay') || 
              key.includes('uruguay') || key.includes('guyana') || key.includes('suriname')
            ).length
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching repository categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch repository categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate government digital maturity report
  app.post(`${americasPath}/generate-maturity-report`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { countries, categories } = req.body;
      
      if (!countries || !Array.isArray(countries)) {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid countries',
          message: 'countries must be an array of country names'
        });
      }

      const report = await orchestrator.generateAmericasDigitalMaturityReport({
        countries: countries || [],
        categories: categories || []
      });

      res.json({
        success: true,
        data: report,
        metadata: {
          countries: countries.length,
          categories: categories?.length || 0,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error generating digital maturity report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate digital maturity report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

