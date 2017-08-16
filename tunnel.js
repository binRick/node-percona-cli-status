#!/usr/bin/env node
var fs = require('fs'),
    pb = require('pretty-bytes'),
    clear = require('cli-clear'),
    _ = require('underscore'),
    mysql = require('mysql'),
    config = require('./config'),
    tunnel = require('tunnel-ssh'),
    async = require('async'),
    c = require('chalk'),
    pb = require('pretty-bytes'),
    ora = require('ora'),
    tree = require('pretty-tree'),
    intervalTime = 1000;

var querySQLs = function(destinationServers) {
    async.map(destinationServers, function(destinationServer, _cb) {
        destinationServer.sqlConnection.query("SHOW GLOBAL STATUS LIKE 'wsrep_%'", function(error, results, fields) {
            if (error) throw error;
            _cb(error, {
                results: results,
                fields: fields,
                destinationServer: destinationServer,
            });
        });
    }, function(errs, sqlResults) {
        if (errs) throw errs;
        var Nodes = [];
        _.each(sqlResults, function(sqlResult) {
            var Label = sqlResult.destinationServer.destinationServer.hostname + ' :: ' + sqlResult.destinationServer.destinationServer.host + ':' + sqlResult.destinationServer.destinationServer.port;;
            var Leaf = {};
            _.each(config.clusterKeys, function(clusterKey) {
                Leaf[clusterKey] = _.findWhere(sqlResult.results, {
                    Variable_name: clusterKey,
                }).Value;
                var cks = clusterKey.split('_');
                if (cks[cks.length - 1] == 'bytes') {
                    Leaf[clusterKey] = pb(+Leaf[clusterKey]);
                }
            });
            Nodes.push({
                label: Label,
                leaf: Leaf
            });
        });
        var str = tree({
            label: 'XtraDB Cluster Status',
            nodes: Nodes,
        });
        clear();
        console.log(str);
    });

};


var spinner = ora('Establishing tunnels...').start();
async.map(config.destinationServers, function(destinationServer, _cb) {
    var tunnelConfig = {
        username: 'root',
        privateKey: config.privateKey,
        host: config.sshServer,
        port: 22,
        dstHost: destinationServer.host,
        dstPort: destinationServer.port,
        keepAlive: true,
        localHost: '127.0.0.1',
        localPort: destinationServer.localPort,
    };
    var server = tunnel(tunnelConfig, function(error, server) {
        if (error) throw error;
        _cb(error, {
            destinationServer: destinationServer,
            serverTunnel: server
        });
    });
}, function(errs, tunnels) {
    spinner.succeed(tunnels.length + ' tunnels Established!');
    spinner = ora('Establishing MySQL Connections...').start();
    async.map(tunnels, function(destinationServer, __cb) {
        destinationServer.sqlConnection = mysql.createConnection({
            host: '127.0.0.1',
            port: destinationServer.destinationServer.localPort,
            user: config.sql.user,
            password: config.sql.pass,
        });
        destinationServer.sqlConnection.connect();
        __cb(null, destinationServer);
    }, function(errs, destinationServers) {
        spinner.succeed(destinationServers.length + ' SQL Connections Established!');
        if (errs) throw errs;
        spinner = ora('Querying SQL Servers..').start();
        async.map(destinationServers, function(destinationServer, ___cb) {
            destinationServer.sqlConnection.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
                if (error) throw error;
                ___cb(error, destinationServer);
            });
        }, function(errs, destinationServers) {
            if (errs) throw errs;
            spinner.succeed(destinationServers.length + ' SQL Servers Queried!');
            querySQLs(destinationServers);
            setInterval(function() {
                querySQLs(destinationServers);
            }, intervalTime);
        });
    });
});
