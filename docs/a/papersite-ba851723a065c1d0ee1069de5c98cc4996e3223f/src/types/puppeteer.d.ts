import { Page } from 'puppeteer';

declare module 'puppeteer' {
  export interface NetworkConditions {
    latency: number;
    download: number;
    upload: number;
    offline?: boolean;
  }

  export interface Page {
    setOfflineMode(offline: boolean): Promise<void>;
    emulateNetworkConditions(conditions: NetworkConditions): Promise<void>;
  }
}