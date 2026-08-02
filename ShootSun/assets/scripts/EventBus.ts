type EventHandler = (date?: any) => void;

export class EventBus {

    //存储事件监听器
    // Map< 事件名 , 监听器数组 >
    private static _listeners: Map<string,EventHandler[]> = new Map();

    /**
     * 订阅事件
     * @param eventName 事件名称
     * @param handler 处理函数
     */
    public static on(eventName: string,handler: EventHandler) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName,[]);
        }

        this._listeners.get(eventName).push(handler);
    }

    /**
     * 取消订阅
     */
    public static off(eventName: string,handler: EventHandler) {
        const handlers = this._listeners.get(eventName);
        if (!handlers) {
            return;
        }
        const index = handlers.indexOf(handler);

        if (index > -1) {
            handlers.splice(index,1);
        }
    }

    /**
     * 发布事件
     */
    public static emit(eventName: string,data?: any) {
        const handlers = this._listeners.get(eventName);
        if (!handlers) {
            return;
        }
        // 复制一份，避免回调中修改数组导致问题
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`事件处理出错 ${eventName}:`,error);
            }
        })
    }

    /**
     * 订阅一次
     */
    public static once(eventName: string,handler: EventHandler) {
        const warpper = (data: any) => {
            handler(data);
            this.off(eventName,warpper);
        }
        this.on(eventName,warpper);
    }

    /**
     * 清空某个事件的监听
     */
    public static clear(eventName: string) {
        if (!eventName) {
            console.warn(`${eventName} not found`);
            return;
        }
        this._listeners.delete(eventName);
    }

    /**
     * 清空所有事件的监听
     */
    public static clearAll() {
        this._listeners.clear();
    }
}


