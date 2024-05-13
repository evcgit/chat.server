const net = require('net');
const clients = [];
const password = 'password';

const server = net.createServer((socket) => {
    let clientName;

    function broadcast(message, senderSocket) {
        clients.forEach((client) => {
            if (client.socket !== senderSocket) {
                client.socket.write(message);
            }
        });
    }

    socket.on('data', (data) => {
        const message = data.toString().trim();
        if (message.startsWith('JOIN:')) {
            clientName = message.substring(5);
            clients.push({ socket, name: clientName });
            broadcast(`\n${clientName} joined the server\n`, socket);
            console.log(`${clientName} joined the server`);
        } else if (message.startsWith('SETNAME:')) {
            const newName = message.substring(8).trim();
            const oldName = clientName;
            clientName = newName;
            const client = clients.find(client => client.socket === socket);
            if (client) {
                client.name = newName;
            }
            broadcast(`${oldName} changed their name to ${newName}\n`, socket);
            console.log(`${oldName} changed their name to ${newName}`);  
        } else if (message === '/clientlist') {
					const clientNames = clients.map(client => client.name).join(',\n-');
					socket.write(`\nCLIENTLIST:\n\n${clientNames}\n`);
        } else if (message.startsWith('DM:')) {
					const recipient = message.split(':')[1];
					const content = message.split(':').slice(2).join(':');
					const recipientClient = clients.find(client => client.name === recipient);
					if (recipientClient) {
						recipientClient.socket.write(`\nDM from ${clientName}: ${content}\n`);
						console.log(`DM from ${clientName} to ${recipient}: ${content}`);
					} else {
						socket.write(`\nRecipient ${recipient} not found\n`);
					}
				} else if (message.startsWith('KICK:')) {
					const recipient = message.split(':')[1];
					const content = message.split(':').slice(2).join(':');
					const recipientClient = clients.find(client => client.name === recipient);
					if (content !== password) {
						socket.write(`\nIncorrect password\n`);
						return;
					} else {
						if (recipientClient) {
							recipientClient.socket.write(`\nYou have been kicked by ${clientName}\n`);
							recipientClient.socket.end();
							console.log(`${recipient} has been kicked by ${clientName}`);
						} else {
							socket.write(`\nRecipient '${recipient}' not found\n`);
						}
					}
				} else {
            broadcast(`${clientName}: ${message}`, socket);
            console.log(`${clientName}: ${message}`);
        }
    });

    socket.on('end', () => {
        const index = clients.findIndex(client => client.socket === socket);
        if (index !== -1) {
            const exitingClientName = clientName || 'Anonymous';
            clients.splice(index, 1);
            broadcast(`${exitingClientName} left the server\n`, socket);
						console.log(`${exitingClientName} left the server`);
        }
    });
});



server.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});
