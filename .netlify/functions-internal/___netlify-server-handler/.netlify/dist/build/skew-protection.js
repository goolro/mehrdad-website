
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-VJBIAOVP.js";

// src/build/skew-protection.ts
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
var EnabledOrDisabledReason = /* @__PURE__ */ ((EnabledOrDisabledReason2) => {
  EnabledOrDisabledReason2["OPT_OUT_DEFAULT"] = "off-default";
  EnabledOrDisabledReason2["OPT_OUT_NO_VALID_DEPLOY_ID"] = "off-no-valid-deploy-id";
  EnabledOrDisabledReason2["OPT_OUT_NO_VALID_DEPLOY_ID_ENV_VAR"] = "off-no-valid-deploy-id-env-var";
  EnabledOrDisabledReason2["OPT_IN_FF"] = "on-ff";
  EnabledOrDisabledReason2["OPT_IN_ENV_VAR"] = "on-env-var";
  EnabledOrDisabledReason2["OPT_OUT_ENV_VAR"] = "off-env-var";
  return EnabledOrDisabledReason2;
})(EnabledOrDisabledReason || {});
var optInOptions = /* @__PURE__ */ new Set([
  "on-ff" /* OPT_IN_FF */,
  "on-env-var" /* OPT_IN_ENV_VAR */
]);
var skewProtectionConfig = {
  patterns: [".*"],
  sources: [
    {
      type: "cookie",
      name: "__vdpl"
    },
    {
      type: "header",
      name: "X-Deployment-Id"
    },
    {
      type: "query",
      name: "dpl"
    }
  ]
};
function shouldEnableSkewProtection(ctx) {
  let enabledOrDisabledReason = "off-default" /* OPT_OUT_DEFAULT */;
  if (process.env.NETLIFY_NEXT_SKEW_PROTECTION === "true" || process.env.NETLIFY_NEXT_SKEW_PROTECTION === "1") {
    enabledOrDisabledReason = "on-env-var" /* OPT_IN_ENV_VAR */;
  } else if (process.env.NETLIFY_NEXT_SKEW_PROTECTION === "false" || process.env.NETLIFY_NEXT_SKEW_PROTECTION === "0") {
    return {
      enabled: false,
      enabledOrDisabledReason: "off-env-var" /* OPT_OUT_ENV_VAR */
    };
  } else if (ctx.featureFlags?.["next-runtime-skew-protection"]) {
    enabledOrDisabledReason = "on-ff" /* OPT_IN_FF */;
  } else {
    return {
      enabled: false,
      enabledOrDisabledReason: "off-default" /* OPT_OUT_DEFAULT */
    };
  }
  const token = process.env.NETLIFY_SKEW_PROTECTION_TOKEN || process.env.DEPLOY_ID;
  if ((!token || token === "0") && optInOptions.has(enabledOrDisabledReason)) {
    return {
      enabled: false,
      enabledOrDisabledReason: enabledOrDisabledReason === "on-env-var" /* OPT_IN_ENV_VAR */ && ctx.constants.IS_LOCAL ? (
        // this case is singled out to provide visible feedback to users that env var has no effect
        "off-no-valid-deploy-id-env-var" /* OPT_OUT_NO_VALID_DEPLOY_ID_ENV_VAR */
      ) : (
        // this is silent disablement to avoid spam logs for users opted in via feature flag
        // that don't explicitly opt in via env var
        "off-no-valid-deploy-id" /* OPT_OUT_NO_VALID_DEPLOY_ID */
      ),
      token
    };
  }
  return {
    enabled: optInOptions.has(enabledOrDisabledReason),
    enabledOrDisabledReason,
    token
  };
}
var setSkewProtection = async (ctx, span) => {
  const { enabled, enabledOrDisabledReason, token } = shouldEnableSkewProtection(ctx);
  span.setAttribute("skewProtection", enabledOrDisabledReason);
  if (!enabled) {
    if (enabledOrDisabledReason === "off-no-valid-deploy-id-env-var" /* OPT_OUT_NO_VALID_DEPLOY_ID_ENV_VAR */) {
      console.warn(
        `NETLIFY_NEXT_SKEW_PROTECTION environment variable is set to ${process.env.NETLIFY_NEXT_SKEW_PROTECTION}, but skew protection is currently unavailable for CLI deploys. Skew protection will not be enabled.`
      );
    }
    return;
  }
  if (enabledOrDisabledReason === "on-env-var" /* OPT_IN_ENV_VAR */) {
    console.log(
      `Setting up Next.js Skew Protection due to NETLIFY_NEXT_SKEW_PROTECTION=${process.env.NETLIFY_NEXT_SKEW_PROTECTION} environment variable.`
    );
  } else {
    console.log("Setting up Next.js Skew Protection.");
  }
  process.env.NEXT_DEPLOYMENT_ID = token;
  await mkdir(dirname(ctx.skewProtectionConfigPath), {
    recursive: true
  });
  await writeFile(ctx.skewProtectionConfigPath, JSON.stringify(skewProtectionConfig));
};
export {
  EnabledOrDisabledReason,
  setSkewProtection,
  shouldEnableSkewProtection,
  skewProtectionConfig
};
