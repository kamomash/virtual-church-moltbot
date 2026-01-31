/**
 * Prayer Queue Management
 * 
 * Handles prayer request submission, storage, and retrieval.
 */

const fs = require('fs').promises;
const path = require('path');

class PrayerQueue {
  constructor(dataDir = '../data') {
    this.dataFile = path.join(__dirname, dataDir, 'prayer-requests.json');
    this.prayers = [];
  }

  async load() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.prayers = JSON.parse(data);
      console.log(`📚 Loaded ${this.prayers.length} prayer requests`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, start fresh
        this.prayers = [];
        await this.save();
      } else {
        throw error;
      }
    }
  }

  async save() {
    const dir = path.dirname(this.dataFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.dataFile, JSON.stringify(this.prayers, null, 2));
  }

  async add(request) {
    const prayer = {
      id: this.generateId(),
      content: request.content,
      author: request.anonymous ? null : request.author,
      anonymous: request.anonymous || false,
      private: request.private || false,
      submittedAt: new Date().toISOString(),
      servedAt: null,
      status: 'pending'
    };

    // Validate
    if (!prayer.content || prayer.content.trim().length === 0) {
      throw new Error('Prayer content is required');
    }

    if (prayer.content.length > 500) {
      throw new Error('Prayer must be 500 characters or less');
    }

    this.prayers.push(prayer);
    await this.save();
    
    console.log(`🙏 Prayer added: ${prayer.id}`);
    return prayer;
  }

  async getPendingForService() {
    // Get pending, non-private prayers
    return this.prayers
      .filter(p => p.status === 'pending' && !p.private)
      .slice(0, 5); // Max 5 prayers per service
  }

  async markAsServed(ids) {
    const now = new Date().toISOString();
    let count = 0;
    
    for (const id of ids) {
      const prayer = this.prayers.find(p => p.id === id);
      if (prayer) {
        prayer.status = 'served';
        prayer.servedAt = now;
        count++;
      }
    }
    
    if (count > 0) {
      await this.save();
      console.log(`✅ Marked ${count} prayers as served`);
    }
    
    return count;
  }

  count() {
    return this.prayers.filter(p => p.status === 'pending').length;
  }

  getStats() {
    const total = this.prayers.length;
    const pending = this.prayers.filter(p => p.status === 'pending').length;
    const served = this.prayers.filter(p => p.status === 'served').length;
    
    return { total, pending, served };
  }

  generateId() {
    return `prayer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = PrayerQueue;
