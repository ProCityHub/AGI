#!/usr/bin/env ts-node

/**
 * Fork and Fix All Repositories Script
 * 
 * Comprehensive script to fork and fix all repositories across
 * ProCityHub organization using the best AI orchestration system.
 * 
 * @author ProCityHub AI Development Team
 * @version 1.0.0
 */

import { initializeRepositoryForkAndFixService } from '../services/repositoryForkAndFixService';
import { masterAGIOrchestrator } from '../src/orchestrator/MasterAGIOrchestrator';

async function main() {
  console.log('🚀 [MAIN] Starting comprehensive repository fork and fix operation...');
  console.log('🤖 [AI] Using Master AGI Orchestrator for best AI-powered fixes');
  
  try {
    // Initialize the fork and fix service
    console.log('🔧 [INIT] Initializing Repository Fork and Fix Service...');
    const forkAndFixService = initializeRepositoryForkAndFixService();
    
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Execute comprehensive fork and fix operation
    console.log('🍴 [EXECUTE] Starting AI-powered fork and fix for ALL repositories...');
    const results = await forkAndFixService.forkAndFixAllRepositories();
    
    // Display comprehensive results
    console.log('\n🎉 [RESULTS] Fork and Fix Operation Complete!');
    console.log('=' .repeat(80));
    
    const statistics = forkAndFixService.getStatistics();
    
    console.log(`📊 [STATS] Total Repositories Processed: ${statistics.totalRepositories}`);
    console.log(`📊 [STATS] Average Health Score: ${statistics.averageHealthScore.toFixed(1)}/100`);
    console.log(`📊 [STATS] Total Issues Identified: ${statistics.totalIssuesIdentified}`);
    console.log(`📊 [STATS] Total Issues Resolved: ${statistics.totalIssuesResolved}`);
    console.log(`📊 [STATS] Total Fixes Applied: ${statistics.totalFixesApplied}`);
    console.log(`📊 [STATS] Successful Forks: ${statistics.successfulForks}`);
    console.log(`📊 [STATS] Average Improvement Score: ${statistics.averageImprovementScore.toFixed(1)}/100`);
    
    console.log('\n🏗️ [COMPLEXITY] Repository Distribution:');
    console.log(`  - Low Complexity: ${statistics.repositoriesByComplexity.low}`);
    console.log(`  - Medium Complexity: ${statistics.repositoriesByComplexity.medium}`);
    console.log(`  - High Complexity: ${statistics.repositoriesByComplexity.high}`);
    console.log(`  - Extreme Complexity: ${statistics.repositoriesByComplexity.extreme}`);
    
    console.log('\n🐛 [ISSUES] Issues by Type:');
    console.log(`  - Security: ${statistics.issuesByType.security}`);
    console.log(`  - Performance: ${statistics.issuesByType.performance}`);
    console.log(`  - Documentation: ${statistics.issuesByType.documentation}`);
    console.log(`  - Dependencies: ${statistics.issuesByType.dependencies}`);
    console.log(`  - Code Quality: ${statistics.issuesByType.code_quality}`);
    console.log(`  - Testing: ${statistics.issuesByType.testing}`);
    
    console.log('\n📋 [DETAILED RESULTS] Individual Repository Results:');
    console.log('=' .repeat(80));
    
    const allResults = forkAndFixService.getAllForkResults();
    allResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.originalRepo}`);
      console.log(`   Status: ${result.status === 'success' ? '✅ SUCCESS' : result.status === 'partial' ? '⚠️ PARTIAL' : '❌ FAILED'}`);
      console.log(`   Forked to: ${result.forkedRepo || 'N/A'}`);
      console.log(`   Fixes Applied: ${result.fixesApplied}`);
      console.log(`   Issues Resolved: ${result.issuesResolved.length}`);
      console.log(`   Remaining Issues: ${result.remainingIssues.length}`);
      console.log(`   Improvement Score: ${result.improvementScore.toFixed(1)}/100`);
      
      if (result.pullRequestUrl) {
        console.log(`   Pull Request: ${result.pullRequestUrl}`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.issuesResolved.length > 0) {
        console.log(`   Resolved Issues:`);
        result.issuesResolved.forEach(issue => {
          console.log(`     - ${issue.type}: ${issue.description}`);
        });
      }
    });
    
    console.log('\n🎯 [SUMMARY] Operation Summary:');
    console.log('=' .repeat(80));
    console.log(`✅ Successfully processed ${statistics.successfulForks} repositories`);
    console.log(`🔧 Applied ${statistics.totalFixesApplied} AI-powered fixes`);
    console.log(`🐛 Resolved ${statistics.totalIssuesResolved} issues across all repositories`);
    console.log(`📈 Average improvement: ${statistics.averageImprovementScore.toFixed(1)} points`);
    
    const topIssueType = Object.entries(statistics.issuesByType)
      .sort(([,a], [,b]) => (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0))[0];
    console.log(`🎯 Most common issue type: ${topIssueType[0]} (${topIssueType[1]} occurrences)`);
    
    console.log('\n🚀 [NEXT STEPS] Recommended Actions:');
    console.log('1. Review all generated pull requests');
    console.log('2. Test the fixes in staging environments');
    console.log('3. Merge approved fixes to main branches');
    console.log('4. Monitor repository health scores');
    console.log('5. Address remaining manual fix requirements');
    
    console.log('\n🎉 [SUCCESS] All repositories have been forked and fixed with the best AI!');
    
  } catch (error) {
    console.error('❌ [ERROR] Fork and fix operation failed:', error);
    process.exit(1);
  }
}

// Execute the main function
if (require.main === module) {
  main().catch(error => {
    console.error('💥 [FATAL] Unhandled error:', error);
    process.exit(1);
  });
}

export { main as forkAndFixAllRepositories };
