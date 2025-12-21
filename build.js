const esbuild = require("esbuild");
// const { externalGlobalPlugin } = require("esbuild-plugin-external-global");
const fs = require('fs');

console.log("Watching")
fs.watchFile('./scripts/pdb/prismarinedb.js', {}, (curr, prev)=>{
    console.log("Building")
    esbuild.build({
        bundle: true,
        entryPoints: ['./src/startup.js'],
        outfile: './scripts/startup.js',
        format: 'esm',                 // "module": "ES2020"
        platform: 'node',              // closer to "moduleResolution": "Node"
        target: ['esnext'],            // "target": "ES2021"
        minify: false,
        treeShaking: true,             // TS would normally tree-shake
        absWorkingDir: __dirname,        // kinda like baseUrl/rootDir
        //outdir: './scripts',           // like "outDir"
        sourcemap: true,               // helps with debugging
        external: [
            "@minecraft/server",
            "@minecraft/server-ui",
            "@minecraft/server-admin",
        ],                  // mimic exclude node_modules (no bundling deps)
        logLevel: 'info'
    }).then(res => {
        console.log("Built");
    })
})