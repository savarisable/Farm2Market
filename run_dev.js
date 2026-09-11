const { spawn } = require('child_process');
const path = require('path');

const cmdPath = 'C:\\Windows\\System32\\cmd.exe';
const system32 = 'C:\\Windows\\System32;C:\\Windows';
const env = { 
  ...process.env, 
  ComSpec: cmdPath,
  COMSPEC: cmdPath,
  PATH: `${system32};${process.env.PATH || ''}`
};

console.log('🌾 Starting Farm2Market AI Platform (Backend + Frontend)...');
console.log('📡 Backend running on http://localhost:5000');
console.log('💻 Frontend running on http://localhost:3000\n');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  shell: cmdPath,
  env,
  stdio: 'inherit'
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: cmdPath,
  env,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Farm2Market AI...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
});
