import { _decorator, Component, Node, CCFloat, UITransform, Vec2, PolygonCollider2D, AudioSource, AudioClip } from 'cc';
import { Loot } from './Loot';
const { ccclass, property } = _decorator;

const enum State {
    Idle, Grow, Back, BackWithTarget, Stop
}

class GameConfig {
    public static LHS_Degree: number = -65;
    public static RHS_Degree: number = 65;
    public static Idle_Len: number = 120;
}

@ccclass('RopeCtrl')
export class RopeCtrl extends Component {
    @property({ type: CCFloat, tooltip: "绳子的摇摆速度" })
    rollSpeed: number = 120;

    @property({ type: CCFloat, tooltip: "绳子的伸长速度" })
    growSpeed: number = 200;

    @property({ type: CCFloat, tooltip: "绳子的收回速度" })
    backSpeed: number = 300;

    @property({ type: Loot, tooltip: "战利品的组件" })
    loot: Loot = null;

    @property({ type: AudioClip, tooltip: "" })
    clip_release: AudioClip = null;

    @property({ type: AudioClip, tooltip: "" })
    clip_back: AudioClip = null;

    @property({ type: AudioClip, tooltip: "" })
    clip_big_gold: AudioClip = null;

    @property({ type: AudioClip, tooltip: "" })
    clip_diamond: AudioClip = null;

    private state: number = State.Idle;
    private nowDegree: number = 0;
    private nowLen: number = GameConfig.Idle_Len;
    private hand: Node = null;
    private nowLoot: PolygonCollider2D = null;
    private loot_delta_x: number = NaN;
    private loot_delta_y: number = NaN;
    private callLevelSuccess_caller: any = null;
    private callLevelSuccess_method: Function = null;

    private callAddScore_caller: any = null;
    private callAddScore_method: Function = null;

    private audio_source = null!;
    onLoad() {
        this.loot.callBackWithTarget(this, this.BackWithTarget.bind(this));
        this.audio_source = this.node.getComponent(AudioSource)!;
    }

    start() {
        console.log("RopeCtrl start")
        this.hand = this.node.getChildByName("game_hand");
        this.setRopeLength(GameConfig.Idle_Len);
    }

    update(deltaTime: number) {
        // log(deltaTime);
        if (this.state === State.Idle) {
            this.idleUpdate(deltaTime);
        } else if (this.state === State.Grow) {
            this.growUpdate(deltaTime);
        } else if (this.state === State.Back) {
            this.backUpdate(deltaTime);
        }

    }

    public callLevelSuccess(caller: any, method: Function): void {
        this.callLevelSuccess_caller = caller;
        this.callLevelSuccess_method = method;
    }

    public callAddScore(caller: any, method: Function): void {
        this.callAddScore_caller = caller;
        this.callAddScore_method = method;
    }


    public hideAllLoots(): void {
        this.loot.hideAllLoots();
    }

    public randomLootsAndShow(): void {
        this.loot.randomLootsAndShow();
    }

    private isLootsRemaining(): boolean {
        return this.loot.isLootsRemaining();
    }

    private setRopeLength(len: number): void {
        // this.node.height = len;
        // this.hand.y = -(len + this.hand.height / 2);

        // 绳子，锚点 在上面，所以只改变height
        const ui_transform = this.getComponent(UITransform);
        ui_transform.height = len;

        // 套索, postion是相对绳子的坐标系，所以x是一样的
        const hand_ui_transform = this.hand.getComponent(UITransform);
        this.hand.setPosition(this.hand.position.x, -(len + hand_ui_transform.height / 2));

        // console.log('rope postion: ' + this.node.worldPosition.x + "," + this.node.worldPosition.y);
        // console.log('hand postion: ' + this.hand.worldPosition.x + "," + this.hand.worldPosition.y);

        // 拉取物
        if (this.nowLoot) {
            // console.log('before nowLoot postion: ' + this.nowLoot.node.worldPosition.x + "," + this.nowLoot.node.worldPosition.y);
            if (Number.isNaN(this.loot_delta_x) && Number.isNaN(this.loot_delta_y)) {
                // 先调整物品相对于钩子的位置
                // 1.计算最近的顶点
                var ploylon_points = this.nowLoot.worldPoints;
                var nearestPoint = null;
                var minDistance = Infinity;
                var specifiedPoint = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y); // 替换成你的指定点坐标
                console.log("绳子的坐标：", specifiedPoint);

                for (var i = 0; i < ploylon_points.length; i++) {
                    var vertex = new Vec2(ploylon_points[i].x, ploylon_points[i].y);
                    var distance = vertex.subtract(specifiedPoint).length(); // 计算距离

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestPoint = new Vec2(ploylon_points[i].x, ploylon_points[i].y);
                    }
                }
                console.log("最近的顶点坐标：", nearestPoint);
                console.log("当前物品的世界坐标：", this.nowLoot.node.worldPosition);
                var d_x = nearestPoint.x - this.nowLoot.node.worldPosition.x;
                var d_y = nearestPoint.y - this.nowLoot.node.worldPosition.y;
                console.log("d_x: ", d_x);
                console.log("d_y: ", d_y);

                // 2.调整锚点位置
                this.nowLoot.node.setWorldPosition(this.hand.worldPosition.x - d_x, this.hand.worldPosition.y - d_y, 0);


                this.loot_delta_x = this.hand.worldPosition.x - this.nowLoot.node.worldPosition.x;
                this.loot_delta_y = this.hand.worldPosition.y - this.nowLoot.node.worldPosition.y;
                console.log('delta : ' + this.loot_delta_x + "," + this.loot_delta_y);
            }

            this.nowLoot.node.setWorldPosition(this.hand.worldPosition.x - this.loot_delta_x, this.hand.worldPosition.y - this.loot_delta_y, 0);
            // console.log('after nowLoot postion: ' + this.nowLoot.node.worldPosition.x + "," + this.nowLoot.node.worldPosition.y);
        }

    }

    public throwRope(): void {
        console.log("throwRope");
        if (this.state != State.Idle) {
            return;
        }
        if (this.audio_source) {
            console.log("throwRope paly audio");
            this.audio_source.playOneShot(this.clip_release, 0.5);
        }
        // console.log("State.Grow")
        this.state = State.Grow;
    }

    public forceIdle(): void {
        console.log("force idle");
        this.state = State.Idle;
        if (this.nowLoot) {
            this.nowLoot.node.active = false;
        }

        this.nowLoot = null;
        this.backSpeed = 300;
        this.loot_delta_x = NaN;
        this.loot_delta_y = NaN;
    }

    public BackWithTarget(collider_loot: any): void {
        console.log("BackWithTarget")
        if (this.state != State.Grow) {
            return;
        }
        // console.log("State.Back")

        let clip: AudioClip = null;
        this.nowLoot = collider_loot;
        switch (this.nowLoot.tag) {
            case 1:
                // 大号黄金
                this.backSpeed = 60;
                clip = this.clip_big_gold;
                break;
            case 2:
                // 中号黄金
                this.backSpeed = 100;
                break;
            case 3:
                // 小号黄金
                this.backSpeed = 150;
                break;
            case 10:
                // 大号石头
                this.backSpeed = 65;
                break;
            case 11:
                // 中号石头
                this.backSpeed = 110;
                break;
            case 20:
                // 小号砖石
                this.backSpeed = 150;
                clip = this.clip_diamond;
                break;
            case 21:
                // 小号砖石
                this.backSpeed = 150;
                clip = this.clip_diamond;
                break;
        }

        if (this.audio_source != null && clip != null) {
            console.log("BackWithTarget play audio!")
            if (this.audio_source.state == AudioSource.AudioState.PLAYING) {
                this.audio_source.stop();
            }
            this.audio_source.playOneShot(clip, 0.5);
        } else {
            console.log("BackWithTarget play audio failed due to unsupported")
        }

        this.state = State.Back;
    }


    public backWithNothing(): void {
        console.log("backWithNothing")

        if (this.state != State.Grow) {
            return;
        }
        this.state = State.Back;
    }

    private growUpdate(dt: number): void {
        this.nowLen += this.growSpeed * dt;
        this.setRopeLength(this.nowLen);
    }

    private backUpdate(dt: number): void {
        // console.log("backUpdate")

        this.nowLen -= this.backSpeed * dt;
        this.setRopeLength(this.nowLen);
        if (this.nowLen <= GameConfig.Idle_Len) {
            // 拉取成功
            this.nowLen = GameConfig.Idle_Len;
            if (this.nowLoot) {
                let score: number = 0;
                switch (this.nowLoot.tag) {
                    case 1:
                        // 大号黄金
                        score = 300;
                        break;
                    case 2:
                        // 中号黄金
                        score = 150;
                        break;
                    case 3:
                        // 小号黄金
                        score = 50;
                        break;
                    case 10:
                        // 大号石头
                        score = 50;
                        break;
                    case 11:
                        // 中号石头
                        score = 10;
                        break;
                    case 20:
                        // 小号砖石
                        score = 150;
                        break;
                    case 21:
                        // 中号砖石
                        score = 300;
                        break;
                }
                this.callAddScore_method.call(this.callAddScore_caller, score);

                this.nowLoot.node.active = false;
                this.nowLoot = null;
                this.backSpeed = 300;
                this.loot_delta_x = NaN;
                this.loot_delta_y = NaN;

                if (!this.isLootsRemaining()) {
                    this.callLevelSuccess_method.call(this.callLevelSuccess_caller);
                };

                console.log("BackWithTarget done")
            }

            this.state = State.Idle;
        }

    }

    private idleUpdate(dt: number): void {
        this.nowLen = GameConfig.Idle_Len;
        this.setRopeLength(this.nowLen);

        this.nowDegree += (this.rollSpeed * dt);
        this.node.angle = this.nowDegree;
        // console.log("angle: " + this.node.angle);
        // console.log("position: " + this.node.position.x + "," + this.node.position.y);

        // 判断摇摆方向的判断
        if (this.nowDegree <= GameConfig.LHS_Degree && this.rollSpeed < 0) {
            this.rollSpeed = -this.rollSpeed;
        } else if (this.nowDegree >= GameConfig.RHS_Degree && this.rollSpeed > 0) {
            this.rollSpeed = -this.rollSpeed;
        }

    }

}


