// watch-rollup.js
import { watch } from 'chokidar';
import { exec } from 'child_process';
import path from 'path';

// Absolute paths for reliability
const projectRoot = path.resolve('./');
const srcGlob = path.join(projectRoot, 'src/**/*.js');
const bannerFile = path.join(projectRoot, 'banner.js');

// Watcher options
const watcher = watch([srcGlob, bannerFile], {
  usePolling: true,    // forces polling, works with junctions and NTFS
  interval: 200,       // check every 200ms
  ignoreInitial: true, // don't trigger on startup
});

// Handle file changes
watcher.on('change', (filePath) => {
  // console.log(`\nDetected change in ${filePath}, rebuilding...`);
  exec('npx rollup -c', (err, stdout, stderr) => {
    if (err) console.error(err);
    if (stdout) // console.log(stdout);
    if (stderr) console.error(stderr);
  });
});

// console.log('Watching src/**/*.js and banner.js for changes...');
