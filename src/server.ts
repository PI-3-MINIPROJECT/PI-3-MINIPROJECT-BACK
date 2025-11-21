import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';
import { initializeSocketIO } from './config/socket';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import userRoutes from './routes/user.routes';
import meetingRoutes from './routes/meeting.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

/**
 * Main server application class
 * @class App
 */
class App {
  public app: Application;
  public server: any;
  public io: Server | null = null;
  private readonly PORT: number;
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.PORT = parseInt(process.env.PORT || '3000', 10);
    
    this.initializeMiddlewares();
    this.initializeFirebase();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Express middlewares
   * @private
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true, // Permitir envío de cookies
      })
    );

    // Cookie parser
    this.app.use(cookieParser());

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    if (process.env.NODE_ENV !== 'production') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }

  /**
   * Initialize Firebase Admin SDK
   * @private
   */
  private initializeFirebase(): void {
    try {
      initializeFirebase();
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize API routes
   * @private
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/meetings', meetingRoutes);
  }

  /**
   * Initialize Socket.IO for real-time communication
   * @private
   */
  private initializeSocketIO(): void {
    this.io = initializeSocketIO(this.server);
    console.log('✅ Socket.IO initialized successfully');
  }

  /**
   * Initialize error handling middlewares
   * @private
   */
  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   * @public
   */
  public listen(): void {
    this.server.listen(this.PORT, () => {
      console.log(`🚀 Server running on port ${this.PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${this.PORT}/health`);
    });
  }
}

// Create and start the application
initializeFirebase();
const app = new App();
app.listen();

// Export for testing purposes
export default app;

