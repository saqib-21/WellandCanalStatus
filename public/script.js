function openSidebar() {
    document.getElementById("sidebar").classList.add("show");
    document.getElementById("overlay").classList.add("show");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show");
    document.getElementById("overlay").classList.remove("show");
}


let map; // Global variable for the Google Map instance
let bridgeMarkers = []; // Store marker references for updating
let userMarker = null; // Store the user location marker
let userPos = null;
let initialCentered = false;


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

// Returns a color string based on the bridge status
function getStatusColor(status) {
  if (status === "Available") return "green";
  if (status === "raising soon") return "yellow";
  if (status === "lowering") return "purple";
  if (status && (status.toLowerCase().includes("raised") || status.toLowerCase().includes("raising") || status.toLowerCase().includes("closed"))) {
    return "red";
  }
  return "gray";
}

// Track user location with live updates
function trackUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
         userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (userMarker) {//if marker already exists, just update position
          userMarker.setPosition(userPos);
        } else {
          userMarker = new google.maps.Marker({
            position: userPos,map,
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

                // ✅ Only center the first time
        if (!initialCentered) {
          map.setCenter(userPos);
          initialCentered = true;
        }


      },
      (error) => {
        console.warn("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    console.warn("Geolocation is not supported by this browser.");
  }
}

// Initializes the Google Map and loads bridge status data
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 43.160, lng: -79.246 },
    zoom: 12,
    disableDefaultUI: true,
    gestureHandling: "greedy", // Allow 1-finger pan on mobile

    styles: [
      { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
      { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
    ]
  });

  // Initial load of bridge markers
  updateBridgeMarkers();

  // Refresh every 30 seconds
  setInterval(updateBridgeMarkers, 30000);

  // Start tracking user location
  trackUserLocation();




}



  // Recenter button click event
    document.addEventListener("DOMContentLoaded", () => {
    const recenterBtn = document.getElementById("recenter-btn");
    if (recenterBtn) {
        recenterBtn.addEventListener("click", () => {
        if (userPos) {
            map.setCenter(userPos);
            map.setZoom(11); // Optional
        }
        });
    }
});

// Fetches bridge status and updates markers on the map
function updateBridgeMarkers() {
  fetch("/api/bridges")
  //fetch("https://corsproxy.io/?https://canalstatus.com/api/v1/bridges.json")
    .then(res => res.json())
    .then(apiData => {
      console.log("API DATA:", apiData);   // 👈 log what you got
      const bridges = apiData.bridges;// Access the bridges array from the API response

      if (!Array.isArray(bridges)) {
        throw new Error("bridges is not an array");
      }

      bridgeMarkers.forEach(marker => marker.setMap(null));
      bridgeMarkers = [];

      localBridgeData.forEach(localBridge => {
        const apiBridge = bridges.find(b => {
          return (
            b.name.toLowerCase().includes(localBridge.name.toLowerCase()) ||
            localBridge.name.toLowerCase().includes(b.name.toLowerCase())
          );
        });
        let status = apiBridge ? apiBridge.status : "Unknown";
        addBridgeMarker({ ...localBridge, status });
      });

    })
    .catch(err => console.error("Fetch error:", err));
}

// Adds a marker for a bridge to the map
function addBridgeMarker(bridge) {
  const { name, status, lat, lng, location } = bridge;

  const color = getStatusColor(status);

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
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

  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>${name}</strong><br>Status: ${status}<br><em>${location}</em>`
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  bridgeMarkers.push(marker);
}
