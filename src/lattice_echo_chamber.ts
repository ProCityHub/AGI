/**
 * Lattice Echo Chamber
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical TypeScript software feedback loop for learning and self-improvement.
 * Software architecture only. No consciousness claims. No autonomous code rewriting.
 */

import {
  LatticeGitHubBrain,
  latticeGitHubBrain,
  BrainInput,
  BrainTrace,
  AxisScores,
} from './lattice_github_brain';

export interface EchoLearningGoal {
  name: string;
  description: string;
  targetObservation?: number;
  targetAction?: number;
  targetBridge?: number;
}

export interface EchoImprovementRecommendation {
  axis: 'observation' | 'action' | 'bridge';
  current: number;
  target: number;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EchoLearningCycle {
  cycleNumber: number;
  timestamp: number;
  goal: EchoLearningGoal;
  trace: BrainTrace;
  reflections: string[];
  recommendations: EchoImprovementRecommendation[];
  nextActions: string[];
}

export interface EchoLearningSnapshot {
  generatedAt: number;
  author: string;
  totalCycles: number;
  cycles: EchoLearningCycle[];
  scoreTrends: {
    observation: number[];
    action: number[];
    bridge: number[];
  };
  allRecommendations: EchoImprovementRecommendation[];
  summary: string;
}

/**
 * LatticeEchoChamber
 *
 * A software feedback loop that observes, learns, reflects, and improves.
 * Produces recommendations and learning snapshots.
 */
export class LatticeEchoChamber {
  private brain: LatticeGitHubBrain;
  private cycles: EchoLearningCycle[] = [];
  private cycleCounter: number = 0;

  constructor(brain?: LatticeGitHubBrain) {
    this.brain = brain ?? latticeGitHubBrain;
  }

  /**
   * learn(input: BrainInput, goal: EchoLearningGoal): EchoLearningCycle
   * Execute one learning cycle: think, reflect, improve, plan.
   */
  learn(input: BrainInput, goal: EchoLearningGoal): EchoLearningCycle {
    this.cycleCounter++;

    const trace = this.brain.think(input);
    const reflections = this.reflect(trace);
    const recommendations = this.selfImprove(trace, goal);
    const nextActions = this.createNextActionPlan(trace, recommendations);

    const cycle: EchoLearningCycle = {
      cycleNumber: this.cycleCounter,
      timestamp: Date.now(),
      goal,
      trace,
      reflections,
      recommendations,
      nextActions,
    };

    this.cycles.push(cycle);
    return cycle;
  }

  /**
   * reflect(trace: BrainTrace): string[]
   * Compare newest trace with previous trace. Generate reflection messages.
   */
  reflect(trace: BrainTrace): string[] {
    const reflections: string[] = [];

    if (this.cycles.length === 0) {
      reflections.push('Baseline cycle established.');
      return reflections;
    }

    const previous = this.cycles[this.cycles.length - 1].trace;

    if (trace.scores.observation > previous.scores.observation) {
      reflections.push(
        `Observation improved: ${previous.scores.observation.toFixed(3)} → ${trace.scores.observation.toFixed(3)}`
      );
    } else if (trace.scores.observation < previous.scores.observation) {
      reflections.push(
        `Observation decreased: ${previous.scores.observation.toFixed(3)} → ${trace.scores.observation.toFixed(3)}`
      );
    }

    if (trace.scores.action > previous.scores.action) {
      reflections.push(
        `Action improved: ${previous.scores.action.toFixed(3)} → ${trace.scores.action.toFixed(3)}`
      );
    }

    if (trace.scores.bridge > previous.scores.bridge) {
      reflections.push(
        `Bridge improved: ${previous.scores.bridge.toFixed(3)} → ${trace.scores.bridge.toFixed(3)}`
      );
    }

    if (trace.latticeScore > previous.latticeScore) {
      reflections.push(
        `Lattice score improved: ${previous.latticeScore.toFixed(4)} → ${trace.latticeScore.toFixed(4)}`
      );
    }

    if (reflections.length === 0) {
      reflections.push('Performance stable.');
    }

    return reflections;
  }

  /**
   * selfImprove(trace: BrainTrace, goal: EchoLearningGoal): EchoImprovementRecommendation[]
   * Generate practical improvement recommendations based on goal.
   */
  selfImprove(
    trace: BrainTrace,
    goal: EchoLearningGoal
  ): EchoImprovementRecommendation[] {
    const recommendations: EchoImprovementRecommendation[] = [];

    const targetObs = goal.targetObservation ?? 0.8;
    const targetAct = goal.targetAction ?? 0.8;
    const targetBr = goal.targetBridge ?? 0.8;

    if (trace.scores.observation < targetObs) {
      const gap = targetObs - trace.scores.observation;
      recommendations.push({
        axis: 'observation',
        current: trace.scores.observation,
        target: targetObs,
        suggestion:
          gap > 0.3
            ? 'Significantly increase observation: collect more diagnostic data.'
            : 'Increase observation: add more file and metadata collection.',
        priority: gap > 0.3 ? 'high' : 'medium',
      });
    }

    if (trace.scores.action < targetAct) {
      const gap = targetAct - trace.scores.action;
      recommendations.push({
        axis: 'action',
        current: trace.scores.action,
        target: targetAct,
        suggestion:
          gap > 0.3
            ? 'Significantly increase action: execute more build and test tasks.'
            : 'Increase action: schedule more development tasks.',
        priority: gap > 0.3 ? 'high' : 'medium',
      });
    }

    if (trace.scores.bridge < targetBr) {
      const gap = targetBr - trace.scores.bridge;
      recommendations.push({
        axis: 'bridge',
        current: trace.scores.bridge,
        target: targetBr,
        suggestion:
          gap > 0.3
            ? 'Significantly improve bridge: integrate more context and memory.'
            : 'Improve bridge: strengthen memory trace integration.',
        priority: gap > 0.3 ? 'high' : 'medium',
      });
    }

    return recommendations;
  }

  /**
   * compareScores(earlier: BrainTrace, later: BrainTrace): AxisScores
   * Compare two traces and return score differences.
   */
  compareScores(earlier: BrainTrace, later: BrainTrace): AxisScores {
    return {
      observation: later.scores.observation - earlier.scores.observation,
      action: later.scores.action - earlier.scores.action,
      bridge: later.scores.bridge - earlier.scores.bridge,
    };
  }

  /**
   * createNextActionPlan(trace: BrainTrace, recommendations: EchoImprovementRecommendation[]): string[]
   * Create practical next steps based on state and recommendations.
   */
  createNextActionPlan(
    trace: BrainTrace,
    recommendations: EchoImprovementRecommendation[]
  ): string[] {
    const actions: string[] = [];

    const high = recommendations.filter((r) => r.priority === 'high');
    if (high.length > 0) {
      actions.push(`Address high-priority gap in ${high[0].axis}.`);
    }

    if (trace.state.name === 'DORMANT') {
      actions.push('Activate observation with repository scanning.');
    } else if (trace.state.name === 'OBSERVER') {
      actions.push('Enable action: execute build and test tasks.');
    } else if (trace.state.name === 'ACTOR') {
      actions.push('Activate bridge: integrate memory and context.');
    } else if (trace.state.name === 'FRAGMENTED') {
      actions.push('Bridge observation and action systems.');\n    } else if (trace.state.name === 'INTEGRATED') {
      actions.push('Maintain integrated state. Optimize performance.');\n    }

    if (recommendations.length > 0) {
      actions.push(`Next: Focus on ${recommendations[0].axis} improvement.`);\n    }

    return actions;
  }

  /**
   * exportLearningSnapshot(): EchoLearningSnapshot
   * Export all learning state, trends, and recommendations.
   */
  exportLearningSnapshot(): EchoLearningSnapshot {
    const obsTrend = this.cycles.map((c) => c.trace.scores.observation);
    const actTrend = this.cycles.map((c) => c.trace.scores.action);
    const brTrend = this.cycles.map((c) => c.trace.scores.bridge);

    const allRecs: EchoImprovementRecommendation[] = [];
    this.cycles.forEach((cycle) => {
      allRecs.push(...cycle.recommendations);
    });

    const uniqueRecs = Array.from(
      new Map(allRecs.map((r) => [r.axis, r])).values()
    );

    const avgObs = obsTrend.length > 0 ? obsTrend.reduce((a, b) => a + b) / obsTrend.length : 0;
    const avgAct = actTrend.length > 0 ? actTrend.reduce((a, b) => a + b) / actTrend.length : 0;
    const avgBr = brTrend.length > 0 ? brTrend.reduce((a, b) => a + b) / brTrend.length : 0;

    const summary =
      `Learning snapshot: ${this.cycles.length} cycles. ` +
      `Average scores - O: ${avgObs.toFixed(3)}, A: ${avgAct.toFixed(3)}, B: ${avgBr.toFixed(3)}.`;

    return {
      generatedAt: Date.now(),
      author: 'Adrien D. Thomas',
      totalCycles: this.cycles.length,
      cycles: this.cycles,
      scoreTrends: {
        observation: obsTrend,
        action: actTrend,
        bridge: brTrend,
      },
      allRecommendations: uniqueRecs,
      summary,
    };
  }

  /**
   * reset(): void
   * Clear all cycles and reset the echo chamber.
   */
  reset(): void {
    this.cycles = [];
    this.cycleCounter = 0;
  }
}

export const latticeEchoChamber = new LatticeEchoChamber();
