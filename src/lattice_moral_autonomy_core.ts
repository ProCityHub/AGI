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
   * reset(): void
   *
   * Clear memory and reset to default state.
   */
  public reset(): void {
    this.memory = [];
    this.selfModel = this.createDefaultSelfModel(this.selfModel.autonomyLevel);
  }
}

/**
 * Default instance of Lattice Moral Autonomy Core
 */
export const latticeMoralAutonomyCore = new LatticeMoralAutonomyCore();
