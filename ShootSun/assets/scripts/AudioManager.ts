import { _decorator, AudioClip, AudioSource, Component, Node, Slider, sys } from 'cc';
import { EventBus } from './EventBus';
import { GameEvents } from './GameEvents';

const { ccclass, property } = _decorator;

const STORAGE_KEY_BGM = 'game_bgm_volume';
const STORAGE_KEY_SFX = 'game_sfx_volume';

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property(AudioClip)
    bgmClip: AudioClip = null; // 背景音乐片段

    @property({ tooltip: 'BGM默认音量 0~1' })
    defaultBgmVolume: number = 1.0;

    @property({ tooltip: 'SFX默认音量 0~1' })
    defaultSfxVolume: number = 1.0;

    @property(Slider)
    bgmSlider: Slider = null; //BGM滑动

    @property(Slider)
    sfxSlider: Slider = null; //SFX滑动

    public static Instance: AudioManager = null;

    private _bgmSource: AudioSource = null;
    private _activeSfxSources: AudioSource[] = [];
    private _bgmVolume: number = 1.0;
    private _sfxVolume: number = 1.0;

    /** 获取当前BGM音量 */
    public get bgmVolume(): number {
        return this._bgmVolume;
    }

    /** 获取当前SFX音量 */
    public get sfxVolume(): number {
        return this._sfxVolume;
    }

    protected onLoad(): void {
        if (AudioManager.Instance) {
            this.node.destroy();
            return;
        }
        AudioManager.Instance = this;

        // 跨场景保留
        this.node.parent?.name === 'Canvas' || directorCheck(this);

        // 初始化BGM播放源
        this._bgmSource = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
        this._bgmSource.loop = true;
        this._bgmSource.playOnAwake = false;

        // 从本地存储恢复音量
        this._bgmVolume = this._loadVolume(STORAGE_KEY_BGM, this.defaultBgmVolume);
        this._sfxVolume = this._loadVolume(STORAGE_KEY_SFX, this.defaultSfxVolume);

        // 同步滑动条UI位置
        if (this.bgmSlider) this.bgmSlider.progress = this._bgmVolume;
        if (this.sfxSlider) this.sfxSlider.progress = this._sfxVolume;

        // 应用音量
        this._applyBgmVolume();
    }

    protected start(): void {
        // 自动开始播放BGM
        if (this.bgmClip) {
            this.playBGM();
        }
    }

    protected onDestroy(): void {
        if (AudioManager.Instance === this) {
            AudioManager.Instance = null;
        }
    }

    // ==================== BGM ====================

    /** 播放背景音乐 */
    public playBGM(clip?: AudioClip): void {
        if (clip) {
            this.bgmClip = clip;
        }
        if (!this.bgmClip) return;

        this._bgmSource.clip = this.bgmClip;
        this._bgmSource.volume = this._bgmVolume;
        this._bgmSource.play();
    }

    /** 停止背景音乐 */
    public stopBGM(): void {
        this._bgmSource.stop();
    }

    /** 暂停背景音乐 */
    public pauseBGM(): void {
        this._bgmSource.pause();
    }

    /** 恢复背景音乐 */
    public resumeBGM(): void {
        this._bgmSource.play();
    }

    // ==================== SFX ====================

    /** 播放音效（动态创建AudioSource，播完自动销毁） */
    public playSFX(clip: AudioClip, volumeScale: number = 1.0): void {
        if (!clip) return;

        const sfxNode = new Node('SFX_OneShot');
        sfxNode.parent = this.node;
        const source = sfxNode.addComponent(AudioSource);
        source.clip = clip;
        source.loop = false;
        source.playOnAwake = false;
        source.volume = this._sfxVolume * volumeScale;
        source.play();

        // 注册到活跃列表，以便实时调节音量
        this._activeSfxSources.push(source);

        // 播放完毕后自动销毁
        this.scheduleOnce(() => {
            if (sfxNode && sfxNode.isValid) {
                this._removeSfxSource(source);
                sfxNode.destroy();
            }
        }, clip.getDuration() + 0.1);
    }

    // ==================== 滑动绑定 ====================
    onChange() {
        this.setBgmVolume(this.bgmSlider.progress);
        this.setSfxVolume(this.sfxSlider.progress);
    }

    // ==================== 音量控制 ====================

    /** 设置BGM音量 (0~1) */
    public setBgmVolume(volume: number): void {
        this._bgmVolume = Math.max(0, Math.min(1, volume));
        this._applyBgmVolume();
        this._saveVolume(STORAGE_KEY_BGM, this._bgmVolume);
        EventBus.emit(GameEvents.VOLUME_BGM_CHANGED, this._bgmVolume);
    }

    /** 设置SFX音量 (0~1) */
    public setSfxVolume(volume: number): void {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        this._applySfxVolume();
        this._saveVolume(STORAGE_KEY_SFX, this._sfxVolume);
        EventBus.emit(GameEvents.VOLUME_SFX_CHANGED, this._sfxVolume);
    }

    // ==================== 内部方法 ====================

    private _applyBgmVolume(): void {
        if (this._bgmSource) {
            this._bgmSource.volume = this._bgmVolume;
        }
    }

    private _applySfxVolume(): void {
        // 清理已销毁的source，并更新活跃source音量
        this._activeSfxSources = this._activeSfxSources.filter(s => s && s.isValid);
        this._activeSfxSources.forEach(s => s.volume = this._sfxVolume);
    }

    private _removeSfxSource(source: AudioSource): void {
        const idx = this._activeSfxSources.indexOf(source);
        if (idx > -1) {
            this._activeSfxSources.splice(idx, 1);
        }
    }

    private _loadVolume(key: string, defaultVal: number): number {
        const stored = sys.localStorage.getItem(key);
        if (stored !== null) {
            const val = parseFloat(stored);
            if (!isNaN(val)) return Math.max(0, Math.min(1, val));
        }
        return defaultVal;
    }

    private _saveVolume(key: string, value: number): void {
        sys.localStorage.setItem(key, value.toString());
    }
}

/** 检查是否是Canvas根节点，不是则提醒 */
function directorCheck(self: AudioManager): void {
    if (self.node.parent?.name !== 'Canvas') {
        console.warn('[AudioManager] 建议挂载在Canvas等持久化节点下，以跨场景保留');
    }
}
