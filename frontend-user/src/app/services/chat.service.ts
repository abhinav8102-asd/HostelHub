import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { API_CONFIG } from '../config/api.config';

export interface GroupChat {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'all';
  batch: string;
  hostelBlock: string;
  description: string;
}

export interface ChatMessage {
  id: number;
  groupId: number;
  senderId: number;
  message: string;
  attachmentUrl?: string;
  isDeleted?: boolean;
  deletedBy?: number;
  deletedByName?: string;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    role: string;
    profilePicUrl?: string;
    roomNumber?: string;
    hostelBlock?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/chat`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  getMyGroups(): Observable<GroupChat[]> {
    return this.http.get<GroupChat[]>(`${this.apiUrl}/groups`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getGroupMessages(groupId: number): Observable<{ group: GroupChat; messages: ChatMessage[] }> {
    return this.http.get<{ group: GroupChat; messages: ChatMessage[] }>(`${this.apiUrl}/messages/${groupId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  sendMessage(groupId: number, message: string, attachmentUrl?: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/send`, { groupId, message, attachmentUrl }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  uploadChatImage(file: File): Observable<{ attachmentUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ attachmentUrl: string }>(`${this.apiUrl}/upload`, formData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteMessageForEveryone(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/messages/${messageId}/everyone`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  bulkDeleteMessagesForEveryone(messageIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages/bulk-delete-everyone`, { messageIds }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  joinGroupRoom(groupId: number): void {
    const socket = this.socketService.getSocket();
    if (socket) {
      socket.emit('join_chat_group', groupId);
    }
  }

  leaveGroupRoom(groupId: number): void {
    const socket = this.socketService.getSocket();
    if (socket) {
      socket.emit('leave_chat_group', groupId);
    }
  }

  onNewMessage(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {
      const socket = this.socketService.getSocket();
      if (socket) {
        socket.on('receive_group_message', (msg: ChatMessage) => {
          observer.next(msg);
        });
      }
    });
  }

  onMessageDeletedEveryone(): Observable<{ messageId: number; groupId: number; deletedByName: string }> {
    return new Observable(observer => {
      const socket = this.socketService.getSocket();
      if (socket) {
        socket.on('message_deleted_everyone', (data: { messageId: number; groupId: number; deletedByName: string }) => {
          observer.next(data);
        });
      }
    });
  }

  onBulkMessagesDeletedEveryone(): Observable<{ messageIds: number[]; groupId: number; deletedByName: string }> {
    return new Observable(observer => {
      const socket = this.socketService.getSocket();
      if (socket) {
        socket.on('bulk_messages_deleted_everyone', (data: { messageIds: number[]; groupId: number; deletedByName: string }) => {
          observer.next(data);
        });
      }
    });
  }
}
