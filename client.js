const net = require('net');
const readline = require('readline');
const client = new net.Socket();
let username;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


client.connect(3000, 'localhost', () => {
  rl.question('Enter your name: ', (name) => {
    username = name;
    client.write(`JOIN:${name}`);

    rl.on('line', (input) => {
      if (input.startsWith('/setname')) {
        const newName = input.substring(9).trim();
        client.write(`SETNAME:${newName}`);
        username = newName;
      } else if (input === '/exit') {
        client.end();
        rl.close();
      } else if (input === '/clientlist') {
        client.write(input);
      }
      
      else {
        client.write(input);
      }
    });
  });
});

client.on('data', (data) => {
  console.log(data.toString());
});

client.on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
});
