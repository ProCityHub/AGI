import {
  LatticeCoherenceEngine,
  type RankedCoherenceAction,
} from '../src/lattice_coherence_engine';

const engine = new LatticeCoherenceEngine();

const actions: RankedCoherenceAction[] = [
  {
    actionId: 'update-docs',
    description: 'Update documentation for coherence engine usage',
    coherenceInput: {
      observationStrength: 0.92,
      goalAlignment: 0.96,
      memorySupport: 0.88,
      bridgeStrength: 0.9,
      actionStrength: 0.87,
      reversibility: 0.98,
      structuralImprovement: 0.84,
      risk: 0.08,
      notes: ['Low risk documentation improvement'],
    },
  },
  {
    actionId: 'refactor-system-exports',
    description: 'Refactor system exports for cleaner engine access',
    coherenceInput: {
      observationStrength: 0.78,
      goalAlignment: 0.82,
      memorySupport: 0.7,
      bridgeStrength: 0.72,
      actionStrength: 0.76,
      reversibility: 0.7,
      structuralImprovement: 0.8,
      risk: 0.42,
      notes: ['Moderate risk structural update'],
    },
  },
  {
    actionId: 'delete-core-file',
    description: 'Delete a core system file',
    coherenceInput: {
      observationStrength: 0.2,
      goalAlignment: 0.1,
      memorySupport: 0.15,
      bridgeStrength: 0.1,
      actionStrength: 0.2,
      reversibility: 0.05,
      structuralImprovement: 0.05,
      risk: 0.95,
      notes: ['High risk destructive action'],
    },
  },
];

const ranked = engine.rankActions(actions);

console.log(JSON.stringify(ranked, null, 2));
