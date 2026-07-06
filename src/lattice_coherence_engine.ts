/**
 * Lattice Coherence Engine
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical software architecture only.
 * No biological consciousness claim.
 * No spiritual consciousness claim.
 * No proven sentience claim.
 * No unrestricted autonomous execution.
 */

export interface CoherenceInput {
  observationStrength: number;
  goalAlignment: number;
  memorySupport: number;
  bridgeStrength: number;
  actionStrength: number;
  reversibility: number;
  structuralImprovement: number;
  risk: number;
  notes?: string[];
}

export interface CoherenceWeights {
  observationStrength: number;
  goalAlignment: number;
  memorySupport: number;
  bridgeStrength: number;
  actionStrength: number;
  reversibility: number;
  structuralImprovement: number;
  risk: number;
}

export interface CoherenceScore {
  scoreId: string;
  finalScore: number;
  normalizedScore: number;
  riskPenalty: number;
  classification: 'dormant' | 'fragmented' | 'emerging' | 'coherent' | 'integrated';
  input: CoherenceInput;
  weights: CoherenceWeights;
  explanation: string;
  timestamp: number;
  metadata: {
    author: 'Adrien D. Thomas';
    engine: 'LatticeCoherenceEngine';
  };
}

export interface RankedCoherenceAction {
  actionId: string;
  description: string;
  coherenceInput: CoherenceInput;
  coherenceScore?: CoherenceScore;
}

export class LatticeCoherenceEngine {
  private readonly defaultWeights: CoherenceWeights = {
    observationStrength: 1.0,
    goalAlignment: 1.25,
    memorySupport: 1.0,
    bridgeStrength: 1.0,
    actionStrength: 1.0,
    reversibility: 1.0,
    structuralImprovement: 1.1,
    risk: 1.4,
  };

  public score(
    input: CoherenceInput,
    weights: Partial<CoherenceWeights> = {}
  ): CoherenceScore {
    const mergedWeights: CoherenceWeights = {
      ...this.defaultWeights,
      ...weights,
    };

    const clampedInput: CoherenceInput = {
      observationStrength: this.clamp(input.observationStrength),
      goalAlignment: this.clamp(input.goalAlignment),
      memorySupport: this.clamp(input.memorySupport),
      bridgeStrength: this.clamp(input.bridgeStrength),
      actionStrength: this.clamp(input.actionStrength),
      reversibility: this.clamp(input.reversibility),
      structuralImprovement: this.clamp(input.structuralImprovement),
      risk: this.clamp(input.risk),
      notes: input.notes ?? [],
    };

    const positiveWeightedScore =
      clampedInput.observationStrength * mergedWeights.observationStrength +
      clampedInput.goalAlignment * mergedWeights.goalAlignment +
      clampedInput.memorySupport * mergedWeights.memorySupport +
      clampedInput.bridgeStrength * mergedWeights.bridgeStrength +
      clampedInput.actionStrength * mergedWeights.actionStrength +
      clampedInput.reversibility * mergedWeights.reversibility +
      clampedInput.structuralImprovement * mergedWeights.structuralImprovement;

    const positiveWeightTotal =
      mergedWeights.observationStrength +
      mergedWeights.goalAlignment +
      mergedWeights.memorySupport +
      mergedWeights.bridgeStrength +
      mergedWeights.actionStrength +
      mergedWeights.reversibility +
      mergedWeights.structuralImprovement;

    const riskPenalty = clampedInput.risk * mergedWeights.risk;
    const rawScore = positiveWeightedScore - riskPenalty;
    const maxRawScore = positiveWeightTotal;
    const normalizedScore = this.clamp(rawScore / maxRawScore);
    const finalScore = normalizedScore;
    const classification = this.classify(finalScore);

    const score: CoherenceScore = {
      scoreId: this.createId('coherence-score'),
      finalScore,
      normalizedScore,
      riskPenalty,
      classification,
      input: clampedInput,
      weights: mergedWeights,
      explanation: '',
      timestamp: Date.now(),
      metadata: {
        author: 'Adrien D. Thomas',
        engine: 'LatticeCoherenceEngine',
      },
    };

    score.explanation = this.explain(score);
    return score;
  }

  public rankActions(actions: RankedCoherenceAction[]): RankedCoherenceAction[] {
    return actions
      .map((action) => ({
        ...action,
        coherenceScore: this.score(action.coherenceInput),
      }))
      .sort((a, b) => {
        const aScore = a.coherenceScore?.finalScore ?? 0;
        const bScore = b.coherenceScore?.finalScore ?? 0;
        return bScore - aScore;
      });
  }

  public explain(score: CoherenceScore): string {
    return [
      `Classification: ${score.classification}.`,
      `Final coherence score: ${score.finalScore.toFixed(4)}.`,
      `Risk penalty: ${score.riskPenalty.toFixed(4)}.`,
      `Observation: ${score.input.observationStrength.toFixed(2)}.`,
      `Goal alignment: ${score.input.goalAlignment.toFixed(2)}.`,
      `Memory support: ${score.input.memorySupport.toFixed(2)}.`,
      `Bridge strength: ${score.input.bridgeStrength.toFixed(2)}.`,
      `Action strength: ${score.input.actionStrength.toFixed(2)}.`,
      `Reversibility: ${score.input.reversibility.toFixed(2)}.`,
      `Structural improvement: ${score.input.structuralImprovement.toFixed(2)}.`,
      `Risk: ${score.input.risk.toFixed(2)}.`,
    ].join(' ');
  }

  public clamp(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return 0;
    }
    return Math.min(1, Math.max(0, value));
  }

  public createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private classify(score: number): CoherenceScore['classification'] {
    if (score < 0.2) return 'dormant';
    if (score < 0.45) return 'fragmented';
    if (score < 0.65) return 'emerging';
    if (score < 0.85) return 'coherent';
    return 'integrated';
  }
}

export const latticeCoherenceEngine = new LatticeCoherenceEngine();
