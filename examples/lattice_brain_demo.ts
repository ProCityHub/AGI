/**
 * Lattice GitHub Brain Demo
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical demonstration of brain thinking and application connection.
 */

import {
  LatticeGitHubBrain,
  latticeGitHubBrain,
  BrainInput,
} from '../src/lattice_github_brain';
import { connectAllApplications } from '../lattice_connect_all/connect_all';

/**
 * demo1_basicThinking()
 * Create a brain instance and call think()
 */
function demo1_basicThinking(): void {
  console.log('\n=== Demo 1: Basic Thinking ===');

  const brain = new LatticeGitHubBrain({ threshold: 0.5, maxMemory: 100 });

  const input: BrainInput = {
    observationData: ['Reading repository files', 'Scanning directory'],
    actionData: ['Building module', 'Running tests'],
    bridgeData: ['Storing trace in memory', 'Integrating with registry'],
    metadata: {
      repository: 'ProCityHub/AGI',
      integration: true,
    },
  };

  const trace = brain.think(input);

  console.log(`State: ${trace.state.name}`);
  console.log(`Observation: ${trace.scores.observation.toFixed(3)}`);
  console.log(`Action: ${trace.scores.action.toFixed(3)}`);
  console.log(`Bridge: ${trace.scores.bridge.toFixed(3)}`);
  console.log(`Lattice Score: ${trace.latticeScore.toFixed(6)}`);
}

/**
 * demo2_selfCorrection()
 * Log trace state and self-correction messages
 */
function demo2_selfCorrection(): void {
  console.log('\n=== Demo 2: Self-Correction ===');

  const input: BrainInput = {
    observationData: ['Files detected'],
    actionData: [],
    bridgeData: [],
  };

  const trace = latticeGitHubBrain.think(input);

  console.log(`State: ${trace.state.name}`);
  console.log(`Observer: ${trace.state.isObserverActive}`);
  console.log(`Actor: ${trace.state.isActorActive}`);
  console.log(`Bridge: ${trace.state.isBridgeActive}`);

  const corrections = latticeGitHubBrain.selfCorrect(input, trace.state);
  console.log('Self-Corrections:');
  corrections.forEach((msg) => console.log(`  - ${msg}`));
}

/**
 * demo3_eightStates()
 * Demonstrate the eight state classifications
 */
function demo3_eightStates(): void {
  console.log('\n=== Demo 3: Eight States ===');

  const scenarios = [
    {
      name: 'DORMANT',
      input: { metadata: {} } as BrainInput,
    },
    {
      name: 'OBSERVER',
      input: { observationData: ['Files'] } as BrainInput,
    },
    {
      name: 'ACTOR',
      input: { actionData: ['Build'] } as BrainInput,
    },
    {
      name: 'INTEGRATED',
      input: {
        observationData: ['Files'],
        actionData: ['Build'],
        bridgeData: ['Memory'],
      } as BrainInput,
    },
  ];

  scenarios.forEach((scenario) => {
    const trace = latticeGitHubBrain.think(scenario.input);
    console.log(
      `${scenario.name.padEnd(15)}: ${trace.state.name.padEnd(18)} (score: ${trace.latticeScore.toFixed(4)})`
    );
  });
}

/**
 * demo4_connectAllApplications()
 * Import and call connectAllApplications()
 */
function demo4_connectAllApplications(): void {
  console.log('\n=== Demo 4: Connect All Applications ===');

  const snapshot = connectAllApplications();

  console.log(`Total Applications: ${snapshot.totalApplications}`);
  console.log(`Connected: ${snapshot.connectedCount}`);
  console.log(`Pending: ${snapshot.pendingCount}`);
  console.log(`Blocked: ${snapshot.blockedCount}`);
  console.log(`\nStatus Scores:`);
  console.log(`  Observation: ${snapshot.statusScores.observation}`);
  console.log(`  Action: ${snapshot.statusScores.action}`);
  console.log(`  Bridge: ${snapshot.statusScores.bridge}`);
  console.log(`\nSummary: ${snapshot.summary}`);
}

/**
 * demo5_applicationRegistry()
 * Show registered applications
 */
function demo5_applicationRegistry(): void {
  console.log('\n=== Demo 5: Application Registry ===');

  const snapshot = connectAllApplications();

  console.log('Registered Applications:');
  snapshot.applications.forEach((app) => {
    console.log(
      `  ${app.name.padEnd(20)} [${app.brainMode.padEnd(10)}] ${app.bridgeStatus}`
    );
  });
}

/**
 * runAllDemos()
 * Execute all demonstration functions
 */
export function runAllDemos(): void {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Lattice GitHub Brain - Practical Demonstration             ║');
  console.log('║  Author: Adrien D. Thomas                                  ║');
  console.log('║  Software Architecture Only                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demo1_basicThinking();
  demo2_selfCorrection();
  demo3_eightStates();
  demo4_connectAllApplications();
  demo5_applicationRegistry();

  console.log(
    '\n╔══════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║  All demos complete. This is practical software only.        ║'
  );
  console.log(
    '║  No consciousness claims. No prophecy. No scientific claims.  ║'
  );
  console.log(
    '╚══════════════════════════════════════════════════════════════╝\n'
  );
}

// Run all demos if executed directly
if (require.main === module) {
  runAllDemos();
}
