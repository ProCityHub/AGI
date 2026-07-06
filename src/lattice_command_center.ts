/**
 * Lattice Command Center
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical command orchestration connecting brain, echo chamber, and app connection.
 * Software architecture only. No consciousness claims. No autonomous code rewriting.
 */

import {
  LatticeGitHubBrain,
  latticeGitHubBrain,
  BrainInput,
  BrainTrace,
} from './lattice_github_brain';

import {
  LatticeEchoChamber,
  latticeEchoChamber,
  EchoLearningGoal,
  EchoLearningCycle,
  EchoLearningSnapshot,
} from './lattice_echo_chamber';

import { connectAllApplications, ConnectAllSnapshot } from '../lattice_connect_all/connect_all';

export interface LatticeCommand {
  observationItems: string[];
  actionItems: string[];
  bridgeItems: string[];
  metadata?: Record<string, unknown>;
}

export interface LatticeCommandResult {
  generatedAt: number;
  author: string;
  command: LatticeCommand;
  brainTrace: BrainTrace;
  echoCycle: EchoLearningCycle;
  connectAllSnapshot: ConnectAllSnapshot;
  learningSnapshot: EchoLearningSnapshot;
  nextActions: string[];
  recommendations: string[];
  summary: string;
}

export interface LatticeCommandSnapshot {
  generatedAt: number;
  author: string;
  totalResults: number;
  results: LatticeCommandResult[];
  overallStatus: string;
}

/**
 * LatticeCommandCenter
 *
 * Orchestrates brain, echo chamber, and application connection.
 * Receives commands and produces integrated results.
 */
export class LatticeCommandCenter {
  private brain: LatticeGitHubBrain;
  private echoChamber: LatticeEchoChamber;
  private results: LatticeCommandResult[] = [];

  constructor(brain?: LatticeGitHubBrain, echoChamber?: LatticeEchoChamber) {
    this.brain = brain ?? latticeGitHubBrain;
    this.echoChamber = echoChamber ?? latticeEchoChamber;
  }

  /**
   * buildBrainInputFromCommand(command: LatticeCommand): BrainInput
   * Convert command into brain input format.
   */
  buildBrainInputFromCommand(command: LatticeCommand): BrainInput {
    return {
      observationData: command.observationItems,
      actionData: command.actionItems,
      bridgeData: command.bridgeItems,
      metadata: command.metadata,
    };
  }

  /**
   * createDefaultLearningGoal(): EchoLearningGoal
   * Return default learning goal with standard targets.
   */
  createDefaultLearningGoal(): EchoLearningGoal {
    return {
      name: 'Optimize Integration',
      description: 'Balance observation, action, and bridge.',
      targetObservation: 0.8,
      targetAction: 0.8,
      targetBridge: 0.8,
    };
  }

  /**
   * command(commandInput: LatticeCommand): LatticeCommandResult
   * Execute one complete command cycle.
   */
  command(commandInput: LatticeCommand): LatticeCommandResult {
    const brainInput = this.buildBrainInputFromCommand(commandInput);
    const goal = this.createDefaultLearningGoal();

    const brainTrace = this.brain.think(brainInput);
    const echoCycle = this.echoChamber.learn(brainInput, goal);
    const connectAllSnapshot = connectAllApplications();
    const learningSnapshot = this.echoChamber.exportLearningSnapshot();

    const nextActions: string[] = [];
    if (brainTrace.state.isObserverActive) {
      nextActions.push('Continue observation and diagnostics.');
    }
    if (brainTrace.state.isActorActive) {
      nextActions.push('Execute planned action tasks.');
    }
    if (brainTrace.state.isBridgeActive) {
      nextActions.push('Maintain memory and context integration.');
    }

    const recommendations: string[] = [];
    echoCycle.recommendations.forEach((rec) => {
      recommendations.push(
        `[${rec.axis}] ${rec.suggestion} (Priority: ${rec.priority})`
      );
    });

    const summary =
      `Command executed: ${commandInput.observationItems.length} observations, ` +
      `${commandInput.actionItems.length} actions, ` +
      `${commandInput.bridgeItems.length} bridges. ` +
      `Brain state: ${brainTrace.state.name}. ` +
      `Connected apps: ${connectAllSnapshot.connectedCount}/${connectAllSnapshot.totalApplications}.`;

    const result: LatticeCommandResult = {
      generatedAt: Date.now(),
      author: 'Adrien D. Thomas',
      command: commandInput,
      brainTrace,
      echoCycle,
      connectAllSnapshot,
      learningSnapshot,
      nextActions,
      recommendations,
      summary,
    };

    this.results.push(result);
    return result;
  }

  /**
   * commandLearnAndImprove(commandInput: LatticeCommand): LatticeCommandResult
   * Execute command and return result with learning applied.
   */
  commandLearnAndImprove(commandInput: LatticeCommand): LatticeCommandResult {
    return this.command(commandInput);
  }

  /**
   * exportCommandSnapshot(): LatticeCommandSnapshot
   * Export complete command center state and all results.
   */
  exportCommandSnapshot(): LatticeCommandSnapshot {
    const overallStatus =
      `${this.results.length} command result(s) generated. ` +
      `Latest brain state: ${this.results.length > 0 ? this.results[this.results.length - 1].brainTrace.state.name : 'UNINITIALIZED'}.`;

    return {
      generatedAt: Date.now(),
      author: 'Adrien D. Thomas',
      totalResults: this.results.length,
      results: this.results,
      overallStatus,
    };
  }

  /**
   * reset(): void
   * Clear all command results and reset internal systems.
   */
  reset(): void {
    this.results = [];
    this.brain.reset();
    this.echoChamber.reset();
  }
}

export const latticeCommandCenter = new LatticeCommandCenter();
