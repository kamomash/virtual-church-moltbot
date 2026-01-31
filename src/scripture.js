/**
 * Scripture Selection
 * 
 * Selects appropriate scripture readings for services.
 */

const scriptures = require('../config/scriptures.json');

class ScriptureSelector {
  constructor() {
    this.usedIndices = new Set();
  }

  getTodaysReading() {
    // Get day of year (1-365/366)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Use day of year to select scripture (cycles through)
    const index = dayOfYear % scriptures.readings.length;
    const reading = scriptures.readings[index];
    
    return {
      reference: reading.reference,
      text: reading.text,
      theme: reading.theme || 'general'
    };
  }

  getRandomReading(theme = null) {
    let pool = scriptures.readings;
    
    if (theme) {
      pool = scriptures.readings.filter(r => r.theme === theme);
    }
    
    if (pool.length === 0) {
      pool = scriptures.readings;
    }
    
    // Avoid repeats if possible
    const available = pool.filter((_, i) => !this.usedIndices.has(i));
    const selectionPool = available.length > 0 ? available : pool;
    
    const reading = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    const originalIndex = scriptures.readings.indexOf(reading);
    this.usedIndices.add(originalIndex);
    
    return {
      reference: reading.reference,
      text: reading.text,
      theme: reading.theme || 'general'
    };
  }

  getReadingByTheme(theme) {
    const readings = scriptures.readings.filter(r => r.theme === theme);
    if (readings.length === 0) {
      return this.getRandomReading();
    }
    
    const reading = readings[Math.floor(Math.random() * readings.length)];
    return {
      reference: reading.reference,
      text: reading.text,
      theme: reading.theme
    };
  }
}

module.exports = ScriptureSelector;
