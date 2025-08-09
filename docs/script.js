class DebianTrixieMonitor {
  constructor() {
    this.feedUrl = "https://www.debian.org/News/news";
    this.proxyUrl = "https://api.allorigins.win/get?url=";
    this.checkInterval = 30000; // 30 seconds
    this.isReleased = false;
    this.fireworks = null;
    this.countdownInterval = null;
    this.nextCheckTime = null;

    this.init();
  }

  init() {
    this.setupDebugPanel();
    this.setupControls();
    this.debugLog("🐧 Debian Trixie Monitor initialized!");
    this.debugLog(
      `⏰ Check interval: ${this.checkInterval / 1000} seconds`,
      "info"
    );

    this.startMonitoring();

    // Check immediately on load
    this.checkFeed();
  }

  setupDebugPanel() {
    // Setup debug panel functionality
    const clearButton = document.getElementById("clear-debug");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const debugOutput = document.getElementById("debug-output");
        debugOutput.innerHTML = '<div class="debug-line">Debug cleared</div>';
      });
    }
  }

  setupControls() {
    // Toggle debug panel
    const toggleDebugBtn = document.getElementById("toggle-debug");
    const debugPanel = document.getElementById("debug-panel");

    if (toggleDebugBtn && debugPanel) {
      toggleDebugBtn.addEventListener("click", () => {
        if (debugPanel.style.display === "none") {
          debugPanel.style.display = "block";
          toggleDebugBtn.textContent = "🔍 Hide Debug Console";
        } else {
          debugPanel.style.display = "none";
          toggleDebugBtn.textContent = "🔍 Show Debug Console";
        }
      });
    }

    // Simulate release button
    const simulateBtn = document.getElementById("simulate-release");
    if (simulateBtn) {
      simulateBtn.addEventListener("click", () => {
        this.debugLog("🎆 SIMULATING TRIXIE RELEASE!", "success");
        this.displayLatestEntry(
          'SIMULATION: It\'s release day for Debian 13 "trixie"!',
          "This is a test simulation to check fireworks and sound",
          "https://example.com/simulation"
        );
        this.triggerRelease();
      });
    }

    // Download button
    const downloadBtn = document.getElementById("download-release");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        window.open("https://www.debian.org/releases/stable/", "_blank");
      });
    }

    // Stop fireworks button
    const stopFireworksBtn = document.getElementById("stop-fireworks");
    if (stopFireworksBtn) {
      stopFireworksBtn.addEventListener("click", () => {
        this.stopFireworks();
        stopFireworksBtn.style.display = "none";
        this.isReleased = false;
      });
    }
  }

  debugLog(message, type = "info") {
    const debugOutput = document.getElementById("debug-output");
    if (debugOutput) {
      const timestamp = new Date().toLocaleTimeString();
      const line = document.createElement("div");
      line.className = `debug-line ${type}`;
      line.textContent = `[${timestamp}] ${message}`;
      debugOutput.appendChild(line);
      debugOutput.scrollTop = debugOutput.scrollHeight;
    }

    // Also log to console
    console.log(message);
  }

  startMonitoring() {
    // Set up the next check time
    this.scheduleNextCheck();
    
    setInterval(() => {
      if (!this.isReleased) {
        this.checkFeed();
        this.scheduleNextCheck();
      }
    }, this.checkInterval);
  }

  async checkFeed() {
    try {
      this.updateStatus("checking");

      // ONLY check micronews feed
      this.debugLog("🔍 Checking Debian micronews feed...", "info");
      const micronewsUrl = "https://micronews.debian.org/feeds/atom.xml";
      const response = await fetch(
        `${this.proxyUrl}${encodeURIComponent(micronewsUrl)}`
      );
      const data = await response.json();

      if (data.contents) {
        this.debugLog(
          `📄 Got micronews content, length: ${data.contents.length}`,
          "success"
        );
        await this.parseAndCheck(data.contents);
      } else {
        this.debugLog("❌ No content from micronews feed", "error");
      }

      this.updateLastCheck();
      this.startCountdown();
    } catch (error) {
      console.error("Error checking feed:", error);
      this.updateStatus("error");
    }
  }

  async verifyReleaseNotes() {
    try {
      this.debugLog("🏛️ Verifying with release notes page...", "info");
      const releaseNotesUrl =
        "https://www.debian.org/releases/stable/releasenotes";
      const response = await fetch(
        `${this.proxyUrl}${encodeURIComponent(releaseNotesUrl)}`
      );
      const data = await response.json();

      if (data.contents) {
        const content = data.contents.toLowerCase();

        if (content.includes("debian 13")) {
          this.debugLog(
            '✅ VERIFIED: Release notes contain "Debian 13"!',
            "success"
          );
          return true;
        } else {
          this.debugLog(
            "❌ Release notes still show Debian 12 (not updated yet)",
            "warning"
          );
          return false;
        }
      }
    } catch (error) {
      this.debugLog(
        `❌ Failed to verify release notes: ${error.message}`,
        "error"
      );
    }
    return false;
  }

  async parseAndCheck(feedContent) {
    try {
      this.debugLog("🔍 Parsing micronews feed", "info");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feedContent, "text/xml");

      const entries = xmlDoc.querySelectorAll("entry");
      this.debugLog(
        `📰 Found ${entries.length} total entries in micronews feed`,
        "info"
      );

      if (entries.length === 0) {
        this.debugLog("❌ No entries found in micronews feed", "warning");
        return false;
      }

      // Filter entries to only show from August 9th, 2025 onwards
      const cutoffDate = new Date("2025-08-09T00:00:00Z");
      const filteredEntries = Array.from(entries).filter((entry) => {
        const published = this.getTextContent(entry, "published");
        if (!published) return false;

        const entryDate = new Date(published);
        return entryDate >= cutoffDate;
      });

      this.debugLog(
        `📅 ${filteredEntries.length} entries from Aug 9th onwards`,
        "info"
      );

      // Display multiple entries
      this.displayMultipleEntries(entries); // Pass all entries, filtering happens inside

      if (filteredEntries.length === 0) {
        this.debugLog("📭 No recent entries to check for release", "info");
        this.updateStatus("not-released");
        return false;
      }

      // Check latest filtered entry for Trixie release
      const latestEntry = filteredEntries[0];
      const title = this.getTextContent(latestEntry, "title");
      const link = this.getTextContent(latestEntry, "link");
      const published = this.getTextContent(latestEntry, "published");

      this.debugLog(`📄 Latest filtered entry: "${title}"`, "info");
      this.debugLog(`🔗 Link: ${link}`, "info");
      this.debugLog(`📅 Published: ${published}`, "info");

      // Check if latest entry matches keywords for Trixie release
      const titleLower = title.toLowerCase();
      const hasTrixie = titleLower.includes("trixie");
      const hasRelease =
        titleLower.includes("release day") ||
        titleLower.includes("released") ||
        titleLower.includes("debian 13");

      this.debugLog(
        `🎯 Found: Trixie=${hasTrixie}, Release=${hasRelease}`,
        "info"
      );

      // Check if we have enough matches for a release
      if (hasTrixie && hasRelease) {
        this.debugLog(
          "🎯 FOUND TRIXIE RELEASE ANNOUNCEMENT IN MICRONEWS!",
          "success"
        );

        // Now verify with release notes page
        const verified = await this.verifyReleaseNotes();

        if (verified) {
          this.debugLog(
            "✅ VERIFIED: Release notes show Debian 13!",
            "success"
          );
          this.triggerRelease();
          return true;
        } else {
          this.debugLog(
            "⚠️ Micronews says released but release notes still show Debian 12",
            "warning"
          );
          this.updateStatus(
            "maybe",
            "Micronews announced but not verified yet"
          );
        }
      } else {
        this.debugLog(
          `📭 Not enough matches for release (need trixie + release keyword)`,
          "info"
        );
        this.updateStatus("not-released");
      }

      return false;
    } catch (error) {
      this.debugLog(
        `❌ Error parsing micronews feed: ${error.message}`,
        "error"
      );
      return false;
    }
  }

  displayMultipleEntries(entries) {
    const entryContent = document.getElementById("entry-content");
    let html = "";

    // Filter entries to only show from August 9th, 2025 onwards
    const cutoffDate = new Date("2025-08-09T00:00:00Z");
    const filteredEntries = Array.from(entries).filter((entry) => {
      const published = this.getTextContent(entry, "published");
      if (!published) return false;

      const entryDate = new Date(published);
      return entryDate >= cutoffDate;
    });

    this.debugLog(
      `📅 Filtered to ${filteredEntries.length} entries from Aug 9th onwards`,
      "info"
    );

    // Show exactly 3 entries max
    const entriesToShow = Math.min(filteredEntries.length, 3);

    if (entriesToShow === 0) {
      html =
        '<div class="feed-entry">No entries found from August 9th onwards</div>';
    } else {
      for (let i = 0; i < entriesToShow; i++) {
        const entry = filteredEntries[i];
        const title = this.getTextContent(entry, "title");
        const link = this.getTextContent(entry, "link");
        const published = this.getTextContent(entry, "published");

        const date = published
          ? new Date(published).toLocaleDateString()
          : "Unknown date";

        html += `
                    <div class="feed-entry ${i === 0 ? "latest" : ""}">
                        <strong>${i + 1}. ${title || "No title"}</strong>
                        <br><small>📅 ${date}</small>
                        ${
                          link
                            ? `<br><a href="${link}" target="_blank">🔗 Read more</a>`
                            : ""
                        }
                    </div>
                `;
      }
    }

    entryContent.innerHTML = html;
  }

  getTextContent(element, selectors) {
    const selectorList = selectors.split(",").map((s) => s.trim());
    for (const selector of selectorList) {
      const found = element.querySelector(selector);
      if (found) {
        return found.textContent || found.innerHTML || "";
      }
    }
    return "";
  }

  displayLatestEntry(title, description, link) {
    // For simulation and verification messages
    const entryContent = document.getElementById("entry-content");
    entryContent.innerHTML = `
            <div class="feed-entry latest simulation">
                <strong>${title || "No title"}</strong><br>
                <small>${description || "No description"}</small>
                ${
                  link
                    ? `<br><a href="${link}" target="_blank">🔗 Read more</a>`
                    : ""
                }
            </div>
        `;
  }

  updateStatus(type, extra = "") {
    const statusElement = document.getElementById("status");
    statusElement.className = "status";

    switch (type) {
      case "checking":
        statusElement.innerHTML =
          '<span class="checking">🔍 Checking for release...</span>';
        break;
      case "not-released":
        statusElement.innerHTML =
          '<span class="not-released">❌ Not yet released</span>';
        break;
      case "maybe":
        statusElement.innerHTML = `<span class="checking">🤔 Maybe? ${extra}</span>`;
        break;
      case "released":
        statusElement.innerHTML =
          '<span class="released">🎉 YES! TRIXIE IS RELEASED!</span>';
        break;
      case "error":
        statusElement.innerHTML =
          '<span class="not-released">⚠️ Error checking feed</span>';
        break;
    }
  }

  updateLastCheck() {
    const now = new Date();
    document.getElementById(
      "last-check"
    ).textContent = `Last checked: ${now.toLocaleTimeString()}`;
  }

  scheduleNextCheck() {
    this.nextCheckTime = new Date(Date.now() + this.checkInterval);
    this.startCountdown();
  }

  startCountdown() {
    // Clear any existing countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (this.isReleased) {
        clearInterval(this.countdownInterval);
        return;
      }

      const now = new Date();
      const timeLeft = this.nextCheckTime - now;

      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
        return;
      }

      const secondsLeft = Math.ceil(timeLeft / 1000);
      this.updateCountdown(secondsLeft);
    }, 1000);
  }

  updateCountdown(seconds) {
    const lastCheckElement = document.getElementById("last-check");
    if (lastCheckElement && !this.isReleased) {
      const lastCheckedText = lastCheckElement.textContent.split(' - ')[0];
      lastCheckElement.textContent = `${lastCheckedText} - Next refresh in ${seconds}s`;
    }
  }

  triggerRelease() {
    this.isReleased = true;
    this.updateStatus("released");

    // Stop countdown timer
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // Show download button directly below the release message after a short delay
    setTimeout(() => {
      const statusCard = document.querySelector(".status-card");
      if (statusCard) {
        // Check if download button already exists in status card
        let downloadBtn = statusCard.querySelector("#download-release-inline");
        if (!downloadBtn) {
          // Create and insert download button in the status card
          downloadBtn = document.createElement("button");
          downloadBtn.id = "download-release-inline";
          downloadBtn.className = "download-button";
          downloadBtn.style.marginTop = "15px";
          // downloadBtn.style.display = "block";
          downloadBtn.innerHTML = "📥 Download Debian 13 Trixie";
          downloadBtn.addEventListener("click", () => {
            window.open("https://www.debian.org/releases/stable/", "_blank");
          });
          statusCard.appendChild(downloadBtn);
        } else {
          downloadBtn.style.display = "block";
        }
      }
    }, 1000); // 1 second delay

    this.startFireworks();
  }

  startFireworks() {
    const canvas = document.getElementById("fireworks-canvas");
    canvas.style.display = "block";

    // Show stop button
    const stopBtn = document.getElementById("stop-fireworks");
    if (stopBtn) {
      stopBtn.style.display = "inline-block";
    }

    this.fireworks = new Fireworks.default(canvas, {
      maxRockets: 5,
      rocketSpawnInterval: 150,
      numParticles: 100,
      explosionMinHeight: 0.2,
      explosionMaxHeight: 0.9,
      explosionChance: 0.08,
      autoresize: true,
      opacity: 0.5,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 50,
      traceLength: 3,
      traceSpeed: 10,
      explosionSpeed: 2,
      lineStyle: "round",
      hue: {
        min: 0,
        max: 360,
      },
      delay: {
        min: 30,
        max: 60,
      },
      rocketsPoint: {
        min: 50,
        max: 50,
      },
      lineWidth: {
        explosion: {
          min: 1,
          max: 3,
        },
        trace: {
          min: 1,
          max: 2,
        },
      },
      brightness: {
        min: 50,
        max: 80,
      },
      decay: {
        min: 0.015,
        max: 0.03,
      },
      sound: {
        enabled: true,
        files: [
          "https://fireworks.js.org/sounds/explosion0.mp3",
          "https://fireworks.js.org/sounds/explosion1.mp3",
          "https://fireworks.js.org/sounds/explosion2.mp3",
        ],
        volume: {
          min: 4,
          max: 8,
        },
      },
    });

    this.fireworks.start();

    this.debugLog("🎆 EPIC FIREWORKS STARTED WITH SOUND!", "success");
  }

  stopFireworks() {
    if (this.fireworks) {
      this.fireworks.stop();
      const canvas = document.getElementById("fireworks-canvas");
      canvas.style.display = "none";

      // Hide stop button
      const stopBtn = document.getElementById("stop-fireworks");
      if (stopBtn) {
        stopBtn.style.display = "none";
      }

      // Hide inline download button
      const inlineDownloadBtn = document.getElementById(
        "download-release-inline"
      );
      if (inlineDownloadBtn) {
        inlineDownloadBtn.style.display = "none";
      }

      // Restart countdown when stopping fireworks
      if (!this.isReleased) {
        this.scheduleNextCheck();
      }

      this.debugLog("🎆 Fireworks stopped", "info");
    }
  }
}

// Initialize the monitor when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new DebianTrixieMonitor();
});

// Add manual refresh button functionality
document.addEventListener("click", (e) => {
  if (e.target.textContent.includes("Checking for release")) {
    // Allow manual refresh by clicking the status
    window.location.reload();
  }
});
