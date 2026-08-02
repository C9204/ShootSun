import { _decorator, Component, Label, Node } from 'cc';
import { GameState, GameStateMachine } from './GameStateMachine';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';
const { ccclass, property } = _decorator;

@ccclass('PopManager')
export class PopManager extends Component {
    @property(Node)
    Tips: Node = null; // 提示框UI

    @property(Node)
    SelectItem: Node = null; //物品选择框UI

    @property(Node)
    Backpack: Node = null; //背包UI

    protected onLoad(): void {
        EventBus.on(GameEvents.OPEN_TIPS,this.Open_Tips);
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.OPEN_TIPS,this.Open_Tips);
    }

    /**
     * 提示框UI
     */
    private Open_Tips = (gamestate: GameState) => {
        if (!this.Tips) return;
        this.Tips.active = true;
        const Tips_Label = this.Tips.getChildByName('Tips')?.getComponent(Label);
        const Button = this.Tips.getChildByName('Button');
        const Button_Label = Button?.getChildByName('Label')?.getComponent(Label);
        const Button_Rebirth = this.Tips.getChildByName('Button_Rebirth');
        switch(gamestate) {
            case GameState.PAUSE:
                if (Tips_Label) Tips_Label.string = '游戏暂停';
                if (Button_Label) Button_Label.string = '游戏继续';
                this.pauseGame();
                break;
            case GameState.GAMEOVER:
                if (Tips_Label) Tips_Label.string = '游戏失败';
                if (Button_Label) Button_Label.string = '重新开始';
                if (Button_Rebirth) Button_Rebirth.active = true;
                this.gameOver();
                break;
            case GameState.WIN:
                if (Tips_Label) Tips_Label.string = '游戏胜利';
                if (Button_Label) Button_Label.string = '下一关';
                this.winGame();
                break;
            case GameState.ALLWIN:
                if (Tips_Label) Tips_Label.string = '游戏通关';
                if (Button_Label) Button_Label.string = '从头开始';
                this.allWinGame();
                break;
            default:
                break;
        }
    }

    /**
     * 物品选择UI
     */


    /**
     * 背包UI
     */
    CurrentState = null;
    Open_Backpack() {
        const CurrentState = this.getState();
        if (this.Backpack.active == false) {
            this.CurrentState = this.getState();
            this.pauseGame();
            //GameManager.isGame_Pause = true;
            this.Backpack.active = true;
        }else if (this.Backpack.active == true) {
            //this.resumeGame();
            //GameManager.isGame_Pause = false;
            this.Backpack.active = false;
            GameStateMachine.instance.switchState(this.CurrentState);
        }
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
    start() {

    }

    update(deltaTime: number) {
        
    }
}


