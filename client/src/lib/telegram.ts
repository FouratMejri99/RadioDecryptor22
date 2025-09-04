// Telegram Web App SDK integration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setParams(params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        expand(): void;
        close(): void;
        ready(): void;
        sendData(data: string): void;
        switchInlineQuery(query: string, choose_chat_types?: string[]): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        showPopup(params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: {
          text?: string;
        }, callback?: (text: string) => boolean): void;
        closeScanQrPopup(): void;
        requestWriteAccess(callback?: (granted: boolean) => void): void;
        requestContact(callback?: (granted: boolean) => void): void;
        onEvent(eventType: string, eventHandler: () => void): void;
        offEvent(eventType: string, eventHandler: () => void): void;
      };
    };
  }
}

export class TelegramWebApp {
  private static instance: TelegramWebApp;
  private webApp: typeof window.Telegram.WebApp | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.webApp.ready();
    }
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  public isAvailable(): boolean {
    return this.webApp !== null;
  }

  public getUser() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  public getUserId(): string {
    const user = this.getUser();
    return user ? user.id.toString() : 'demo_user';
  }

  public getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'dark';
  }

  public expand(): void {
    this.webApp?.expand();
  }

  public close(): void {
    this.webApp?.close();
  }

  public showAlert(message: string, callback?: () => void): void {
    if (this.webApp) {
      this.webApp.showAlert(message, callback);
    } else {
      alert(message);
      callback?.();
    }
  }

  public showConfirm(message: string, callback?: (confirmed: boolean) => void): void {
    if (this.webApp) {
      this.webApp.showConfirm(message, callback);
    } else {
      const confirmed = confirm(message);
      callback?.(confirmed);
    }
  }

  public hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'): void {
    if (!this.webApp?.HapticFeedback) return;

    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        this.webApp.HapticFeedback.impactOccurred(type);
        break;
      case 'success':
      case 'error':
      case 'warning':
        this.webApp.HapticFeedback.notificationOccurred(type);
        break;
      case 'selection':
        this.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }

  public setMainButton(params: {
    text: string;
    color?: string;
    textColor?: string;
    isVisible?: boolean;
    onClick?: () => void;
  }): void {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.setText(params.text);
    
    if (params.color) this.webApp.MainButton.color = params.color;
    if (params.textColor) this.webApp.MainButton.textColor = params.textColor;
    
    if (params.onClick) {
      this.webApp.MainButton.onClick(params.onClick);
    }

    if (params.isVisible !== false) {
      this.webApp.MainButton.show();
    } else {
      this.webApp.MainButton.hide();
    }
  }

  public hideMainButton(): void {
    this.webApp?.MainButton.hide();
  }
}

export const telegram = TelegramWebApp.getInstance();
