import { _decorator, Component, Node, AudioSource, assert } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioCtr')
export class AudioCtr extends Component {
    @property(AudioSource)
    public _audioSource: AudioSource = null!;

    onLoad() {
        // this.node.getChildByName("time").getComponent(AudioSource).string = String(time);

        // 获取 AudioSource 组件
        const audioSource = this.node.getComponent(AudioSource)!;
        // 检查是否含有 AudioSource，如果没有，则输出错误消息
        assert(audioSource);
        // 将组件赋到全局变量 _audioSource 中
        this._audioSource = audioSource;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


