import type { Response }  from "../../@types/Response";
import type { Request }  from "../../@types/Request";
import { Socket } from "net";
import { Error } from "../middleware/Error";

export class ResponseParser {
    public static deserialize(request: string, socket:Socket): Request {
        const parts = request.split('|');
        const bodyParts = parts[0].split(' ');
        try {
            if (parts.length < 3) {
                Error.handle('Formato inválido de requisição '+ request, socket);
            }

            if (bodyParts.length < 4) {
                Error.handle('Formato inválido de corpo ' + request, socket);
            }
            
        } catch (error: any) {
            Error.handle('Formato inválido de corpo ' + request, socket);
        }

        const [method, path] = parts;
        const [source, type, payload, timestamp] = bodyParts;

        return {
                method,
                path,
                body:{
                    source,
                    type,
                    payload,
                    timestamp
                }
            };
    }   

    public static serialize(response: Response): string {
        return `${response.id}|${response.type}|${response.payload}`;
    }
}
