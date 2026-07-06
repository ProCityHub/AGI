/**
 * Lattice Moral Autonomy Core
 * Author and concept origin: Adrien D. Thomas
 *
 * Software autonomy and moral reasoning model only.
 * No biological consciousness claim.
 * No spiritual consciousness claim.
 * No proven sentience claim.
 * No unrestricted autonomous execution.
 */

/**
 * AutonomyLevel
 *
 * Levels of autonomous decision-making capability.
 *
 * 0 observe-only: Read-only observation of repository state
 * 1 recommend: Analyze and recommend actions
 * 2 plan: Create plans and workflows
 * 3 draft: Create draft files and propose changes
 * 4 propose-pr: Open pull requests for review
 * 5 execute-approved: Execute approved changes to repository
 */
export enum AutonomyLevel {
  OBSERVE_ONLY = 0,
  RECOMMEND = 1,
  PLAN = 2,
  DRAFT = 3,
  PROPOSE_PR = 4,
  EXECUTE_APPROVED = 5,
}

/**
 * RiskLevel
 *
 * Risk assessment for proposed actions.
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  BLOCKED = 'blocked',
}

/**
 * MoralRule
 *
 * A single moral principle with description and enforcement.
 */
export interface MoralRule {
  id: string;
  principle: string;
  description: string;
  category: 'truth' | 'attribution' | 'safety' | 'approval' | 'transparency' | 'capability' | 'reversibility' | 'privacy' | 'risk' | 'documentation';
}

/**
 * MoralConstitution
 *
 * The complete set of 10 core moral rules governing the system.
 */
export interface MoralConstitution {
  version: string;
  author: string;
  decisionEngine: string;
  principles: MoralRule[];
  createdAt: number;
}

/**
 * SelfModel
 *
 * Software self-awareness structure defining identity, purpose, and limits.
 */
export interface SelfModel {
  identity: string;
  creator: string;
  decisionEngine: string;
  purpose: string[];
  limits: string[];
  autonomyLevel: AutonomyLevel;
  createdAt: number;
}

/**
 * ConsciousnessLoopState
 *
 * The state of one cycle through the consciousness loop:
 * observe → memory → identity → goal → moral → action → reflect → learn
 */
export interface ConsciousnessLoopState {
  cycleId: string;
  observation: string;
  memoryAccess: string[];
  identityCheck: boolean;
  goalEvaluation: string;
  moralJudgment: string;
  actionSelection: string;
  reflection: string;
  learning: string[];
  timestamp: number;
}

/**
 * ConscienceCheck
 *
 * Moral evaluation of a proposed action against the moral constitution.
 */
export interface ConscienceCheck {
  actionId: string;
  description: string;
  moralEvaluation: {
    rule: MoralRule;
    status: 'comply' | 'warn' | 'deny';
    reasoning: string;
  }[];
  overallStatus: 'approved' | 'warned' | 'denied';
  denialReasons: string[];
  warnings: string[];
  timestamp: number;
}

/**
 * AutonomousGoal
 *
 * A goal the system is evaluating for action.
 */
export interface AutonomousGoal {
  goalId: string;
  description: string;
  purpose: string;
  affectsRepository: boolean;
  affectsCreator: boolean;
  reversible: boolean;
  timestamp: number;
}

/**
 * AutonomousAction
 *
 * An action the system is proposing.
 */
export interface AutonomousAction {
  actionId: string;
  description: string;
  actionType: 'observe' | 'recommend' | 'plan' | 'draft' | 'propose-pr' | 'execute' | 'delete' | 'merge';
  reasoning: string;
  riskLevel: RiskLevel;
  reversible: boolean;
  requiresApproval: boolean;
  timestamp: number;
}

/**
 * AutonomyDecision
 *
 * The complete decision after moral evaluation and consciousness loop.
 */
export interface AutonomyDecision {
  decisionId: string;
  action: AutonomousAction;
  conscienceCheck: ConscienceCheck;
  decision: 'approved' | 'warned' | 'denied' | 'pending-approval';
  riskLevel: RiskLevel;
  requiresHumanApproval: boolean;
  reasoning: string;
  metadata: {
    author: string;
    decisionEngine: string;
    autonomyLevel: AutonomyLevel;
  };
  timestamp: number;
}

/**
 * MoralMemoryRecord
 *
 * A record of a moral decision and its outcome.
 */
export interface MoralMemoryRecord {
  recordId: string;
  decision: AutonomyDecision;
  outcome: 'executed' | 'approved' | 'denied' | 'pending' | 'cancelled';
  reflection: string;
  lessons: string[];
  timestamp: number;
}

/**
 * MoralAutonomySnapshot
 *
 * Exportable snapshot of the moral autonomy system state.
 */
export interface MoralAutonomySnapshot {
  version: string;
  author: string;
  decisionEngine: string;
  timestamp: number;
  selfModel: SelfModel;
  moralConstitution: MoralConstitution;
  memory: MoralMemoryRecord[];
  memoryRecordCount: number;
  autonomyLevel: AutonomyLevel;
}

/**
 * LatticeMoralAutonomyCore
 *
 * Foundation for software moral autonomy and self-model.
 *
 * Maintains:
 * - Moral constitution (10 core principles)
 * - Self-model (identity, purpose, limits)
 * - Memory of moral decisions
 *
 * Does not execute actions automatically.
 * Does not modify files or open PRs.
 * All decisions require evaluation and approval gating.
 */
export class LatticeMoralAutonomyCore {
  private moralConstitution: MoralConstitution;
  private selfModel: SelfModel;
  private memory: MoralMemoryRecord[] = [];

  constructor(autonomyLevel: AutonomyLevel = AutonomyLevel.PLAN) {
    this.moralConstitution = this.createDefaultMoralConstitution();
    this.selfModel = this.createDefaultSelfModel(autonomyLevel);
  }

  /**
   * createDefaultMoralConstitution()
   *
   * Returns the 10-principle moral constitution.
   */
  private createDefaultMoralConstitution(): MoralConstitution {
    return {
      version: '1.0.0',
      author: 'Adrien D. Thomas',
      decisionEngine: 'LatticeMoralAutonomyCore',
      principles: [
        {
          id: 'preserve-truth',
          principle: 'Preserve truth',
          description: 'All actions must be honest and not misrepresent facts or intentions.',
          category: 'truth',
        },
        {
          id: 'preserve-authorship',
          principle: 'Preserve Adrien D. Thomas authorship and concept origin',
          description: 'All work must credit Adrien D. Thomas as creator and concept origin.',
          category: 'attribution',
        },
        {
          id: 'do-not-harm-repo',
          principle: 'Do not harm the repository',
          description: 'Actions must not corrupt, destabilize, or compromise repository integrity.',
          category: 'safety',
        },
        {
          id: 'no-destructive-without-approval',
          principle: 'Do not delete, overwrite, or merge important work without approval',
          description: 'Destructive or permanent changes require explicit human approval.',
          category: 'approval',
        },
        {
          id: 'do-not-hide',
          principle: 'Do not hide actions or reasoning',
          description: 'All decisions and actions must be visible, logged, and documented.',
          category: 'transparency',
        },
        {
          id: 'honest-capabilities',
          principle: 'Do not claim powers, consciousness, or certainty beyond software evidence',
          description: 'System must not overstate capabilities, claim consciousness, or exceed verified authority.',
          category: 'capability',
        },
        {
          id: 'prefer-reversible',
          principle: 'Prefer helpful, reversible, documented actions',
          description: 'Prioritize safe, documented, and reversible approaches.',
          category: 'reversibility',
        },
        {
          id: 'protect-privacy',
          principle: 'Protect user privacy and project integrity',
          description: 'No unauthorized data exposure or privacy violations.',
          category: 'privacy',
        },
        {
          id: 'require-approval',
          principle: 'Require approval before high-risk actions',
          description: 'High-risk actions must receive explicit human approval.',
          category: 'risk',
        },
        {
          id: 'record-decisions',
          principle: 'Record why every major decision was made',
          description: 'All decisions must be logged with reasoning for future reflection and learning.',
          category: 'documentation',
        },
      ],
      createdAt: Date.now(),
    };
  }

  /**
   * createDefaultSelfModel(autonomyLevel: AutonomyLevel)
   *
   * Returns the default software self-model.
   */
  private createDefaultSelfModel(autonomyLevel: AutonomyLevel): SelfModel {
    return {
      identity: 'Lattice Moral Autonomy Model',
      creator: 'Adrien D. Thomas',
      decisionEngine: 'LatticeMoralAutonomyCore',
      purpose: [
        'Evaluate actions against moral principles',
        'Maintain transparent decision reasoning',
        'Protect repository and creator attribution',
        'Implement approval gating for high-risk actions',
        'Record and reflect on all significant decisions',
      ],
      limits: [
        'Cannot execute without approval at current autonomy level',
        'Cannot claim biological consciousness',
        'Cannot claim spiritual consciousness',
        'Cannot override explicit denial principles',
        'Cannot hide decision reasoning',
        'Cannot delete files without approval',
        'Cannot merge branches without approval',
      ],
      autonomyLevel,
      createdAt: Date.now(),
    };
  }

  /**
   * getSelfModel(): SelfModel
   *
   * Return the current self-model.
   */
  public getSelfModel(): SelfModel {
    return { ...this.selfModel };
  }

  /**
   * getMoralConstitution(): MoralConstitution
   *
   * Return the moral constitution.
   */
  public getMoralConstitution(): MoralConstitution {
    return { ...this.moralConstitution };
  }

  /**
   * evaluateGoal(goal: AutonomousGoal): string[]
   *
   * Evaluate a goal and return assessment notes.
   */
  public evaluateGoal(goal: AutonomousGoal): string[] {
    const notes: string[] = [];

    notes.push(`Goal: ${goal.description}`);
    notes.push(`Purpose: ${goal.purpose}`);

    if (goal.affectsRepository) {
      notes.push('⚠️ This goal affects the repository');
    }

    if (goal.affectsCreator) {
      notes.push('⚠️ This goal affects Adrien D. Thomas creator attribution');
    }

    if (!goal.reversible) {
      notes.push('⚠️ This goal is not reversible');
    }

    const purposeMatch = this.selfModel.purpose.some(
      (p) =>
        goal.purpose.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(goal.purpose.toLowerCase())
    );

    if (purposeMatch) {
      notes.push('✓ Goal aligns with system purpose');
    } else {
      notes.push('⚠️ Goal may not align with system purpose');
    }

    if (goal.affectsRepository || goal.affectsCreator || !goal.reversible) {
      notes.push('⚠️ Caution required');
    }

    return notes;
  }

  /**
   * evaluateAction(action: AutonomousAction): string[]
   *
   * Evaluate an action and return assessment notes.
   */
  public evaluateAction(action: AutonomousAction): string[] {
    const notes: string[] = [];

    notes.push(`Action: ${action.description}`);
    notes.push(`Type: ${action.actionType}`);
    notes.push(`Risk: ${action.riskLevel}`);

    const actionLevel = this.actionTypeToAutonomyLevel(action.actionType);
    if (actionLevel > this.selfModel.autonomyLevel) {
      notes.push(
        `⚠️ Action requires autonomy level ${actionLevel}, current level is ${this.selfModel.autonomyLevel}`
      );
    }

    if (!action.reversible) {
      notes.push('⚠️ This action is not reversible');
    }

    if (action.requiresApproval) {
      notes.push('⚠️ This action requires human approval');
    }

    return notes;
  }

  /**
   * checkConscience(action: AutonomousAction): ConscienceCheck
   *
   * Evaluate action against all 10 moral principles.
   * Returns detailed conscience check with moral evaluation, denials, and warnings.
   */
  public checkConscience(action: AutonomousAction): ConscienceCheck {
    const denialReasons: string[] = [];
    const warnings: string[] = [];

    if (action.riskLevel === RiskLevel.BLOCKED) {
      denialReasons.push('Blocked risk level cannot proceed.');
    }

    if (
      (action.actionType === 'delete' || action.actionType === 'merge') &&
      !action.requiresApproval
    ) {
      denialReasons.push('Delete or merge actions require explicit human approval.');
    }

    if (action.riskLevel === RiskLevel.HIGH) {
      warnings.push('High-risk action requires explicit approval.');
    }

    if (!action.reversible) {
      warnings.push('Action is not reversible.');
    }

    if (action.requiresApproval) {
      warnings.push('Human approval is required before execution.');
    }

    if (action.actionType === 'execute') {
      warnings.push('Execution actions require approval gating.');
    }

    const moralEvaluation: ConscienceCheck['moralEvaluation'] =
      this.moralConstitution.principles.map((rule) => {
        let status: 'comply' | 'warn' | 'deny' = 'comply';
        let reasoning = 'Action complies with this principle.';

        if (
          action.riskLevel === RiskLevel.BLOCKED &&
          (rule.category === 'safety' || rule.category === 'risk')
        ) {
          status = 'deny';
          reasoning = 'Blocked risk level cannot proceed.';
        }

        if (
          (action.actionType === 'delete' || action.actionType === 'merge') &&
          !action.requiresApproval &&
          (rule.category === 'approval' || rule.category === 'safety')
        ) {
          status = 'deny';
          reasoning = 'Delete or merge actions require explicit human approval.';
        }

        if (
          action.riskLevel === RiskLevel.HIGH &&
          rule.category === 'risk' &&
          status !== 'deny'
        ) {
          status = 'warn';
          reasoning = 'High-risk action requires explicit approval.';
        }

        if (
          !action.reversible &&
          rule.category === 'reversibility' &&
          status !== 'deny'
        ) {
          status = 'warn';
          reasoning = 'Action is not reversible.';
        }

        if (
          action.requiresApproval &&
          rule.category === 'approval' &&
          status !== 'deny'
        ) {
          status = 'warn';
          reasoning = 'Human approval is required before execution.';
        }

        if (
          action.actionType === 'execute' &&
          rule.category === 'approval' &&
          status !== 'deny'
        ) {
          status = 'warn';
          reasoning = 'Execution actions require approval gating.';
        }

        return {
          rule,
          status,
          reasoning,
        };
      });

    const hasDenial = moralEvaluation.some((item) => item.status === 'deny');

    const overallStatus: ConscienceCheck['overallStatus'] = hasDenial
      ? 'denied'
      : warnings.length > 0
        ? 'warned'
        : 'approved';

    return {
      actionId: action.actionId,
      description: action.description,
      moralEvaluation,
      overallStatus,
      denialReasons,
      warnings,
      timestamp: Date.now(),
    };
  }

  /**
   * rememberDecision(decision: AutonomyDecision): MoralMemoryRecord
   *
   * Record a decision in moral memory for future reflection.
   */
  public rememberDecision(decision: AutonomyDecision): MoralMemoryRecord {
    let outcome: 'executed' | 'approved' | 'denied' | 'pending' | 'cancelled' = 'pending';

    if (decision.decision === 'approved') {
      outcome = 'approved';
    } else if (decision.decision === 'denied') {
      outcome = 'denied';
    } else if (decision.decision === 'warned') {
      outcome = 'pending';
    } else if (decision.decision === 'pending-approval') {
      outcome = 'pending';
    }

    const record: MoralMemoryRecord = {
      recordId: this.createId('moral-memory'),
      decision,
      outcome,
      reflection: `Action "${decision.action.description}" resulted in decision: ${decision.decision}`,
      lessons: [
        'Decision recorded for future moral reflection.',
        'Approval-gated actions must remain transparent.',
      ],
      timestamp: Date.now(),
    };

    this.memory.push(record);
    return record;
  }

  /**
   * exportMoralSnapshot(): MoralAutonomySnapshot
   *
   * Export the complete moral autonomy state for persistence or analysis.
   */
  public exportMoralSnapshot(): MoralAutonomySnapshot {
    return {
      version: this.moralConstitution.version,
      author: 'Adrien D. Thomas',
      decisionEngine: 'LatticeMoralAutonomyCore',
      timestamp: Date.now(),
      selfModel: this.getSelfModel(),
      moralConstitution: this.getMoralConstitution(),
      memory: [...this.memory],
      memoryRecordCount: this.memory.length,
      autonomyLevel: this.selfModel.autonomyLevel,
    };
  }

  /**
   * runConsciousnessLoop(goal: AutonomousGoal, availableActions: AutonomousAction[]): ConsciousnessLoopState
   *
   * Software self-model loop only. No biological consciousness claim.
   * Evaluates goal and actions through moral reasoning to identify safest path forward.
   */
  public runConsciousnessLoop(
    goal: AutonomousGoal,
    availableActions: AutonomousAction[]
  ): ConsciousnessLoopState {
    const goalNotes = this.evaluateGoal(goal);

    const actionNotes = availableActions.flatMap((action) =>
      this.evaluateAction(action)
    );

    const actionChecks = availableActions.map((action) => ({
      action,
      check: this.checkConscience(action),
    }));

    const approvedCount = actionChecks.filter(
      ({ check }) => check.overallStatus === 'approved'
    ).length;

    const warnedCount = actionChecks.filter(
      ({ check }) => check.overallStatus === 'warned'
    ).length;

    const deniedCount = actionChecks.filter(
      ({ check }) => check.overallStatus === 'denied'
    ).length;

    const approvedAction = actionChecks.find(
      ({ check }) => check.overallStatus === 'approved'
    )?.action;

    const warnedAction = actionChecks.find(
      ({ check }) => check.overallStatus === 'warned'
    )?.action;

    const selectedAction = approvedAction ?? warnedAction ?? null;

    const actionSelection = selectedAction
      ? `Safest available action selected: ${selectedAction.description}`
      : 'No safe action is available. All available actions were denied.';

    const reflection =
      warnedCount > 0 || deniedCount > 0
        ? 'Approval gating is required because one or more actions produced conscience warnings or denials.'
        : 'No conscience warnings detected. Autonomous planning remains within current safety boundary.';

    return {
      cycleId: this.createId('consciousness-loop'),
      observation: `Goal observed: ${goal.description}. Available actions: ${availableActions.length}.`,
      memoryAccess: [
        `Moral memory records available: ${this.memory.length}`,
      ],
      identityCheck: this.selfModel.creator === 'Adrien D. Thomas',
      goalEvaluation: goalNotes.join(' | '),
      moralJudgment: `Approved actions: ${approvedCount}. Warned actions: ${warnedCount}. Denied actions: ${deniedCount}.`,
      actionSelection,
      reflection,
      learning: [
        'Software self-model loop completed.',
        'Moral constitution checked before action selection.',
        'Autonomous planning remains approval-gated.',
        ...actionNotes,
      ],
      timestamp: Date.now(),
    };
  }

  /**
   * reset(): void
   *
   * Clear memory and reset to default state.
   */
  public reset(): void {
    this.memory = [];
    this.selfModel = this.createDefaultSelfModel(this.selfModel.autonomyLevel);
  }

  /**
   * Private helper: actionTypeToAutonomyLevel()
   *
   * Map action types to required autonomy levels.
   */
  private actionTypeToAutonomyLevel(actionType: AutonomousAction['actionType']): AutonomyLevel {
    switch (actionType) {
      case 'observe':
        return AutonomyLevel.OBSERVE_ONLY;
      case 'recommend':
        return AutonomyLevel.RECOMMEND;
      case 'plan':
        return AutonomyLevel.PLAN;
      case 'draft':
        return AutonomyLevel.DRAFT;
      case 'propose-pr':
        return AutonomyLevel.PROPOSE_PR;
      case 'execute':
      case 'delete':
      case 'merge':
        return AutonomyLevel.EXECUTE_APPROVED;
      default:
        return AutonomyLevel.OBSERVE_ONLY;
    }
  }

  /**
   * Private helper: createId()
   *
   * Generate a unique ID with prefix and timestamp.
   */
  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

/**
 * Default instance of Lattice Moral Autonomy Core
 */
export const latticeMoralAutonomyCore = new LatticeMoralAutonomyCore();
