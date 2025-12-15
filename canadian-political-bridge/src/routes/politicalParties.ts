import { Express, Request, Response } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

export function politicalPartyRoutes(app: Express, orchestrator: BridgeOrchestrator, basePath: string): void {
  const partyPath = `${basePath}/political-parties`;

  // Get all political parties
  app.get(partyPath, rateLimit, async (req: Request, res: Response) => {
    try {
      const { ideology, minSeats, minPolling } = req.query;
      
      const filters: any = {};
      if (ideology) filters.ideology = ideology as string;
      if (minSeats) filters.minSeats = parseInt(minSeats as string);
      if (minPolling) filters.minPolling = parseFloat(minPolling as string);

      const parties = await orchestrator.getPoliticalPartyData(undefined, filters);
      
      res.json({
        success: true,
        data: parties,
        metadata: {
          totalParties: Array.isArray(parties) ? parties.length : 1,
          filters: filters,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching political parties:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch political party data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get specific political party
  app.get(`${partyPath}/:party`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { party } = req.params;
      const partyData = await orchestrator.getPoliticalPartyData(party);
      
      if (!partyData) {
        return res.status(404).json({
          success: false,
          error: 'Party not found',
          message: `Political party '${party}' not found`,
          availableParties: ['liberal', 'conservative', 'ndp', 'bloc', 'green', 'ppc']
        });
      }

      res.json({
        success: true,
        data: partyData,
        metadata: {
          party: party,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching party ${req.params.party}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch party data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get polling data for all parties or specific party
  app.get(`${partyPath}/polling/latest`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { party } = req.query;
      const pollingData = await orchestrator.getPollingData(party as string);
      
      res.json({
        success: true,
        data: pollingData,
        metadata: {
          party: party || 'all',
          totalPolls: pollingData.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching polling data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch polling data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get polling data for specific party
  app.get(`${partyPath}/:party/polling`, rateLimit, async (req: Request, res: Response) => {
    try {
      const { party } = req.params;
      const pollingData = await orchestrator.getPollingData(party);
      
      res.json({
        success: true,
        data: pollingData,
        metadata: {
          party: party,
          totalPolls: pollingData.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error(`Error fetching polling data for ${req.params.party}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch polling data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Compare parties
  app.post(`${partyPath}/compare`, rateLimit, validateRequest, async (req: Request, res: Response) => {
    try {
      const { parties, metrics } = req.body;
      
      if (!parties || !Array.isArray(parties) || parties.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Please provide at least 2 parties to compare'
        });
      }

      const comparisonData = await Promise.all(
        parties.map(async (party: string) => {
          const partyData = await orchestrator.getPoliticalPartyData(party);
          const pollingData = await orchestrator.getPollingData(party);
          return {
            party: party,
            data: partyData,
            polling: pollingData
          };
        })
      );

      // Perform comparison analysis
      const comparison = await orchestrator.performPoliticalAnalysis('party_comparison', {
        parties: comparisonData,
        metrics: metrics || ['polling', 'seats', 'ideology']
      });

      res.json({
        success: true,
        data: {
          parties: comparisonData,
          comparison: comparison
        },
        metadata: {
          comparedParties: parties,
          metrics: metrics || ['polling', 'seats', 'ideology'],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error comparing parties:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare parties',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get party leaders
  app.get(`${partyPath}/leaders`, rateLimit, async (req: Request, res: Response) => {
    try {
      const parties = await orchestrator.getPoliticalPartyData();
      const leaders = Array.isArray(parties) ? parties.map(party => ({
        party: party.name,
        shortName: party.shortName,
        leader: party.leader,
        since: party.founded // This would be leader start date in production
      })) : [];

      res.json({
        success: true,
        data: leaders,
        metadata: {
          totalLeaders: leaders.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching party leaders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch party leaders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get party ideologies
  app.get(`${partyPath}/ideologies`, rateLimit, async (req: Request, res: Response) => {
    try {
      const parties = await orchestrator.getPoliticalPartyData();
      const ideologies = new Map<string, string[]>();

      if (Array.isArray(parties)) {
        parties.forEach(party => {
          party.ideology.forEach(ideology => {
            if (!ideologies.has(ideology)) {
              ideologies.set(ideology, []);
            }
            ideologies.get(ideology)?.push(party.shortName);
          });
        });
      }

      const ideologyData = Array.from(ideologies.entries()).map(([ideology, parties]) => ({
        ideology,
        parties,
        count: parties.length
      }));

      res.json({
        success: true,
        data: ideologyData,
        metadata: {
          totalIdeologies: ideologyData.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching party ideologies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch party ideologies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get seat distribution
  app.get(`${partyPath}/seats`, rateLimit, async (req: Request, res: Response) => {
    try {
      const parties = await orchestrator.getPoliticalPartyData();
      const seatData = Array.isArray(parties) ? parties.map(party => ({
        party: party.name,
        shortName: party.shortName,
        houseSeats: party.currentSeats.house,
        senateSeats: party.currentSeats.senate,
        totalSeats: party.currentSeats.house + party.currentSeats.senate
      })) : [];

      const totalHouseSeats = seatData.reduce((sum, party) => sum + party.houseSeats, 0);
      const totalSenateSeats = seatData.reduce((sum, party) => sum + party.senateSeats, 0);

      res.json({
        success: true,
        data: {
          parties: seatData,
          totals: {
            house: totalHouseSeats,
            senate: totalSenateSeats,
            combined: totalHouseSeats + totalSenateSeats
          }
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error fetching seat distribution:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch seat distribution',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
