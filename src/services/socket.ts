import { io, Socket } from 'socket.io-client';
import { handleApiError } from './errorHandler';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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

type EventCallback<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  on<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as EventCallback);
  }

  off<T>(event: string, callback: EventCallback<T>) {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  private notifyListeners<T>(event: string, data: T) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
        // Notify listeners of connection failure
        this.notifyListeners('connection:failed', {
          error: 'Failed to connect to server',
          attempts: this.reconnectAttempts
        });
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', handleApiError(error));
      this.notifyListeners('error', error);
    });

    // User events
    this.socket.on('user:update', (data: UserUpdate) => {
      this.notifyListeners('user:update', data);
    });

    this.socket.on('user:levelUp', (data: LevelUpdate) => {
      this.notifyListeners('user:levelUp', data);
    });

    this.socket.on('user:achievement', (data: Achievement) => {
      this.notifyListeners('user:achievement', data);
    });

    // Coins events
    this.socket.on('coins:update', (data: CoinsUpdate) => {
      this.notifyListeners('coins:update', data);
    });

    this.socket.on('coins:transaction', (data: CoinsUpdate) => {
      this.notifyListeners('coins:transaction', data);
    });

    // Withdrawal events
    this.socket.on('withdrawal:status', (data: WithdrawalUpdate) => {
      this.notifyListeners('withdrawal:status', data);
    });

    // Ad events
    this.socket.on('ad:impression', (data: AdEvent) => {
      this.notifyListeners('ad:impression', data);
    });

    this.socket.on('ad:click', (data: AdEvent) => {
      this.notifyListeners('ad:click', data);
    });

    this.socket.on('ad:reward', (data: AdEvent) => {
      this.notifyListeners('ad:reward', data);
    });

    // Telegram events
    this.socket.on('telegram:message', (data: { message: string; timestamp: string }) => {
      this.notifyListeners('telegram:message', data);
    });

    this.socket.on('telegram:status', (data: { connected: boolean; lastSeen?: string }) => {
      this.notifyListeners('telegram:status', data);
    });

    // System events
    this.socket.on('system:maintenance', (data: { startTime: string; duration: number }) => {
      this.notifyListeners('system:maintenance', data);
    });

    this.socket.on('system:update', (data: { version: string; changes: string[] }) => {
      this.notifyListeners('system:update', data);
    });
  }
}

export const socketService = new SocketService(); 