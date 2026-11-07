import { spawn } from 'child_process';
import http from 'http';

const PORT = 3099;

function checkReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startAndRun() {
  console.log(`Starting next start on port ${PORT}...`);
  const server = spawn('npx.cmd', ['next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
  });

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    ready = await checkReady();
    if (ready) {
      console.log(`\nServer is ready on port ${PORT}!`);
      break;
    }
    process.stdout.write('.');
  }

  if (!ready) {
    console.error('\nServer failed to become ready in time.');
    spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { shell: true });
    process.exit(1);
  }

  console.log('\nRunning verify-demo-ecosystem.mjs...');
  const testProc = spawn('node', ['scripts/verify-demo-ecosystem.mjs'], {
    shell: true,
    stdio: 'inherit'
  });

  testProc.on('exit', (code) => {
    console.log(`Test process exited with code ${code}. Stopping server...`);
    spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { shell: true });
    process.exit(code || 0);
  });
}

startAndRun().catch((err) => {
  console.error(err);
  process.exit(1);
});
