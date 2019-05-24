const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const log = require('./log');

const PROTO_PATH = 'echo.proto';
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const echo = grpc.loadPackageDefinition(packageDefinition).echo;

function simple(call, callback) {
  const msg = call.request.msg;
  log(`Echo ${msg}`);
  callback(null, { msg : msg });
}

function serverStream(call) {
  const msg = call.request.msg;
  const repeats = call.request.repeats;

  for (let i = 0; i < repeats; i++) {
    log(`Sending: ${msg}`);
    call.write({msg:msg})
  }

  call.end();
}

function clientStream(call, callback) {
  let repeats = 0;
  let text = '';
  call.on('data', function(msg) {
    repeats += 1;
    text = msg.msg;
    log(`Received on stream: ${text}`);
  });
  call.on('end', function() {
    callback(null, {
      msg: text,
      repeats,
    });
  });
}

function biStream(call) {
  call.on('data', function(msg) {
    log(`Received on stream: ${msg.msg}`);
    log(`Sending on stream: ${msg.msg}`);
    call.write(msg);
  });

  call.on('end', function() {
    call.end();
  });
}

function getServer() {
  var server = new grpc.Server();
  server.addProtoService(echo.Echo.service, {
    simple,
    serverStream,
    clientStream,
    biStream,
  });
  return server;
}

// If this is run as a script, start a server on an unused port
const routeServer = getServer();
routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
routeServer.start();
