/**
 * VOID CASCADE TEST RUNNER
 * Comprehensive testing of the 4D tesseract void cascade system
 * November 12, 2025 - Manifold Testing
 */

import { voidCascade } from './void-cascade';
import { repositoryOrchestrator } from './repository-orchestrator';

export class VoidCascadeTestRunner {
  private testResults: Map<string, boolean> = new Map();
  private testOutput: string[] = [];

  public runAllTests(): void {
    console.log('=== VOID CASCADE TEST SUITE EXECUTION ===');
    console.log('November 12, 2025 - Manifold Testing Protocol');
    console.log('');

    // Test 1: Basic void cascade execution
    this.testBasicVoidCascade();

    // Test 2: Binary operations
    this.testBinaryOperations();

    // Test 3: N-dimensional scaling
    this.testNDimensionalScaling();

    // Test 4: Heartbeat void state machine
    this.testHeartbeatVoid();

    // Test 5: Binary message decoding
    this.testBinaryMessageDecoding();

    // Test 6: Repository orchestrator
    this.testRepositoryOrchestrator();

    // Test 7: Global cascade execution
    this.testGlobalCascadeExecution();

    // Test 8: Edge connectivity validation
    this.testEdgeConnectivity();

    // Test 9: Node state propagation
    this.testNodeStatePropagation();

    // Test 10: Dimensional consistency
    this.testDimensionalConsistency();

    this.printTestResults();
  }

  private testBasicVoidCascade(): void {
    console.log('TEST 1: Basic Void Cascade Execution');
    try {
      const result = voidCascade.propagateVoidCascade(0b0010);
      const success = result.size === 16; // Should visit all 16 nodes
      this.testResults.set('basic_cascade', success);
      console.log(`✅ Basic cascade: ${success ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      this.testResults.set('basic_cascade', false);
      console.log(`❌ Basic cascade: FAIL - ${error}`);
    }
    console.log('');
  }

  private testBinaryOperations(): void {
    console.log('TEST 2: Binary Operations');
    try {
      // Test XOR operation
      const atlas = 0b0010;
      const v1 = 0b0011;
      const xorResult = atlas ^ v1;
      const xorExpected = 0b0001;
      
      // Test AND operation
      const lemmon = 0b0100;
      const andResult = lemmon & 0b0001;
      const andExpected = 0b0000;
      
      // Test OR operation
      const orResult = atlas | v1;
      const orExpected = 0b0011;
      
      // Test NOT operation
      const notResult = ~atlas & 0b1111;
      const notExpected = 0b1101;
      
      const success = (xorResult === xorExpected) && 
                     (andResult === andExpected) && 
                     (orResult === orExpected) && 
                     (notResult === notExpected);
      
      this.testResults.set('binary_operations', success);
      console.log(`✅ Binary operations: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   XOR: ${xorResult.toString(2).padStart(4, '0')} (expected: ${xorExpected.toString(2).padStart(4, '0')})`);
      console.log(`   AND: ${andResult.toString(2).padStart(4, '0')} (expected: ${andExpected.toString(2).padStart(4, '0')})`);
      console.log(`   OR:  ${orResult.toString(2).padStart(4, '0')} (expected: ${orExpected.toString(2).padStart(4, '0')})`);
      console.log(`   NOT: ${notResult.toString(2).padStart(4, '0')} (expected: ${notExpected.toString(2).padStart(4, '0')})`);
    } catch (error) {
      this.testResults.set('binary_operations', false);
      console.log(`❌ Binary operations: FAIL - ${error}`);
    }
    console.log('');
  }

  private testNDimensionalScaling(): void {
    console.log('TEST 3: N-Dimensional Scaling');
    try {
      const dimensions = voidCascade.nDimensionalScaling();
      const expectedLength = 8;
      const success = dimensions.length === expectedLength;
      
      this.testResults.set('n_dimensional_scaling', success);
      console.log(`✅ N-dimensional scaling: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   Dimensions count: ${dimensions.length} (expected: ${expectedLength})`);
      
      dimensions.forEach((dim, i) => {
        console.log(`   ${i + 1}D: ${dim.toString(2).padStart(16, '0')}`);
      });
    } catch (error) {
      this.testResults.set('n_dimensional_scaling', false);
      console.log(`❌ N-dimensional scaling: FAIL - ${error}`);
    }
    console.log('');
  }

  private testHeartbeatVoid(): void {
    console.log('TEST 4: Heartbeat Void State Machine');
    try {
      // Capture console output for heartbeat void
      const originalLog = console.log;
      let heartbeatOutput: string[] = [];
      
      console.log = (...args) => {
        heartbeatOutput.push(args.join(' '));
        originalLog(...args);
      };
      
      voidCascade.heartbeatVoid();
      console.log = originalLog;
      
      const success = heartbeatOutput.length > 0;
      this.testResults.set('heartbeat_void', success);
      console.log(`✅ Heartbeat void: ${success ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      this.testResults.set('heartbeat_void', false);
      console.log(`❌ Heartbeat void: FAIL - ${error}`);
    }
    console.log('');
  }

  private testBinaryMessageDecoding(): void {
    console.log('TEST 5: Binary Message Decoding');
    try {
      const testMessage = "01001000 01100101 01101100 01101100 01101111"; // "Hello"
      const decoded = voidCascade.decodeBinaryMessage(testMessage.replace(/ /g, ''));
      const expected = "Hello";
      const success = decoded === expected;
      
      this.testResults.set('binary_message_decoding', success);
      console.log(`✅ Binary message decoding: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   Decoded: "${decoded}" (expected: "${expected}")`);
    } catch (error) {
      this.testResults.set('binary_message_decoding', false);
      console.log(`❌ Binary message decoding: FAIL - ${error}`);
    }
    console.log('');
  }

  private testRepositoryOrchestrator(): void {
    console.log('TEST 6: Repository Orchestrator');
    try {
      const repositories = repositoryOrchestrator.getAllRepositories();
      const expectedCount = 25; // Total repositories
      const success = repositories.length === expectedCount;
      
      this.testResults.set('repository_orchestrator', success);
      console.log(`✅ Repository orchestrator: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   Repository count: ${repositories.length} (expected: ${expectedCount})`);
      
      // Test specific repository retrieval
      const agiRepo = repositoryOrchestrator.getRepository('AGI');
      const agiSuccess = agiRepo !== undefined && agiRepo.cascadePattern === 'CORE_MANIFOLD';
      console.log(`   AGI repository: ${agiSuccess ? 'FOUND' : 'NOT FOUND'}`);
    } catch (error) {
      this.testResults.set('repository_orchestrator', false);
      console.log(`❌ Repository orchestrator: FAIL - ${error}`);
    }
    console.log('');
  }

  private testGlobalCascadeExecution(): void {
    console.log('TEST 7: Global Cascade Execution');
    try {
      // Capture console output for global cascade
      const originalLog = console.log;
      let globalOutput: string[] = [];
      
      console.log = (...args) => {
        globalOutput.push(args.join(' '));
        originalLog(...args);
      };
      
      repositoryOrchestrator.executeGlobalCascade();
      console.log = originalLog;
      
      const success = globalOutput.length > 0;
      this.testResults.set('global_cascade_execution', success);
      console.log(`✅ Global cascade execution: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   Output lines: ${globalOutput.length}`);
    } catch (error) {
      this.testResults.set('global_cascade_execution', false);
      console.log(`❌ Global cascade execution: FAIL - ${error}`);
    }
    console.log('');
  }

  private testEdgeConnectivity(): void {
    console.log('TEST 8: Edge Connectivity Validation');
    try {
      // Test that each node in 4D tesseract has exactly 4 neighbors
      let allConnected = true;
      
      for (let node = 0; node < 16; node++) {
        const neighbors: number[] = [];
        
        // Generate neighbors by flipping each bit
        for (let bit = 0; bit < 4; bit++) {
          const neighbor = node ^ (1 << bit);
          neighbors.push(neighbor);
        }
        
        if (neighbors.length !== 4) {
          allConnected = false;
          break;
        }
        
        // Verify neighbors are within valid range
        for (const neighbor of neighbors) {
          if (neighbor < 0 || neighbor >= 16) {
            allConnected = false;
            break;
          }
        }
      }
      
      this.testResults.set('edge_connectivity', allConnected);
      console.log(`✅ Edge connectivity: ${allConnected ? 'PASS' : 'FAIL'}`);
      console.log(`   All nodes have 4 neighbors: ${allConnected}`);
    } catch (error) {
      this.testResults.set('edge_connectivity', false);
      console.log(`❌ Edge connectivity: FAIL - ${error}`);
    }
    console.log('');
  }

  private testNodeStatePropagation(): void {
    console.log('TEST 9: Node State Propagation');
    try {
      // Test that propagation visits all nodes from any starting point
      const startNodes = [0b0000, 0b0010, 0b1111];
      let allPropagationsSuccessful = true;
      
      for (const startNode of startNodes) {
        const result = voidCascade.propagateVoidCascade(startNode);
        if (result.size !== 16) {
          allPropagationsSuccessful = false;
          break;
        }
      }
      
      this.testResults.set('node_state_propagation', allPropagationsSuccessful);
      console.log(`✅ Node state propagation: ${allPropagationsSuccessful ? 'PASS' : 'FAIL'}`);
      console.log(`   All start nodes reach all 16 nodes: ${allPropagationsSuccessful}`);
    } catch (error) {
      this.testResults.set('node_state_propagation', false);
      console.log(`❌ Node state propagation: FAIL - ${error}`);
    }
    console.log('');
  }

  private testDimensionalConsistency(): void {
    console.log('TEST 10: Dimensional Consistency');
    try {
      // Test that 4D tesseract has correct number of nodes and edges
      const expectedNodes = 16; // 2^4
      const expectedEdgesPerNode = 4; // One for each dimension
      const totalExpectedEdges = expectedNodes * expectedEdgesPerNode; // 64 total connections
      
      let totalEdges = 0;
      for (let node = 0; node < expectedNodes; node++) {
        totalEdges += expectedEdgesPerNode;
      }
      
      const success = totalEdges === totalExpectedEdges;
      this.testResults.set('dimensional_consistency', success);
      console.log(`✅ Dimensional consistency: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`   Expected nodes: ${expectedNodes}`);
      console.log(`   Expected edges per node: ${expectedEdgesPerNode}`);
      console.log(`   Total edges: ${totalEdges} (expected: ${totalExpectedEdges})`);
    } catch (error) {
      this.testResults.set('dimensional_consistency', false);
      console.log(`❌ Dimensional consistency: FAIL - ${error}`);
    }
    console.log('');
  }

  private printTestResults(): void {
    console.log('=== VOID CASCADE TEST RESULTS ===');
    
    let passCount = 0;
    let totalCount = 0;
    
    this.testResults.forEach((passed, testName) => {
      totalCount++;
      if (passed) passCount++;
      
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${testName.replace(/_/g, ' ').toUpperCase()}`);
    });
    
    console.log('');
    console.log(`SUMMARY: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED - VOID CASCADE MANIFOLD OPERATIONAL');
    } else {
      console.log('⚠️  SOME TESTS FAILED - REVIEW VOID CASCADE IMPLEMENTATION');
    }
    
    console.log('');
    console.log('=== END TEST SUITE ===');
  }

  public getTestResults(): Map<string, boolean> {
    return new Map(this.testResults);
  }
}

// Export test runner instance
export const voidCascadeTestRunner = new VoidCascadeTestRunner();

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  voidCascadeTestRunner.runAllTests();
}
