import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function indigenousGovernanceRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const governancePath = `${basePath}/indigenous-governance`;

  // Get all Indigenous governance data
  app.get(governancePath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, type } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;

      const data = await orchestrator.getIndigenousGovernanceData(category as string, filters);
      
      res.json({
        success: true,
        data: data,
        metadata: {
          category: category || 'all',
          filters: filters,
          totalProvisions: data.indianActProvisions?.length || 0,
          totalGovernmentModels: data.indigenousGovernmentModels?.length || 0,
          decolonizationPhases: data.decolonizationStrategies?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indigenous governance data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous governance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Indian Act analysis and deconstruction
  app.get(`${governancePath}/indian-act`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type, section } = req.query;
      const provisions = await orchestrator.getIndianActProvisions(type as string);
      
      let filteredProvisions = provisions;
      if (section) {
        filteredProvisions = provisions.filter((provision: any) => 
          provision.section.toLowerCase().includes((section as string).toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredProvisions,
        metadata: {
          type: type || 'all',
          section: section || 'all',
          totalProvisions: filteredProvisions.length,
          colonialImpactCategories: {
            colonial_control: filteredProvisions.filter((p: any) => p.type === 'colonial_control').length,
            land_dispossession: filteredProvisions.filter((p: any) => p.type === 'land_dispossession').length,
            cultural_suppression: filteredProvisions.filter((p: any) => p.type === 'cultural_suppression').length,
            governance_denial: filteredProvisions.filter((p: any) => p.type === 'governance_denial').length,
            economic_restriction: filteredProvisions.filter((p: any) => p.type === 'economic_restriction').length
          },
          undripViolations: filteredProvisions.reduce((total: number, p: any) => total + p.violatesUNDRIP.length, 0),
          recommendedActions: {
            repeal: filteredProvisions.filter((p: any) => p.recommendedAction === 'repeal').length,
            replace: filteredProvisions.filter((p: any) => p.recommendedAction === 'replace').length,
            transfer_to_indigenous_control: filteredProvisions.filter((p: any) => p.recommendedAction === 'transfer_to_indigenous_control').length
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indian Act analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indian Act analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Indigenous government models
  app.get(`${governancePath}/government-models`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type, jurisdiction } = req.query;
      const models = await orchestrator.getIndigenousGovernmentModels(type as string);
      
      let filteredModels = models;
      if (jurisdiction) {
        filteredModels = models.filter((model: any) => 
          model.jurisdiction.some((j: string) => j.toLowerCase().includes((jurisdiction as string).toLowerCase()))
        );
      }

      res.json({
        success: true,
        data: filteredModels,
        metadata: {
          type: type || 'all',
          jurisdiction: jurisdiction || 'all',
          totalModels: filteredModels.length,
          governmentTypes: {
            nation_based: filteredModels.filter((m: any) => m.type === 'nation_based').length,
            treaty_based: filteredModels.filter((m: any) => m.type === 'treaty_based').length,
            territorial: filteredModels.filter((m: any) => m.type === 'territorial').length,
            urban_indigenous: filteredModels.filter((m: any) => m.type === 'urban_indigenous').length,
            metis_settlements: filteredModels.filter((m: any) => m.type === 'metis_settlements').length
          },
          commonJurisdictions: [
            'Citizenship and membership',
            'Language and culture',
            'Education',
            'Health and social services',
            'Natural resource management',
            'Justice and dispute resolution'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indigenous government models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous government models',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Decolonization strategies
  app.get(`${governancePath}/decolonization`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { phase, timeline } = req.query;
      const strategies = await orchestrator.getDecolonizationStrategies(phase as string);
      
      let filteredStrategies = strategies;
      if (timeline) {
        filteredStrategies = strategies.filter((strategy: any) => 
          strategy.timeline.toLowerCase().includes((timeline as string).toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredStrategies,
        metadata: {
          phase: phase || 'all',
          timeline: timeline || 'all',
          totalStrategies: filteredStrategies.length,
          phases: {
            immediate: filteredStrategies.filter((s: any) => s.phase === 'immediate').length,
            short_term: filteredStrategies.filter((s: any) => s.phase === 'short_term').length,
            medium_term: filteredStrategies.filter((s: any) => s.phase === 'medium_term').length,
            long_term: filteredStrategies.filter((s: any) => s.phase === 'long_term').length
          },
          totalBudgetRequirements: filteredStrategies.reduce((total: number, s: any) => total + s.budgetRequirements, 0),
          keyActions: [
            'Declare moratorium on Indian Act enforcement',
            'Establish Indigenous-led transition authority',
            'Negotiate self-government agreements',
            'Transfer lands to Indigenous control',
            'Establish Indigenous courts'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching decolonization strategies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch decolonization strategies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Indigenous legal systems
  app.get(`${governancePath}/legal-systems`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { nation, recognition_status } = req.query;
      const legalSystems = await orchestrator.getIndigenousLegalSystems(nation as string);
      
      let filteredSystems = legalSystems;
      if (recognition_status) {
        filteredSystems = legalSystems.filter((system: any) => 
          system.recognitionStatus === recognition_status
        );
      }

      res.json({
        success: true,
        data: filteredSystems,
        metadata: {
          nation: nation || 'all',
          recognitionStatus: recognition_status || 'all',
          totalSystems: filteredSystems.length,
          recognitionStatuses: {
            fully_recognized: filteredSystems.filter((s: any) => s.recognitionStatus === 'fully_recognized').length,
            partially_recognized: filteredSystems.filter((s: any) => s.recognitionStatus === 'partially_recognized').length,
            not_recognized: filteredSystems.filter((s: any) => s.recognitionStatus === 'not_recognized').length,
            under_negotiation: filteredSystems.filter((s: any) => s.recognitionStatus === 'under_negotiation').length
          },
          commonLegalTraditions: [
            'Great Law of Peace',
            'Seven Fires teachings',
            'Oral tradition',
            'Ceremonial law',
            'Clan responsibilities'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indigenous legal systems:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous legal systems',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Self-government agreements
  app.get(`${governancePath}/self-government-agreements`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { status, nation } = req.query;
      const agreements = await orchestrator.getSelfGovernmentAgreements(status as string);
      
      let filteredAgreements = agreements;
      if (nation) {
        filteredAgreements = agreements.filter((agreement: any) => 
          agreement.nation.toLowerCase().includes((nation as string).toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredAgreements,
        metadata: {
          status: status || 'all',
          nation: nation || 'all',
          totalAgreements: filteredAgreements.length,
          agreementStatuses: {
            completed: filteredAgreements.filter((a: any) => a.status === 'completed').length,
            under_negotiation: filteredAgreements.filter((a: any) => a.status === 'under_negotiation').length,
            stalled: filteredAgreements.filter((a: any) => a.status === 'stalled').length,
            terminated: filteredAgreements.filter((a: any) => a.status === 'terminated').length
          },
          commonJurisdictions: [
            'Citizenship',
            'Culture and language',
            'Education',
            'Health services',
            'Child and family services',
            'Administration of justice',
            'Land and resource management'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching self-government agreements:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch self-government agreements',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Constitutional reform proposals
  app.get(`${governancePath}/constitutional-reform`, rateLimit, async (req: Request, res: Response) => {
    try {
      const constitutionalReforms = await orchestrator.getConstitutionalReformProposals();
      
      res.json({
        success: true,
        data: constitutionalReforms,
        metadata: {
          totalProposals: constitutionalReforms.length,
          keyReforms: [
            'Enhanced Section 35 recognition',
            'Indigenous government recognition clause',
            'Indigenous jurisdiction provisions',
            'Fiscal arrangements provisions',
            'Indigenous court system recognition'
          ],
          implementationRequirements: [
            'Federal-provincial agreement',
            'Indigenous consent',
            'Constitutional amendment process',
            'Legislative changes',
            'Fiscal arrangements'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching constitutional reform proposals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch constitutional reform proposals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search Indigenous governance data
  app.get(`${governancePath}/search`, rateLimit, async (req: Request, res: Response) => {
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

      const results = await orchestrator.searchIndigenousGovernance(q as string, filters);
      
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
      logger.error('Error searching Indigenous governance data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search Indigenous governance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate decolonization action plan
  app.post(`${governancePath}/generate-action-plan`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { nation, priorities, timeline, budget } = req.body;
      
      if (!nation || !priorities) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'nation and priorities are required'
        });
      }

      const actionPlan = await orchestrator.generateDecolonizationActionPlan({
        nation,
        priorities: priorities || [],
        timeline: timeline || 'medium_term',
        budget: budget || 0
      });

      res.json({
        success: true,
        data: actionPlan,
        metadata: {
          nation: nation,
          priorities: priorities.length,
          timeline: timeline || 'medium_term',
          estimatedBudget: actionPlan.estimatedBudget,
          keyActions: actionPlan.actions.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error generating decolonization action plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate decolonization action plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Analyze Indian Act provision
  app.post(`${governancePath}/analyze-provision`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { section, content } = req.body;
      
      if (!section || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'section and content are required'
        });
      }

      const analysis = await orchestrator.analyzeIndianActProvision({
        section,
        content
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          section: section,
          analysisType: 'colonial_impact_assessment',
          undripViolations: analysis.violatesUNDRIP.length,
          internationalLawViolations: analysis.violatesInternationalLaw.length,
          recommendedAction: analysis.recommendedAction,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error analyzing Indian Act provision:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze Indian Act provision',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get related GitHub repositories
  app.get(`${governancePath}/repositories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const repositories = await orchestrator.getIndigenousGovernanceRepositories(category as string);
      
      res.json({
        success: true,
        data: repositories,
        metadata: {
          category: category || 'all',
          totalRepositories: Object.values(repositories).flat().length,
          categories: Object.keys(repositories).length,
          repositoryCategories: [
            'indigenous_governance',
            'decolonization',
            'indian_act_analysis',
            'self_government_agreements',
            'indigenous_legal_systems',
            'constitutional_reform'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indigenous governance repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous governance repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
