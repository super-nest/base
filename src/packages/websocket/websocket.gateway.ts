import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { appSettings } from 'src/configs/app-settings';
import { Server, Socket } from 'socket.io';
import { EVENT_NAME } from './constants';
import { Types } from 'mongoose';
import { ReviewRatingDocument } from 'src/apis/review-ratings/entities/review-ratings.entity';
import { sleep } from 'src/utils/helper';

@WebSocketGateway(appSettings.webSocket.port, {
    cors: true,
})
export class WebsocketGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(WebsocketGateway.name);

    handleConnection(client: Socket) {
        const { userId, appId } = client.handshake.query;

        if (userId) {
            client.join(userId);
            this.logger.log(
                `Client connected: ${client.id} (UserId: ${userId})`,
            );
        } else {
            this.logger.warn(`Client connected without UserId`);
        }

        if (appId) {
            client.join(appId);
            this.logger.log(`Client connected: ${client.id} (AppId: ${appId})`);
        } else {
            this.logger.warn(`Client connected without AppId`);
        }
    }

    handleDisconnect(client: Socket) {
        const { userId, appId } = client.handshake.query;

        if (userId) {
            client.leave(String(userId));
            this.logger.log(
                `Client disconnected: ${client.id} (UserId: ${userId})`,
            );
        }

        if (appId) {
            client.leave(String(appId));
            this.logger.log(
                `Client disconnected: ${client.id} (AppId: ${appId})`,
            );
        }
    }

    sendMissionUpdate(userId: Types.ObjectId) {
        this.server
            .to(userId.toString())
            .emit(EVENT_NAME.MISSION_UPDATE, { data: true });
    }

    async sendPointsUpdate(
        userId: Types.ObjectId,
        currentPoint: number,
        ms = 0,
    ) {
        await sleep(ms);
        this.server
            .to(userId.toString())
            .emit(EVENT_NAME.POINT_UPDATE, { currentPoint });
    }

    sendNewReviewRating(appId: Types.ObjectId, result: ReviewRatingDocument) {
        this.server
            .to(appId.toString())
            .emit(EVENT_NAME.NEW_REVIEW_RATING, result);
    }

    sendLimitAddPointForUser(userId: Types.ObjectId, data: any) {
        this.server
            .to(userId.toString())
            .emit(EVENT_NAME.GET_LIMIT_ADD_POINT_FOR_USER, data);
    }

    sendToClient(userId: Types.ObjectId, event: string, data: any) {
        this.server.to(userId.toString()).emit(event, data);
    }
}
