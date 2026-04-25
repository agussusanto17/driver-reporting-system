/**
 * Patch .next/standalone/server.js after build.
 * Sets UPLOADS_ROOT to a persistent path outside the nodejs deploy folder.
 * This ensures uploaded photos survive redeploys.
 */

const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "..", ".next", "standalone", "server.js");

if (!fs.existsSync(serverPath)) {
  console.log("[patch-server] server.js not found, skipping.");
  process.exit(0);
}

const content = fs.readFileSync(serverPath, "utf8");

// Only patch if not already patched
if (content.includes("UPLOADS_ROOT")) {
  console.log("[patch-server] Already patched, skipping.");
  process.exit(0);
}

// Persistent uploads path: sibling of nodejs/ directory, inside public_html
// Resolves to: /home/.../domains/driver.truckinc.id/public_html/uploads
// From nodejs/__dirname, one level up reaches driver.truckinc.id/
// then public_html/uploads is the persistent storage folder
const uploadsPatch = `
process.env.UPLOADS_ROOT = process.env.UPLOADS_ROOT ||
  require("path").join(__dirname, "..", "public_html", "uploads");
`;

const patched = content.replace(
  "process.chdir(__dirname)",
  `process.chdir(__dirname)\n${uploadsPatch}`
);

if (patched === content) {
  console.log("[patch-server] Warning: Could not find patch location.");
  process.exit(0);
}

fs.writeFileSync(serverPath, patched);
console.log("[patch-server] server.js patched successfully.");
console.log("[patch-server] UPLOADS_ROOT will resolve to: <domain>/public_html/uploads");
