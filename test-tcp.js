const net = require('net');
const host = 'ac-wspqrub-shard-00-00.zdgq8u8.mongodb.net';
const port = 27017;

console.log(`Connecting to ${host}:${port}...`);
const client = new net.Socket();

client.connect(port, host, () => {
    console.log('✅ TCP connection established!');
    client.destroy();
});

client.on('error', (err) => {
    console.error('❌ TCP connection error:');
    console.error(err);
});

client.setTimeout(5000, () => {
    console.error('❌ TCP connection timed out!');
    client.destroy();
});
