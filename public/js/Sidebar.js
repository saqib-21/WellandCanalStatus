// Sidebar.js
// Handles sidebar open/close interactions (Single Responsibility)

export default class Sidebar {
  constructor(sidebarId, overlayId) {
    this.sidebar = document.getElementById(sidebarId);
    this.overlay = document.getElementById(overlayId);
  }

  open() {
    this.sidebar.classList.add("show");
    this.overlay.classList.add("show");
  }

  close() {
    this.sidebar.classList.remove("show");
    this.overlay.classList.remove("show");
  }
}
