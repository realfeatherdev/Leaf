import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import fs from 'fs';
// import { terser } from "@rollup/plugin-terser"; // uncomment if you want minify


  
export default {
  input: "./src/startup.js",
  output: {
    file: "./scripts/startup.js",
    format: "es",          // ESM output, so TLA is valid
    sourcemap: false,
    inlineDynamicImports: true,
    banner: fs.readFileSync('./banner.js').toString()
  },
  watch: {
    // include: 'src/**', // <-- watches everything in src recursively
    include: ['src/**/*.js', 'banner.js'],
    clearScreen: false,
  },
  plugins: [
    // prioritizeStartup(),
    resolve({
      browser: false,
      preferBuiltins: true,
    }),
    commonjs(),
    // terser(), // enable if you want minification
  ],
  external: [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-admin",
  ], // keep Minecraft modules external
  preserveEntrySignatures: "strict",
};
