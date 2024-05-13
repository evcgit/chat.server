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
      } else if (input.startsWith('/dm')) {
				const recipient = input.split(' ')[1];
				const message = input.split(' ').slice(2).join(' ');
				client.write(`DM:${recipient}:${message}`);
			} else if (input.startsWith('/kick')) {
				const recipient = input.split(' ')[1];
				const message = input.split(' ').slice(2).join(' ');
				client.write(`KICK:${recipient}:${message}`);
			} else if (input === ('/help')) {
				console.log(`\nCommands:\n/setname <newname> - change your name\n/exit - disconnect from the server\n/clientlist - view all connected clients\n/dm <recipient> <message> - send a private message\n/kick <recipient> <password> - kick a user from the server\n/help - view all commands\n`);
			} else {
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
