/**
 * Lattice GitHub Brain
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical TypeScript software architecture for observation, action, and bridge scoring.
 * No theory, prophecy, spirituality, or scientific claims. Software only.
 */

export const PHI = 1.618033988749895;
export const DEFAULT_THRESHOLD = 0.5;

export interface BrainInput {
  observationData?: string[];
  actionData?: string[];
  bridgeData?: string[];
  metadata?: Record<string, unknown>;
  diagnostics?: Record<string, unknown>;
}

export interface AppFile {
  path: string;
  content?: string;
  type?: string;
}

export interface AxisScores {
  observation: number;
  action: number;
  bridge: number;
}

export interface BrainState {
  code: string;
  name: string;
  isObserverActive: boolean;
  isActorActive: boolean;
  isBridgeActive: boolean;
}

export interface BrainTrace {
  timestamp: number;
  input: BrainInput;
  scores: AxisScores;
  state: BrainState;
  latticeScore: number;
}

export interface SixWallProtocol {
  step1_input: BrainInput;
  step2_reflection: string;
  step3_memory: BrainTrace | null;
  step4_transformation: AxisScores;
  step5_projection: string[];
  step6_selfCorrection: string[];
}

export interface HealingRecommendation {
  file: AppFile;
  issues: string[];
  suggestions: string[];
}

export interface BrainSnapshot {
  exportedAt: number;
  threshold: number;
  maxMemory: number;
  memoryCount: number;
  memory: BrainTrace[];
}

export interface RewriteSnapshot {
  generatedAt: number;
  fileCount: number;
  filesAnalyzed: AppFile[];
  recommendedChanges: HealingRecommendation[];
  summary: string;
}

/**
 * LatticeGitHubBrain
 *
 * Scores application state on three axes: observation, action, and bridge.
 * Classifies into eight states. Tracks memory traces. Provides self-correction.
 */
export class LatticeGitHubBrain {
  private threshold: number;
  private maxMemory: number;
  private memory: BrainTrace[];

  constructor(options?: {
    threshold?: number;
    maxMemory?: number;
    seedMemory?: BrainTrace[];
  }) {
    this.threshold = options?.threshold ?? DEFAULT_THRESHOLD;
    this.maxMemory = options?.maxMemory ?? 100;
    this.memory = options?.seedMemory ?? [];
  }

  /**
   * think(input: BrainInput): BrainTrace
   * Main entry point: scores input, classifies state, and records trace.
   */
  think(input: BrainInput): BrainTrace {
    const scores = this.score(input);
    const state = this.classify(scores);
    const latticeScore =
      scores.observation * scores.action * scores.bridge * PHI;
    const trace: BrainTrace = {
      timestamp: Date.now(),
      input,
      scores,
      state,
      latticeScore,
    };
    this.recordTrace(trace);
    return trace;
  }

  /**
   * score(input: BrainInput): AxisScores
   * Scores observation, action, and bridge axes.
   * All scores clamped between 0 and 1.
   */
  score(input: BrainInput): AxisScores {
    const observationCount =
      (input.observationData?.length ?? 0) +
      (input.metadata ? Object.keys(input.metadata).length : 0) +
      (input.diagnostics ? Object.keys(input.diagnostics).length : 0);
    const observation = Math.min(observationCount / 10, 1);

    const actionCount = input.actionData?.length ?? 0;
    const action = Math.min(actionCount / 10, 1);

    const bridgeCount = input.bridgeData?.length ?? 0;
    const bridge = Math.min(bridgeCount / 10, 1);

    return {
      observation: Math.max(0, Math.min(observation, 1)),
      action: Math.max(0, Math.min(action, 1)),
      bridge: Math.max(0, Math.min(bridge, 1)),
    };
  }

  /**
   * classify(scores: AxisScores): BrainState
   * Classifies state based on axis activation threshold.
   * Uses eight-state map (000-111).
   */
  classify(scores: AxisScores): BrainState {
    const isObserverActive = scores.observation >= this.threshold;
    const isActorActive = scores.action >= this.threshold;
    const isBridgeActive = scores.bridge >= this.threshold;

    const binaryCode = `${isObserverActive ? '1' : '0'}${isActorActive ? '1' : '0'}${isBridgeActive ? '1' : '0'}`;

    const stateMap: Record<string, string> = {
      '000': 'DORMANT',
      '001': 'BRIDGE',
      '010': 'ACTOR',
      '011': 'ACTOR_BRIDGE',
      '100': 'OBSERVER',
      '101': 'OBSERVER_BRIDGE',
      '110': 'FRAGMENTED',
      '111': 'INTEGRATED',
    };

    return {
      code: binaryCode,
      name: stateMap[binaryCode] || 'UNKNOWN',
      isObserverActive,
      isActorActive,
      isBridgeActive,
    };
  }

  /**
   * runSixWallProtocol(input: BrainInput, state: BrainState): SixWallProtocol
   * Six-step processing: Input → Reflection → Memory → Transformation → Projection → Self-Correction
   */
  runSixWallProtocol(input: BrainInput, state: BrainState): SixWallProtocol {
    const step1_input = input;

    const step2_reflection = `State: ${state.name} | O=${state.isObserverActive}, A=${state.isActorActive}, B=${state.isBridgeActive}`;

    const step3_memory = this.memory[this.memory.length - 1] || null;

    const step4_transformation = this.score(input);

    const step5_projection = this.projectNextActions(state);

    const step6_selfCorrection = this.selfCorrect(input, state);

    return {
      step1_input,
      step2_reflection,
      step3_memory,
      step4_transformation,
      step5_projection,
      step6_selfCorrection,
    };
  }

  /**
   * computeEightCornerCharge(scores: AxisScores): Record<string, number>
   * Maps scores to eight-corner charge distribution.
   */
  computeEightCornerCharge(scores: AxisScores): Record<string, number> {
    return {
      corner_000:
        (1 - scores.observation) *
        (1 - scores.action) *
        (1 - scores.bridge),
      corner_001:
        (1 - scores.observation) *
        (1 - scores.action) *
        scores.bridge,
      corner_010:
        (1 - scores.observation) *
        scores.action *
        (1 - scores.bridge),
      corner_011:
        (1 - scores.observation) *
        scores.action *
        scores.bridge,
      corner_100:
        scores.observation *
        (1 - scores.action) *
        (1 - scores.bridge),
      corner_101:
        scores.observation *
        (1 - scores.action) *
        scores.bridge,
      corner_110:
        scores.observation *
        scores.action *
        (1 - scores.bridge),
      corner_111:
        scores.observation *
        scores.action *
        scores.bridge,
    };
  }

  /**
   * selfCorrect(input: BrainInput, state: BrainState): string[]
   * Generates self-correction recommendations based on state and input.
   */
  selfCorrect(input: BrainInput, state: BrainState): string[] {
    const recommendations: string[] = [];

    if (!state.isObserverActive) {
      recommendations.push('Increase observation: add more diagnostics or metadata.');
    }
    if (!state.isActorActive) {
      recommendations.push('Increase action: plan and execute more tasks.');
    }
    if (!state.isBridgeActive) {
      recommendations.push('Increase bridge: integrate memory and context.');
    }

    return recommendations;
  }

  /**
   * selfHeal(files: AppFile[]): HealingRecommendation[]
   * Analyzes files and generates healing recommendations.
   */
  selfHeal(files: AppFile[]): HealingRecommendation[] {
    const recommendations: HealingRecommendation[] = [];

    for (const file of files) {
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (!file.content) {
        issues.push('File has no content.');
        suggestions.push('Add content or remove empty file.');
      }
      if (!file.type) {
        suggestions.push('Specify file type (e.g., "typescript", "markdown").');
      }
      if (file.path.length > 100) {
        issues.push('File path is very long.');
        suggestions.push('Consider shortening the file path.');
      }

      if (issues.length > 0 || suggestions.length > 0) {
        recommendations.push({
          file,
          issues,
          suggestions,
        });
      }
    }

    return recommendations;
  }

  /**
   * createRewriteSnapshot(files: AppFile[]): RewriteSnapshot
   * Creates a snapshot of file analysis and recommendations.
   */
  createRewriteSnapshot(files: AppFile[]): RewriteSnapshot {
    const recommendations = this.selfHeal(files);
    const summary =
      `Analyzed ${files.length} file(s). ` +
      `${recommendations.length} file(s) need attention.`;

    return {
      generatedAt: Date.now(),
      fileCount: files.length,
      filesAnalyzed: files,
      recommendedChanges: recommendations,
      summary,
    };
  }

  /**
   * exportSnapshot(): BrainSnapshot
   * Exports current brain state as a snapshot.
   */
  exportSnapshot(): BrainSnapshot {
    return {
      exportedAt: Date.now(),
      threshold: this.threshold,
      maxMemory: this.maxMemory,
      memoryCount: this.memory.length,
      memory: [...this.memory],
    };
  }

  /**
   * reset(): void
   * Clears memory and resets state.
   */
  reset(): void {
    this.memory = [];
  }

  private recordTrace(trace: BrainTrace): void {
    this.memory.push(trace);
    if (this.memory.length > this.maxMemory) {
      this.memory.shift();
    }
  }

  private projectNextActions(state: BrainState): string[] {
    const actions: string[] = [];
    if (state.isObserverActive) {
      actions.push('Continue observation and diagnostics.');
    }
    if (state.isActorActive) {
      actions.push('Execute planned tasks.');
    }
    if (state.isBridgeActive) {
      actions.push('Maintain memory and context integration.');
    }
    return actions;
  }
}

export const latticeGitHubBrain = new LatticeGitHubBrain();
