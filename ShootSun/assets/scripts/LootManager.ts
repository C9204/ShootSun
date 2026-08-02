import { _decorator, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
import { ItemData, ItemRarity } from './ItemData';
import { InventoryManager } from './InventoryManager';
import { InventoryUI } from './InventoryUI';
import { ItemDatabase } from './ItemDatabase';
const { ccclass, property } = _decorator;

@ccclass('LootManager')
export class LootManager extends Component {

    public static dropItem(): void {
        const item : ItemData = ItemDatabase.dropRandomItem();
        InventoryManager.addItem(item);
        InventoryUI.instance.refreshUI();
        console.log(`Get : ${item.name}`);
        console.log(InventoryManager.getItems());
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


