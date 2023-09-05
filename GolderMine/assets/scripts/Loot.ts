import { _decorator, Component, Collider2D, Contact2DType, UITransform, randomRange, randomRangeInt, v2, Vec2, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loot')
export class Loot extends Component {

    private callBackWithTargets_caller: any = null;
    private callBackWithTarget_method: Function = null;

    private min_x: number = 0;
    private min_y: number = 0;
    private max_x: number = 0;
    private max_y: number = 0;

    onLoad() {
        console.log('Loot onLoad');
        let colliders = this.getComponentsInChildren(Collider2D);

        for (var i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            if (collider) {
                console.log('Loot listen collider.tag: ' + collider.tag);
                collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        }

        this.hideAllLoots();  // 一定要隐藏子node后，在getbuondingbox，子node的位置会影响box的范围
        const rect = this.getComponent(UITransform).getBoundingBoxToWorld();
        this.min_x = rect.xMin;
        this.min_y = rect.yMin;
        this.max_x = rect.xMax;
        this.max_y = rect.yMax;
        console.log('min ~ max: ' + rect.xMin + " ~ " + rect.xMax + ", " + rect.yMin + " ~ " + rect.yMax);

        // 注册全局碰撞回调函数
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // }

        let x_range = rect.xMax - rect.xMin;
        let y_range = rect.yMax - rect.yMin;
        console.log('x_range: ' + x_range + " , y_range: " + y_range);
        this.randomLootsAndShow();
    }
    start() {
        console.log('Loot start');
    }

    update(deltaTime: number) {
        // this.randomLootsAndShow();

        // const rect = this.getComponent(UITransform).getBoundingBoxToWorld();
        // console.log('min ~ max: ' + rect.xMin + " ~ " + rect.xMax + ", " + rect.yMin + " ~ " + rect.yMax);
    }

    onBeginContact(selfCollider: any, otherCollider: any, contact: any | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact tag: ' + selfCollider.tag);
        // console.log('onBeginContact UITransform: ' + selfCollider.node.position.x + "," + selfCollider.node.position.y);

        this.callBackWithTarget_method.call(this.callBackWithTargets_caller, selfCollider);
    }

    public callBackWithTarget(caller: any, method: Function): void {
        this.callBackWithTargets_caller = caller;
        this.callBackWithTarget_method = method;
    }

    onEndContact(selfCollider: any, otherCollider: any, contact: any | null) {
        // 只在两个碰撞体结束接触时被调用一次
        // console.log('onEndContact');
    }

    public isLootsRemaining(): boolean {
        let remainng: boolean = false;
        let colliders = this.getComponentsInChildren(Collider2D);
        for (var i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            if (collider.node.active) {
                remainng = true;
            }
        }
        return remainng;
    }

    public hideAllLoots(): void {
        let colliders = this.getComponentsInChildren(Collider2D);
        for (var i = 0; i < colliders.length; i++) {
            colliders[i].node.active = false;
        }
    }

    public randomLootsAndShow(): void {
        console.log('randomLootsAndShow +++ ');

        let colliders = this.getComponentsInChildren(Collider2D);
        // console.log('randomLootsAndShow 1 colliders.length: ' + colliders.length);

        for (var i = 0; i < 8; i++) {
            let r = randomRangeInt(0, colliders.length);
            colliders.splice(r, 1);
            // console.log('randomLootsAndShow 2 colliders.length: ' + colliders.length);
        }

        let current_loot_num = colliders.length;
        let points = this.randomPoints(current_loot_num);
        console.log('colliders.length: ' + colliders.length + "     r_points.length " + points.length);

        for (var i = 0; i < points.length; i++) {
            let random_x = points[i].x;
            let random_y = points[i].y;
            // console.log('set random position  [' + i + ']: ' + random_x + ", " + random_y);
            colliders[i].node.setWorldPosition(random_x, random_y, 0);
            colliders[i].node.active = true;
        }

        // console.log('randomLootsAndShow --- ');
    }

    private randomPoints(num: number): Vec2[] {

        var max_count = 0;
        var selectedPoints: Vec2[] = [];
        // 从第二个点开始，使用蓄水池抽样算法
        while (selectedPoints.length < num) {
            max_count = max_count + 1;
            if (max_count >= 999) {
                // 死循环保护
                break;
            }

            if (selectedPoints.length == 0) {
                // 初始化第一个点
                let first_point = v2(randomRange(this.min_x, this.max_x), randomRange(this.min_y, this.max_y));

                let forbiden_point = v2(((this.max_x - this.min_x) / 2) + this.min_x, this.max_y);
                let forbien_distance = forbiden_point.subtract(first_point).length();
                // console.log('forbien_distance: ' + forbien_distance);
                if (forbien_distance < ((this.max_y - this.min_y) / 3)) {
                    // 不能离中心点太近，大概大于一般的高度
                    // console.log('target distance: ' + (this.max_y - this.min_y) / 2);
                } else {
                    selectedPoints.push(first_point);
                }
                continue;
            }

            let random_x = randomRange(this.min_x, this.max_x);
            let random_y = randomRange(this.min_y, this.max_y);
            // console.log("randomPoints :" + random_x + "," + random_y);
            let point = v2(random_x, random_y);

            // 计算当前点与已选点的距离
            // const minDistance = Math.min(...selectedPoints.map(p => p.subtract(point).length()));
            let forbiden_point = v2(((this.max_x - this.min_x) / 2) + this.min_x, this.max_y);
            let forbien_distance = forbiden_point.subtract(point).length();
            // console.log('forbien_distance: ' + forbien_distance);
            if (forbien_distance < ((this.max_y - this.min_y) / 3)) {
                // 不能离中心点太近，大概大于一般的高度
                // console.log('target distance: ' + (this.max_y - this.min_y) / 2);
                continue;
            }

            let minDistance: number = 999999;
            for (let p of selectedPoints) {
                let p_ = v2(p.x, p.y);
                let distance = p_.subtract(point).length();
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
            // console.log('minDistance: ' + minDistance);


            // 根据距离决定是否选取当前点
            if (minDistance > ((this.max_y - this.min_y) / 3)) {
                // console.log("push point :" + point.x + "," + point.y);
                selectedPoints.push(point);
                // console.log('4 [0].x: ' + selectedPoints[0].x + "  [0].y " + selectedPoints[0].y);
            } else {
                // console.log('too nearest, selectedPoints.length: ' + selectedPoints.length);
            }
            // console.log('selectedPoints.length: ' + selectedPoints.length + "     num.length " + num);
        }

        // console.log('return selectedPoints.length: ' + selectedPoints.length + "     num.length " + num);
        // console.log('return selectedPoints[0].x: ' + selectedPoints[0].x + "     selectedPoints[0].y " + selectedPoints[0].y);
        // 现在selectedPoints数组中包含了均匀分布在矩形范围内的n个点
        return selectedPoints;

    }
}


