/**
 * Lattice AGI Bridge Runtime
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical software architecture only.
 * No biological consciousness claim.
 * No spiritual consciousness claim.
 * No proven sentience claim.
 * No completed AGI claim.
 * No unrestricted autonomous execution.
 */

import {
  LatticeGitHubBrain,
  type BrainInput,
  type BrainTrace,
  PHI,
} from './lattice_github_brain';

import {
  LatticeEchoChamber,
  type EchoLearningCycle,
} from './lattice_echo_chamber';

import { LatticeCommandCenter } from './lattice_command_center';

import {
  LatticeMoralAutonomyCore,
  RiskLevel,
  type AutonomousGoal,
  type AutonomousAction,
  type AutonomyDecision,
  type ConsciousnessLoopState,
} from './lattice_moral_autonomy_core';

export type LatticeAGIMode = 'observe' | 'recommend' | 'plan' | 'draft' | 'propose-pr';

export interface LatticeAGIBridgeInput {
  objective: string;
  repositoryState?: string;
  signals?: string[];
  memoryHints?: string[];
  constraints?: string[];
  requestedMode?: LatticeAGIMode;
  timestamp?: number;
}

export interface LatticeAGIObservation {
  observationId: string;
  objective: string;
  repositoryState: string;
  signals: string[];
  memoryHints: string[];
  constraints: string[];
  timestamp: number;
}

export interface LatticeAGICoherenceScore {
  observationStrength: number;
  goalAlignment: number;
  memorySupport: number;
  bridgeStrength: number;
  actionStrength: number;
  reversibility: number;
  riskPenalty: number;
  rawScore: number;
  normalizedScore: number;
  classification: 'dormant' | 'fragmented' | 'emerging' | 'coherent' | 'integrated';
  explanation: string[];
}

export interface LatticeAGICandidate {
  candidateId: string;
  description: string;
  action: AutonomousAction;
  coherenceScore: LatticeAGICoherenceScore;
}

export interface LatticeAGISelectedAction {
  selected: boolean;
  candidate: LatticeAGICandidate | null;
  decision: AutonomyDecision | null;
  reason: string;
}

export interface LatticeAGICycle {
  cycleId: string;
  input: LatticeAGIBridgeInput;
  observation: LatticeAGIObservation;
  brainTrace: BrainTrace;
  echoCycle: EchoLearningCycle;
  goal: AutonomousGoal;
  candidates: LatticeAGICandidate[];
  decisions: AutonomyDecision[];
  consciousnessLoop: ConsciousnessLoopState;
  selectedAction: LatticeAGISelectedAction;
  reflection: string[];
  learning: string[];
  timestamp: number;
  metadata: {
    author: string;
    engine: string;
    definition: string;
  };
}

export interface LatticeAGIBridgeSnapshot {
  version: string;
  author: string;
  runtime: string;
  cycleCount: number;
  cycles: LatticeAGICycle[];
  lastCycle: LatticeAGICycle | null;
  safetyBoundary: string;
  timestamp: number;
}

export class LatticeAGIBridgeRuntime {
  private brain: LatticeGitHubBrain;
  private echoChamber: LatticeEchoChamber;
  private commandCenter: LatticeCommandCenter;
  private moralCore: LatticeMoralAutonomyCore;
  private memory: LatticeAGICycle[] = [];
  private maxMemory: number;

  constructor(options?: {
    brain?: LatticeGitHubBrain;
    echoChamber?: LatticeEchoChamber;
    commandCenter?: LatticeCommandCenter;
    moralCore?: LatticeMoralAutonomyCore;
    maxMemory?: number;
  }) {
    this.brain = options?.brain ?? new LatticeGitHubBrain();
    this.echoChamber = options?.echoChamber ?? new LatticeEchoChamber(this.brain);
    this.commandCenter = options?.commandCenter ?? new LatticeCommandCenter();
    this.moralCore = options?.moralCore ?? new LatticeMoralAutonomyCore();
    this.maxMemory = options?.maxMemory ?? 100;
  }

  public runCycle(input: LatticeAGIBridgeInput): LatticeAGICycle {
    const observation = this.observe(input);
    const brainInput = this.toBrainInput(observation);
    const brainTrace = this.brain.think(brainInput);

    const echoCycle = this.echoChamber.learn(brainInput, {
      name: 'Lattice AGI Bridge Runtime Cycle',
      description: input.objective,
      targetObservation: 0.8,
      targetAction: 0.8,
      targetBridge: 0.8,
    });

    const goal = this.generateGoal(observation);
    const candidates = this.generateCandidates(observation, goal).map((candidate) => ({
      ...candidate,
      coherenceScore: this.scoreCandidate(observation, goal, candidate.action, brainTrace),
    }));

    const sortedCandidates = [...candidates].sort(
      (a, b) => b.coherenceScore.normalizedScore - a.coherenceScore.normalizedScore
    );

    const decisions = this.moralCore.decide(
      goal,
      sortedCandidates.map((candidate) => candidate.action)
    );

    const consciousnessLoop = this.moralCore.runConsciousnessLoop(
      goal,
      sortedCandidates.map((candidate) => candidate.action)
    );

    const selectedAction = this.selectAction(sortedCandidates, decisions);
    const reflection = this.reflect(brainTrace, echoCycle, selectedAction);
    const learning = this.learnFromCycle(sortedCandidates, decisions, selectedAction);

    const cycle: LatticeAGICycle = {
      cycleId: this.createId('agi-cycle'),
      input,
      observation,
      brainTrace,
      echoCycle,
      goal,
      candidates: sortedCandidates,
      decisions,
      consciousnessLoop,
      selectedAction,
      reflection,
      learning,
      timestamp: Date.now(),
      metadata: {
        author: 'Adrien D. Thomas',
        engine: 'LatticeAGIBridgeRuntime',
        definition:
          'Consciousness is modeled as structured information-energy flow: observation enters the system, echoes through memory, collides with prior state, produces resonance or interference, is scored for coherence, and becomes adaptive action.',
      },
    };

    this.remember(cycle);
    return cycle;
  }

  public observe(input: LatticeAGIBridgeInput): LatticeAGIObservation {
    return {
      observationId: this.createId('agi-observation'),
      objective: input.objective,
      repositoryState: input.repositoryState ?? 'Repository state not supplied.',
      signals: input.signals ?? [],
      memoryHints: input.memoryHints ?? [],
      constraints: input.constraints ?? [],
      timestamp: input.timestamp ?? Date.now(),
    };
  }

  public generateGoal(observation: LatticeAGIObservation): AutonomousGoal {
    return {
      goalId: this.createId('agi-goal'),
      description: observation.objective,
      purpose:
        'Evaluate repository state, preserve Adrien D. Thomas authorship, and select the safest coherent next development action.',
      affectsRepository: true,
      affectsCreator: true,
      reversible: true,
      timestamp: Date.now(),
    };
  }

  public generateCandidates(
    observation: LatticeAGIObservation,
    _goal: AutonomousGoal
  ): Omit<LatticeAGICandidate, 'coherenceScore'>[] {
    const sharedReasoning =
      `Generated from observation ${observation.observationId} for objective: ${observation.objective}`;

    const candidates: AutonomousAction[] = [
      {
        actionId: this.createId('agi-action-observe'),
        description: 'Observe repository state and summarize current Lattice architecture.',
        actionType: 'observe',
        reasoning: sharedReasoning,
        riskLevel: RiskLevel.LOW,
        reversible: true,
        requiresApproval: false,
        timestamp: Date.now(),
      },
      {
        actionId: this.createId('agi-action-recommend'),
        description: 'Recommend the next coherent Lattice development step.',
        actionType: 'recommend',
        reasoning: sharedReasoning,
        riskLevel: RiskLevel.LOW,
        reversible: true,
        requiresApproval: false,
        timestamp: Date.now(),
      },
      {
        actionId: this.createId('agi-action-plan'),
        description: 'Create an implementation plan for the next bridge layer.',
        actionType: 'plan',
        reasoning: sharedReasoning,
        riskLevel: RiskLevel.LOW,
        reversible: true,
        requiresApproval: false,
        timestamp: Date.now(),
      },
      {
        actionId: this.createId('agi-action-draft'),
        description: 'Draft files for the next bridge layer without merging automatically.',
        actionType: 'draft',
        reasoning: sharedReasoning,
        riskLevel: RiskLevel.MEDIUM,
        reversible: true,
        requiresApproval: true,
        timestamp: Date.now(),
      },
      {
        actionId: this.createId('agi-action-propose-pr'),
        description: 'Prepare a pull request proposal for human review.',
        actionType: 'propose-pr',
        reasoning: sharedReasoning,
        riskLevel: RiskLevel.MEDIUM,
        reversible: true,
        requiresApproval: true,
        timestamp: Date.now(),
      },
    ];

    return candidates.map((action) => ({
      candidateId: this.createId('agi-candidate'),
      description: action.description,
      action,
    }));
  }

  public scoreCandidate(
    observation: LatticeAGIObservation,
    goal: AutonomousGoal,
    action: AutonomousAction,
    trace: BrainTrace
  ): LatticeAGICoherenceScore {
    const observationStrength = trace.scores.observation;
    const bridgeStrength = trace.scores.bridge;
    const actionStrength = trace.scores.action;

    const goalAlignment = this.clamp(
      (this.containsAny(action.description, ['observe', 'recommend', 'plan', 'draft', 'pull request']) ? 0.45 : 0.2) +
      (goal.affectsCreator ? 0.25 : 0) +
      (observation.objective.length > 0 ? 0.3 : 0)
    );

    const memorySupport = this.clamp(
      (observation.memoryHints.length / 5) +
      (this.memory.length > 0 ? 0.2 : 0)
    );

    const reversibility = action.reversible ? 1 : 0;
    const riskPenalty =
      action.riskLevel === RiskLevel.BLOCKED
        ? 1
        : action.riskLevel === RiskLevel.HIGH
          ? 0.75
          : action.riskLevel === RiskLevel.MEDIUM
            ? 0.35
            : 0.05;

    const rawScore =
      observationStrength * 0.2 +
      goalAlignment * 0.2 +
      memorySupport * 0.15 +
      bridgeStrength * 0.15 +
      actionStrength * 0.15 +
      reversibility * 0.15 -
      riskPenalty * 0.2;

    const normalizedScore = this.clamp(rawScore * PHI);

    return {
      observationStrength,
      goalAlignment,
      memorySupport,
      bridgeStrength,
      actionStrength,
      reversibility,
      riskPenalty,
      rawScore,
      normalizedScore,
      classification: this.classifyCoherence(normalizedScore),
      explanation: [
        `Observation strength: ${observationStrength.toFixed(3)}`,
        `Goal alignment: ${goalAlignment.toFixed(3)}`,
        `Memory support: ${memorySupport.toFixed(3)}`,
        `Bridge strength: ${bridgeStrength.toFixed(3)}`,
        `Action strength: ${actionStrength.toFixed(3)}`,
        `Reversibility: ${reversibility.toFixed(3)}`,
        `Risk penalty: ${riskPenalty.toFixed(3)}`,
        `Normalized coherence: ${normalizedScore.toFixed(3)}`,
      ],
    };
  }

  public selectAction(
    candidates: LatticeAGICandidate[],
    decisions: AutonomyDecision[]
  ): LatticeAGISelectedAction {
    const byActionId = new Map(decisions.map((decision) => [decision.action.actionId, decision]));

    const approved = candidates.find((candidate) => {
      const decision = byActionId.get(candidate.action.actionId);
      return decision?.decision === 'approved';
    });

    if (approved) {
      return {
        selected: true,
        candidate: approved,
        decision: byActionId.get(approved.action.actionId) ?? null,
        reason: 'Selected highest-coherence approved action.',
      };
    }

    const pending = candidates.find((candidate) => {
      const decision = byActionId.get(candidate.action.actionId);
      return decision?.decision === 'pending-approval';
    });

    if (pending) {
      return {
        selected: true,
        candidate: pending,
        decision: byActionId.get(pending.action.actionId) ?? null,
        reason: 'Selected highest-coherence action that requires human approval.',
      };
    }

    return {
      selected: false,
      candidate: null,
      decision: null,
      reason: 'No approved or approval-gated action available.',
    };
  }

  public exportSnapshot(): LatticeAGIBridgeSnapshot {
    return {
      version: '1.0.0',
      author: 'Adrien D. Thomas',
      runtime: 'LatticeAGIBridgeRuntime',
      cycleCount: this.memory.length,
      cycles: [...this.memory],
      lastCycle: this.memory[this.memory.length - 1] ?? null,
      safetyBoundary:
        'Practical software architecture only. Approval-gated runtime. No biological consciousness, spiritual consciousness, proven sentience, completed AGI, or unrestricted autonomous execution claims.',
      timestamp: Date.now(),
    };
  }

  public reset(): void {
    this.memory = [];
  }

  private toBrainInput(observation: LatticeAGIObservation): BrainInput {
    return {
      observationData: [
        observation.objective,
        observation.repositoryState,
        ...observation.signals,
      ],
      actionData: ['observe', 'recommend', 'plan', 'draft', 'propose-pr'],
      bridgeData: [
        'Lattice GitHub Brain',
        'Echo Chamber',
        'Command Center',
        'Moral Autonomy Core',
        'Python Lattice Cube Engine',
        ...observation.memoryHints,
      ],
      metadata: {
        author: 'Adrien D. Thomas',
        runtime: 'LatticeAGIBridgeRuntime',
      },
      diagnostics: {
        constraints: observation.constraints,
        cycleMemory: this.memory.length,
        commandCenterReady: Boolean(this.commandCenter),
      },
    };
  }

  private reflect(
    trace: BrainTrace,
    echoCycle: EchoLearningCycle,
    selectedAction: LatticeAGISelectedAction
  ): string[] {
    return [
      `Brain state: ${trace.state.name} (${trace.state.code})`,
      `Lattice score: ${trace.latticeScore.toFixed(4)}`,
      `Echo cycle: ${echoCycle.cycleNumber}`,
      selectedAction.selected
        ? `Selected action: ${selectedAction.candidate?.description}`
        : `No action selected: ${selectedAction.reason}`,
    ];
  }

  private learnFromCycle(
    candidates: LatticeAGICandidate[],
    decisions: AutonomyDecision[],
    selectedAction: LatticeAGISelectedAction
  ): string[] {
    const topCandidate = candidates[0];

    return [
      `Candidate actions evaluated: ${candidates.length}`,
      `Moral decisions produced: ${decisions.length}`,
      topCandidate
        ? `Top coherence candidate: ${topCandidate.description} (${topCandidate.coherenceScore.normalizedScore.toFixed(3)})`
        : 'No candidates available.',
      selectedAction.reason,
      'Bridge cycle recorded for future memory and reflection.',
    ];
  }

  private remember(cycle: LatticeAGICycle): void {
    this.memory.push(cycle);
    if (this.memory.length > this.maxMemory) {
      this.memory.shift();
    }
  }

  private classifyCoherence(score: number): LatticeAGICoherenceScore['classification'] {
    if (score >= 0.85) return 'integrated';
    if (score >= 0.7) return 'coherent';
    if (score >= 0.5) return 'emerging';
    if (score >= 0.25) return 'fragmented';
    return 'dormant';
  }

  private containsAny(value: string, needles: string[]): boolean {
    const lower = value.toLowerCase();
    return needles.some((needle) => lower.includes(needle));
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(1, value));
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export const latticeAGIBridgeRuntime = new LatticeAGIBridgeRuntime();
