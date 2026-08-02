import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum ItemRarity { //物品的稀有度

    Common = '普通',
    Rare = '稀有',
    Epic = '史诗',
    Legendary = '传奇'
}

export enum EffectType { //效果类型
    STATIC_ADD_DAMAGE = 'STATIC_ADD_DAMAGE', //静态增加伤害
    STATIC_MULTI_DAMAGE = 'STATIC_MULTI_DAMAGE', //静态提高伤害乘区
    STATIC_ADD_ARROW = 'STATIC_ADD_ARROW',//静态添加箭的数量
    SHOOT_COUNT_ADD = 'SHOOT_COUNT_ADD', //伤害随着射箭数增加而增加
}

export interface ItemEffect {
    type: EffectType;

    params: {
        // 通用参数
        baseValue?: number;      // 基础值
        perLevel?: number;       // 每级增加量
        maxValue?: number;       // 最大值限制
        
        // 射箭次数相关
        perShoot?: number;       // 每次射箭增加量
        
        // 百分比相关
        percentage?: boolean;    // 是否为百分比
    }
}

export interface ItemData {
    id: string; //物品id
    name: string; //物品名字
    icon: string; //物品图标资源路径
    rarity: ItemRarity; //物品稀有度
    description?:string; //物品描述
    effects: ItemEffect[]; //物品效果
}


