import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

// Event types
interface UserUpdate {
  id: string;
  username?: string;
  level?: number;
  coinBalance?: number;
  tapsRemaining?: number;
}

interface CoinsUpdate {
  balance: number;
  change: number;
  reason: string;
  timestamp: string;
}

interface LevelUpdate {
  level: number;
  experience: number;
  experienceToNext: number;
  rewards?: {
    coins: number;
    items?: string[];
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface WithdrawalUpdate {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  method: string;
  timestamp: string;
}

interface AdEvent {
  id: string;
  type: 'impression' | 'click' | 'reward';
  amount?: number;
  timestamp: string;
}

type SocketCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<SocketCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isConnecting = false;

  constructor() {
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.reconnect();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.disconnect();
    });
  }

  private getSocketUrl(): string {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      throw new Error('Socket URL not configured');
    }
    return socketUrl;
  }

  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      console.log('Socket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const token = useAuthStore.getState().token;

    if (!token) {
      console.error('No authentication token available');
      this.isConnecting = false;
      return;
    }

    try {
      this.socket = io(this.getSocketUrl(), {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        timeout: 10000,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.handleError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.reconnect();
      }
    });

    // Reattach all event listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 1.5,
      this.maxReconnectDelay
    );

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  private handleError(error: Error): void {
    console.error('Socket error:', error);
    // Notify user of error (you can implement your own error notification system)
    if (error.message.includes('authentication')) {
      useAuthStore.getState().logout();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.eventListeners.clear();
  }

  on(event: string, callback: SocketCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: SocketCallback): void {
    this.eventListeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService(); 