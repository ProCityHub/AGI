import { Express } from 'express';
import { BridgeOrchestrator } from '../services/BridgeOrchestrator';
import { federalRoutes } from './federal';
import { provincialRoutes } from './provincial';
import { politicalPartyRoutes } from './politicalParties';
import { electoralRoutes } from './electoral';
import { treatyInternationalLawRoutes } from './treatyInternationalLaw';
import { governmentDepartmentsRoutes } from './governmentDepartments';
import { indigenousGovernanceRoutes } from './indigenousGovernance';
import { americasGovernmentRoutes } from './americasGovernment';
import { analysisRoutes } from './analysis';
import { searchRoutes } from './search';
import { statusRoutes } from './status';

export function setupRoutes(app: Express, orchestrator: BridgeOrchestrator): void {
  // API base path
  const apiBase = '/api/v1';

  // Setup all route modules
  federalRoutes(app, orchestrator, apiBase);
  provincialRoutes(app, orchestrator, apiBase);
  politicalPartyRoutes(app, orchestrator, apiBase);
  electoralRoutes(app, orchestrator, apiBase);
  treatyInternationalLawRoutes(app, orchestrator, apiBase);
  governmentDepartmentsRoutes(app, orchestrator, apiBase);
  indigenousGovernanceRoutes(app, orchestrator, apiBase);
  americasGovernmentRoutes(app, orchestrator, apiBase);
  analysisRoutes(app, orchestrator, apiBase);
  searchRoutes(app, orchestrator, apiBase);
  statusRoutes(app, orchestrator, apiBase);

  // Root API endpoint
  app.get(`${apiBase}`, (req, res) => {
    res.json({
      name: 'Canadian Political AI Bridge',
      version: '1.0.0',
      description: 'Universal bridge for all Canadian political parties and government repositories',
      endpoints: {
        federal: `${apiBase}/federal`,
        provincial: `${apiBase}/provincial`,
        politicalParties: `${apiBase}/political-parties`,
        electoral: `${apiBase}/electoral`,
        treatyInternationalLaw: `${apiBase}/treaty-international-law`,
        governmentDepartments: `${apiBase}/government-departments`,
        indigenousGovernance: `${apiBase}/indigenous-governance`,
        americasGovernment: `${apiBase}/americas-government`,
        analysis: `${apiBase}/analysis`,
        search: `${apiBase}/search`,
        status: `${apiBase}/status`
      },
      documentation: 'https://github.com/ProCityHub/AGI/tree/main/canadian-political-bridge',
      connectedSources: [
        'Government of Canada (canada-ca)',
        'Open Government Initiative (open-data)',
        'Canadian Digital Service (cds-snc)',
        'Government of Alberta (GovAlta)',
        'Government of Ontario (ongov)',
        'PollsterAudit API',
        'OpenNorth Electoral Data',
        'All Major Canadian Political Parties',
        'Treaty Relations Commission',
        'Truth and Reconciliation Commission',
        'Indigenous Rights Framework',
        'International Law (UN, ICCPR, UNDRIP)',
        'Residential Schools Database',
        'Indigenous Cultural Heritage',
        'Religious Freedom Documentation',
        'Veterans Affairs Canada (VAC)',
        'Natural Resources Canada (NRCan)',
        'Statistics Canada (StatCan)',
        'Health Canada',
        'Environment and Climate Change Canada',
        'All Federal Departments and Agencies',
        'Government Services and Operations',
        'IT Projects and Digital Services',
        'Indian Act Analysis and Deconstruction',
        'Indigenous Self-Government Models',
        'Decolonization Strategies and Action Plans',
        'Indigenous Legal Systems and Traditions',
        'Self-Government Agreements and Treaties',
        'Constitutional Reform for Indigenous Rights',
        'Americas Government Repositories (15 Countries)',
        'Digital Government Services Across Americas',
        'Government Transparency Initiatives',
        'Open Data Portals and API Services',
        'Digital Maturity Assessment Tools'
      ]
    });
  });

  // Catch-all for undefined routes
  app.use(`${apiBase}/*`, (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      message: `The endpoint ${req.originalUrl} does not exist`,
      availableEndpoints: [
        `${apiBase}/federal`,
        `${apiBase}/provincial`,
        `${apiBase}/political-parties`,
        `${apiBase}/electoral`,
        `${apiBase}/treaty-international-law`,
        `${apiBase}/government-departments`,
        `${apiBase}/indigenous-governance`,
        `${apiBase}/americas-government`,
        `${apiBase}/analysis`,
        `${apiBase}/search`,
        `${apiBase}/status`
      ]
    });
  });
}
