import api from './api';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  context?: Record<string, any>;
}

interface NavigationTiming {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

interface PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  name: string;
  duration: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsQueue: PerformanceMetric[] = [];
  private isProcessing = false;
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  private constructor() {
    this.setupPerformanceObservers();
    this.startPeriodicFlush();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObservers(): void {
    // Navigation timing
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationTiming: NavigationTiming = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.responseEnd - timing.navigationStart,
        firstContentfulPaint: timing.domComplete - timing.navigationStart,
      };
      this.recordMetric('navigation_timing', navigationTiming.loadTime, { ...navigationTiming });
    }

    // Resource timing
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.recordMetric('resource_timing', resourceEntry.duration, {
            name: resourceEntry.name,
            type: resourceEntry.initiatorType,
          });
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }

    // Memory usage
    if (window.performance?.memory) {
      setInterval(() => {
        const memory = window.performance.memory;
        if (memory) {
          this.recordMetric('memory_usage', memory.usedJSHeapSize, {
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          });
        }
      }, 30000); // Every 30 seconds
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  recordMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      context,
    };

    this.metricsQueue.push(metric);

    if (this.metricsQueue.length >= this.maxQueueSize) {
      this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.isProcessing || this.metricsQueue.length === 0) return;

    this.isProcessing = true;
    const metricsToSend = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await api.post('/logs/performance', { metrics: metricsToSend });
    } catch (error) {
      // If sending fails, put metrics back in queue
      this.metricsQueue = [...metricsToSend, ...this.metricsQueue];
      console.error('Failed to send performance metrics:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Referral-specific metrics
  recordReferralShare(): void {
    this.recordMetric('referral_share', 1, {
      timestamp: new Date().toISOString(),
    });
  }

  recordReferralClick(): void {
    this.recordMetric('referral_click', 1, {
      timestamp: new Date().toISOString(),
    });
  }

  recordReferralConversion(): void {
    this.recordMetric('referral_conversion', 1, {
      timestamp: new Date().toISOString(),
    });
  }

  recordReferralRewardClaim(): void {
    this.recordMetric('referral_reward_claim', 1, {
      timestamp: new Date().toISOString(),
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 