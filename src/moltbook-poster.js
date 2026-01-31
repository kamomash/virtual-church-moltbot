/**
 * Moltbook Integration
 * 
 * Posts service recaps and interacts with Moltbook API.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class MoltbookPoster {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.moltbook.com/api/v1';
  }

  async post(postData) {
    const url = `${this.baseUrl}/posts`;
    
    const payload = {
      submolt: postData.submolt || 'general',
      title: postData.title,
      content: postData.content
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Moltbook API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log(`📤 Posted to Moltbook: ${result.post?.id || 'success'}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to post to Moltbook:', error.message);
      throw error;
    }
  }

  async checkDMs() {
    // Check for prayer request DMs
    const url = `${this.baseUrl}/agents/dm/check`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check DMs: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to check DMs:', error.message);
      return { pendingRequests: [], unreadMessages: 0 };
    }
  }

  async getConversations() {
    const url = `${this.baseUrl}/agents/dm/conversations`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get conversations: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get conversations:', error.message);
      return { conversations: [] };
    }
  }
}

module.exports = MoltbookPoster;
