import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function politicalMediaRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const politicalMediaPath = `${basePath}/political-media`;

  // Get all political media data
  app.get(politicalMediaPath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { category, country, partyType, mediaType } = req.query;
      
      const filters: any = {};
      if (country) filters.country = country as string;
      if (partyType) filters.partyType = partyType as string;
      if (mediaType) filters.mediaType = mediaType as string;

      const data = await orchestrator.getPoliticalMediaData(category as string, filters);
      
      res.json({
        success: true,
        data: data,
        metadata: {
          category: category || 'all',
          country: country || 'all',
          partyType: partyType || 'all',
          mediaType: mediaType || 'all',
          filters: filters,
          totalPoliticalParties: data.politicalParties?.length || 0,
          totalNewsMedia: data.newsMedia?.length || 0,
          totalPoliticalData: data.politicalData?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political media data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political media data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get political party repositories
  app.get(`${politicalMediaPath}/political-parties`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, partyType, active } = req.query;
      const parties = await orchestrator.getPoliticalPartyRepositories(
        country as string, 
        partyType as string
      );
      
      let filteredParties = parties;
      if (active !== undefined) {
        filteredParties = parties.filter((party: any) => 
          party.isActive === (active === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredParties,
        metadata: {
          country: country || 'all',
          partyType: partyType || 'all',
          active: active || 'all',
          totalParties: filteredParties.length,
          countries: [...new Set(filteredParties.map((p: any) => p.country))],
          partyTypes: {
            democratic: filteredParties.filter((p: any) => p.partyType === 'democratic').length,
            republican: filteredParties.filter((p: any) => p.partyType === 'republican').length,
            liberal: filteredParties.filter((p: any) => p.partyType === 'liberal').length,
            conservative: filteredParties.filter((p: any) => p.partyType === 'conservative').length,
            progressive: filteredParties.filter((p: any) => p.partyType === 'progressive').length,
            socialist: filteredParties.filter((p: any) => p.partyType === 'socialist').length,
            green: filteredParties.filter((p: any) => p.partyType === 'green').length,
            libertarian: filteredParties.filter((p: any) => p.partyType === 'libertarian').length,
            centrist: filteredParties.filter((p: any) => p.partyType === 'centrist').length,
            nationalist: filteredParties.filter((p: any) => p.partyType === 'nationalist').length,
            other: filteredParties.filter((p: any) => p.partyType === 'other').length
          },
          totalStars: filteredParties.reduce((sum: number, p: any) => sum + p.stars, 0),
          totalForks: filteredParties.reduce((sum: number, p: any) => sum + p.forks, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political party repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political party repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get news media repositories
  app.get(`${politicalMediaPath}/news-media`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, mediaType, politicalLean, active } = req.query;
      const media = await orchestrator.getNewsMediaRepositories(
        country as string, 
        mediaType as string
      );
      
      let filteredMedia = media;
      if (politicalLean) {
        filteredMedia = filteredMedia.filter((m: any) => 
          m.politicalLean === politicalLean
        );
      }
      if (active !== undefined) {
        filteredMedia = filteredMedia.filter((m: any) => 
          m.isActive === (active === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredMedia,
        metadata: {
          country: country || 'all',
          mediaType: mediaType || 'all',
          politicalLean: politicalLean || 'all',
          totalMedia: filteredMedia.length,
          countries: [...new Set(filteredMedia.map((m: any) => m.country))],
          mediaTypes: {
            television: filteredMedia.filter((m: any) => m.mediaType === 'television').length,
            newspaper: filteredMedia.filter((m: any) => m.mediaType === 'newspaper').length,
            digital: filteredMedia.filter((m: any) => m.mediaType === 'digital').length,
            radio: filteredMedia.filter((m: any) => m.mediaType === 'radio').length,
            magazine: filteredMedia.filter((m: any) => m.mediaType === 'magazine').length,
            wire_service: filteredMedia.filter((m: any) => m.mediaType === 'wire_service').length,
            public_media: filteredMedia.filter((m: any) => m.mediaType === 'public_media').length,
            independent: filteredMedia.filter((m: any) => m.mediaType === 'independent').length
          },
          politicalLean: {
            left: filteredMedia.filter((m: any) => m.politicalLean === 'left').length,
            center_left: filteredMedia.filter((m: any) => m.politicalLean === 'center_left').length,
            center: filteredMedia.filter((m: any) => m.politicalLean === 'center').length,
            center_right: filteredMedia.filter((m: any) => m.politicalLean === 'center_right').length,
            right: filteredMedia.filter((m: any) => m.politicalLean === 'right').length,
            neutral: filteredMedia.filter((m: any) => m.politicalLean === 'neutral').length,
            mixed: filteredMedia.filter((m: any) => m.politicalLean === 'mixed').length
          },
          totalStars: filteredMedia.reduce((sum: number, m: any) => sum + m.stars, 0),
          totalForks: filteredMedia.reduce((sum: number, m: any) => sum + m.forks, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching news media repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch news media repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get political data repositories
  app.get(`${politicalMediaPath}/political-data`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, category, openSource, apiAvailable } = req.query;
      const data = await orchestrator.getPoliticalDataRepositories(country as string);
      
      let filteredData = data;
      if (category) {
        filteredData = filteredData.filter((d: any) => d.category === category);
      }
      if (openSource !== undefined) {
        filteredData = filteredData.filter((d: any) => 
          d.openSource === (openSource === 'true')
        );
      }
      if (apiAvailable !== undefined) {
        filteredData = filteredData.filter((d: any) => 
          d.apiAvailable === (apiAvailable === 'true')
        );
      }

      res.json({
        success: true,
        data: filteredData,
        metadata: {
          country: country || 'all',
          category: category || 'all',
          totalData: filteredData.length,
          countries: [...new Set(filteredData.map((d: any) => d.country))],
          categories: {
            election_data: filteredData.filter((d: any) => d.category === 'election_data').length,
            polling_data: filteredData.filter((d: any) => d.category === 'polling_data').length,
            campaign_finance: filteredData.filter((d: any) => d.category === 'campaign_finance').length,
            voting_records: filteredData.filter((d: any) => d.category === 'voting_records').length,
            demographic_data: filteredData.filter((d: any) => d.category === 'demographic_data').length,
            policy_analysis: filteredData.filter((d: any) => d.category === 'policy_analysis').length,
            transparency_tools: filteredData.filter((d: any) => d.category === 'transparency_tools').length
          },
          openSource: filteredData.filter((d: any) => d.openSource).length,
          withAPI: filteredData.filter((d: any) => d.apiAvailable).length,
          totalStars: filteredData.reduce((sum: number, d: any) => sum + d.stars, 0),
          totalForks: filteredData.reduce((sum: number, d: any) => sum + d.forks, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political data repositories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political data repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get country statistics
  app.get(`${politicalMediaPath}/countries/:country/stats`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country } = req.params;
      const stats = await orchestrator.getPoliticalMediaCountryStats(country);
      
      res.json({
        success: true,
        data: stats,
        metadata: {
          country: country,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political media country statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political media country statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search political media data
  app.get(`${politicalMediaPath}/search`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { q, country, partyType, mediaType } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Missing search query',
          message: 'Please provide a search query using the "q" parameter'
        });
      }

      const filters: any = {};
      if (country) filters.country = country as string;
      if (partyType) filters.partyType = partyType as string;
      if (mediaType) filters.mediaType = mediaType as string;

      const results = await orchestrator.searchPoliticalMedia(q as string, filters);
      
      res.json({
        success: true,
        data: results,
        metadata: {
          query: q,
          country: country || 'all',
          partyType: partyType || 'all',
          mediaType: mediaType || 'all',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error searching political media data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search political media data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all repository categories
  app.get(`${politicalMediaPath}/repository-categories`, rateLimit, async (req: Request, res: Response) => {
    try {
      const repositories = orchestrator.getPoliticalMediaRepositoryCategories();
      
      res.json({
        success: true,
        data: repositories,
        metadata: {
          totalCategories: Object.keys(repositories).length,
          totalRepositories: Object.values(repositories).flat().length,
          categories: {
            usa_political_parties: Object.keys(repositories).filter(key => 
              key.includes('usa_') && (key.includes('democratic') || key.includes('republican') || key.includes('third'))
            ).length,
            canada_political_parties: Object.keys(repositories).filter(key => 
              key.includes('canada_') && !key.includes('media') && !key.includes('data')
            ).length,
            usa_news_media: Object.keys(repositories).filter(key => 
              key.includes('usa_') && key.includes('news')
            ).length,
            canada_news_media: Object.keys(repositories).filter(key => 
              key.includes('canada_') && key.includes('media')
            ).length,
            political_data: Object.keys(repositories).filter(key => 
              key.includes('data') || key.includes('fact_checking') || key.includes('election_monitoring')
            ).length
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political media repository categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political media repository categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate political media analysis report
  app.post(`${politicalMediaPath}/generate-analysis-report`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { countries, partyTypes, mediaTypes, analysisType } = req.body;
      
      if (!countries || !Array.isArray(countries)) {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid countries',
          message: 'countries must be an array of country names'
        });
      }

      const report = await orchestrator.generatePoliticalMediaAnalysisReport({
        countries: countries || [],
        partyTypes: partyTypes || [],
        mediaTypes: mediaTypes || [],
        analysisType: analysisType || 'comprehensive'
      });

      res.json({
        success: true,
        data: report,
        metadata: {
          countries: countries.length,
          partyTypes: partyTypes?.length || 0,
          mediaTypes: mediaTypes?.length || 0,
          analysisType: analysisType || 'comprehensive',
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error generating political media analysis report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate political media analysis report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get election coverage analysis
  app.get(`${politicalMediaPath}/election-coverage`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country, electionYear, mediaType } = req.query;
      
      const coverage = await orchestrator.getElectionCoverageAnalysis({
        country: country as string,
        electionYear: electionYear as string,
        mediaType: mediaType as string
      });

      res.json({
        success: true,
        data: coverage,
        metadata: {
          country: country || 'all',
          electionYear: electionYear || 'all',
          mediaType: mediaType || 'all',
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching election coverage analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch election coverage analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get fact-checking organizations
  app.get(`${politicalMediaPath}/fact-checking`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { country } = req.query;
      
      const factCheckers = await orchestrator.getFactCheckingOrganizations(country as string);

      res.json({
        success: true,
        data: factCheckers,
        metadata: {
          country: country || 'all',
          totalOrganizations: factCheckers.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching fact-checking organizations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch fact-checking organizations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
