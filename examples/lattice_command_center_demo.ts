/**
 * Lattice Command Center Demo
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical demonstration of command orchestration and learning.
 */

import { LatticeCommandCenter } from '../src/lattice_command_center';

function runLatticeCommandCenterDemo(): void {
  console.log(
    '\n╔════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║  Lattice Command Center Demo                                  ║'
  );
  console.log(
    '║  Author: Adrien D. Thomas                                     ║'
  );
  console.log(
    '║  Software Architecture Only                                   ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝'
  );

  const commandCenter = new LatticeCommandCenter();

  console.log(
    '\n📋 Command: Observe repository state, connect registered applications,'
  );
  console.log(
    '   learn from the current trace, and recommend the next improvement.\n'
  );

  const commandInput = {
    observationItems: [
      'Read main branch state',
      'Inspect Lattice GitHub Brain',
      'Inspect Lattice Echo Chamber',
      'Inspect Connect-All registry',
    ],
    actionItems: [
      'Run brain trace',
      'Run echo learning loop',
      'Connect registered applications',
      'Generate command snapshot',
    ],
    bridgeItems: [
      'Preserve prior learning cycles',
      'Connect repository context',
      'Preserve Adrien D. Thomas authorship',
      'Maintain software-only safety boundary',
    ],
    metadata: {
      repository: 'ProCityHub/AGI',
      mode: 'command-center-demo',
      author: 'Adrien D. Thomas',
    },
  };

  const result = commandCenter.command(commandInput);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('COMMAND RESULT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('🧠 Brain State:');
  console.log(`  Current State: ${result.brainTrace.state.name}`);
  console.log(`  Lattice Score: ${result.brainTrace.latticeScore.toFixed(6)}`);
  console.log(`  Observation: ${result.brainTrace.scores.observation.toFixed(3)}`);
  console.log(`  Action: ${result.brainTrace.scores.action.toFixed(3)}`);
  console.log(`  Bridge: ${result.brainTrace.scores.bridge.toFixed(3)}`);

  console.log('\n🔗 Application Connection:');
  console.log(
    `  Connected: ${result.connectAllSnapshot.connectedCount}/${result.connectAllSnapshot.totalApplications}`
  );
  console.log(
    `  Pending: ${result.connectAllSnapshot.pendingCount}`
  );
  console.log(
    `  Blocked: ${result.connectAllSnapshot.blockedCount}`
  );

  console.log('\n📚 Echo Learning Cycle:');
  console.log(`  Cycle Number: ${result.echoCycle.cycleNumber}`);
  console.log(`  Echo State: ${result.echoCycle.trace.state.name}`);

  console.log('\n✨ Reflections:');
  result.echoCycle.reflections.forEach((reflection) => {
    console.log(`  • ${reflection}`);
  });

  console.log('\n📋 Recommendations:');
  result.echoCycle.recommendations.forEach((rec) => {
    console.log(
      `  [${rec.axis}] Current: ${rec.current.toFixed(3)}, Target: ${rec.target.toFixed(3)}`
    );
    console.log(`  → ${rec.suggestion}`);
    console.log(`  Priority: ${rec.priority}\n`);
  });

  console.log('📋 Echo Learning Recommendations (formatted):');
  result.recommendations.forEach((recommendation) => {
    console.log(`  • ${recommendation}`);
  });

  console.log('\n🎯 Next Actions:');
  result.nextActions.forEach((action) => {
    console.log(`  → ${action}`);
  });

  console.log('\n📊 Command Summary:');
  console.log(`  ${result.summary}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('COMMAND CENTER SNAPSHOT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const snapshot = commandCenter.exportCommandSnapshot();

  console.log(`Total Commands Executed: ${snapshot.totalResults}`);
  console.log(`Author: ${snapshot.author}`);
  console.log(`Overall Status: ${snapshot.overallStatus}`);

  console.log('\n📚 Learning Snapshot from Echo Chamber:');
  console.log(`  Total Learning Cycles: ${result.learningSnapshot.totalCycles}`);
  console.log(`  Score Trends:`);
  console.log(
    `    Observation: ${result.learningSnapshot.scoreTrends.observation.map((s) => s.toFixed(3)).join(' → ')}`
  );
  console.log(
    `    Action: ${result.learningSnapshot.scoreTrends.action.map((s) => s.toFixed(3)).join(' → ')}`
  );
  console.log(
    `    Bridge: ${result.learningSnapshot.scoreTrends.bridge.map((s) => s.toFixed(3)).join(' → ')}`
  );
  console.log(`  Summary: ${result.learningSnapshot.summary}`);

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
  runLatticeCommandCenterDemo();
}

export { runLatticeCommandCenterDemo };
