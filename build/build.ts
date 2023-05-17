import { build } from './common';

const argStr = process.argv.slice(2).join(' ');
if (argStr.includes('--watch')) {
  build(true);
} else {
  build(false);
}
