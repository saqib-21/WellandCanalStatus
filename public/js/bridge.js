import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Menu, X, Navigation } from 'lucide-react';

// Bridge data with coordinates
const BRIDGE_DATA = [
  { name: "Bridge 1", location: "Lakeshore Rd. (St. Catharines)", lat: 43.21623852274046, lng: -79.2121272063928 },
  { name: "Bridge 3A", location: "Carlton St. (St. Catharines)", lat: 43.191911962120976, lng: -79.20093237793138 },
  { name: "Bridge 4", location: "Queenston St. (St. Catharines)", lat: 43.16599516348815, lng: -79.19444584468829 },
  { name: "Bridge 5", location: "Glendale Ave. (St. Catharines)", lat: 43.14549183202389, lng: -79.1923500322874 },
  { name: "Bridge 11", location: "Highway 20 (Thorold)", lat: 43.076878412812015, lng: -79.21046458925635 },
  { name: "Bridge 19", location: "Main St. (Port Colborne)", lat: 42.90152711319618, lng: -79.24537865530645 },
  { name: "Bridge 19A", location: "Mellanby Ave. (Port Colborne)", lat: 42.8965101134639, lng: -79.24656798681 },
  { name: "Bridge 21", location: "Clarence St. (Port Colborne)", lat: 42.8867208876898, lng: -79.24838049606134 }
];

// Status color mapping
const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "available") return "#10b981";
  if (s.includes("raising soon")) return "#fbbf24";
  if (s.includes("lowering")) return "#a855f7";
  if (s.includes("unavailable") || s.includes("raised") || s.includes("closed")) return "#ef4444";
  return "#6b7280";
};

const WellandCanalApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bridgeStatuses, setBridgeStatuses] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Fetch bridge statuses
  const fetchBridgeData = useCallback(async () => {
    try {
      const response = await fetch('/api/bridges');
      const data = await response.json();
      
      const statusMap = {};
      data.bridges?.forEach(bridge => {
        const localBridge = BRIDGE_DATA.find(b => 
          bridge.name.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(bridge.name.toLowerCase())
        );
        if (localBridge) {
          statusMap[localBridge.name] = bridge.status || "Unknown";
        }
      });
      
      setBridgeStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching bridge data:', error);
    }
  }, []);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 43.160, lng: -79.246 },
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: [
          { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
        ]
      });
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC1vJCiM2x7sfljzSgeBh7XV5gdvFJAAE4`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  // Update markers when statuses change
  useEffect(() => {
    if (!googleMapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add bridge markers
    BRIDGE_DATA.forEach(bridge => {
      const status = bridgeStatuses[bridge.name] || "Unknown";
      const color = getStatusColor(status);

      const marker = new window.google.maps.Marker({
        position: { lat: bridge.lat, lng: bridge.lng },
        map: googleMapRef.current,
        title: `${bridge.name}: ${status}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: "white",
          strokeWeight: 1
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-family: 'Montserrat', sans-serif;">
          <strong>${bridge.name}</strong><br/>
          Status: ${status}<br/>
          <em>${bridge.location}</em>
        </div>`
      });

      marker.addListener("click", () => infoWindow.open(googleMapRef.current, marker));
      markersRef.current.push(marker);
    });
  }, [bridgeStatuses]);

  // Track user location
  useEffect(() => {
    if (!navigator.geolocation || !googleMapRef.current) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setUserLocation(pos);

        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(pos);
        } else if (window.google) {
          userMarkerRef.current = new window.google.maps.Marker({
            position: pos,
            map: googleMapRef.current,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2
            }
          });
          googleMapRef.current.setCenter(pos);
        }
      },
      (error) => console.warn('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch bridge data periodically
  useEffect(() => {
    fetchBridgeData();
    const interval = setInterval(fetchBridgeData, 30000);
    return () => clearInterval(interval);
  }, [fetchBridgeData]);

  const recenterMap = () => {
    if (userLocation && googleMapRef.current) {
      googleMapRef.current.setCenter(userLocation);
      googleMapRef.current.setZoom(11);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-[#035379] text-white px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#035379]" />
          </div>
          <h1 className="text-sm md:text-lg font-bold uppercase tracking-wider">
            Welland Canal Bridge Status
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="border border-white rounded-full px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-bold uppercase hover:bg-white hover:text-[#035379] transition-colors"
        >
          Menu
        </button>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-[#035379] text-white shadow-xl z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 left-1/2 -translate-x-1/2 border border-white rounded-full px-4 py-2 text-sm font-bold uppercase hover:bg-white hover:text-[#035379] transition-colors"
        >
          Close
        </button>
        <nav className="mt-20 space-y-2">
          <a href="/" className="block px-6 py-3 text-center font-bold uppercase hover:bg-white hover:text-[#035379] transition-colors">
            Home
          </a>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Map */}
      <div className="flex-1 mt-16">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Legend Section */}
      <div className="bg-white border-t-4 border-green-600 px-6 py-5 text-center">
        <button
          onClick={recenterMap}
          className="mb-4 bg-[#035379] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-white hover:text-[#035379] border-2 border-[#035379] transition-colors inline-flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Recenter
        </button>

        <p className="font-bold uppercase text-sm mb-3">Welland Canal Bridge Legend</p>
        <p className="text-xs text-gray-600 mb-4">
          Click on a bridge marker to see its status and location.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500"></span>
            Open
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500"></span>
            Closed
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
            Raising Soon
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-purple-500"></span>
            Lowering
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500"></span>
            You Are Here
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#035379] text-white text-center py-4 text-xs font-bold uppercase tracking-wide">
        © 2025 Bridge Status Visualizer
      </footer>
    </div>
  );
};

export default WellandCanalApp;