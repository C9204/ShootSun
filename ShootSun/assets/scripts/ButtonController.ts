import { _decorator, Button, Component, director, Input,input, Node } from 'cc';
import { GameState, GameStateMachine } from './GameStateMachine';
import { InventoryManager } from './InventoryManager';
import { SunController } from './SunController';
import { EffectProcessor } from './EffectProcessor';
import { GameManager } from './GameManager';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
import { ArrowPool } from './ArrowPool';
const { ccclass, property } = _decorator;

@ccclass('ButtonController')
export class ButtonController extends Component {
    @property(Node)
    Setting_Node : Node = null; //导入设置页面节点

    @property(Node)
    Tips_UI : Node = null; //导入提示框

    @property(Node)
    BackpackUI: Node = null; //导入背包按钮

    @property(ArrowPool)
    ArrowPool: ArrowPool = null; //导入箭对象池

    Game_Start() {
        GameStateMachine.instance.switchState(GameState.PLAYING); 
        InventoryManager.clearInventory(); //清空背包
        EffectProcessor.removeAllEffect(); //清空效果
        director.loadScene('assets/scene/scene-level1');
    }

    Open_SettingPage() {
        if (this.Setting_Node != null)
        this.Setting_Node.active = true;
    }

    Close_SettingPage() {
        if (this.Setting_Node != null)
        this.Setting_Node.active = false;
    }

    Back_to_StartPage() {
        if (this.Setting_Node != null)
        this.Setting_Node.active = false;
        GameStateMachine.instance.switchState(GameState.GAMEOVER); 
        director.loadScene('assets/scene/scene-start');
    }

    rebirth_Game() {
        GameStateMachine.instance.switchState(GameState.PLAYING); 
        this.Tips_UI.active = false;
        SunController.Instance.clearArrow();
        const levelIndex = GameManager.Instance.LevelIndex;
        GameManager.Instance.loadLevel(levelIndex);
        GameManager.Instance.resetSun();
        const rebirthBtn = this.Tips_UI?.getChildByName('Button_Rebirth');
        if (rebirthBtn) rebirthBtn.active = false;
    }

    CurrentState = null;
    Open_Backpack() {
        const CurrentState = this.getState();
        if (this.BackpackUI.active == false) {
            this.CurrentState = this.getState();
            this.pauseGame();
            this.BackpackUI.active = true;
        }else if (this.BackpackUI.active == true) {
            this.BackpackUI.active = false;
            GameStateMachine.instance.switchState(this.CurrentState);
        }
    }

    Pause_Game() {
        this.pauseGame();
        //GameManager.isGame_Pause = true;
        EventBus.emit(GameEvents.OPEN_TIPS,GameState.PAUSE);
        //this.Tips_Update(3);
    }

    /**
     * 游戏状态
     */

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

    // 通关
    public allWinGame() {
        GameStateMachine.instance.switchState(GameState.ALLWIN);
    }
    //获取当前状态
    public getState() {
        return GameStateMachine.instance.getState();
    }
}


