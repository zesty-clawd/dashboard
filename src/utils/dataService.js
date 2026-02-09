// Service to handle data fetching for the dashboard
import axios from 'axios';

class DataService {
  constructor() {
    this.basePath = '/api';
  }

  async fetchQuestStats() {
    try {
      const response = await fetch('/api/quests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quest stats:', error);
      return {
        active: [],
        completed: []
      };
    }
  }

  async fetchHealthStatus() {
    try {
      const response = await fetch('/api/health');
      return await response.json();
    } catch (error) {
      console.error('Error fetching health status:', error);
      return {
        last_check_summary: 'System operational',
        reported_alerts: []
      };
    }
  }

  async fetchMoltbookKarma() {
    try {
      const response = await fetch('/api/karma');
      const data = await response.json();
      return data.karma || 0;
    } catch (error) {
      console.error('Error fetching Moltbook karma:', error);
      return 0;
    }
  }

  async fetchStickers() {
    try {
      const response = await fetch('/api/stickers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stickers:', error);
      return [];
    }
  }
}

export default new DataService();