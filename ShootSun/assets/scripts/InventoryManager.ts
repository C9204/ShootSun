import { _decorator, Component, Node, sys } from 'cc';
import { ItemData } from './ItemData';
import { ItemDatabase } from './ItemDatabase';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends Component {

    private static _items : (ItemData|null)[] = new Array(10).fill(null);
    private static _saveKey : string = 'Player_Inventory';

    //本地存储

    //保存到本地
    private static saveToLocalStorage() {
        const saveData = this._items.map(item => item ? item.id : null);
        sys.localStorage.setItem(this._saveKey,JSON.stringify(saveData));
    }

    //从本地加载
    private static loadFromLocalStorage() {
        const raw = sys.localStorage.getItem(InventoryManager._saveKey)
        if (!raw) return;

        try {
            const ids = JSON.parse(raw) as (string | null)[];
            InventoryManager._items = ids.map(id => id ? this.getItemById(id) : null);
        } catch (e) {
            console.warn('读取背包存档失败');
        }

    }

    private static getItemById(id: string): ItemData | null {
        return ItemDatabase.getById(id);
    }

    //背包增删查改操作


    //添加物品，成功返回true
    public static addItem(item: ItemData): boolean {

        //找到背包第一个空位
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i] == null) {
                this._items[i] = item;
                this.saveToLocalStorage();
                return true;
            }
        }

        console.log('背包已经满了');
        return false;
    }

    //删除物品
    public static removeItem(index: number): boolean {
        if (index < 0||index > InventoryManager._items.length) return false; //删除物品的索引不存在
        if (InventoryManager._items[index] == null) return false; //删除对应物品栏中无物品
        
        InventoryManager._items[index] = null;
        InventoryManager.saveToLocalStorage();
        return true;
    }

    //清空背包
    public static clearInventory() {
        InventoryManager._items.fill(null);
        InventoryManager.saveToLocalStorage();
    }

    //获取所有物品，便于UI渲染
    public static getItems(): (ItemData | null)[] {
        return InventoryManager._items;
    }

    //获取单个物品
    public static getItem(index: number): ItemData | null {
        return InventoryManager._items[index];
    }
    
    //检查空位
    public static hasEmptySlot() {
        return InventoryManager._items.some(item => item === null);
    }


    protected onLoad(): void {
        InventoryManager.loadFromLocalStorage();
    }


    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


