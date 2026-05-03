import { SocketClient } from "@/infra/client/SocketClient";

export class ServiceClient {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly serviceHost: string,
    private readonly servicePort: number
  ) {}

  public async send(queueMessageId: string, service: string, apiPayload: string): Promise<void> {
    const request = this.buildSendRequest(queueMessageId, service, apiPayload);

    await this.socketClient.send(
      this.serviceHost,
      this.servicePort,
      request
    );

    }

  private buildSendRequest(queueMessageId: string, service: string, apiPayload: string): string {
    const payload = `queueMessageId=${queueMessageId},service=${service},apiPayload=${apiPayload}`;

    return `POST|process|MESSAGE_SERVICE;REQUEST;${payload};${new Date().toISOString()}`;
  }
}