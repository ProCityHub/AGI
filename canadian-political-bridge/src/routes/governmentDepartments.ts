import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function governmentDepartmentsRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const deptPath = `${basePath}/government-departments`;

  // Get all government departments data
  app.get(deptPath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, type, budget_min, budget_max } = req.query;
      
      const filters: any = {};
      if (type) filters.departmentType = type as string;
      if (budget_min) filters.budgetMin = parseInt(budget_min as string);
      if (budget_max) filters.budgetMax = parseInt(budget_max as string);

      const data = await orchestrator.getGovernmentDepartmentsData(category as string, filters);
      
      res.json({
        success: true,
        data: data,
        metadata: {
          category: category || 'all',
          filters: filters,
          totalDepartments: data.departments?.length || 0,
          totalBudget: data.departments?.reduce((sum: number, dept: any) => sum + dept.budget, 0) || 0,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching government departments data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch government departments data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all federal departments
  app.get(`${deptPath}/departments`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type, minister, province } = req.query;
      const departments = await orchestrator.getFederalDepartments(type as string);
      
      let filteredDepartments = departments;
      if (minister) {
        filteredDepartments = departments.filter((dept: any) => 
          dept.minister.toLowerCase().includes((minister as string).toLowerCase())
        );
      }
      if (province) {
        filteredDepartments = filteredDepartments.filter((dept: any) => 
          dept.headquarters.toLowerCase().includes((province as string).toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredDepartments,
        metadata: {
          type: type || 'all',
          minister: minister || 'all',
          province: province || 'all',
          totalDepartments: filteredDepartments.length,
          totalEmployees: filteredDepartments.reduce((sum: number, dept: any) => sum + dept.employees, 0),
          totalBudget: filteredDepartments.reduce((sum: number, dept: any) => sum + dept.budget, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching federal departments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch federal departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get specific department
  app.get(`${deptPath}/departments/:departmentId`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const department = await orchestrator.getFederalDepartment(departmentId);
      
      if (!department) {
        return res.status(404).json({
          success: false,
          error: 'Department not found',
          message: `Department '${departmentId}' not found`
        });
      }

      res.json({
        success: true,
        data: department,
        metadata: {
          departmentId: departmentId,
          budget: department.budget,
          employees: department.employees,
          openDatasets: department.openDatasets,
          repositories: department.repositories.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching department ${req.params.departmentId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get veteran services
  app.get(`${deptPath}/veterans`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, digital_only } = req.query;
      const services = await orchestrator.getVeteranServices(category as string);
      
      let filteredServices = services;
      if (digital_only === 'true') {
        filteredServices = services.filter((service: any) => service.digitalAvailability);
      }

      res.json({
        success: true,
        data: filteredServices,
        metadata: {
          category: category || 'all',
          digitalOnly: digital_only === 'true',
          totalServices: filteredServices.length,
          totalBeneficiaries: filteredServices.reduce((sum: number, service: any) => sum + service.beneficiaries, 0),
          totalBudget: filteredServices.reduce((sum: number, service: any) => sum + service.budget, 0),
          averageSatisfaction: filteredServices.reduce((sum: number, service: any) => sum + service.satisfaction, 0) / filteredServices.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching veteran services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch veteran services',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get natural resources
  app.get(`${deptPath}/natural-resources`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type, province, indigenous_rights } = req.query;
      const resources = await orchestrator.getNaturalResources(type as string);
      
      let filteredResources = resources;
      if (province) {
        filteredResources = resources.filter((resource: any) => 
          resource.location.some((loc: string) => loc.toLowerCase().includes((province as string).toLowerCase()))
        );
      }
      if (indigenous_rights === 'true') {
        filteredResources = filteredResources.filter((resource: any) => 
          resource.indigenousRights && resource.indigenousRights.length > 0
        );
      }

      res.json({
        success: true,
        data: filteredResources,
        metadata: {
          type: type || 'all',
          province: province || 'all',
          indigenousRights: indigenous_rights === 'true',
          totalResources: filteredResources.length,
          totalEconomicValue: filteredResources.reduce((sum: number, resource: any) => sum + resource.economicValue, 0),
          resourcesWithIndigenousRights: filteredResources.filter((r: any) => r.indigenousRights.length > 0).length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching natural resources:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch natural resources',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get department services
  app.get(`${deptPath}/services`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, digital_maturity, availability } = req.query;
      const services = await orchestrator.getDepartmentServices(department as string);
      
      let filteredServices = services;
      if (digital_maturity) {
        filteredServices = services.filter((service: any) => service.digitalMaturity === digital_maturity);
      }
      if (availability) {
        filteredServices = filteredServices.filter((service: any) => service.availability === availability);
      }

      res.json({
        success: true,
        data: filteredServices,
        metadata: {
          department: department || 'all',
          digitalMaturity: digital_maturity || 'all',
          availability: availability || 'all',
          totalServices: filteredServices.length,
          endToEndOnline: filteredServices.filter((s: any) => s.availability === 'end_to_end_online').length,
          averageSatisfaction: filteredServices.reduce((sum: number, s: any) => sum + s.satisfaction, 0) / filteredServices.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching department services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department services',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get department laws and regulations
  app.get(`${deptPath}/laws`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, type, status } = req.query;
      const laws = await orchestrator.getDepartmentLaws(department as string, type as string, status as string);
      
      res.json({
        success: true,
        data: laws,
        metadata: {
          department: department || 'all',
          type: type || 'all',
          status: status || 'all',
          totalLaws: laws.length,
          activeLaws: laws.filter((law: any) => law.status === 'active').length,
          proposedLaws: laws.filter((law: any) => law.status === 'proposed').length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching department laws:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department laws',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get IT projects
  app.get(`${deptPath}/it-projects`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, status, cost_min, risk_level } = req.query;
      const projects = await orchestrator.getITProjects(department as string, status as string);
      
      let filteredProjects = projects;
      if (cost_min) {
        filteredProjects = projects.filter((project: any) => project.totalCost >= parseInt(cost_min as string));
      }
      if (risk_level) {
        filteredProjects = filteredProjects.filter((project: any) => project.riskLevel === risk_level);
      }

      res.json({
        success: true,
        data: filteredProjects,
        metadata: {
          department: department || 'all',
          status: status || 'all',
          costMin: cost_min || 0,
          riskLevel: risk_level || 'all',
          totalProjects: filteredProjects.length,
          totalCost: filteredProjects.reduce((sum: number, project: any) => sum + project.totalCost, 0),
          highRiskProjects: filteredProjects.filter((p: any) => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching IT projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch IT projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search across all government departments data
  app.get(`${deptPath}/search`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { q, category } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Missing search query',
          message: 'Please provide a search query using the "q" parameter'
        });
      }

      const filters: any = {};
      if (category) filters.category = category as string;

      const results = await orchestrator.searchGovernmentDepartments(q as string, filters);
      
      res.json({
        success: true,
        data: results,
        metadata: {
          query: q,
          category: category || 'all',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error searching government departments data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search government departments data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get department performance metrics
  app.get(`${deptPath}/performance`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, metric, year } = req.query;
      const performance = await orchestrator.getDepartmentPerformance(
        department as string, 
        metric as string, 
        year as string
      );
      
      res.json({
        success: true,
        data: performance,
        metadata: {
          department: department || 'all',
          metric: metric || 'all',
          year: year || 'current',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching department performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department performance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get related GitHub repositories
  app.get(`${deptPath}/repositories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department } = req.query;
      const repositories = await orchestrator.getDepartmentRepositories(department as string);
      
      res.json({
        success: true,
        data: repositories,
        metadata: {
          department: department || 'all',
          totalRepositories: Object.values(repositories).flat().length,
          departmentCategories: Object.keys(repositories).length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching department repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get digital services overview
  app.get(`${deptPath}/digital-services`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, status, accessibility } = req.query;
      const digitalServices = await orchestrator.getDigitalServices(
        department as string, 
        status as string, 
        accessibility as string
      );
      
      res.json({
        success: true,
        data: digitalServices,
        metadata: {
          department: department || 'all',
          status: status || 'all',
          accessibility: accessibility || 'all',
          totalServices: digitalServices.length,
          liveServices: digitalServices.filter((s: any) => s.status === 'live').length,
          wcagCompliant: digitalServices.filter((s: any) => s.accessibility === 'wcag_aa' || s.accessibility === 'wcag_aaa').length,
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

  // Get open datasets
  app.get(`${deptPath}/open-data`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, format, license } = req.query;
      const openData = await orchestrator.getOpenDatasets(
        department as string, 
        format as string, 
        license as string
      );
      
      res.json({
        success: true,
        data: openData,
        metadata: {
          department: department || 'all',
          format: format || 'all',
          license: license || 'all',
          totalDatasets: openData.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching open datasets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch open datasets',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
