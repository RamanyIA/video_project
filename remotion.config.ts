import {Config} from '@remotion/cli/config';

// Use the preinstalled headless Chromium when present (cloud sandbox).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
