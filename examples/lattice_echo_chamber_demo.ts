/**
 * Lattice Echo Chamber Demo
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical demonstration of the learning loop feedback system.
 */

import { LatticeEchoChamber, EchoLearningGoal } from '../src/lattice_echo_chamber';
import type { BrainInput } from '../src/lattice_github_brain';

function runEchoChamberDemo(): void {
  console.log(
    '\n╔════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║  Lattice Echo Chamber - Learning Loop Demonstration          ║'
  );
  console.log(
    '║  Author: Adrien D. Thomas                                    ║'
  );
  console.log(
    '║  Software Architecture Only                                  ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝'
  );

  const chamber = new LatticeEchoChamber();

  const goal: EchoLearningGoal = {
    name: 'Integrated State',
    description: 'Achieve integrated observation, action, and bridge.',
    targetObservation: 0.8,
    targetAction: 0.8,
    targetBridge: 0.8,
  };

  console.log(`\nLearning Goal: ${goal.name}`);
  console.log(`Description: ${goal.description}\n`);

  // Cycle 1: Observation
  console.log('\n=== Cycle 1: Establish Observation ===\n');

  const input1: BrainInput = {
    observationData: ['Scanning files', 'Reading config', 'Analyzing structure'],
    actionData: [],
    bridgeData: [],
  };

  const cycle1 = chamber.learn(input1, goal);

  console.log(`State: ${cycle1.trace.state.name}`);
  console.log(`Lattice Score: ${cycle1.trace.latticeScore.toFixed(6)}`);
  console.log(`Observation: ${cycle1.trace.scores.observation.toFixed(3)} | Action: ${cycle1.trace.scores.action.toFixed(3)} | Bridge: ${cycle1.trace.scores.bridge.toFixed(3)}`);
  console.log('\nReflections:');
  cycle1.reflections.forEach((r) => console.log(`  • ${r}`));
  console.log('\nRecommendations:');
  cycle1.recommendations.forEach((r) => console.log(`  • [${r.axis}] ${r.suggestion}`));
  console.log('\nNext Actions:');
  cycle1.nextActions.forEach((a) => console.log(`  → ${a}`));

  // Cycle 2: Add Action
  console.log('\n=== Cycle 2: Introduce Action ===\n');

  const input2: BrainInput = {
    observationData: ['Scanning files', 'Reading config', 'Analyzing structure'],
    actionData: ['Building module', 'Running tests'],
    bridgeData: [],
  };

  const cycle2 = chamber.learn(input2, goal);

  console.log(`State: ${cycle2.trace.state.name}`);
  console.log(`Lattice Score: ${cycle2.trace.latticeScore.toFixed(6)}`);
  console.log(`Observation: ${cycle2.trace.scores.observation.toFixed(3)} | Action: ${cycle2.trace.scores.action.toFixed(3)} | Bridge: ${cycle2.trace.scores.bridge.toFixed(3)}`);
  console.log('\nReflections:');
  cycle2.reflections.forEach((r) => console.log(`  • ${r}`));
  console.log('\nNext Actions:');
  cycle2.nextActions.forEach((a) => console.log(`  → ${a}`));

  // Cycle 3: Complete Integration
  console.log('\n=== Cycle 3: Integrate Bridge ===\n');

  const input3: BrainInput = {
    observationData: ['Scanning files', 'Reading config', 'Analyzing structure'],
    actionData: ['Building module', 'Running tests', 'Validating output'],
    bridgeData: ['Storing trace', 'Integrating context', 'Updating registry'],
  };

  const cycle3 = chamber.learn(input3, goal);

  console.log(`State: ${cycle3.trace.state.name}`);
  console.log(`Lattice Score: ${cycle3.trace.latticeScore.toFixed(6)}`);
  console.log(`Observation: ${cycle3.trace.scores.observation.toFixed(3)} | Action: ${cycle3.trace.scores.action.toFixed(3)} | Bridge: ${cycle3.trace.scores.bridge.toFixed(3)}`);
  console.log('\nReflections:');
  cycle3.reflections.forEach((r) => console.log(`  • ${r}`));
  console.log('\nNext Actions:');
  cycle3.nextActions.forEach((a) => console.log(`  → ${a}`));

  // Export Snapshot
  console.log('\n=== Learning Snapshot ===\n');

  const snapshot = chamber.exportLearningSnapshot();

  console.log(`Total Cycles: ${snapshot.totalCycles}`);
  console.log('\nScore Trends:');
  console.log(`  Observation: ${snapshot.scoreTrends.observation.map((s) => s.toFixed(3)).join(' → ')}`);
  console.log(`  Action: ${snapshot.scoreTrends.action.map((s) => s.toFixed(3)).join(' → ')}`);
  console.log(`  Bridge: ${snapshot.scoreTrends.bridge.map((s) => s.toFixed(3)).join(' → ')}`);
  console.log(`\nSummary: ${snapshot.summary}`);

  console.log(
    '\n╔════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║  Demo complete. Practical software architecture only.         ║'
  );
  console.log(
    '║  No consciousness claims. No autonomous code rewriting.       ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n'
  );
}

if (require.main === module) {
  runEchoChamberDemo();
}

export { runEchoChamberDemo };
