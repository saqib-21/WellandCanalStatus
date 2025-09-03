// MapManager.js
// Handles Google Maps initialization and user location tracking (SRP)

export default class MapManager {
  constructor(mapElementId) {
    this.mapElementId = mapElementId;
    this.map = null;
    this.userMarker = null;
    this.userPos = null;
    this.initialCentered = false;
  }

  // Initializes the map and starts tracking user location
  initMap() {
    this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
      center: { lat: 43.160, lng: -79.246 },
      zoom: 12,

      // Disable default UI for a cleaner look
      disableDefaultUI: true,
      gestureHandling: "greedy",
      styles: [
        { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
      ]
    });

    this.trackUserLocation();
    return this.map;
  }

  // Continuously tracks and updates user location on the map
  trackUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (this.userMarker) {//if marker already exists, just update position
            this.userMarker.setPosition(this.userPos);
          } else {
            this.userMarker = new google.maps.Marker({
              position: this.userPos,
              map: this.map,
              title: "Your Current Location",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              },
            });
          }
        // Only center the first time
          if (!this.initialCentered) {
            this.map.setCenter(this.userPos);
            this.initialCentered = true;
          }
        },
        (error) => console.warn("Geolocation error:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }

  recenterOnUser() {
    if (this.userPos) {
      this.map.setCenter(this.userPos);
      this.map.setZoom(11);
    }
  }
}
