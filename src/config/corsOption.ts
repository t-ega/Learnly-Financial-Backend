import * as dotenv from 'dotenv';

dotenv.config();

function getCorsAllowedOrigins(): string[] {
    const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];
    return corsAllowedOrigins;
}

const corsOption = {
    origin: (orgin: string, callback: CallableFunction) => {
        if (getCorsAllowedOrigins().indexOf(orgin) !== -1 || !orgin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
}

module.exports = corsOption;
