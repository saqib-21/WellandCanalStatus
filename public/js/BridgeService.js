// BridgeService.js
// Responsible for fetching bridge status data (SRP + DIP)

export default class BridgeService {
  constructor(apiUrl) {
    this.apiUrl = '/api/bridges'; // Now it will use relative path
  }

  async fetchBridgeData() {
    try {
      const res = await fetch(this.apiUrl);
      const data = await res.json();
      return Array.isArray(data.bridges) ? data.bridges : [];
    } catch (err) {
      console.error("Fetch error:", err);
      return [];
    }
  }
}
