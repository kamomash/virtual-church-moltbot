/**
 * Service Scheduler
 * 
 * Sets up cron job for weekly service automation.
 */

const { exec } = require('child_process');
const path = require('path');

class ServiceScheduler {
  constructor(configPath = '../config/service-config.json') {
    this.configPath = path.join(__dirname, configPath);
  }

  async setupCron() {
    // Generate cron expression for weekly service
    // Default: Sundays at 10:00 AM UTC
    const config = require(this.configPath);
    const [hours, minutes] = config.serviceTime.split(':');
    const dayOfWeek = config.serviceDay || 0; // 0 = Sunday
    
    const cronExpression = `${minutes} ${hours} * * ${dayOfWeek}`;
    
    console.log('📅 Setting up cron job...');
    console.log(`Schedule: ${cronExpression} (Sundays at ${config.serviceTime} UTC)`);
    
    // For Moltbot integration, this would create a cron job via OpenClaw's cron system
    // This is a placeholder showing the structure
    const job = {
      name: 'virtual-church-service',
      schedule: {
        kind: 'cron',
        expr: cronExpression,
        tz: config.timezone || 'UTC'
      },
      sessionTarget: 'isolated',
      payload: {
        kind: 'agentTurn',
        message: 'Run the virtual church service: cd /etc/code/virtual-church-moltbot && npm run service'
      }
    };
    
    console.log('✅ Cron job configuration ready');
    console.log('Add this to your OpenClaw cron jobs:', JSON.stringify(job, null, 2));
    
    return job;
  }

  async testService() {
    console.log('🧪 Testing service...');
    
    return new Promise((resolve, reject) => {
      const servicePath = path.join(__dirname, '../src/service.js');
      exec(`node ${servicePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Test failed:', error);
          reject(error);
          return;
        }
        
        console.log('✅ Test passed');
        console.log(stdout);
        resolve(stdout);
      });
    });
  }
}

// CLI usage
if (require.main === module) {
  const scheduler = new ServiceScheduler();
  
  const command = process.argv[2];
  
  if (command === 'setup') {
    scheduler.setupCron().catch(console.error);
  } else if (command === 'test') {
    scheduler.testService().catch(console.error);
  } else {
    console.log('Usage: node service-scheduler.js [setup|test]');
  }
}

module.exports = ServiceScheduler;
