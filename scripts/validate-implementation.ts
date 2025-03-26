#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { performanceMonitor } from '../src/utils/performance';

interface Requirement {
  id: string;
  category: string;
  description: string;
  validation: () => Promise<boolean>;
  critical: boolean;
}

interface ValidationResult {
  requirement: Requirement;
  passed: boolean;
  error?: string;
}

const requirements: Requirement[] = [
  {
    id: 'MOBILE-1',
    category: 'Mobile Responsiveness',
    description: 'Side-by-side PDF viewer with swipe on mobile',
    validation: async () => {
      const pdfViewer = path.join(__dirname, '../src/components/pdf/PDFViewer.tsx');
      const content = fs.readFileSync(pdfViewer, 'utf8');
      return content.includes('onTouchStart') && content.includes('onTouchEnd');
    },
    critical: true
  },
  {
    id: 'UNIT-1',
    category: 'Unit Organization',
    description: 'Support for 6 units per subject',
    validation: async () => {
      const subjectsData = path.join(__dirname, '../src/lib/data/subjects.json');
      const content = JSON.parse(fs.readFileSync(subjectsData, 'utf8'));
      return Object.values(content.subjects).every((subject: any) => 
        subject.units && subject.units.length <= 6
      );
    },
    critical: true
  },
  {
    id: 'PERF-1',
    category: 'Performance',
    description: 'PDF load time under 3 seconds',
    validation: async () => {
      const metrics = performanceMonitor.getMetrics();
      const pdfLoads = metrics.filter(m => m.type === 'pdf-load');
      return pdfLoads.every(m => m.duration < 3000);
    },
    critical: true
  },
  {
    id: 'TOUCH-1',
    category: 'Touch Targets',
    description: 'All touch targets >= 44px',
    validation: async () => {
      const utils = path.join(__dirname, '../src/utils/testing.ts');
      const content = fs.readFileSync(utils, 'utf8');
      return content.includes('minTouchTargetSize: 44');
    },
    critical: true
  },
  {
    id: 'NAV-1',
    category: 'Navigation',
    description: 'Maximum 2 taps to reach papers',
    validation: async () => {
      const routeFiles = await findRouteFiles(path.join(__dirname, '../src/app'));
      // Check if we have direct routes to papers
      return routeFiles.some(file => file.includes('[subject]') && file.includes('page.tsx'));
    },
    critical: true
  }
];

async function findRouteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findRouteFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function validateImplementation(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  console.log('🔍 Validating implementation against requirements...\n');
  
  for (const req of requirements) {
    try {
      const passed = await req.validation();
      results.push({
        requirement: req,
        passed
      });
      
      console.log(`${passed ? '✅' : '❌'} ${req.category}: ${req.description}`);
      
    } catch (error) {
      results.push({
        requirement: req,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log(`❌ ${req.category}: ${req.description} (Error: ${error})`);
    }
  }

  // Generate summary
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const criticalFailed = results.filter(r => !r.passed && r.requirement.critical).length;

  console.log('\n📊 Validation Summary');
  console.log('==================');
  console.log(`Total Requirements: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Critical Issues: ${criticalFailed}`);

  if (criticalFailed > 0) {
    console.log('\n⚠️ Critical requirements not met:');
    results
      .filter(r => !r.passed && r.requirement.critical)
      .forEach(r => {
        console.log(`- ${r.requirement.id}: ${r.requirement.description}`);
      });
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total,
      passed,
      failed,
      criticalFailed
    }
  };

  const reportDir = path.join(__dirname, '../validation-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }

  fs.writeFileSync(
    path.join(reportDir, `validation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify(report, null, 2)
  );

  return results;
}

if (require.main === module) {
  validateImplementation()
    .then(results => {
      const criticalFailed = results.some(r => !r.passed && r.requirement.critical);
      process.exit(criticalFailed ? 1 : 0);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export { validateImplementation, requirements };