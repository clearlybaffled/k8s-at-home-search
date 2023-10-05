import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

import glob from 'glob';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

// const webServer = {
//   command: 'yarn run dev',
//   url: 'http://localhost:5173/',
//   timeout: 60 * 1000,
//   reuseExistingServer: true
// };

const webServer = {
  command: 'yarn run serve',
  url: 'http://localhost:4173/',
  timeout: 10 * 1000,
  reuseExistingServer: true
};

function findBrowserPath(browserName: string) {
  // "PLAYWRIGHT_BROWSERS_PATH" in process.env ? process.env["PLAYWRIGHT_BROWSERS_PATH"] + "/chromium-1028/chrome-linux/chrome" : undefined,
  if ("PLAYWRIGHT_BROWSERS_PATH" in process.env) {
    // glob browser
    if (browserName === "chromium") {
      const browserPath = glob.sync(process.env["PLAYWRIGHT_BROWSERS_PATH"] + "/chromium-*/chrome-linux/chrome")[0];
      console.log("browserPath: " + browserPath);
      return browserPath;
    }
    // no other browsers are there

    // return process.env["PLAYWRIGHT_BROWSERS_PATH"] + "/chromium-1028/chrome-linux/chrome";
  }
  return undefined;
}



/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: webServer.url,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: findBrowserPath("chromium"),
        },
      },
      
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     launchOptions: {
    //       executablePath: process.env["PLAYWRIGHT_BROWSERS_PATH"] + "/firefox-1357/firefox/firefox",
    //     },
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */

  webServer
};

export default config;
