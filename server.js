const net = require('net');
const clients = [];

const server = net.createServer((socket) => {
    let clientName;

    function broadcast(message, senderSocket) {
        clients.forEach((client) => {
            if (client.socket !== senderSocket) {
                client.socket.write(message);
            }
        });
    }

		function updateClientList(targetSocket) {
			const clientNames = clients.map(client => client.name).join(', ');
			targetSocket.write(`CLIENTLIST:\n${clientNames}\n`);
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
            updateClientList(socket);
        } else if (message === '/exit') {
            const index = clients.findIndex(client => client.socket === socket);
            if (index !== -1) {
                clients.splice(index, 1);
                console.log(`${clientName} left the server`);
                broadcast(`${clientName} left the server\n`);
                socket.end();
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
        }
    });
});



server.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});
