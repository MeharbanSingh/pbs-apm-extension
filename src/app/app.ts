/// <reference types="chrome" />
import { Component, signal, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('pbs-apm-extension');
  serverName = signal('');
  applicationName = signal('');
  formName = signal<any>(null);
  isPopup = signal(true);

  private onMessage = (message: any, sender: chrome.runtime.MessageSender) => {
    if (message?.type === 'PAGE_INFO') {
      this.applicationName.set(message.payload?.title ?? '');
      const host = sender.tab?.url ? new URL(sender.tab.url).hostname : '';
      this.serverName.set(host);
    }
  };

  ngOnInit(): void {
    // Detect if running in popup or tab
    chrome.tabs?.getCurrent((tab) => {
      // If tab exists, we're in a separate tab, otherwise we're in popup
      this.isPopup.set(!tab);

      // Add class to body based on context
      if (!tab) {
        document.body.classList.add('popup-mode');
      } else {
        document.body.classList.add('tab-mode');
      }
    });
  }

  constructor() {
    chrome.runtime?.onMessage.addListener(this.onMessage);
  }

  loadAppInfo() {
    //send event to content script to get page info
    chrome.runtime.sendMessage({ type: 'GET_PAGE_INFO' }, (response: any) => {
      if (response?.success) {
        this.serverName.set(response.data.serverName || 'failed to get');
        this.applicationName.set(response.data.applicationName || 'failed to get');
        this.formName.set(JSON.stringify(response.data.localStorageData) || 'failed to get');
      }
    });
  }

  ClearInfo() {
    this.serverName.set('');
    this.applicationName.set('');
    this.formName.set(null);
  }

  ngOnDestroy(): void {
    chrome.runtime?.onMessage.removeListener(this.onMessage);
  }
}
