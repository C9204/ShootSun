import { _decorator, Collider2D, Component, Contact2DType, instantiate, Node, Prefab, RigidBody2D, tween, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ArrowPool')
export class ArrowPool extends Component {

    @property(Prefab)
    arrowPrefab: Prefab = null; //导入箭的预制体

    @property
    initialSize: number = 10; //初始数量

    @property
    maxSize: number = 30; //最大数量

    private _pool: Node[] = []; //对象池创建

    private _activeCount: number = 0; //当前对象池使用中的数量
    
    private _activeArrows: Node[] = []; // 激活的箭矢存放

    
    protected onLoad(): void {
        this.initializePool();
    }

    //初始化
    private initializePool() {
        for (let i = 0; i < this.initialSize; i++) {
            const arrow = this.createArrow();
            this.recycleArrow(arrow);
        }
        this._activeCount = 0;
    }

    //创建新箭矢
    private createArrow() {
        const arrow = instantiate(this.arrowPrefab);
        return arrow;
    }

    //获取箭
    public getArrow() {
        let arrow: Node = null;

        if (this._activeCount < this.initialSize) {
            //如果对象池中使用的数量低于初始数量，从池中取
            console.log(`active:${this._activeCount}`);
            arrow = this._pool.pop();
            arrow.active = true;
            this._activeCount++;
        }else if (this._activeCount < this.maxSize) {
            //如果大于初始数量，低于最大数量，池子空了，新增节点
            arrow = this.createArrow();
            this._activeCount++;
        }else {
            //如果大于最大数量，返回无
            console.warn('箭矢对象池已经满了');
            return null;
        }
        this._activeArrows.push(arrow);
        return arrow;
    }


    //回收箭到池子中
    public recycleArrow(arrow: Node) {
        this.resetArrow(arrow);
        arrow.active = false;
        arrow.removeFromParent();
        this._pool.push(arrow);
        this._activeCount--;
    }

    public recycleAll() {
        const count = this._activeArrows.length;
        this._activeArrows.forEach(arrow => this.recycleArrow(arrow));
        this._activeArrows = [];
        this._activeCount = 0;
        console.log(`回收${count}支箭矢`);
    }

    //重置箭矢
    private resetArrow(arrow: Node) {
        //重置位置
        arrow.setPosition(0,-500);
        //重置旋转角度
        arrow.angle = 180;
        //重置碰撞监听
        const collider2D = arrow.getComponent(Collider2D);
        if (collider2D) {
            collider2D.off(Contact2DType.BEGIN_CONTACT);
        }
        //停止动画
        tween(arrow).stop();
    }

    //清空对象池
    public clearPool() {
        this._pool.forEach(arrow => arrow.destroy());
        this._pool = [];
        this._activeCount = 0;
    }

    protected onDestroy(): void {
        this.clearPool();
    }

    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


