import { Socket } from "net";

export class Error {
    
    public static handle(err: String, socket:Socket): void {
        console.log(err);

        socket.write(`Error: ${err}`);
        socket.end();
    }
}