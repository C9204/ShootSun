import { _decorator, Component, director, Node, Physics2DUtils, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

export enum GameState {
    PLAYING, //游戏中
    PAUSE, //游戏暂停
    GAMEOVER, //失败
    WIN, //胜利
    ALLWIN //通关
}

@ccclass('GameStateMachine')
export class GameStateMachine extends Component {

    public static instance: GameStateMachine = null; //建立单例

    private _currentState: GameState = GameState.PLAYING; //当前状态，初始为 游戏中

    protected onLoad(): void {
        GameStateMachine.instance = this;
        this.enterState(this._currentState);
    }

    //切换状态的方法
    public switchState(newState: GameState) {
        //当前状态与新状态一致时
        if (this._currentState == newState) return;

        //退出状态
        this.exitState(this._currentState);

        //更新状态
        this._currentState = newState;

        //进入新状态
        this.enterState(this._currentState);
    }
    //退出状态
    private exitState(state: GameState) {
        console.log('Exit'+GameState[state] );
    }
    //进入状态
    private enterState(state: GameState) {
        console.log('Enter'+GameState[state]);
        switch (state) {
            case GameState.PLAYING:
                //恢复时间
                director.getScheduler().setTimeScale(1);
                //恢复物理系统
                PhysicsSystem2D.instance.enable = true;
                break;
            
            case GameState.PAUSE:
                //暂停时间
                director.getScheduler().setTimeScale(0);
                //暂停物理系统
                PhysicsSystem2D.instance.enable = false;
                break;
            case GameState.GAMEOVER:
                //暂停时间
                director.getScheduler().setTimeScale(0);
                //暂停物理系统
                PhysicsSystem2D.instance.enable = false;
                break;
            case GameState.WIN:
                //暂停时间
                director.getScheduler().setTimeScale(0);
                //暂停物理系统
                PhysicsSystem2D.instance.enable = false;
                break;
            case GameState.ALLWIN:
                //暂停时间
                director.getScheduler().setTimeScale(0);
                //暂停物理系统
                PhysicsSystem2D.instance.enable = false;
                break;
            default:
                break;
        }
    }

    //判断方法
    public isPlaying() {
        return this._currentState ===GameState.PLAYING;
    }
    public isPause() {
        return this._currentState ===GameState.PAUSE;
    }
    public isGameOver() {
        return this._currentState ===GameState.GAMEOVER;
    }
    public isWin() {
        return this._currentState ===GameState.WIN;
    }
    public isAllWin() {
        return this._currentState ===GameState.ALLWIN;
    }
    public getState() : GameState{
        return this._currentState;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


