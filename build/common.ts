/*
 * @Author: chenzihan
 * @Date: 2022-10-10 17:02:11
 * @LastEditTime: 2022-10-10 17:14:35
 * @LastEditors: chenzihan
 * @Description:
 * @FilePath: \transform\build\common.js
 */
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { spawnSync, exec } from 'child_process';

const execPromisify = promisify(exec);

const srcPath = path.resolve(process.cwd(), 'src');
const distPath = path.resolve(process.cwd(), 'dist');

const srcHtmlPath = path.resolve(srcPath, 'demo.html');
const distHtmlPath = path.resolve(distPath, 'demo.html');

function deleteDir(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  return Promise.all(
    files.map((item) => promisify(fs.unlink)(path.resolve(dirPath, item)))
  );
}

async function generateHtml() {
  let html = await promisify(fs.readFile)(srcHtmlPath, { encoding: 'utf-8' });
  return promisify(fs.writeFile)(distHtmlPath, html);
}

async function buildJS(watch: any) {
  if (watch) {
    spawnSync('npx tsc --watch', {
      shell: true,
      stdio: 'inherit',
    });
  } else {
    await execPromisify('npx tsc');
  }
}

export async function build(watch = false) {
  if (fs.existsSync(distPath)) {
    await deleteDir(distPath);
  } else {
    fs.mkdirSync(distPath);
  }
  if (watch) {
    await generateHtml();  
  }
  await buildJS(watch);
}
