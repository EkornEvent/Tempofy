/**
 * @wwdrew/expo-spotify-sdk's Android side links against the Spotify App Remote
 * AAR, which Spotify only distributes via GitHub releases — it's not on Maven
 * Central, so it isn't included in node_modules. The package's android/libs/
 * folder is expected to contain it before Gradle runs.
 *
 * Without this copy, EAS Android builds (and local `expo run:android`) fail at
 * the Gradle step. We keep a vendored copy in vendor/spotify-android-sdk/ and
 * mirror it into node_modules on every install so EAS's fresh installs find it
 * too.
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const src = path.join(
  repoRoot,
  "vendor",
  "spotify-android-sdk",
  "spotify-app-remote-release-0.8.0.aar"
);
const destDir = path.join(
  repoRoot,
  "node_modules",
  "@wwdrew",
  "expo-spotify-sdk",
  "android",
  "libs"
);
const dest = path.join(destDir, "spotify-app-remote-release-0.8.0.aar");

if (!fs.existsSync(src)) {
  console.warn(
    `[copy-spotify-android-aar] Skipping: source AAR not found at ${src}`
  );
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  console.warn(
    `[copy-spotify-android-aar] Skipping: dest dir not found at ${destDir} (is @wwdrew/expo-spotify-sdk installed?)`
  );
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log(
  `[copy-spotify-android-aar] Copied ${path.basename(src)} -> ${dest}`
);
