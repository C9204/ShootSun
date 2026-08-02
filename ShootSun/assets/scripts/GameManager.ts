import { _decorator, AudioClip, AudioSource, Collider2D, Component, Contact2DType, director, Input, input, instantiate, Label, Node, Prefab, ProgressBar, selector, tween, Vec3 } from 'cc';
import {SunController} from './SunController'
import { ItemDatabase } from './ItemDatabase';
import { LootManager } from './LootManager';
import { GameState, GameStateMachine } from './GameStateMachine';
import { LEVELS } from './LevelConfig';
import { InventoryManager } from './InventoryManager';
import { EffectType, ItemData } from './ItemData';
import { LootChoiceManager } from './LootChoiceManager';
import { EffectProcessor } from './EffectProcessor';
import { ArrowPool } from './ArrowPool';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Prefab)
    Arrow_Prefab : Prefab = null; //导入箭的预制体

    @property(Prefab)
    sunParticlePrefab : Prefab = null; //导入粒子节点

    @property(Node)
    Arrow_Top : Node = null; // 导入箭的父节点

    @property(Node)
    Sun_Controller : Node = null; //导入太阳控制器

    @property(Node)
    Tips_UI : Node = null; //导入提示框

    @property(Node)
    HP_Bar : Node = null; //导入太阳的血条

    @property(Node)
    Arrow_Before : Node = null; //导入箭反射之前的ui

    @property(Node)
    Backpack_UI : Node = null; // 导入背包UI

    @property(Node)
    sunNode : Node = null; // 导入太阳节点

    @property(Node)
    levelTips: Node = null; //导入关卡提示

    @property(LootChoiceManager)
    lootChoiceManager: LootChoiceManager = null; // 导入掉落物选择节点

    @property(Label)
    reaminArrow: Label = null; //剩余箭矢

    @property(ArrowPool)
    arrowPool: ArrowPool = null; // 导入箭的对象池

    @property(AudioClip)
    hitSfxClip: AudioClip = null; // 射箭音效片段

    //@property
    Sun_MaxHP = 10; //太阳的最大生命值

    Sun_CurrentHP = 10; //太阳的当前生命值

    isShooting = true; //是否射击

    private _coldTime: number = 0.5; //冷却时间

    //isGameOver = false; //游戏结束

    Damage_Sum = 0;

    CurrentState : GameState = null;

    public LevelIndex = 0; //关卡标签数

    private _baseDamage = 1; //基础伤害

    private _maxHitCount = 30; //最大射箭次数

    private _currentHitCount = this._maxHitCount; //当前射箭次数



    private get _finalDamage(): number {
        const addDamage = EffectProcessor.getTotalBonus(EffectType.STATIC_ADD_DAMAGE);
        const multiDamage = EffectProcessor.getTotalBonus(EffectType.STATIC_MULTI_DAMAGE);
        const perShootDamage = EffectProcessor.getTotalBonus(EffectType.SHOOT_COUNT_ADD);
        const finalDamage = (this._baseDamage + addDamage) * (1 + multiDamage) + perShootDamage;

        console.log(`add:${addDamage}`+`multi:${multiDamage}`+`pershoot:${perShootDamage}`+`final:${finalDamage}`);
        return finalDamage;
    }

    //public static isGame_Pause : boolean = false; //游戏暂停

    public static Instance: GameManager = null;

    //加载关卡
    public loadLevel(index: number) {
        tween(this.sunNode).stop();
        this.unscheduleAllCallbacks();

        if (index >= LEVELS.length) {
            console.log('所有关卡通关！');
            EventBus.emit(GameEvents.OPEN_TIPS,GameState.ALLWIN);
            //this.Tips_Update(4);
            return;
        }
        this.Sun_MaxHP = LEVELS[index].sunHealth;
        this.Sun_CurrentHP = LEVELS[index].sunHealth;
        const hitPointLabel = this.HP_Bar?.getChildByName('Hit_Point')?.getComponent(Label);
        if (hitPointLabel) hitPointLabel.string = `HP:${this.Sun_MaxHP}`;
        const levelLabel = this.levelTips?.getChildByName('LevelLabel')?.getComponent(Label);
        if (levelLabel) levelLabel.string = `第${LEVELS[index].level}关`;
        const levelDesc = this.levelTips?.getChildByName('LevelDescription')?.getComponent(Label);
        if (levelDesc) levelDesc.string = LEVELS[index].description;

        const healthBar = this.HP_Bar?.getChildByName('Health_Bar')?.getComponent(ProgressBar);
        if (healthBar) healthBar.progress = 1;
        this.sunNode.destroyAllChildren();
        this._currentHitCount = this._maxHitCount;
        this.Update_ReamainArrow();
        if (this.Arrow_Before) {
            this.Arrow_Before.active = true;
        }
        this.isShooting = true;
    }


    //击败太阳后的粒子特效
    private onSunDefeated() {
        const particle = instantiate(this.sunParticlePrefab);
        //particle.setWorldPosition(this.sunNode.getWorldPosition());
        this.sunNode.parent.addChild(particle);
        // 粒子播放完后自动销毁，或手动调度销毁
        this.scheduleOnce(() => {
            if (this.LevelIndex>=0&&this.LevelIndex<9)
                EventBus.emit(GameEvents.OPEN_TIPS,GameState.WIN);
                //this.Tips_Update(1);
            else 
                EventBus.emit(GameEvents.OPEN_TIPS,GameState.ALLWIN);
                //this.Tips_Update(4);
            //this.winGame();
            particle.destroy();
        }, 1.5);
    }

    // 游戏结束
    public gameOver() {
        GameStateMachine.instance.switchState(GameState.GAMEOVER);
    }

    // 暂停游戏
    public pauseGame() {
        GameStateMachine.instance.switchState(GameState.PAUSE);
    }

    // 恢复游戏
    public resumeGame() {
        GameStateMachine.instance.switchState(GameState.PLAYING);
    }

    // 胜利
    public winGame() {
        GameStateMachine.instance.switchState(GameState.WIN);
    }
    //获取当前状态
    public getState() {
        return GameStateMachine.instance.getState();
    }

    protected onLoad(): void {
        GameManager.Instance = this;
        this.loadLevel(this.LevelIndex);
        this.resumeGame();
        //GameManager.isGame_Pause = false;
        //this.isGameOver = false
        if (this.Tips_UI) {
            this.Tips_UI.active = false;
        }

        if (this.Backpack_UI) {
            this.Backpack_UI.active = false;
        }

        if (this.Arrow_Before) {
            this.Arrow_Before.active = true;
        }
        
        const rebirthBtn = this.Tips_UI?.getChildByName('Button_Rebirth');
        if (rebirthBtn) rebirthBtn.active = false;
        ItemDatabase.init();
        input.on(Input.EventType.TOUCH_START,this.TOUCH_START,this); //监听触碰    
        EventBus.on(GameEvents.ITEM_SELECTED,this.ItemSelected);
    }

    protected onDestroy(): void {
        GameManager.Instance = null;
        input.off(Input.EventType.TOUCH_START,this.TOUCH_START,this);    
        this.unscheduleAllCallbacks();
        EventBus.off(GameEvents.ITEM_SELECTED,this.ItemSelected);
    }

    private ItemSelected = (item: ItemData) => {
        this.applyItemEffect(item);
    }

    TOUCH_START() {
        const condition: boolean = GameStateMachine.instance.isPlaying()
        &&this.isShooting
        &&this._currentHitCount>0;
        if(condition){ //游戏进行时
            this.isShooting = false;
            this.Arrow_Before.active = false;

            this.scheduleOnce(()=>{
                this.Arrow_Before.active = true;
                this.isShooting = true;
            },this._coldTime); //射击间隔时间

            //从对象池中取箭
            const Arrow = this.arrowPool.getArrow();
            Arrow.setParent(this.Arrow_Top);
            //添加碰撞监听
            const collider = Arrow.getComponent(Collider2D);
            if (collider) collider.on(Contact2DType.BEGIN_CONTACT,this.BEGIN_CONTACT,this);
            //（旧方案）
            // const Arrow_Node = instantiate(this.Arrow_Prefab);
            // Arrow_Node.setParent(this.Arrow_Top); //设置父节点存箭显示
            // Arrow_Node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT,this.BEGIN_CONTACT,this);
            tween(Arrow).to(0.3,{position:new Vec3(0,-50,0)}).call(()=>{
                if (!GameStateMachine.instance.isGameOver()) {
                    this.Rotate_with_Sun(Arrow);
                    SunController.Rotate_Speed+=1;
                    this._currentHitCount--;
                    EventBus.emit(GameEvents.SHOOT);
                    this.Update_Health(this._finalDamage);
                    EventBus.emit(GameEvents.SUN_DAMAGED, {
                        damage: this._finalDamage,
                        currentHP: this.Sun_CurrentHP
                    });
                    //EffectProcessor.triggerEvent('SHOOT');
                    this.Update_ReamainArrow();
                    this.Hit_Sound();
                    this.Victory_Judge();

                }
                if (collider) collider.off(Contact2DType.BEGIN_CONTACT,this.BEGIN_CONTACT,this);

            }).start();
        }else {
            if (this._currentHitCount > 0)
                console.log('shoot is cold\n'+this.isShooting+'\n'+GameStateMachine.instance.isPlaying());
            else if (this._currentHitCount == 0) {
                EventBus.emit(GameEvents.OPEN_TIPS,GameState.GAMEOVER);
                //this.Tips_Update(2);
                //this.Tips_UI.getChildByName('Button_Rebirth').active = false;
            }
        }
    }
    
    //应用物品效果
    applyItemEffect(item: ItemData) {
        EffectProcessor.addEffect(item);
    }
    
    BEGIN_CONTACT() {
        //this.isGameOver = true;
        EventBus.emit(GameEvents.OPEN_TIPS,GameState.GAMEOVER);
        //this.Tips_Update(2);
    }

    
    Victory_Judge() {
        if (this.Sun_CurrentHP <= 0) {
            EventBus.emit(GameEvents.SUN_DEFEATED);
            this.isShooting = false;
            tween(this.sunNode)
            .to(0.5, {
                scale: new Vec3(0.01,0.01,1)
            })
            .call(()=>{
                this.sunNode.active = false;
            })
            .start();
            if (this.LevelIndex < 9) {
                this.pauseGame();
                if (this.lootChoiceManager) {
                    this.lootChoiceManager.showLootChoice(this.LevelIndex,(selectedItem: ItemData) =>{
                    EventBus.emit(GameEvents.OPEN_TIPS,GameState.WIN);
                    //this.Tips_Update(1);
                })
                }else {
                    console.log('error: No LootChoiceManage');
                }
            }else 
                EventBus.emit(GameEvents.OPEN_TIPS,GameState.ALLWIN);
                //this.Tips_Update(4);
        }
    }

    New_Game() {
        if (GameStateMachine.instance.isGameOver()) {
            this.resumeGame();
            EffectProcessor.removeAllEffect();//移除所有效果
            InventoryManager.clearInventory();//清空背包
            this.arrowPool.recycleAll();//回收箭
            director.loadScene('assets/scene/scene-level1'); //重新开始当前场景
        }else if (GameStateMachine.instance.isWin()) {
            this.arrowPool.recycleAll();
            this.LevelIndex++;
            this.loadLevel(this.LevelIndex);
            this.Tips_UI.active = false;
            this.resetSun();
            this.resumeGame();
            this.isShooting = true;

        }else if (GameStateMachine.instance.isPause()){
            this.resumeGame();
            //GameManager.isGame_Pause = false;
            this.Tips_UI.active = false;
        }else if (GameStateMachine.instance.isAllWin()){
            this.resumeGame();
            EffectProcessor.removeAllEffect();
            InventoryManager.clearInventory();
            this.arrowPool.recycleAll();
            director.loadScene('assets/scene/scene-level1'); 
        }
    }

    resetSun() {
        this.sunNode.active = true;
        this.sunNode.scale = new Vec3(1,1,1);
    }

    Hit_Sound() {
        if (this.hitSfxClip) {
            AudioManager.Instance.playSFX(this.hitSfxClip);
        } else {
            const hit_sound = this.getComponent(AudioSource);
            if (hit_sound) hit_sound.play();
        }
    }
    Rotate_with_Sun(Arrow_Node) { //跟着太阳转
        const Sun_Node = this.Sun_Controller?.getChildByName('Sun_Node');
        if (!Sun_Node) return;
        const WorldPos =Arrow_Node.getWorldPosition();
        Arrow_Node.setParent(Sun_Node);
        Arrow_Node.setWorldPosition(WorldPos);
        Arrow_Node.angle = 180 - Sun_Node.angle;
    }

    Update_Health(Damage): void {
        this.Sun_CurrentHP = this.Sun_CurrentHP-Damage;
        const hitPointLabel = this.HP_Bar?.getChildByName('Hit_Point')?.getComponent(Label);
        if (hitPointLabel) hitPointLabel.string = 'HP:'+this.Sun_CurrentHP;
        const progressBar = this.HP_Bar?.getChildByName('Health_Bar')?.getComponent(ProgressBar);
        if (progressBar) {
            const CurrentProgressBar = progressBar;
            if (CurrentProgressBar.progress>0) {
                CurrentProgressBar.progress = CurrentProgressBar.progress - Damage/this.Sun_MaxHP;
            }else {
                CurrentProgressBar.progress = 1;
            }
            progressBar.progress = CurrentProgressBar.progress; //更新UI
        }
    }

    Update_ReamainArrow() {
        this.reaminArrow.string = '箭矢x'+this._currentHitCount;
    }

    
    start() {

    }

    update(deltaTime: number) {
        
    }

}


