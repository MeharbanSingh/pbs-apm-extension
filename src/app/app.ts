/// <reference types="chrome" />
import { Component, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-root',
  imports: [CommonModule, MatTableModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
//implements OnInit, OnDestroy
export class App  {
  protected readonly title = signal('pbs-apm-extension');
  data = signal<any>(null);
  serverName = signal<string>('');
  applicationName = signal('');
  formName = signal<any>(null);
  isPopup = signal(true);
  userID = signal<string>('');
  EpicorVersion = signal<string>('');
  EpicorPatchLevel = signal<string>('');
  UXPVersion = signal<string>('');
  hostingType = signal<string>('');
  company = signal<string>('');
  hotKeyData = signal<any>(null);

  // All possible columns with labels for UI controls
  readonly allColumns: { key: string; label: string }[] = [
    { key: 'shortCut', label: 'Shortcut' },
    { key: 'title', label: 'Title' },
    { key: 'callback', label: 'Callback' },
    { key: 'internal', label: 'Internal' },
    { key: 'category', label: 'Category' },
    { key: 'element', label: 'Element' },
    { key: 'id', label: 'ID' },
    { key: 'defaultShortcut', label: 'Default Shortcut' }
  ];

  // Visible columns (user can hide/show)
  visibleColumns = signal<string[]>(this.allColumns.map(c => c.key));
  displayedColumns = computed(() => this.visibleColumns());

  // Table data source derived from hotKeyData
  dataSource = computed<any[]>(() => (this.hotKeyData() ? this.hotKeyData() : []));

  toggleColumn(key: string) {
    const current = this.visibleColumns();
    if (current.includes(key)) {
      this.visibleColumns.set(current.filter(c => c !== key));
    } else {
      this.visibleColumns.set([...current, key]);
    }
  }

  resetColumns() {
    this.visibleColumns.set(this.allColumns.map(c => c.key));
  }

  showOnly(keys: string[]) {
    this.visibleColumns.set(this.allColumns.map(c => c.key).filter(k => keys.includes(k)));
  }

  // private onMessage = (message: any, sender: chrome.runtime.MessageSender) => {
  //   if (message?.type === 'PAGE_INFO') {
  //     //this.applicationName.set(message.payload?.title ?? '');
  //     //const host = sender.tab?.url ? new URL(sender.tab.url).hostname : '';
  //     //this.serverName.set(host);
  //   }
  // };

  // ngOnInit(): void {
  //   // Detect if running in popup or tab
  //   chrome.tabs?.getCurrent((tab) => {
  //     // If tab exists, we're in a separate tab, otherwise we're in popup
  //     this.isPopup.set(!tab);

  //     // Add class to body based on context
  //     if (!tab) {
  //       document.body.classList.add('popup-mode');
  //     } else {
  //       document.body.classList.add('tab-mode');
  //     }
  //   });
  // }

  // constructor() {
  //   chrome.runtime?.onMessage.addListener(this.onMessage);
  // }

  //write function to write json data to file.
  writeJsonToFile(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadAppInfo() {
    //send event to content script to get page info
    chrome.runtime.sendMessage({ type: 'GET_PAGE_INFO' }, (response: any) => {
      if (response?.success) {

        this.data.set(JSON.stringify(response.data.localStorageData) || null);
        const obj = JSON.parse(this.data() || '{}');
        this.hotKeyData.set(obj['ep-hot-key'].hotKeyList || null);
        this.serverName.set(obj.ep.session.server.serverUrl.toString().split('/')[2] || 'failed to get');
        this.applicationName.set(obj.ep.session.server.serverUrl.toString().split('/')[3] || 'failed to get');
        this.formName.set(obj.kerp.settings.routeState.appViewId || 'failed to get');
        this.userID.set(obj.kerp.settings.user.userId || 'failed to get');
        this.EpicorVersion.set(obj.kerp.settings.user.version || 'failed to get');
        this.EpicorPatchLevel.set(obj.kerp.settings.user.revision || 'failed to get');
        this.UXPVersion.set(obj.kerp.settings.user.uxpVersion || 'failed to get');
        this.hostingType.set(obj.kerp.settings.user.hostingType || 'failed to get');
        this.company.set(obj.kerp.settings.user.companyID+"-"+obj.kerp.settings.user.companyName|| 'failed to get');

      }
    });
  }

  ClearInfo() {
    this.serverName.set('');
    this.applicationName.set('');
    this.formName.set(null);
    this.data.set(null);
    this.userID.set('');
    this.EpicorVersion.set('');
    this.EpicorPatchLevel.set('');
    this.UXPVersion.set('');
    this.hostingType.set('');
    this.company.set('');
    this.hotKeyData.set(null);
  }

  DownloadLocalStorageData() {
    const data = this.data();
    if (data) {
      this.writeJsonToFile(JSON.parse(data), 'localStorageData.json');
    }else {
      alert('No data to download');
    }
  }

  ToggleDeveloperMode()
  {
    chrome.runtime.sendMessage({ type: 'DeveloperMode' }, (response: any) =>
    {

    });
  }

  // ngOnDestroy(): void {
  //   chrome.runtime?.onMessage.removeListener(this.onMessage);
  // }
}
