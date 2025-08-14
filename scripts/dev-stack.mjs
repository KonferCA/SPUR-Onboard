#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Utilities
const run = (cmd, args, opts = {}) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
  child.on('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
  });
});

const waitForLine = (proc, matcher, timeoutMs, label) => new Promise((resolve, reject) => {
  const rl = createInterface({ input: proc.stdout });
  const timer = setTimeout(() => {
    rl.close();
    reject(new Error(`Timeout waiting for ${label}`));
  }, timeoutMs);
  rl.on('line', (line) => {
    if (matcher(line)) {
      clearTimeout(timer);
      rl.close();
      resolve();
    }
  });
});

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, '..');
  const spurcoinDir = path.join(repoRoot, 'spurcoin');
  const backendDir = path.join(repoRoot, 'backend');
  const frontendDir = path.join(repoRoot, 'frontend');

  // 1) Start Hardhat node
  console.log('Starting Hardhat node...');
  const node = spawn('npx', ['hardhat', 'node'], { cwd: spurcoinDir, stdio: ['ignore', 'pipe', 'inherit'] });
  await waitForLine(node, (l) => l.includes('JSON-RPC server at http://127.0.0.1:8545/'), 10000, 'hardhat node');

  // 2) Deploy contracts (fail hard on error)
  console.log('Deploying contracts to localhost...');
  await run('npx', ['hardhat', 'run', 'scripts/deploy.ts', '--network', 'localhost'], { cwd: spurcoinDir });

  // 3) Read deployments file
  const deploymentsPath = path.join(spurcoinDir, 'deployments', 'local.json');
  const deployments = JSON.parse(await readFile(deploymentsPath, 'utf-8'));
  const registry = deployments.SpurRegistry;
  if (!registry) throw new Error('SpurRegistry address missing in deployments/local.json');

  // 4) Start backend with envs; stop if it exits non-zero
  console.log('Starting backend...');
  const backendEnv = {
    ...process.env,
    APP_ENV: 'test',
    FRONTEND_URL: 'http://localhost:5173',
    BLOCKCHAIN_RPC_URL: 'http://127.0.0.1:8545',
    SPUR_REGISTRY_ADDRESS: registry,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'dev-bucket',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'local',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '5432',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_NAME: process.env.DB_NAME || 'postgres',
    DB_SSLMODE: process.env.DB_SSLMODE || 'disable',
  };
  const backend = spawn('go', ['run', '.'], { cwd: backendDir, env: backendEnv, stdio: ['ignore', 'pipe', 'inherit'] });
  await waitForLine(backend, (l) => l.includes('http server started'), 15000, 'backend start');

  // 5) Start frontend dev server
  console.log('Starting frontend...');
  const frontend = spawn('pnpm', ['run', 'dev'], { cwd: frontendDir, stdio: 'inherit' });
  

  console.log('\nAll services up. Ctrl+C to stop.');

  // Handle shutdown
  const shutdown = () => {
    try { frontend.kill(); } catch {}
    try { backend.kill(); } catch {}
    try { node.kill(); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('\nStack failed:', err.message);
  process.exit(1);
});


