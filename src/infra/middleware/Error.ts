import { Socket } from "net";

export class Error {
    
    public static handle(err: String, socket:Socket): void {
        socket.write(`Error: ${err}`);
        socket.end();
        return;
    }
}