require('dotenv').config();
const express = require('express')
const morgan = require('morgan');
const chalk = require('chalk');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const authRouter = require('./routes/AuthRoutes');
const projectRouter = require('./routes/ProjectRoutes');
const enviornmentRouter = require('./routes/EnviornmentRoutes');
const variableRouter = require('./routes/VariableRoutes');
const cliAuthRouter = require('./routes/CliAuthRouter');
const cliProjectRouter = require('./routes/CliProjectRouter');
const cliEnviornmentRouter = require('./routes/CliEnviornmentRouter');
const cliVariableRouter = require('./routes/cliVariableRouter');

const app = express()

// Custom morgan tokens
morgan.token('urlOnly', (req) => req.originalUrl);
morgan.token('statusColored', (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red(status);
    if (status >= 400) return chalk.yellow(status);
    if (status >= 300) return chalk.cyan(status);
    if (status >= 200) return chalk.green(status);
    return status;
});
morgan.token('timestamp', () => new Date().toISOString());

// Logging format
const format = '[:timestamp] :method :urlOnly :statusColored :response-time ms';
const skipOptions = (req) => req.method === 'OPTIONS';
app.use(morgan(format, { skip: skipOptions }));

// middlewares
app.use(express.json());
app.use(cors());

// Database connection middleware for serverless
app.use(async (req, res, next) => {
    try {
        // Only connect to DB when a request comes in (serverless-friendly)
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            error: 'Database connection failed',
            message: error.message 
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
})

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/project', projectRouter)
app.use('/api/v1/enviornment', enviornmentRouter)
app.use('/api/v1/variable', variableRouter)

// cli routes
app.use('/api/v1/cli/auth', cliAuthRouter)
app.use('/api/v1/cli/project', cliProjectRouter)
app.use('/api/v1/cli/enviornment', cliEnviornmentRouter)
app.use('/api/v1/cli/variable', cliVariableRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
    });
});

// Export app for Vercel (CRITICAL!)
module.exports = app;

// Local development server
if (require.main === module) {
    const startServer = async () => {
        try {
            await connectDB();
            const PORT = config.port || 3000;
            app.listen(PORT, () => {
                console.log(chalk.green(`✅ Server is running on port ${PORT}`));
            });
        } catch (error) {
            console.error(chalk.red('❌ Error starting server:', error.message));
            process.exit(1);
        }
    }
    startServer();
}
