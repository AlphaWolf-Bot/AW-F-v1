import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://server-d421.onrender.com';

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

  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('token')
      }
    });

    this.setupListeners();
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
      console.error('Socket error:', error);
    });

    // Add more event listeners as needed
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
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
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
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