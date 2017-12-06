require('./index');

// external libs
const http = require('http');

// internal libs
const server = require('./server');
const util = require('./libs/util');
const daoUtil = require('./libs/daoUtil');


async function _init(portHttp){
    // init queue and db...
    console.log('Waiting for ORM to bootstrap...');
    await Promise.all([
        daoUtil.init(),
    ])

    // starting the server
    console.log('Starting up the server on port', portHttp)
    http.createServer(server).listen(
        portHttp,
        console.log.bind(null, 'Server is up on port', portHttp)
    );
}


// init routine...
const portHttp = process.env.PORT || 8080;
_init(portHttp);
