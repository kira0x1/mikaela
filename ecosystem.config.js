module.exports = {
    apps: [{
        name: 'mikaela',
        script: './out/app.js',
        exp_backoff_restart_delay: 100,
        args: ['--color'],
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
            args: ['--production', '--color'],
        },
    },],
};