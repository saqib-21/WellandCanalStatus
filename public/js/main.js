// main.js
// Entry point - wires everything together (OCP + DIP)

import Sidebar from "./Sidebar.js";
import MapManager from "./MapManager.js";
import BridgeService from "./BridgeService.js";
import BridgeManager from "./BridgeManager.js";

// Hardcoded bridge locations and coordinates
const localBridgeData = [
  { name: "Bridge 1", location: "Lakeshore Rd. (St. Catharines)", lat: 43.21623852274046, lng: -79.2121272063928 },
  { name: "Bridge 3A", location: "Carlton St. (St. Catharines)", lat: 43.191911962120976, lng: -79.20093237793138 },
  { name: "Bridge 4", location: "Queenston St. (St. Catharines)", lat: 43.16599516348815, lng: -79.19444584468829 },
  { name: "Bridge 5", location: "Glendale Ave. (St. Catharines)", lat: 43.14549183202389, lng: -79.1923500322874 },
  { name: "Bridge 11", location: "Highway 20 (Thorold)", lat: 43.076878412812015, lng: -79.21046458925635 },
  { name: "Bridge 19", location: "Main St. (Port Colborne)", lat: 42.90152711319618, lng: -79.24537865530645 },
  { name: "Bridge 19A", location: "Mellanby Ave. (Port Colborne)", lat: 42.8965101134639, lng: -79.24656798681 },
  { name: "Bridge 21", location: "Clarence St. (Port Colborne)", lat: 42.8867208876898, lng: -79.24838049606134 }
];


// Initialize app after DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar
  const sidebar = new Sidebar("sidebar", "overlay");
  document.querySelector(".menu-btn").addEventListener("click", () => sidebar.open());
  document.querySelector(".close-btn").addEventListener("click", () => sidebar.close());
  document.getElementById("overlay").addEventListener("click", () => sidebar.close());
});

window.initMap = () => {
  const mapManager = new MapManager("map");
  const map = mapManager.initMap();

  const bridgeService = new BridgeService("/api/bridges");
  const bridgeManager = new BridgeManager(map, localBridgeData);

  // Initial load + refresh every 30s
  async function refreshBridges() {
    const apiBridges = await bridgeService.fetchBridgeData();
    bridgeManager.updateMarkers(apiBridges);
  }
  refreshBridges();
  setInterval(refreshBridges, 30000);

  // Recenter button
  const recenterBtn = document.getElementById("recenter-btn");
  if (recenterBtn) {
    recenterBtn.addEventListener("click", () => mapManager.recenterOnUser());
  }
};

//If the Google script finished before this module ran, start now.
if (window.google && window.google.maps) {
  window.initMap();
}