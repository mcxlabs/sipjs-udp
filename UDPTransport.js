import dgram from 'react-native-udp';
//const dgram = require('dgram');
class UDPTransport {
  constructor(logger, options) {
    this.logger = logger;
    this.port = options.port || 5060;
    this.server = options.server;
  }
  connect() {
    this.client = dgram.createSocket({type: "udp4"});

    this.client.on('error', (err) => {
      console.log("UDP socket closed unexpectedly");
      console.log(err);
      this.client.close();
    });

    this.client.on('message', (msg, rinfo) => {
      console.log("received", msg);
      if (this.onMessage) {
        try {
          this.onMessage(msg.toString('utf8'));
        }
        catch (e) {
          console.log(e);
          console.log("Exception thrown by onMessage callback");
          throw e; // rethrow unhandled exception
        }
      }
    });

    this.client.on('listening', () => {
      const address = this.client.address();
      console.log('connected listening recv');
      this.send('testing');
    });

    return new Promise((resolve, reject) => {
      this.client.bind({port: this.port}, (err) => {
        if (err) reject(err);
        resolve();
      })
    });
  }

  logMessage(action, msg) {
    const lines = msg.toString('utf8').split("\r\n");
    this.logger.debug(`${action} ${lines[0]}${lines.length > 1?" [...]":""}`)
  }

  send(data) {
    console.log("sending", data);
    return new Promise((resolve, reject) => {
      this.client.send(data, 0,data.length,5060, '172.23.53.9', (err) => {
        if (err) reject(err);
        resolve();
      })
    });
  }
}

module.exports = UDPTransport;