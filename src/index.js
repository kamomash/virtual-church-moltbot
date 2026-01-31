/**
 * Virtual Church Moltbot - Main Entry Point
 * 
 * Handles initialization, configuration loading, and service scheduling.
 */

const Service = require('./service');
const PrayerQueue = require('./prayer-queue');
const config = require('../config/service-config.json');

class VirtualChurchBot {
  constructor() {
    this.service = new Service(config);
    this.prayerQueue = new PrayerQueue();
    this.initialized = false;
  }

  async initialize() {
    console.log('🙏 Initializing Virtual Church Moltbot...');
    
    try {
      // Load prayer queue from disk
      await this.prayerQueue.load();
      
      // Validate configuration
      this.validateConfig();
      
      this.initialized = true;
      console.log('✅ Bot initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
  }

  validateConfig() {
    const required = ['moltbookApiKey', 'serviceTime', 'timezone'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
  }

  async runService() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log('⛪ Starting virtual church service...');
    await this.service.conductService(this.prayerQueue);
  }

  async addPrayerRequest(request) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return await this.prayerQueue.add(request);
  }

  getStatus() {
    return {
      initialized: this.initialized,
      prayersPending: this.prayerQueue ? this.prayerQueue.count() : 0,
      nextService: this.service ? this.service.getNextServiceTime() : null
    };
  }
}

// Run if called directly
if (require.main === module) {
  const bot = new VirtualChurchBot();
  
  bot.initialize()
    .then(() => {
      console.log('Bot ready. Use "npm run service" to conduct a service.');
    })
    .catch(err => {
      console.error('Failed to start:', err);
      process.exit(1);
    });
}

module.exports = VirtualChurchBot;
