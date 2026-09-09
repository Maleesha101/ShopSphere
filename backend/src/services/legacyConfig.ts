// Legacy Config Service for ShopSphere
// SM-08: Demonstrates usage of intentionally outdated dependency
// lodash 4.17.15 has known prototype pollution vulnerability (CVE-2019-10744)
// This service ONLY runs in vulnerable mode for demonstration purposes
// DO NOT use this in production

import _ from "lodash";

export const legacyConfig = {
  /**
   * Loads legacy configuration using outdated lodash
   * This is a DELIBERATE lab artifact to demonstrate dependency management
   */
  load(): void {
    if (process.env.LAB_MODE !== "vulnerable") {
      console.log("ℹ️  Legacy config skipped (not in vulnerable mode)");
      return;
    }

    // SM-08: Using lodash 4.17.15 which has prototype pollution vulnerability
    // This demonstrates that the outdated dependency is present
    // The actual vulnerability requires specific conditions to exploit
    const configObject = {
      api: {
        version: "1.0",
        timeout: 30000,
      },
      features: {
        debug: true,
        experimental: false,
      },
    };

    // Using lodash merge which was vulnerable in 4.17.15
    // CVE-2019-10744: Prototype pollution via _.merge or _.defaultsDeep
    const userConfig = {};
    const merged = _.merge({}, configObject, userConfig);

    console.log("⚠️  LAB VULNERABILITY SM-08: Using outdated lodash 4.17.15");
    console.log("   This version has CVE-2019-10744 (prototype pollution)");
    console.log("   See: https://github.com/lodash/lodash/issues/4336");
    console.log("   Merged config:", JSON.stringify(merged, null, 2));
  },

  /**
   * Demonstrates the vulnerable merge operation
   * This is for educational purposes only
   */
  demonstrateVulnerableMerge(): void {
    if (process.env.LAB_MODE !== "vulnerable") {
      return;
    }

    // Example of what a prototype pollution payload might look like
    // In practice: _.merge({}, JSON.parse('{"__proto__": {"polluted": true}}'))
    // This would pollute Object.prototype
    console.log("🔬 SM-08 Demo: Prototype pollution test (safe simulation)");
    console.log("   In real exploit: _.merge({}, {__proto__: {polluted: 'yes'}})");
    console.log("   Would make {}.polluted === 'yes' globally");
  },
};