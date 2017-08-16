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
clusterKeys: ['wsrep_local_index', 'wsrep_replicated_bytes', 'wsrep_replicated', 'wsrep_replicated_bytes', 'wsrep_received_bytes', 'wsrep_replicated_bytes', 'wsrep_local_state_comment', 'wsrep_cluster_status', 'wsrep_ready', 'wsrep_connected', 'wsrep_evs_state'],
};
