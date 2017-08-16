var fs = require('fs'),
os = require('os');

module.exports = {
    sshServer: 'SSH_HOST',
    privateKey: fs.readFileSync(os.homedir()+'/.ssh/id_rsa').toString(),
    sql: {
        user: 'USER',
        pass: 'PASS',
    },
    destinationServers: [{
            host: '10.114.88.50',
            hostname: 'dev-sql1',
            port: 3306,
            localPort: 27022
        },
        {
            host: '10.114.88.51',
            hostname: 'dev-sql2',
            port: 3306,
            localPort: 27023
        },
        {
            host: '10.114.88.52',
            hostname: 'dev-sql3',
            port: 3306,
            port: 3306,
            localPort: 27024
        },
    ],
};
