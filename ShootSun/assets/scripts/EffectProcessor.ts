import { _decorator, Component, Node } from 'cc';
import { EffectType, ItemData, ItemEffect } from './ItemData';
import { GameManager } from './GameManager';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
const { ccclass, property } = _decorator;

@ccclass('EffectProcessor')
export class EffectProcessor extends Component {
    private static _effects: Map<string, ActiveEffect> = new Map();
    
    // 注册效果
    public static addEffect(item: ItemData) {
        const existingItem = this._effects.get(item.id);

        
        if (existingItem) {
            //是否存在相同的物品
            existingItem.stack++;
            console.log(`${item.name}已叠加${existingItem.stack}`);
        }else {
            
            const activeEffect = new ActiveEffect(item.id,item.effects);
            this._effects.set(item.id, activeEffect);
        }
    }

    //删除所有效果
    public static removeAllEffect() {
        this._effects.clear();
    }
    
    // 更新所有持续效果
    public static update(deltaTime: number) {
        this._effects.forEach(effect => effect.update(deltaTime));
    }
    
    // 获取某类型效果的总加成
    public static getTotalBonus(type: EffectType): number {
        let total = 0;
        this._effects.forEach(activeEffect => {
            activeEffect.effects.forEach(effect => {
                if (effect.type === type) {
                total += activeEffect.getBonus(effect);
            }
            });
        })
        return total;
    }
    
    protected onLoad(): void {
        EventBus.on(GameEvents.SHOOT,this.onShoot);
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.SHOOT,this.onShoot);
    }

    private onShoot = () => {
        EffectProcessor._effects.forEach(effect => effect.onEvent('SHOOT'));
    }
    // // 触发事件（如射箭、命中、受伤等）
    // public static triggerEvent(eventType: string, data?: any) {
    //     this._effects.forEach(effect => effect.onEvent(eventType, data));
    // }
}

// 活跃效果类（每个物品效果的实例）
class ActiveEffect {
    public itemId: string = null;
    public effects: ItemEffect[] = [];
    public state: { [key: string]: number } = {}; // 效果状态（如射箭次数、当前加成等）
    public stack: number = 1; //叠加状态，默认为1

    constructor(itemId: string, effects: ItemEffect[]) {
        this.itemId = itemId;
        this.effects = effects;
        this.state = { shootCount: 0 }; // 初始化状态
        this.stack = 1;
    }
    
    update(deltaTime: number) {
        // 持续效果的每帧更新
        // 根据 effect.type 执行不同逻辑
    }
    
    onEvent(eventType: string, data?: any) {
        // 事件触发效果
        if (eventType === 'SHOOT') {
            this.onShoot();
        } else if (eventType === 'HIT') {
            this.onHit(data);
        }
    }

    onHit(data: any) {
        console.log('Hit');
    }
    
    onShoot() {
        this.state.shootCount++;
        console.log(`shootCount${this.state.shootCount}`);
    }
    
    getBonus(effect: ItemEffect): number {
        let bonus = 0;

        switch (effect.type) {
            case EffectType.STATIC_ADD_DAMAGE:
                bonus += effect.params.baseValue;
                break;
            case EffectType.STATIC_MULTI_DAMAGE:
                bonus += effect.params.baseValue;
                break;
            case EffectType.SHOOT_COUNT_ADD:
                const perShoot = effect.params.perShoot || 0;
                const shootCount = this.state.shootCount || 0;
                bonus += perShoot * shootCount;
                break;
            default:
                return 0;
                
            // ... 其他效果类型
        }
        return bonus * this.stack;
    
    }

    start() {

    }

    
}



