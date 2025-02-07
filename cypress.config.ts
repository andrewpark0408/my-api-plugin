import { defineConfig } from "cypress";
import * as fs from "fs";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // Load environment variables from cypress.env.json
      if (fs.existsSync("cypress.env.json")) {
        const envConfig = JSON.parse(fs.readFileSync("cypress.env.json", "utf-8"));
        config.env = { ...config.env, ...envConfig };
      }
      return config;
    },
  },
});
