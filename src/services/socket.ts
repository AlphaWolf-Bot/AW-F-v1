import { io, Socket } from 'socket.io-client';
import { handleApiError } from './errorHandler';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', handleApiError(error));
    });

    // User events
    this.socket.on('user:levelUp', (data) => {
      this.notifyListeners('user:levelUp', data);
    });

    this.socket.on('user:achievement', (data) => {
      this.notifyListeners('user:achievement', data);
    });

    // Coins events
    this.socket.on('coins:update', (data) => {
      this.notifyListeners('coins:update', data);
    });

    this.socket.on('coins:transaction', (data) => {
      this.notifyListeners('coins:transaction', data);
    });

    // Withdrawal events
    this.socket.on('withdrawal:status', (data) => {
      this.notifyListeners('withdrawal:status', data);
    });

    // Ad events
    this.socket.on('ad:impression', (data) => {
      this.notifyListeners('ad:impression', data);
    });

    this.socket.on('ad:click', (data) => {
      this.notifyListeners('ad:click', data);
    });

    // Telegram events
    this.socket.on('telegram:message', (data) => {
      this.notifyListeners('telegram:message', data);
    });

    this.socket.on('telegram:status', (data) => {
      this.notifyListeners('telegram:status', data);
    });
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  unsubscribe(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService(); 