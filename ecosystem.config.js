module.exports = {
    apps: [
        {
            name: "najigre-production",
            script: "/home/equal/najigre-production/najigre.com/server.js",
            max_memory_restart: '350M',
            error_file: '/home/equal/najigre-production/logs/err.log',
            out_file: '/home/equal/najigre-production/logs/out.log',
            log_file: '/home/equal/najigre-production/logs/combined.log',
            time: true,
            interpreter: "node",
            args: "3000"
        },
        {
            name: "najigre-testing",
            script: "/home/equal/najigre-testing/najigre.com/server.js",
            max_memory_restart: '150M',
            error_file: '/home/equal/najigre-testing/logs/err.log',
            out_file: '/home/equal/najigre-testing/logs/out.log',
            log_file: '/home/equal/najigre-testing/logs/combined.log',
            time: true,
            interpreter: "node",
            args: "3001"    
        },
    ],
};