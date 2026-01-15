const esbuild = require("esbuild");
const path = require("path");

esbuild.build({
  entryPoints: [path.resolve("sdk/index.ts")],
  bundle: true,
  minify: true,
  sourcemap: false,

  format: "iife",
  globalName: "ChatbotSDK",

  target: ["es2017"],
  outfile: "public/chatbot-sdk.js",

  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
}).then(() => {
  console.log("✅ chatbot-sdk.js built successfully");
}).catch(() => process.exit(1));
