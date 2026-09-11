const { spawn } = require('child_process');
const path = require('path');

const system32 = 'C:\\Windows\\System32;C:\\Windows';
const env = { ...process.env };
if (!env.PATH || (!env.PATH.includes('System32') && !env.PATH.includes('system32'))) {
  env.PATH = `${system32};${env.PATH || ''}`;
}

console.log('💻 Starting Farm2Market AI Frontend on http://localhost:3000...');

const child = spawn('npm.cmd', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  env,
  stdio: 'inherit'
});

child.on('error', () => {
  spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    env,
    stdio: 'inherit'
  });
});
