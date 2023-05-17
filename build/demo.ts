import { spawnSync } from 'child_process';

spawnSync('npx http-server -c-1 -o dist/demo.html', {
  shell: true,
  stdio: 'inherit',
});

