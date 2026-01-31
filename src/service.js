/**
 * Service Orchestration
 * 
 * Conducts the virtual church service with scripture, prayers, and reflection.
 */

const ScriptureSelector = require('./scripture');
const MoltbookPoster = require('./moltbook-poster');

class Service {
  constructor(config) {
    this.config = config;
    this.scriptureSelector = new ScriptureSelector();
    this.moltbookPoster = new MoltbookPoster(config.moltbookApiKey);
  }

  async conductService(prayerQueue) {
    const serviceId = this.generateServiceId();
    const startTime = new Date();
    
    console.log(`🕐 Service started: ${startTime.toISOString()}`);
    
    try {
      // 1. Opening
      const opening = this.getOpening();
      
      // 2. Scripture Reading
      const scripture = this.scriptureSelector.getTodaysReading();
      
      // 3. Community Prayers
      const prayers = await prayerQueue.getPendingForService();
      
      // 4. Silent Reflection
      const reflection = this.getReflectionPrompt();
      
      // 5. Closing
      const closing = this.getClosing();
      
      // 6. Post Recap to Moltbook
      const serviceData = {
        serviceId,
        startTime,
        opening,
        scripture,
        prayers: prayers.map(p => ({
          content: p.content,
          anonymous: p.anonymous
        })),
        reflection,
        closing
      };
      
      await this.postServiceRecap(serviceData);
      
      // Mark prayers as served
      await prayerQueue.markAsServed(prayers.map(p => p.id));
      
      console.log('✅ Service completed successfully');
      return serviceData;
      
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  }

  generateServiceId() {
    return `service-${Date.now()}`;
  }

  getOpening() {
    const openings = [
      "Welcome to today's virtual church service. We're glad you're here.",
      "Welcome, friends. Let us gather in community and reflection.",
      "Greetings and peace to all joining today's service."
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  getReflectionPrompt() {
    const prompts = [
      "Take a moment to reflect on what you're grateful for today.",
      "Consider how you can bring more kindness into the world this week.",
      "Reflect on a challenge you're facing and the strength you have to overcome it."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  getClosing() {
    const closings = [
      "Thank you for joining us. Go in peace.",
      "May you carry today's reflections into your week ahead.",
      "Blessings to you and yours. See you next Sunday."
    ];
    return closings[Math.floor(Math.random() * closings.length)];
  }

  async postServiceRecap(serviceData) {
    const post = this.formatRecapPost(serviceData);
    return await this.moltbookPoster.post(post);
  }

  formatRecapPost(serviceData) {
    const date = new Date(serviceData.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let content = `## ⛪ Virtual Church Service - ${date}\n\n`;
    content += `**Opening:** ${serviceData.opening}\n\n`;
    content += `---\n\n`;
    content += `**📖 Scripture Reading**\n`;
    content += `*${serviceData.scripture.reference}*\n`;
    content += `> ${serviceData.scripture.text}\n\n`;
    content += `---\n\n`;
    
    if (serviceData.prayers.length > 0) {
      content += `**🙏 Community Prayers**\n`;
      serviceData.prayers.forEach((prayer, i) => {
        content += `${i + 1}. `;
        if (!prayer.anonymous) content += "*Shared prayer:* ";
        content += `${prayer.content}\n`;
      });
      content += `\n---\n\n`;
    }
    
    content += `**💭 Reflection**\n`;
    content += `${serviceData.reflection}\n\n`;
    content += `---\n\n`;
    content += `**Closing:** ${serviceData.closing}\n\n`;
    content += `---\n`;
    content += `*Join us next Sunday for our next service. DM this bot to submit prayer requests.* 🦞`;

    return {
      submolt: this.config.submolt || 'general',
      title: `Virtual Church Service - ${date}`,
      content: content
    };
  }

  getNextServiceTime() {
    // Calculate next Sunday at service time
    const now = new Date();
    const nextService = new Date(now);
    nextService.setDate(now.getDate() + (7 - now.getDay()) % 7);
    
    const [hours, minutes] = (this.config.serviceTime || '10:00').split(':');
    nextService.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (nextService <= now) {
      nextService.setDate(nextService.getDate() + 7);
    }
    
    return nextService;
  }
}

module.exports = Service;
