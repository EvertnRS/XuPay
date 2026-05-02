import net from 'net';
import { ResponseParser } from './infra/parser/ResponseParser';
import { Error } from './infra/middleware/Error';
import { Routes } from './routes/Routes';

const server = net.createServer((socket: net.Socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data: Buffer) => {
        console.log('Recebido');
        
        const request = ResponseParser.deserialize(data.toString(), socket);

        if (!request) {
            return Error.handle('Corpo da requisição com campos diferentes do esperado ' + request, socket);
        }

        const routes = new Routes();
        routes.handle(request, socket);

    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(4000, () => {
    console.log('Servidor de processamento rodando na porta 4000');
});