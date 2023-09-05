import { _decorator, Component, Node, Label, Animation, AnimationState } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MsgCtrl')
export class MsgCtrl extends Component {
    start() {
        let animation = this.node.getChildByName("loot_score").getComponent(Animation);
        animation.on(Animation.EventType.FINISHED, this.onAnimationEvent, this);
    }

    update(deltaTime: number) {

    }

    onAnimationEvent(type: Animation.EventType, state: AnimationState) {
        // console.log('onAnimationEvent!');
        this.node.getChildByName("loot_score").active = false;
    }

    public finalMsg(score: number, is_show: boolean, is_success: boolean): void {
        var final_msg_node = this.node.getChildByName("final_msg");
        if (is_show == true) {
            if (is_success == true) {
                final_msg_node.getComponent(Label).string = "恭喜!下一关目标: " + String(score);
                this.node.getChildByName("next_button").active = true;
            }
            else {
                final_msg_node.getComponent(Label).string = "失败,继续加油！";
                this.node.getChildByName("restart_button").active = true;
            }

            if (final_msg_node.active == false) {
                final_msg_node.active = true;
            }
        } else {
            if (is_success == true) {
                if (this.node.getChildByName("next_button").active == true) {
                    this.node.getChildByName("next_button").active = false;
                }
            }
            else {
                if (this.node.getChildByName("restart_button").active == true) {
                    this.node.getChildByName("restart_button").active = false;
                }
            }
            if (final_msg_node.active == true) {
                final_msg_node.active = false;
            }
        }

    }

    public updateStage(stage: number): void {
        this.node.getChildByName("stage").getComponent(Label).string = String(stage);
    }

    public updateTarget(target: number): void {
        this.node.getChildByName("target").getComponent(Label).string = String(target);
    }

    public updateCountDown(time: number): void {
        console.log('update time!');
        this.node.getChildByName("time").active = true;
        this.node.getChildByName("time").getComponent(Label).string = String(time);
    }

    public updateScore(total_score: number): void {
        console.log('updateScore!');
        this.node.getChildByName("score").active = true;
        this.node.getChildByName("score").getComponent(Label).string = String(total_score);
    }

    public showScoreAnimation(score: number): void {
        console.log('showScoreAnimation!');
        var loot_socre_node = this.node.getChildByName("loot_score");
        loot_socre_node.active = true;
        loot_socre_node.getComponent(Label).string = "+" + String(score);
        var animation_component = loot_socre_node.getComponent(Animation);
        animation_component.play();
    }
}


