import { _decorator, Component, Node, AudioClip, AudioSource, randomRangeInt } from 'cc';
import { RopeCtrl } from './RopeCtrl';
import { MsgCtrl } from './MsgCtrl';

const { ccclass, property } = _decorator;

@ccclass('GameMgr')
export class GameMgr extends Component {
    @property({ type: RopeCtrl, tooltip: "控制绳子的组件" })
    rope: RopeCtrl = null;
    @property({ type: MsgCtrl, tooltip: "控制消息显示的组件" })
    msg: MsgCtrl = null;

    @property({ type: AudioClip, tooltip: "" })
    clip_add_money: AudioClip = null;

    private total_score: number = 0;
    private stage: number = 1;

    private init_target: number = 850;
    private target: number = this.init_target;

    private init_remaining: number = 30;
    private time_remaining: number = this.init_remaining;
    private time_callback: Function = null;

    private audio_source = null!;
    onLoad() {
        console.log('GameMgr onLoad!');
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);

        // 回调函数
        this.rope.callLevelSuccess(this, this.levelSuccess.bind(this));
        this.rope.callAddScore(this, this.addScore.bind(this))

        // 界面初始化
        this.msg.finalMsg(this.target, false, false);
        this.msg.updateScore(this.total_score);
        this.msg.updateTarget(this.target);
        this.msg.updateStage(this.stage);
        this.msg.node.getChildByName("next_button").active = false;
        this.msg.node.getChildByName("restart_button").active = false;

        this.audio_source = this.node.getComponent(AudioSource)!;
        // 倒计时
        this.time_callback = function () {
            // 这里的 this 指向 component
            if (this.time_remaining == 0) {
                if (this.total_score >= this.target) {
                    this.levelSuccess();
                } else {
                    this.levelFailed();
                }
            }

            this.updateCountDown();
        }
    }

    start() {
        console.log('GameMgr start!');
        // 以秒为单位的时间间隔
        let interval = 1;
        // 重复次数
        let repeat = this.time_remaining;
        // 开始延时
        let delay = 1;
        this.schedule(this.time_callback, interval, repeat, delay);
    }

    update(deltaTime: number) {
        // this.rope.randomLootsAndShow();
    }

    onTouchStart(): void {
        console.log('onTouchStart!');
        this.rope.throwRope();
    }

    updateCountDown(): void {
        this.msg.updateCountDown(this.time_remaining);
        this.time_remaining = this.time_remaining - 1;
    }

    levelSuccess(): void {
        console.log('levelSuccess!');

        this.rope.hideAllLoots();
        this.rope.forceIdle();
        this.unschedule(this.time_callback);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);

        let r = randomRangeInt(0, 30);
        this.target = this.target + (900 + r * 10);
        this.msg.finalMsg(this.target, true, true);
    }

    levelFailed(): void {
        console.log('levelFailed!');

        this.rope.hideAllLoots();
        this.rope.forceIdle();
        this.unschedule(this.time_callback);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.msg.finalMsg(this.target, true, false);
    }

    addScore(score: number): void {
        console.log('addScore!');
        if (this.audio_source) {
            console.log("addScore play audio!")
            this.audio_source.playOneShot(this.clip_add_money, 0.5);
        }

        this.total_score = this.total_score + score;
        this.msg.showScoreAnimation(score);
        this.msg.updateScore(this.total_score);
    }

    // on button
    enterNextStage(): void {
        console.log('enterNextStage on button!');
        // 清理上一个场景
        this.msg.finalMsg(this.target, false, true);

        // 刷新下一个场景
        this.stage += 1;
        this.msg.updateStage(this.stage);
        this.msg.updateTarget(this.target);
        this.rope.randomLootsAndShow();
        this.time_remaining = this.init_remaining;
        let interval = 1;
        let repeat = this.time_remaining;
        let delay = 1;
        this.schedule(this.time_callback, interval, repeat, delay);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    // on button
    restartStage(): void {
        console.log('restartStage on button!');
        // 清理上一个场景
        this.msg.finalMsg(this.target, false, false);
        this.rope.hideAllLoots();

        // 刷新下一个场景
        this.rope.randomLootsAndShow();
        this.time_remaining = this.init_remaining;
        this.total_score = 0;
        this.target = this.init_target;
        this.stage = 1;
        this.msg.updateScore(this.total_score);
        this.msg.updateTarget(this.target);
        this.msg.updateStage(this.stage);

        let interval = 1;
        let repeat = this.time_remaining;
        let delay = 1;
        this.schedule(this.time_callback, interval, repeat, delay);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
}


