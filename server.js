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

    function updateClientList() {
        const clientNames = clients.map(client => client.name).join(', ');
        clients.forEach(client => {
            client.socket.write(`CLIENTLIST:${clientNames}\n`);
        });
    }

    socket.on('data', (data) => {
        const message = data.toString().trim();
        if (message.startsWith('JOIN:')) {
            clientName = message.substring(5);
            clients.push({ socket, name: clientName });
            broadcast(`${clientName} joined the server\n`, socket);
            console.log(`${clientName} joined the server`);
            updateClientList();
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
            updateClientList();
        } else if (message === '/clientlist') {
            updateClientList(); // Send the client list to the client
        } else if (message === '/exit') {
            const index = clients.findIndex(client => client.socket === socket);
            if (index !== -1) {
                const exitingClientName = clientName || 'Anonymous';
                clients.splice(index, 1);
                console.log(`${exitingClientName} left the server`);
                broadcast(`${exitingClientName} left the server\n`);
                updateClientList();
                socket.end();
            }
        } else {
            broadcast(`${clientName}: ${message}\n`, socket);
            console.log(`${clientName}: ${message}`);
        }
    });

    socket.on('end', () => {
        const index = clients.findIndex(client => client.socket === socket);
        if (index !== -1) {
            const exitingClientName = clientName || 'Anonymous';
            clients.splice(index, 1);
            broadcast(`${exitingClientName} left the server\n`, socket);
            updateClientList();
        }
    });
});

const PORT = 3000;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});
