'use strict';

const { spawn, spawnSync } = require('node:child_process');
const { createWriteStream, existsSync, mkdirSync } = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const root = __dirname;
const logs = path.join(root, '.demo-logs');
const services = [];
let startupError;
let ready = false;
let stopping = false;

function pythonPath() {
  const venv = path.join(root, '.venv', 'Scripts', 'python.exe');
  if (existsSync(venv)) return venv;

  const result = spawnSync('py.exe', ['-3.13', '-c', 'import sys; print(sys.executable)'], {
    encoding: 'utf8', windowsHide: true,
  });
  if (result.status !== 0) throw new Error('Install Python 3.13 with the Windows launcher.');
  return result.stdout.trim();
}

function ensurePortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(error.code === 'EADDRINUSE'
      ? new Error('Port ' + port + ' is busy. Stop the existing service and try again.')
      : error));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const service of services) service.kill();
  process.exitCode = code;
}

function start(name, executable, args, folder) {
  const file = path.join(logs, name + '.log');
  const output = createWriteStream(file);
  const child = spawn(executable, args, {
    cwd: path.join(root, folder), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  services.push(child);
  child.stdout.pipe(output, { end: false });
  child.stderr.pipe(output, { end: false });
  child.once('error', error => { startupError = error; });
  child.once('close', code => {
    output.end();
    if (stopping) return;
    startupError ??= new Error(name + ' stopped with exit code ' + code + '. See ' + file);
    if (ready) {
      console.error(startupError.message);
      stop(1);
    }
  });
}

async function waitUntilReady(url) {
  const deadline = Date.now() + 180_000;
  while (!stopping && Date.now() < deadline) {
    if (startupError) throw startupError;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      // The service is still starting.
    }
    await delay(500);
  }
  if (!stopping) throw new Error('Timed out waiting for ' + url + '. See ' + logs);
}

async function main() {
  if (!process.versions.node.startsWith('20.')) throw new Error('Use the Node 20 command in README.md.');
  const cli = path.join('node_modules', '@angular', 'cli', 'bin', 'ng.js');
  if (!existsSync(path.join(root, 'frontend', cli)) ||
      !existsSync(path.join(root, 'backend', 'node_modules', '@strapi', 'strapi'))) {
    throw new Error('Install the dependencies using the one-time setup in README.md.');
  }

  for (const port of [4200, 1337, 5000]) await ensurePortFree(port);
  const python = pythonPath();
  mkdirSync(logs, { recursive: true });
  process.on('SIGINT', () => stop(0));
  process.on('SIGBREAK', () => stop(0));

  console.log('Starting Angular, Strapi and the focus model…');
  start('strapi', process.execPath, ['start-demo.js'], 'backend');
  start('focus-model', python, ['-u', 'distraction_api.py'], 'distractionModel');
  start('angular', process.execPath, [cli, 'serve', '--host', '127.0.0.1'], 'frontend');

  await Promise.all([
    waitUntilReady('http://127.0.0.1:4200/'),
    waitUntilReady('http://127.0.0.1:1337/_health'),
    waitUntilReady('http://127.0.0.1:5000/health'),
  ]);
  if (stopping) return;
  if (startupError) throw startupError;
  ready = true;
  console.log('Demo ready at http://127.0.0.1:4200');
  console.log('Keep this terminal open. Press Ctrl+C when you finish.');
}

main().catch(error => {
  console.error(error.message);
  stop(1);
});
