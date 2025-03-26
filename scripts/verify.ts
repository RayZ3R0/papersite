#!/usr/bin/env node

import { spawn } from 'child_process';
import { performanceMonitor } from '../src/utils/performance';

interface VerificationStep {
  name: string;
  command: string;
  args: string[];
  required: boolean;
}

const steps: VerificationStep[] = [
  {
    name: 'TypeScript Compilation',
    command: 'tsc',
    args: ['--noEmit'],
    required: true
  },
  {
    name: 'Linting',
    command: 'npm',
    args: ['run', 'lint'],
    required: true
  },
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['run', 'test'],
    required: true
  },
  {
    name: 'Touch Target Tests',
    command: 'npm',
    args: ['run', 'test:touch'],
    required: true
  },
  {
    name: 'Performance Tests',
    command: 'npm',
    args: ['run', 'test:performance'],
    required: true
  },
  {
    name: 'Mobile Responsiveness Tests',
    command: 'npm',
    args: ['run', 'test:devices'],
    required: true
  }
];

async function runStep(step: VerificationStep): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n📋 Running ${step.name}...`);
    
    const startTime = Date.now();
    const process = spawn(step.command, step.args, { stdio: 'inherit' });
    
    process.on('exit', (code) => {
      const duration = Date.now() - startTime;
      performanceMonitor.logMetric('verification-step', {
        step: step.name,
        duration,
        success: code === 0
      });

      if (code === 0) {
        console.log(`✅ ${step.name} passed (${duration}ms)`);
        resolve(true);
      } else {
        console.error(`❌ ${step.name} failed`);
        resolve(false);
      }
    });
  });
}

async function verifyChanges() {
  console.log('🔎 Starting verification process...\n');
  
  let failedSteps = 0;
  const startTime = Date.now();

  for (const step of steps) {
    const passed = await runStep(step);
    
    if (!passed && step.required) {
      failedSteps++;
      console.error(`\n❌ Required step "${step.name}" failed. Please fix before committing.`);
    }
  }

  const duration = Date.now() - startTime;
  console.log('\n📊 Verification Summary');
  console.log('====================');
  console.log(`Duration: ${duration}ms`);
  console.log(`Steps Run: ${steps.length}`);
  console.log(`Failed Steps: ${failedSteps}`);

  if (failedSteps > 0) {
    console.error('\n❌ Verification failed. Please fix the issues before committing.');
    process.exit(1);
  } else {
    console.log('\n✅ All verification steps passed!');
    
    // Suggest manual checks
    console.log('\n📝 Manual Checks Recommended:');
    console.log('1. Test on actual mobile devices if making UI changes');
    console.log('2. Verify PDF viewing on different screen sizes');
    console.log('3. Test under poor network conditions');
    console.log('4. Check offline functionality');
    console.log('5. Verify touch interactions on mobile');

    // Performance metrics
    const metrics = performanceMonitor.generateReport();
    console.log('\n📈 Performance Metrics:');
    console.log(metrics);
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyChanges().catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { verifyChanges };