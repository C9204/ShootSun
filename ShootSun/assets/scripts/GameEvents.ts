// GameEvents.ts
export const GameEvents = {
    // 射击相关
    SHOOT: 'SHOOT',                    // 射箭
    ARROW_HIT_SUN: 'ARROW_HIT_SUN',    // 箭命中太阳
    ARROW_MISS: 'ARROW_MISS',          // 箭未命中

    // 游戏状态
    GAME_START: 'GAME_START',
    GAME_PAUSE: 'GAME_PAUSE',
    GAME_RESUME: 'GAME_RESUME',
    GAME_WIN: 'GAME_WIN',
    GAME_OVER: 'GAME_OVER',

    // 关卡相关
    LEVEL_START: 'LEVEL_START',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    LEVEL_LOAD: 'LEVEL_LOAD',

    // 物品相关
    ITEM_SELECTED: 'ITEM_SELECTED',     // 选中物品
    ITEM_ADDED: 'ITEM_ADDED',           // 物品加入背包
    ITEM_REMOVED: 'ITEM_REMOVED',       // 物品移除
    INVENTORY_UPDATED: 'INVENTORY_UPDATED', // 背包更新

    // 太阳相关
    SUN_DAMAGED: 'SUN_DAMAGED',         // 太阳受伤
    SUN_DEFEATED: 'SUN_DEFEATED',       // 太阳被击败

    //UI相关
    OPEN_TIPS: 'OPEN_TIPS', //打开提示框
    CLOSE_TIPS: 'CLOSE_TIPS', //关闭提示框

    //全局音量相关
    VOLUME_BGM_CHANGED: 'VOLUME_BGM_CHANGED', // 背景音乐调节
    VOLUME_SFX_CHANGED: 'VOLUME_SFX_CHANGED', // 音效调节

} as const;