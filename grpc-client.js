const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const log = require('./log');

const PROTO_PATH = 'echo.proto';
const REPEATS = 5;

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const echo = grpc.loadPackageDefinition(packageDefinition).echo;
var client = new echo.Echo('localhost:50051',
                                       grpc.credentials.createInsecure());

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const argvHandlers = {
  "simple": simpleHandler,
  "serverStream": serverStream,
  "clientStream": clientStream,
  "biStream": biStream,
}

function simpleHandler(text, resolve) {
  log(`Sending: ${text}`);
  client.simple({ msg: text }, (error, returnedMsg) => {
    if (error) {
      log(`Error: ${error}`);
    }
    else {
      log(`Received: ${returnedMsg.msg}`);
    }
    resolve();
  });
}

function serverStream(text, resolve) {
  const call = client.serverStream({msg: text, repeats: REPEATS});
  call.on('data', function(returnedMsg) {
    log(`Received in stream: ${returnedMsg.msg}`);
  });
  call.on('end', resolve);
}

function clientStream(text, resolve) {

  const call = client.clientStream(function(error, msg) {
    if (error) {
      resolve(error);
      return;
    }
    log(`Received: ${msg.msg}`);
    log(`Server got ${msg.repeats} messages in stream`);
    resolve();
  });

  for (let i = 0; i < REPEATS; i++) {
    log(`Sending: ${text}`);
    call.write({msg:text})
  }

  call.end();
}

function biStream(text, resolve) {
  let received = 0;

  const call = client.biStream();

  call.on('data', function(returnedMsg) {
    received++;
    log(`Received in stream: ${returnedMsg.msg}`);
    if (received == REPEATS) {
      call.end();
    }
  });
  
  call.on('end', resolve);
  let sent = 0;

  let sendMsg = () => {
    log(`Sending on stream: ${text}`);
    call.write({msg:text});
    sent++;
    if (sent == REPEATS) {
      return;
    }
    setTimeout(sendMsg, 500);
  };

  sendMsg();
}

async function main() {
  while (true) {
    await new Promise(resolve => {
      readline.question(`[${new Date().toISOString()}] what to send? `, (text) => {
        argvHandlers[process.argv[2]](text,resolve);
      });
    });
  }
}

if (process.argv.length < 3 || !argvHandlers[process.argv[2]]) {
  log("wrong parameter!");
  process.exit();
}
main();