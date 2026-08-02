import { _decorator, Color, Component, instantiate, Label, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { InventoryManager } from './InventoryManager';
import { ItemData } from './ItemData';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
const { ccclass, property } = _decorator;

@ccclass('InventoryUI')
export class InventoryUI extends Component {

    @property(Prefab)
    Slot_Prafab: Prefab = null; //导入物品栏预制体

    @property(Node)
    GridContainer_Node: Node = null; //导入存预制体的父节点

    private _slotNodes: Node[] = [];

    public static instance: InventoryUI = null; 


    protected onLoad(): void {
        InventoryUI.instance = this;
        this.creatSlots(10);
        this.refreshUI();

        EventBus.on(GameEvents.ITEM_ADDED,this.onItemAdded);
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.ITEM_ADDED,this.onItemAdded);
    }

    private onItemAdded = (item: ItemData) => {
        this.refreshUI();
        console.log(`物品加入背包：${item.name}`);
    }
    creatSlots(count:number) {
        for (let i = 0;i<count;i++) {
            const slot = instantiate(this.Slot_Prafab);
            slot.name = `Slot_${i}`;
            this.GridContainer_Node.addChild(slot);
            this._slotNodes.push(slot);
        }
    }

    public refreshUI() {
        const items = InventoryManager.getItems(); // 获取背包数据
        
        for (let i = 0; i < this._slotNodes.length; i++) {
            const slot = this._slotNodes[i];
            const item = items[i] || null;
            
            // 更新这个格子的显示
            this.updateSlot(slot, item);
        }
    }

    private updateSlot(slot: Node, item: ItemData | null) {
        // 获取子节点
        const icon = slot.getChildByName('Icon')?.getComponent(Sprite);
        const nameLabel = slot.getChildByName('Label')?.getComponent(Label);

        if (item) {
            // ★ 有物品：显示物品信息
            if (icon) {
                //加载物品图标
                resources.load(item.icon, SpriteFrame, (err, frame) => {
                    if (!err) {
                        icon.spriteFrame = frame;
                        console.log('load success');
                    }else {
                        console.error('加载失败详情：', err);
                    }
                });
                icon.node.active = true;
            }
            if (nameLabel) {
                nameLabel.string = item.name;
                nameLabel.color = this.getRarityColor(item.rarity);
            }
        } else {
            // ★ 空：清空显示
            if (icon) {
                icon.spriteFrame = null;
                icon.node.active = false;
            }
            if (nameLabel) {
                nameLabel.string = '空';
            }
        }
    }

    /**
     * 根据稀有度获取颜色
     */
    private getRarityColor(rarity: string): Color {
        switch (rarity) {
            case '普通': return new Color(0, 0, 0);
            case '稀有': return new Color(79, 195, 247);
            case '史诗': return new Color(171, 71, 188);
            case '传奇': return new Color(255, 111, 0);
            default: return Color.WHITE;
        }
    }


    start() {

    }

    update(deltaTime: number) {
        
    }
}


