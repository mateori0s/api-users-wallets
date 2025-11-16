import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './config/data-source';
import { ensureDatabaseExists } from './config/db-init.util';

const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  try {
    // Ensure database exists before connecting
    // This is important for first-time setup or when reusing existing containers
    await ensureDatabaseExists();

    // Initialize TypeORM DataSource
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});
