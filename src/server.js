require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');
const authService = require('./services/auth.service');

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDatabase();
    await authService.ensureAdminFromEnvironment();
    app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
  } catch (error) {
    console.error('No se pudo iniciar la API:', error.message);
    process.exit(1);
  }
}

startServer();
