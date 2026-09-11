import { createServer } from './server';

const PORT = process.env.PORT || 5000;
const app = createServer();

app.listen(PORT, () => {
  console.log(`🌾 Farm2Market AI Server running on http://localhost:${PORT}`);
  console.log(`📊 DoCA Problem Statement 26033: Multiple Intermediaries Reduction Platform`);
});
