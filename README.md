# grpc-echo-example
Simple gRPC echo example of all possible kinds of methods.
The server is static, while you can run the client in 4 different ways, each will communicate differently with the gRPC server:
- "simple" RPC call (no streams, you call a function and get a reponse)
- the clients streams messages to the server on a single channel
- the server streams messages to the client on a single channel
- both sides stream messages on a single channel

The server sends back the exact input the client sends, while using different methods of communication.

# Instructions
Run the server first, then run any amount of clients you want, with any configuration you want.

# Server
Run `npm start server`

# Clients
## Simple RPC
The clients calls a function on the server and gets a response.
How to run: `npm start client simple`.

## Client streams messages
The client sends the same message multiple times (hard coded currently) as a stream, the server returns one message in the end as a response: the amount of messages it received, alongside the original message.
How to run: `npm start client clientStream`.

## Server streams messages
The client sends the message once, while the server sends it back multiple times (hard coded currently) as a stream.
How to run: `npm start client serverStream`.

## Bidirectional streams
The client sends a stream of messages, the server sends that message back for each message the client sends.
Both directions are sent in streams.
How to run: `npm start client biStream`.
