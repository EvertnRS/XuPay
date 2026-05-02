import net from 'net';
import { ResponseParser } from './infra/parser/ResponseParser';
import { Routes } from './routes/Routes';

const server = net.createServer((socket: net.Socket) => {
    console.log('Cliente conectado');

    const routes = new Routes();


    socket.on('data', (data: Buffer) => {
        console.log('Recebido');
        console.log(data.toString());
        
        const request = ResponseParser.deserialize(data.toString(), socket);
        routes.handle(request, socket);

    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(4000, () => {
    console.log('Servidor de processamento rodando na porta 4000');
});