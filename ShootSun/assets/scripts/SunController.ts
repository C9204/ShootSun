import { _decorator, Component, Node } from 'cc';
import { GameManager } from './GameManager';
import { GameStateMachine } from './GameStateMachine';
import { ArrowPool } from './ArrowPool';
const { ccclass, property } = _decorator;

@ccclass('SunController')
export class SunController extends Component {

    @property(Node)
    Sun_Node : Node = null; //导入太阳节点
    
    @property(Node)
    Sun_Top : Node = null; //导入太阳节点

    @property(ArrowPool)
    arrowPool: ArrowPool = null; //导入箭的对象池

    @property
    Rotate_Angle = 0; //初始角度

    public static Rotate_Speed = 30; //旋转速度

    public static Instance: SunController = null;

    protected onLoad(): void {
        SunController.Instance = this;
    }
    protected onDestroy(): void {
        SunController.Instance = null;
    }

    public clearArrow() {
        this.arrowPool.recycleAll();
        //this.Sun_Node.removeAllChildren();
    }

    start() {
        SunController.Rotate_Speed = 60;
        this.Rotate_Angle = 0;
    }


    update(deltaTime: number) {
        if (GameStateMachine.instance.isPlaying()){
            this.Rotate_Angle=(this.Rotate_Angle+deltaTime*SunController.Rotate_Speed)%360; 
        }
        this.Sun_Node.angle = this.Rotate_Angle;
        
    }
}


