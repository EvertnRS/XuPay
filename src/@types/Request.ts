import { MessageBody } from "./MessageBody";
import { Socket } from "net";
import { Error } from "../infra/middleware/Error";

export type Request = {
  method: string;
  path: string;
  body: MessageBody;
};

enum Source {
  client = "client",
  retry = "retry"
}

enum Type {
  CREATE_TRANSACTION = "CREATE_TRANSACTION",
  READ_TRANSACTION = "READ_TRANSACTION",
  UPDATE_TRANSACTION = "UPDATE_TRANSACTION",
  DELETE_TRANSACTION = "DELETE_TRANSACTION"
}

export function isValidRequest(request: Request, socket:Socket): Request {
  if (!Object.values(Source).includes(request.body.source as Source)) {
      Error.handle("Origem inválida: " + request.body.source, socket);
  }

  if (!Object.values(Type).includes(request.body.type as Type)) {
    Error.handle("Tipo inválido: " + request.body.source, socket);
  }

  if (request.body.timestamp && isNaN(Date.parse(request.body.timestamp))) {
    Error.handle("Timestamp inválido: " + request.body.source, socket);
  }

  return request;
}