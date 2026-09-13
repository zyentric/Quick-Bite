import { API_URL } from '../config/api';

export interface OrderSocketEvent {
  type: 'ORDER_PLACED' | 'ORDER_STATUS_CHANGED' | 'DELIVERY_CLAIMED' | 'ORDER_CANCELLED';
  orderId: string;
  orderNumber?: string;
  status: string;
  message: string;
  userId?: string;
  roleTarget?: string[];
  timestamp?: string;
}

export interface ChatSocketMessage {
  type: 'CHAT_MESSAGE';
  orderId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientRole?: string;
  message: string;
  createdAt: string;
}

type EventCallback = (event: OrderSocketEvent) => void;
type ChatCallback = (message: ChatSocketMessage) => void;
type ToastCallback = (options: { type: 'order' | 'info' | 'success' | 'warning' | 'error'; title: string; message: string }) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private role: string | null = null;
  private listeners: Set<EventCallback> = new Set();
  private chatListeners: Set<ChatCallback> = new Set();
  private toastHandler: ToastCallback | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private isExplicitlyClosed = false;

  public setToastHandler(handler: ToastCallback | null) {
    this.toastHandler = handler;
  }

  public connect(userId: string, role: string) {
    this.userId = userId;
    this.role = role;
    this.isExplicitlyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      // Already connected or connecting, send register message
      this.sendRegister();
      return;
    }

    this.initSocket();
  }

  private getSocketUrl(): string {
    let url = API_URL.replace(/\/api\/?$/, '');
    if (url.startsWith('https://')) {
      url = url.replace('https://', 'wss://');
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', 'ws://');
    } else {
      url = `ws://${url}`;
    }
    return url;
  }

  private initSocket() {
    if (this.isExplicitlyClosed) return;

    try {
      const wsUrl = this.getSocketUrl();
      console.log('[WebSocketService] Connecting to:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocketService] Connected successfully');
        this.reconnectDelay = 2000;
        this.sendRegister();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocketService] Message received:', data);

          if (data.type === 'REGISTERED') {
            console.log('[WebSocketService] Registered as:', data.role);
            return;
          }

          if (data.type === 'PONG') {
            return;
          }

          // Chat message event received
          if (data.type === 'CHAT_MESSAGE') {
            const chatMsg = data as ChatSocketMessage;

            // Notify chat screen listeners
            this.chatListeners.forEach((callback) => {
              try {
                callback(chatMsg);
              } catch (err) {
                console.error('[WebSocketService] Error in chat listener:', err);
              }
            });

            // If toast handler is active, show incoming chat toast
            if (this.toastHandler && chatMsg.message) {
              const roleTitle =
                chatMsg.senderRole === 'delivery_man'
                  ? 'Delivery Hero'
                  : chatMsg.senderRole === 'shopkeeper'
                  ? 'Kitchen'
                  : 'Customer';

              this.toastHandler({
                type: 'info',
                title: `${chatMsg.senderName || roleTitle} (Order #${chatMsg.orderId.slice(-6).toUpperCase()})`,
                message: chatMsg.message,
              });
            }
            return;
          }

          // Order event received
          const orderEvent = data as OrderSocketEvent;

          // 1. Notify UI toast if registered
          if (this.toastHandler && orderEvent.message) {
            let toastType: 'order' | 'info' | 'success' | 'warning' | 'error' = 'order';
            let title = 'Order Update';

            if (orderEvent.type === 'ORDER_PLACED') {
              toastType = 'order';
              title = `New Order #${orderEvent.orderNumber || ''}`;
            } else if (orderEvent.status === 'Delivered') {
              toastType = 'success';
              title = `Order #${orderEvent.orderNumber || ''} Delivered!`;
            } else if (orderEvent.type === 'ORDER_CANCELLED') {
              toastType = 'warning';
              title = `Order Cancelled #${orderEvent.orderNumber || ''}`;
            } else if (orderEvent.type === 'DELIVERY_CLAIMED') {
              toastType = 'info';
              title = 'Delivery Hero Assigned';
            }

            this.toastHandler({
              type: toastType,
              title,
              message: orderEvent.message,
            });
          }

          // 2. Notify all subscribed screens / listeners
          this.listeners.forEach((callback) => {
            try {
              callback(orderEvent);
            } catch (err) {
              console.error('[WebSocketService] Error in listener callback:', err);
            }
          });
        } catch (e) {
          console.log('[WebSocketService] Raw message:', event.data);
        }
      };

      this.ws.onerror = (error: any) => {
        console.log('[WebSocketService] Socket error:', error?.message || 'WebSocket Error');
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocketService] Socket closed with code:', event.code);
        this.ws = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[WebSocketService] Failed to initialize socket:', err);
      this.scheduleReconnect();
    }
  }

  private sendRegister() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userId) {
      this.ws.send(
        JSON.stringify({
          type: 'REGISTER',
          userId: this.userId,
          role: this.role || 'customer',
        })
      );
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    console.log(`[WebSocketService] Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
      this.initSocket();
    }, this.reconnectDelay);
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeChat(callback: ChatCallback): () => void {
    this.chatListeners.add(callback);
    return () => {
      this.chatListeners.delete(callback);
    };
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.userId = null;
    this.role = null;
  }
}

export const wsService = new WebSocketService();
