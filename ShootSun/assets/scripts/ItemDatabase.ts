import { _decorator, Component, Node } from 'cc';
import { ItemRarity, ItemData, EffectType } from './ItemData';
const { ccclass, property } = _decorator;


@ccclass('ItemDatabase')
export class ItemDatabase extends Component {

    private static _items: Map<string, ItemData> = new Map();

    //初始化
    public static init() {


        //普通
        this.register({
            id: 'Bow',
            name: '强弓',
            icon: 'UI/bow/spriteFrame',
            rarity: ItemRarity.Common,
            description: '攻击+4',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 4 } }
            ]
        });

        this.register({
            id: 'Axe',
            name: '利斧',
            icon: 'UI/axe/spriteFrame',
            rarity: ItemRarity.Common,
            description: '攻击乘区+2',
            effects: [
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 2 } }
            ]
        });

        this.register({
            id: 'AxeDouble',
            name: '双刃斧',
            icon: 'UI/axeDouble/spriteFrame',
            rarity: ItemRarity.Common,
            description: '攻击乘区+1\n攻击+2',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 2 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 1 } }
            ]
        });

        this.register({
            id: 'Hammer',
            name: '锤子',
            icon: 'UI/hammer/spriteFrame',
            rarity: ItemRarity.Common,
            description: '攻击乘区+1\n攻击+2',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 2 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 1 } }
            ]
        });

        this.register({
            id: 'SwordWood',
            name: '木剑',
            icon: 'UI/swordWood/spriteFrame',
            rarity: ItemRarity.Common,
            description: '每次射击额外增加1点伤害',
            effects: [
                { type: EffectType.SHOOT_COUNT_ADD, params: { perShoot: 1 } }
            ]
        });

        //稀有
        this.register({
            id: 'Axe2',
            name: '强化斧',
            icon: 'UI/axe2/spriteFrame',
            rarity: ItemRarity.Rare,
            description: '攻击乘区+4',
            effects: [
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 4 } }
            ]
        });

        this.register({
            id: 'AxeDouble2',
            name: '强化双刃斧',
            icon: 'UI/axeDouble2/spriteFrame',
            rarity: ItemRarity.Rare,
            description: '攻击乘区+2\n攻击+4',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 4 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 2 } }
            ]
        });

        this.register({
            id: 'Sword',
            name: '铁剑',
            icon: 'UI/sword/spriteFrame',
            rarity: ItemRarity.Rare,
            description: '每次射击额外增加2点伤害',
            effects: [
                { type: EffectType.SHOOT_COUNT_ADD, params: { perShoot: 2 } }
            ]
        });


        //史诗
        this.register({
            id: 'GemRed',
            name: '力量宝石',
            icon: 'UI/gemRed/spriteFrame',
            rarity: ItemRarity.Epic,
            description: '攻击+40',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 40 } }
            ]
        });

        this.register({
            id: 'GemBlue',
            name: '智慧宝石',
            icon: 'UI/gemBlue/spriteFrame',
            rarity: ItemRarity.Epic,
            description: '攻击乘区+20',
            effects: [
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 20 } }
            ]
        });

        this.register({
            id: 'GemGreen',
            name: '敏捷宝石',
            icon: 'UI/gemGreen/spriteFrame',
            rarity: ItemRarity.Epic,
            description: '攻击+20\n攻击乘区+10',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 20 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 10 } }
            ]
        });

        //传奇
        this.register({
            id: 'Envelope',
            name: '平民的信',
            icon: 'UI/envelope/spriteFrame',
            rarity: ItemRarity.Legendary,
            description: '攻击+100',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 100 } }
            ]
        });

        this.register({
            id: 'Coin',
            name: '幸运金币',
            icon: 'UI/coin/spriteFrame',
            rarity: ItemRarity.Legendary,
            description: '攻击乘区+50',
            effects: [
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 50 } }
            ]
        });

        this.register({
            id: 'Upg_Bow',
            name: '射日之弓',
            icon: 'UI/upg_bow/spriteFrame',
            rarity: ItemRarity.Legendary,
            description: '攻击+20\n攻击乘区+40',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 20 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 40 } }
            ]
        });

        this.register({
            id: 'Upg_Axe',
            name: '开天之斧',
            icon: 'UI/upg_axe/spriteFrame',
            rarity: ItemRarity.Legendary,
            description: '攻击+40\n攻击乘区+30',
            effects: [
                { type: EffectType.STATIC_ADD_DAMAGE, params: { baseValue: 40 } },
                { type: EffectType.STATIC_MULTI_DAMAGE, params: { baseValue: 30 } }
            ]
        });
    }


    //随机获取物品
    public static dropRandomItem() {
        //获取所有的物品
        const AllItem = this.getAll();

        //随机选一个,纯随机
        const RandomIndex = Math.floor(Math.random() * AllItem.length);
        const DropItem = AllItem[RandomIndex];

        return DropItem;
    }
    //注册物品
    private static register(item: ItemData) {
        this._items.set(item.id, item);
    }

    //根据ID获取完整物品数据
    public static getById(id: string): ItemData | null {
        return this._items.get(id) || null;
    }

    //根据稀有度获取对应的物品组
    public static getByRarity(rarity: ItemRarity): ItemData[] | null {
        return Array.from(this._items.values()).filter(item => item.rarity === rarity)
    }

    //获取所有物品
    public static getAll(): ItemData[] {
        return Array.from(this._items.values());
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


