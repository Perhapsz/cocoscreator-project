import { _decorator, Component, Node, Contact2DType, BoxCollider2D, PolygonCollider2D, PhysicsSystem2D } from 'cc';
import { RopeCtrl } from './RopeCtrl';
const { ccclass, property } = _decorator;

@ccclass('Edage')
export class Edage extends Component {
    @property({ type: RopeCtrl, tooltip: "碰撞时候需要处理绳子" })
    rope: RopeCtrl = null;

    onLoad() {
        let colliders = this.getComponents(BoxCollider2D);
        for (var i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            if (collider) {
                console.log('Edage collider.tag: ' + collider.tag);

                console.log('Edage listen');
                collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        }

        // 注册全局碰撞回调函数
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // }
    }
    start() {

    }

    update(deltaTime: number) {

    }

    onBeginContact(selfCollider: any, otherCollider: any, contact: any | null) {
        // 只在两个碰撞体开始接触时被调用一次
        this.rope.backWithNothing();
    }

    onEndContact(selfCollider: any, otherCollider: any, contact: any | null) {
        // 只在两个碰撞体结束接触时被调用一次
        // console.log('onEndContact');
    }
}


