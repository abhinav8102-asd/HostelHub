import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';

export interface LiveNotification {
  message: string;
  type: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private notificationSubject = new BehaviorSubject<LiveNotification | null>(null);
  public notification$ = this.notificationSubject.asObservable();
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connect(user.id);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(userId: number): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(API_CONFIG.baseUrl, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      console.log('Socket client connected.');
      this.connectedSubject.next(true);
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket client disconnected.');
      this.connectedSubject.next(false);
    });

    this.socket.on('notification', (data: LiveNotification) => {
      console.log('Notification received:', data);
      this.notificationSubject.next(data);
    });
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connectedSubject.next(false);
    }
  }

  // Clear current active notification alert
  clearNotification(): void {
    this.notificationSubject.next(null);
  }

  // Register custom socket event listener
  onEvent(eventName: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  emit(eventName: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  getSocket(): Socket | null {
    return this.socket || null;
  }
}
