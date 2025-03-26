#!/usr/bin/env node

import { execSync } from 'child_process';
import { performanceMonitor } from '../src/utils/performance';

interface NetworkProfile {
  name: string;
  download: string;
  upload: string;
  latency: string;
}

const profiles: { [key: string]: NetworkProfile } = {
  'fast-4g': {
    name: 'Fast 4G',
    download: '20mbps',
    upload: '10mbps',
    latency: '20ms'
  },
  '4g': {
    name: 'Regular 4G',
    download: '8mbps',
    upload: '4mbps',
    latency: '50ms'
  },
  'slow-3g': {
    name: 'Slow 3G',
    download: '1mbps',
    upload: '750kbps',
    latency: '100ms'
  },
  '2g': {
    name: '2G',
    download: '250kbps',
    upload: '100kbps',
    latency: '300ms'
  },
  'terrible': {
    name: 'Terrible Connection',
    download: '100kbps',
    upload: '50kbps',
    latency: '500ms'
  }
};

function setupThrottling(profile: NetworkProfile) {
  try {
    // Check if running as root/sudo
    if (process.getuid && process.getuid() !== 0) {
      console.error('⛔️ This script requires root/sudo privileges to modify network settings');
      process.exit(1);
    }

    // Clear any existing throttling
    execSync('tc qdisc del dev lo root');
    
    // Set up throttling
    execSync(`tc qdisc add dev lo root handle 1: htb default 12`);
    execSync(`tc class add dev lo parent 1:1 classid 1:12 htb rate ${profile.download} ceil ${profile.download}`);
    execSync(`tc qdisc add dev lo parent 1:12 netem delay ${profile.latency}`);

    console.log(`✅ Network throttling set to "${profile.name}"`);
    console.log(`📊 Settings:`);
    console.log(`   Download: ${profile.download}`);
    console.log(`   Upload: ${profile.upload}`);
    console.log(`   Latency: ${profile.latency}`);

    // Log the network change
    performanceMonitor.logMetric('network-simulation', {
      profile: profile.name,
      settings: profile
    });

  } catch (error) {
    console.error('❌ Failed to set network throttling:', error);
    process.exit(1);
  }
}

function clearThrottling() {
  try {
    execSync('tc qdisc del dev lo root');
    console.log('✅ Network throttling cleared');
    
    performanceMonitor.logMetric('network-simulation', {
      profile: 'none',
      settings: 'cleared'
    });

  } catch (error) {
    console.error('❌ Failed to clear network throttling:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📡 Network Simulator
==================

Usage: npm run network-sim [profile|clear]

Available profiles:
${Object.entries(profiles)
  .map(([key, profile]) => `  - ${key}: ${profile.name}`)
  .join('\n')}

Examples:
  npm run network-sim 4g         # Simulate 4G connection
  npm run network-sim slow-3g    # Simulate slow 3G connection
  npm run network-sim clear      # Clear network throttling

Note: Requires sudo/root privileges to modify network settings
`);
}

// Main execution
if (require.main === module) {
  const profile = process.argv[2];

  if (!profile) {
    showHelp();
    process.exit(0);
  }

  if (profile === 'clear') {
    clearThrottling();
  } else if (profiles[profile]) {
    setupThrottling(profiles[profile]);
  } else {
    console.error(`❌ Unknown profile: ${profile}`);
    showHelp();
    process.exit(1);
  }
}