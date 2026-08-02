import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface DropRate {
    commonRate: number; //普通概率
    rareRate: number; //稀有概率
    epicRate: number; //史诗概率
    lengendaryRate: number; //传奇概率
}

export interface LevelData {
    level: number;
    sunHealth: number;  // 太阳需要被射中多少次才死
    description: string;
    dropRate?: DropRate;
}

export const LEVELS: LevelData[] = [

    { level: 1, sunHealth: 10, description: '初出茅庐', dropRate:{
        commonRate:100,rareRate:0,epicRate:0,lengendaryRate:0
    }},
    { level: 2, sunHealth: 100, description: '小试牛刀', dropRate:{
        commonRate:80,rareRate:20,epicRate:0,lengendaryRate:0
    }},
    { level: 3, sunHealth: 200, description: '渐入佳境', dropRate:{
        commonRate:60,rareRate:35,epicRate:5,lengendaryRate:0
    }},
    { level: 4, sunHealth: 500, description: '锋芒初露', dropRate:{
        commonRate:40,rareRate:50,epicRate:9,lengendaryRate:1
    }},
    { level: 5, sunHealth: 1000, description: '百步穿杨', dropRate:{
        commonRate:20,rareRate:65,epicRate:12,lengendaryRate:3
    }},
    { level: 6, sunHealth: 2000, description: '箭无虚发', dropRate:{
        commonRate:0,rareRate:75,epicRate:20,lengendaryRate:5
    }},
    { level: 7, sunHealth: 5000, description: '势如破竹', dropRate:{
        commonRate:0,rareRate:65,epicRate:25,lengendaryRate:10
    }},
    { level: 8, sunHealth: 10000, description: '百发百中', dropRate:{
        commonRate:0,rareRate:50,epicRate:30,lengendaryRate:20
    }},
    { level: 9, sunHealth: 20000, description: '炉火纯青', dropRate:{
        commonRate:0,rareRate:40,epicRate:35,lengendaryRate:25
    }},
    { level: 10, sunHealth: 100000, description: '射日传说'}

];

@ccclass('LevelConfig')
export class LevelConfig extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
}


