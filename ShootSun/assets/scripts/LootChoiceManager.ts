// LootChoiceManager.ts
import { _decorator, Component, Node, Label, Sprite, Toggle, Button, resources, SpriteFrame, Color, random, RichText, color } from 'cc';
import { ItemData, ItemRarity } from './ItemData';
import { ItemDatabase } from './ItemDatabase';
import { InventoryManager } from './InventoryManager';
import { GameManager } from './GameManager';
import { InventoryUI } from './InventoryUI';
import { DropRate, LevelData, LEVELS } from './LevelConfig';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
const { ccclass, property } = _decorator;

@ccclass('LootChoiceManager')
export class LootChoiceManager extends Component {
    
    @property(Node)
    public panel: Node = null; // 整个选择面板

    @property([Node])
    public itemNodes: Node[] = []; // 三个选项节点

    @property([Toggle])
    public toggles: Toggle[] = []; // 三个单选按钮

    @property(Button)
    public confirmBtn: Button = null; // 确定按钮

    @property(Label)
    public titleLabel: Label = null; //标题

    @property([Label])
    public RateLabels: Label[]= []; //掉落概率节点 命名只能两个单词，三个单词不行？？


    private _selectedItem: ItemData | null = null; // 当前选中的物品
    private _currentItems: ItemData[] = []; // 当前显示的三个物品
    private _onConfirmCallback: Function = null; // 确认回调

    onLoad() {
        // 初始隐藏
        this.panel.active = false;
        
        // 绑定确认按钮事件
        this.confirmBtn.node.on(Button.EventType.CLICK, this.onConfirmClick, this);
        
        // 绑定三个 Toggle 的事件
        for (let i = 0; i < this.toggles.length; i++) {
            const toggle = this.toggles[i];
            const index = i;
            toggle.node.on(Toggle.EventType.TOGGLE, (isChecked: boolean) => {
                if (isChecked) {
                    this.onToggleSelected(index);
                }
            }, this);
        }
    }

    /**
     * ★ 显示掉落选择面板
     * @param callback 选择完成后的回调
     */
    public showLootChoice(levelIndex: number,callback: Function) {

        if (levelIndex > 9) {
            if(callback) callback(null);
            return;
        }

        this._onConfirmCallback = callback;
        
        // 1. 随机抽取 3 个不同的物品
        //this._currentItems = this.getRandomItems(3);
        // 1.根据关卡数按关卡对应稀有度概率抽取3个物品
        this._currentItems = this.getRandomItemByLevel(levelIndex,3);
        if (this._currentItems.length < 3) {
            console.warn('⚠️ 物品库不足以提供3个不同物品');
            // 如果物品不够，允许重复
            this._currentItems = this.getRandomItemsWithRepeat(3);
        }
        
        // 2. 更新 UI
        const commonRate = LEVELS[levelIndex].dropRate.commonRate;
        const rareRate = LEVELS[levelIndex].dropRate.rareRate;
        const epicRate = LEVELS[levelIndex].dropRate.epicRate;
        const lengendaryRate = LEVELS[levelIndex].dropRate.lengendaryRate;

        this.RateLabel(0,ItemRarity.Common,commonRate);
        this.RateLabel(1,ItemRarity.Rare,rareRate);
        this.RateLabel(2,ItemRarity.Epic,epicRate);
        this.RateLabel(3,ItemRarity.Legendary,lengendaryRate);

        
        for (let i = 0; i < this.itemNodes.length; i++) {
            const item = this._currentItems[i];
            if (item) {
                this.updateItemUI(this.itemNodes[i], item, i);
                this.toggles[i].isChecked = false; // 重置选中状态
                this.toggles[i].interactable = true;
            }
        }
        
        // 3. 清空选中
        this._selectedItem = null;
        this.confirmBtn.interactable = false; // 未选中时确定按钮不可用
        
        // 4. 显示面板
        this.panel.active = true;
    }

    //物品概率文字
    private RateLabel(dropIndex: number,rarity: string,rate: number) {
        const label = this.RateLabels[dropIndex];
        label.color = this.getRarityColor(rarity);
        label.string = `${rate}%`;
    }

    /**
     * 更新单个物品的 UI
     */
    private updateItemUI(node: Node, item: ItemData, index: number) {
        // 名称
        const nameLabel = node.getChildByName('item_name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = item.name;
            // 根据稀有度设置颜色
            nameLabel.color = this.getRarityColor(item.rarity);
        }
        
        // 描述
        const descLabel = node.getChildByName('item_description')?.getComponent(Label);
        if (descLabel) {
            descLabel.string = item.description || '一个神秘的物品';
        }
        
        // 图标
        const icon = node.getChildByName('item_icon')?.getComponent(Sprite);
        if (icon && item.icon) {
            resources.load(item.icon, SpriteFrame, (err, frame) => {
                if (!err) {
                    console.log('icon load success');
                    icon.spriteFrame = frame;
                }
            });
        }
    }

    /**
     * Toggle 被选中时
     */
    private onToggleSelected(index: number) {
        this._selectedItem = this._currentItems[index] || null;
        this.confirmBtn.interactable = this._selectedItem !== null;
        console.log(`📦 选中：${this._selectedItem?.name}`);
    }

    /**
     * 点击“确定”按钮
     */
    private onConfirmClick() {
        if (!this._selectedItem) {
            console.warn('⚠️ 请先选择一个物品');
            return;
        }
        
        // 1. 将选中物品加入背包
        const success = InventoryManager.addItem(this._selectedItem);
        if (!success) {
            console.warn('⚠️ 背包已满！');
            // 提示玩家背包已满
            this.showTips('背包已满！', '#FF4444');
            return;
        }
        //InventoryUI.instance.refreshUI();
        
        // 2. 应用物品效果（如果是增益类）
        EventBus.emit(GameEvents.ITEM_ADDED,this._selectedItem);
        EventBus.emit(GameEvents.ITEM_SELECTED, this._selectedItem);
        // const gm = GameManager.Instance;
        // if (gm && this._selectedItem.effects) {
        //     gm.applyItemEffect(this._selectedItem);
        // }
        
        // 3. 关闭面板
        this.panel.active = false;
        
        // 4. 显示获得提示
        console.log(`🎁 获得：${this._selectedItem.name}`);
        
        // 5. 执行回调（进入下一关）
        if (this._onConfirmCallback) {
            this._onConfirmCallback(this._selectedItem);
        }
    }

    /**
     * 从物品库随机抽取 N 个不同物品
     */
    private getRandomItems(count: number): ItemData[] {
        const all = ItemDatabase.getAll();
        if (all.length === 0) return [];
        
        const result: ItemData[] = [];
        const usedIndexes = new Set<number>();
        
        // 如果物品总数少于需要的数量，直接返回全部
        if (all.length <= count) {
            return [...all];
        }
        
        while (result.length < count) {
            const randomIndex = Math.floor(Math.random() * all.length);
            if (!usedIndexes.has(randomIndex)) {
                usedIndexes.add(randomIndex);
                result.push(all[randomIndex]);
            }
        }
        
        return result;
    }

    //根据概率随机稀有度
    private rollRarity(dropRate: DropRate): ItemRarity {
        const rand = Math.random() * 100;
        let cumulative = 0;
        cumulative += dropRate.commonRate;
        if (rand < cumulative) {
            return ItemRarity.Common;
        }
        cumulative += dropRate.rareRate;
        if (rand < cumulative) {
            return ItemRarity.Rare;
        }
        cumulative += dropRate.epicRate;
        if (rand < cumulative) {
            return ItemRarity.Epic;
        }
        cumulative += dropRate.lengendaryRate;
        if (rand < cumulative) {
            return ItemRarity.Legendary;
        }
    }

    //根据当前关卡随机 n 个物品
    private getRandomItemByLevel(levelIndex: number,count: number): ItemData[] | null  {
        const result: ItemData[] = []; //存储物品结果
        const level = LEVELS[levelIndex]; //获取关卡配置数据
        for(let i = 0; i < count; i++){
            const rarity = this.rollRarity(level.dropRate); //获取随机到的稀有度
            const rarityItem = ItemDatabase.getByRarity(rarity); //稀有度对应的物品组

            if (rarityItem.length > 0) { //如果物品组中有物品
                const randomIndex = Math.floor(Math.random() * rarityItem.length); // 在物品组中获取随机数
                result.push(rarityItem[randomIndex]);
            } else { //如果没有 从所有物品获取
                const allItem = ItemDatabase.getAll();
                result.push(allItem[Math.floor(Math.random() * allItem.length)]); 
            }
        }
        return result;
    }

    /**
     * 允许重复的随机抽取（物品不够时使用）
     */
    private getRandomItemsWithRepeat(count: number): ItemData[] {
        const all = ItemDatabase.getAll();
        if (all.length === 0) return [];
        
        const result: ItemData[] = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * all.length);
            result.push(all[randomIndex]);
        }
        return result;
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

    /**
     * 简单提示
     */
    private showTips(text: string, color: string) {
        // 你可以用已有的 Tips_UI 系统
        const gm = GameManager.Instance;
        if (gm) {
            // gm.Tips_Update(...) 或者显示一个临时提示
        }
        console.log(`%c${text}`, `color: ${color}`);
    }
}