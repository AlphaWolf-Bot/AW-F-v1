import { socketService } from '../services/socket.js';
import { setupSocketEvents, cleanupSocketEvents } from '../services/socketEvents.js';

const testSocketConnection = async () => {
  try {
    console.log('Testing socket connection...');

    // Set up event listeners
    setupSocketEvents();

    // Test connection
    socketService.connect();

    // Listen for connection events
    socketService.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    socketService.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketService.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Test event handling
    const testEvents = [
      {
        event: 'user:update',
        data: {
          id: 'test-user',
          username: 'Test User',
          level: 1,
          coinBalance: 1000,
        },
      },
      {
        event: 'user:levelUp',
        data: {
          level: 2,
          experience: 100,
          experienceToNext: 200,
          rewards: {
            coins: 100,
            items: ['item1', 'item2'],
          },
        },
      },
      {
        event: 'user:achievement',
        data: {
          id: 'achievement-1',
          name: 'First Win',
          description: 'Win your first game',
          icon: '🏆',
          unlockedAt: new Date().toISOString(),
        },
      },
      {
        event: 'coins:update',
        data: {
          balance: 1100,
          change: 100,
          reason: 'game_win',
          timestamp: new Date().toISOString(),
        },
      },
    ];

    // Wait for connection
    console.log('Waiting for connection...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test each event
    for (const testEvent of testEvents) {
      console.log(`Testing ${testEvent.event}...`);
      socketService.on(testEvent.event, (data) => {
        console.log(`✅ Received ${testEvent.event}:`, data);
      });
    }

    // Clean up after 5 seconds
    setTimeout(() => {
      console.log('Cleaning up...');
      cleanupSocketEvents();
      socketService.disconnect();
      console.log('Test completed');
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testSocketConnection().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 