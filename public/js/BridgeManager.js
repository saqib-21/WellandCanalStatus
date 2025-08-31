// BridgeManager.js
// Handles adding and updating bridge markers (SRP)

export default class BridgeManager {
  constructor(map, localBridgeData) {
    this.map = map;
    this.localBridgeData = localBridgeData;
    this.bridgeMarkers = [];
  }

  // Returns a color string based on the bridge status
getStatusColor(status) {
  if (status.toLowerCase().includes("available")) return "green";
  if (status.toLowerCase().includes("raising soon")) return "yellow";
  if (status.toLowerCase().includes("lowering")) return "purple";
  if (status.toLowerCase().includes("unavailable") || 
      status.toLowerCase().includes("raised") || 
      status.toLowerCase().includes("closed")) {
    return "red";
  }
  return "gray";
}

// Clears all existing bridge markers from the map
  clearMarkers() {
    this.bridgeMarkers.forEach(marker => marker.setMap(null));
    this.bridgeMarkers = [];
  }

  // Updates markers based on latest API data
  updateMarkers(apiBridges) {
    this.clearMarkers();

    this.localBridgeData.forEach(localBridge => {
      const apiBridge = apiBridges.find(b => b.name === localBridge.name);
      const status = apiBridge ? apiBridge.status.status : "Unknown";
      this.addMarker({ ...localBridge, status });
    });
  }


  // Adds a marker for a bridge to the map
  addMarker(bridge) {
    const { name, status, lat, lng, location } = bridge;
    const color = this.getStatusColor(status);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: `${name}: ${status}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: "white",
        strokeWeight: 1
      }
    });

    // Info window on click
    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${name}</strong><br>Status: ${status}<br><em>${location}</em>`
    });

    marker.addListener("click", () => infoWindow.open(this.map, marker));
    this.bridgeMarkers.push(marker);
  }
}
