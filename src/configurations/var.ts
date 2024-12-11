import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';

const config = {
    env,
    DEFAULT_LIMIT: 10,
    PAGE_LIMIT: 1,
};

export const CONFIG = config;
