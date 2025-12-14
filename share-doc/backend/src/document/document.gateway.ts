import { WebSocketGateway, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";import { Server, Socket } from "socket.io";import { DocumentService } from "./document.service";import { JwtService } from "@nestjs/jwt";@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: "/ws",
})
export class DocumentGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly documentService: DocumentService,
    private readonly jwtService: JwtService
  ) {}

  @SubscribeMessage("doc:join")
  async handleJoin(client: Socket, payload: { docId: string }) {
    const { docId } = payload;
    const token = client.handshake.auth.token;

    if (\!token) {
      client.emit("error", { message: "Unauthorized" });
      return;
    }

    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId;

      // Check if user has access to document
      await this.documentService.findOneById(docId, userId);

      // Join the room
      await client.join(docId);

      // Get current document content
      const document = await this.documentService.findOneById(docId, userId);

      // Send current content to client
      client.emit("doc:sync", {
        content: document.content ? document.content.toString("base64") : null,
      });

      console.log();
    } catch (error) {
      console.error(, error);
      client.emit("error", { message: "Failed to join document" });
    }
  }

  @SubscribeMessage("doc:update")
  async handleUpdate(client: Socket, payload: { docId: string; update: string }) {
    const { docId, update } = payload;
    const token = client.handshake.auth.token;

    if (\!token) {
      client.emit("error", { message: "Unauthorized" });
      return;
    }

    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId;

      // Convert base64 update to buffer
      const updateBuffer = Buffer.from(update, "base64");

      // Save the update to database (async)
      this.documentService.saveContent(docId, updateBuffer, userId).catch(console.error);

      // Broadcast the update to all other clients
      client.to(docId).emit("doc:update", {
        update,
      });
    } catch (error) {
      console.error(, error);
      client.emit("error", { message: "Failed to process document update" });
    }
  }

  @SubscribeMessage("awareness:update")
  async handleAwarenessUpdate(client: Socket, payload: { docId: string; state: any }) {
    const { docId, state } = payload;

    // Broadcast awareness update to all other clients
    client.to(docId).emit("awareness:update", {
      clientId: client.id,
      state,
    });
  }
}