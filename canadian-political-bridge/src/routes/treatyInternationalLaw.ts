import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function treatyInternationalLawRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const treatyPath = `${basePath}/treaty-international-law`;

  // Get all treaty and international law data
  app.get(treatyPath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, treatyType, province, nation } = req.query;
      
      const filters: any = {};
      if (treatyType) filters.treatyType = treatyType as string;
      if (province) filters.province = province as string;
      if (nation) filters.nation = nation as string;

      const data = await orchestrator.getTreatyInternationalLawData(category as string, filters);
      
      res.json({
        success: true,
        data: data,
        metadata: {
          category: category || 'all',
          filters: filters,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching treaty and international law data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch treaty and international law data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get treaties
  app.get(`${treatyPath}/treaties`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const treaties = await orchestrator.getTreaties(type as string);
      
      res.json({
        success: true,
        data: treaties,
        metadata: {
          type: type || 'all',
          totalTreaties: treaties.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching treaties:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch treaties',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get specific treaty
  app.get(`${treatyPath}/treaties/:treatyId`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { treatyId } = req.params;
      const treaty = await orchestrator.getTreaty(treatyId);
      
      if (!treaty) {
        return res.status(404).json({
          success: false,
          error: 'Treaty not found',
          message: `Treaty '${treatyId}' not found`
        });
      }

      res.json({
        success: true,
        data: treaty,
        metadata: {
          treatyId: treatyId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching treaty ${req.params.treatyId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch treaty',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get residential schools
  app.get(`${treatyPath}/residential-schools`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { province } = req.query;
      const schools = await orchestrator.getResidentialSchools(province as string);
      
      res.json({
        success: true,
        data: schools,
        metadata: {
          province: province || 'all',
          totalSchools: schools.length,
          totalConfirmedDeaths: schools.reduce((sum, school) => sum + school.confirmedDeaths, 0),
          totalGravesFound: schools.reduce((sum, school) => sum + school.gravesFound, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching residential schools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch residential schools data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get Indigenous symbols and cultural data
  app.get(`${treatyPath}/indigenous-symbols`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { nation, type } = req.query;
      const symbols = await orchestrator.getIndigenousSymbols(nation as string);
      
      let filteredSymbols = symbols;
      if (type) {
        filteredSymbols = symbols.filter(symbol => symbol.type === type);
      }

      res.json({
        success: true,
        data: filteredSymbols,
        metadata: {
          nation: nation || 'all',
          type: type || 'all',
          totalSymbols: filteredSymbols.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Indigenous symbols:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous symbols',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get specific Indigenous symbol (including Thunderbird, sacred swastika/whirling log)
  app.get(`${treatyPath}/indigenous-symbols/:symbolId`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { symbolId } = req.params;
      const symbol = await orchestrator.getIndigenousSymbol(symbolId);
      
      if (!symbol) {
        return res.status(404).json({
          success: false,
          error: 'Symbol not found',
          message: `Indigenous symbol '${symbolId}' not found`
        });
      }

      res.json({
        success: true,
        data: symbol,
        metadata: {
          symbolId: symbolId,
          culturalContext: 'This symbol has deep cultural and spiritual significance to Indigenous peoples',
          respectfulUse: 'Please use this information respectfully and in accordance with Indigenous cultural protocols',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching Indigenous symbol ${req.params.symbolId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Indigenous symbol',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get Truth and Reconciliation Commission data
  app.get(`${treatyPath}/truth-reconciliation`, rateLimit, async (req: Request, res: Response) => {
    try {
      const trcData = await orchestrator.getTruthAndReconciliationData();
      
      res.json({
        success: true,
        data: trcData,
        metadata: {
          description: 'Truth and Reconciliation Commission data including residential schools, treaty violations, and calls to action',
          totalResidentialSchools: trcData.residentialSchools.length,
          totalTreatyViolations: trcData.treatyViolations.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching Truth and Reconciliation data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Truth and Reconciliation data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get international law data
  app.get(`${treatyPath}/international-law`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { relevantToIndigenous } = req.query;
      const laws = await orchestrator.getInternationalLaws();
      
      let filteredLaws = laws;
      if (relevantToIndigenous === 'true') {
        filteredLaws = laws.filter(law => law.relevantToIndigenous);
      }

      res.json({
        success: true,
        data: filteredLaws,
        metadata: {
          relevantToIndigenous: relevantToIndigenous === 'true',
          totalLaws: filteredLaws.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching international law data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch international law data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get religious freedom data
  app.get(`${treatyPath}/religious-freedom`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const freedoms = await orchestrator.getReligiousFreedoms();
      
      let filteredFreedoms = freedoms;
      if (type) {
        filteredFreedoms = freedoms.filter(freedom => freedom.type === type);
      }

      res.json({
        success: true,
        data: filteredFreedoms,
        metadata: {
          type: type || 'all',
          totalReligions: filteredFreedoms.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching religious freedom data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch religious freedom data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search across all treaty and international law data
  app.get(`${treatyPath}/search`, rateLimit, async (req: Request, res: Response) => {
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

      const results = await orchestrator.searchTreatyInternationalLaw(q as string, filters);
      
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
      logger.error('Error searching treaty and international law data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search treaty and international law data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Analyze treaty violations and fraud
  app.post(`${treatyPath}/analyze-violations`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { treatyId, analysisType, timeframe } = req.body;
      
      const analysis = await orchestrator.performPoliticalAnalysis('treaty_violation_analysis', {
        treatyId,
        analysisType: analysisType || 'comprehensive',
        timeframe: timeframe || 'all_time'
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          treatyId: treatyId || 'all',
          analysisType: analysisType || 'comprehensive',
          timeframe: timeframe || 'all_time',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error analyzing treaty violations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze treaty violations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get related GitHub repositories
  app.get(`${treatyPath}/related-repositories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const repositories = await orchestrator.getTreatyRelatedRepositories();
      
      res.json({
        success: true,
        data: repositories,
        metadata: {
          totalCategories: Object.keys(repositories).length,
          totalRepositories: Object.values(repositories).flat().length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching related repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch related repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Historical truth verification endpoint
  app.post(`${treatyPath}/verify-historical-truth`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { claim, sources, category } = req.body;
      
      if (!claim) {
        return res.status(400).json({
          success: false,
          error: 'Missing claim',
          message: 'Please provide a historical claim to verify'
        });
      }

      const verification = await orchestrator.performPoliticalAnalysis('historical_truth_verification', {
        claim,
        sources: sources || [],
        category: category || 'general',
        includeIndigenousPerspectives: true,
        includeTreatyContext: true,
        includeInternationalLaw: true
      });

      res.json({
        success: true,
        data: verification,
        metadata: {
          claim: claim.substring(0, 100) + (claim.length > 100 ? '...' : ''),
          category: category || 'general',
          verificationApproach: 'Multi-source analysis including Indigenous perspectives and treaty context',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error verifying historical truth:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify historical truth',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Ceremonial and cultural truth endpoint
  app.get(`${treatyPath}/ceremonial-truths`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { nation, ceremony } = req.query;
      
      const ceremonialTruths = await orchestrator.getCeremonialTruths(nation as string, ceremony as string);
      
      res.json({
        success: true,
        data: ceremonialTruths,
        metadata: {
          nation: nation || 'all',
          ceremony: ceremony || 'all',
          culturalNote: 'This information is shared with respect for Indigenous cultural protocols and should be used appropriately',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching ceremonial truths:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ceremonial truths',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UNDRIP specific endpoints
  app.get(`${treatyPath}/undrip`, rateLimit, async (req: Request, res: Response) => {
    try {
      const undrip = await orchestrator.getUNDRIP();
      
      res.json({
        success: true,
        data: undrip,
        metadata: {
          description: 'United Nations Declaration on the Rights of Indigenous Peoples - Canada\'s implementation',
          implementationStatus: 'Active - Bill C-15 in force since June 21, 2021',
          actionPlanMeasures: 181,
          federalDepartments: 38,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching UNDRIP data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch UNDRIP data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UNDRIP Action Plan measures
  app.get(`${treatyPath}/undrip/action-plan`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { department, status } = req.query;
      const actionPlan = await orchestrator.getUNDRIPActionPlan(department as string, status as string);
      
      res.json({
        success: true,
        data: actionPlan,
        metadata: {
          totalMeasures: 181,
          federalDepartments: 38,
          department: department || 'all',
          status: status || 'all',
          lastUpdated: 'Annual Progress Report 2025',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching UNDRIP Action Plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch UNDRIP Action Plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UNDRIP compliance monitoring
  app.get(`${treatyPath}/undrip/compliance`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { year, department } = req.query;
      const compliance = await orchestrator.getUNDRIPCompliance(year as string, department as string);
      
      res.json({
        success: true,
        data: compliance,
        metadata: {
          year: year || 'current',
          department: department || 'all',
          monitoringFramework: 'Indigenous Navigator and federal reporting',
          annualReports: ['2022', '2023', '2024', '2025'],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching UNDRIP compliance data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch UNDRIP compliance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UN Declarations and Covenants
  app.get(`${treatyPath}/un-declarations`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { type, status } = req.query;
      const declarations = await orchestrator.getUNDeclarations(type as string, status as string);
      
      res.json({
        success: true,
        data: declarations,
        metadata: {
          type: type || 'all',
          status: status || 'all',
          totalDeclarations: declarations.length,
          includedInstruments: [
            'UNDRIP',
            'ICCPR',
            'CERD',
            'ILO Convention 169'
          ],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching UN declarations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch UN declarations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Free, Prior and Informed Consent (FPIC) tracking
  app.get(`${treatyPath}/fpic`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { project, status, year } = req.query;
      const fpic = await orchestrator.getFPICData(project as string, status as string, year as string);
      
      res.json({
        success: true,
        data: fpic,
        metadata: {
          project: project || 'all',
          status: status || 'all',
          year: year || 'all',
          description: 'Free, Prior and Informed Consent implementation tracking',
          legalBasis: 'UNDRIP Article 19, federal consultation policies',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching FPIC data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FPIC data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Indigenous rights violations reporting
  app.post(`${treatyPath}/report-violation`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { violationType, description, location, affectedCommunities, evidenceDocuments } = req.body;
      
      if (!violationType || !description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'violationType and description are required'
        });
      }

      const report = await orchestrator.reportIndigenousRightsViolation({
        violationType,
        description,
        location: location || 'Not specified',
        affectedCommunities: affectedCommunities || [],
        evidenceDocuments: evidenceDocuments || [],
        reportedDate: new Date(),
        status: 'reported'
      });

      res.json({
        success: true,
        data: report,
        metadata: {
          reportId: report.id,
          status: 'Violation report submitted',
          nextSteps: 'Report will be reviewed and forwarded to appropriate authorities',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error reporting Indigenous rights violation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to report violation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
