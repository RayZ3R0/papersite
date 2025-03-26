import { runE2ETests } from '../src/utils/e2e';
import { testingUtils } from '../src/utils/testing';
import { performanceMonitor } from '../src/utils/performance';

interface TestSuiteResult {
  name: string;
  passed: boolean;
  details: any;
  errors: string[];
}

async function runAllTests() {
  const results: TestSuiteResult[] = [];
  const startTime = Date.now();

  try {
    // 1. Run E2E Tests
    console.log('\n🔄 Running E2E Tests...');
    const e2eResults = await runE2ETests();
    results.push({
      name: 'E2E Tests',
      passed: !JSON.parse(e2eResults).criticalPathTests.some((t: any) => !t.success),
      details: e2eResults,
      errors: []
    });

    // 2. Check Touch Targets
    console.log('\n🔄 Validating Touch Targets...');
    const touchErrors = await testingUtils.verifyTouchTargets();
    results.push({
      name: 'Touch Target Size Validation',
      passed: touchErrors.length === 0,
      details: { errors: touchErrors },
      errors: touchErrors
    });

    // 3. Performance Tests
    console.log('\n🔄 Running Performance Tests...');
    const perfReport = performanceMonitor.generateReport();
    const perfData = JSON.parse(perfReport);
    results.push({
      name: 'Performance Tests',
      passed: validatePerformanceMetrics(perfData),
      details: perfReport,
      errors: getPerformanceErrors(perfData)
    });

    // Generate Final Report
    const report = generateReport(results, startTime);
    saveReport(report);
    
    // Print Summary
    printSummary(report);

    // Exit with appropriate code
    process.exit(results.every(r => r.passed) ? 0 : 1);

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

function validatePerformanceMetrics(data: any): boolean {
  const requirements = {
    maxPDFLoadTime: 3000, // 3 seconds
    maxSearchResponseTime: 500, // 500ms
    maxNavigationTime: 2000, // 2 seconds
  };

  return (
    data.summary.averagePDFLoadTime < requirements.maxPDFLoadTime &&
    data.summary.averagePageLoadTime < requirements.maxNavigationTime
  );
}

function getPerformanceErrors(data: any): string[] {
  const errors: string[] = [];
  
  if (data.summary.averagePDFLoadTime > 3000) {
    errors.push(`PDF load time (${data.summary.averagePDFLoadTime}ms) exceeds 3000ms limit`);
  }
  
  if (data.summary.averagePageLoadTime > 2000) {
    errors.push(`Page load time (${data.summary.averagePageLoadTime}ms) exceeds 2000ms limit`);
  }

  return errors;
}

function generateReport(results: TestSuiteResult[], startTime: number): any {
  return {
    timestamp: new Date().toISOString(),
    duration: Date.now() - startTime,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests: results.filter(r => !r.passed).length,
    results: results,
    summary: generateSummary(results)
  };
}

function generateSummary(results: TestSuiteResult[]): any {
  return {
    overall: results.every(r => r.passed) ? 'PASS' : 'FAIL',
    criticalIssues: results.filter(r => !r.passed).length,
    errorCount: results.reduce((sum, r) => sum + r.errors.length, 0),
    categories: {
      e2e: results.find(r => r.name === 'E2E Tests')?.passed,
      touch: results.find(r => r.name === 'Touch Target Size Validation')?.passed,
      performance: results.find(r => r.name === 'Performance Tests')?.passed
    }
  };
}

function saveReport(report: any): void {
  const fs = require('fs');
  const path = require('path');
  
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const filename = `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(
    path.join(reportsDir, filename),
    JSON.stringify(report, null, 2)
  );
}

function printSummary(report: any): void {
  console.log('\n📊 Test Summary');
  console.log('==============');
  console.log(`Status: ${report.summary.overall === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Total Tests: ${report.totalTests}`);
  console.log(`Passed: ${report.passedTests}`);
  console.log(`Failed: ${report.failedTests}`);
  console.log(`Critical Issues: ${report.summary.criticalIssues}`);
  console.log(`Total Errors: ${report.summary.errorCount}`);
  console.log('\nCategory Results:');
  console.log(`E2E Tests: ${report.summary.categories.e2e ? '✅' : '❌'}`);
  console.log(`Touch Validation: ${report.summary.categories.touch ? '✅' : '❌'}`);
  console.log(`Performance: ${report.summary.categories.performance ? '✅' : '❌'}`);
  console.log('\nDetailed report saved to test-reports/');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}