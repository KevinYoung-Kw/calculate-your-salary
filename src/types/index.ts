// 用户输入数据
export interface UserInput {
  annualSalary: number;            // 税前年薪（元）
  overtimeFreq: 'flex' | 'normal' | 'occasional' | 'frequent' | '996' | 'extreme';  // 加班频率
  bonus: number;                   // 年终奖（元）
  exchangeRate: number;            // 汇率：1两白银 = X元人民币（由PPP模型计算得出）
  silverPricePerGram?: number;     // 今日银价（元/克），用于PPP计算
  familySize: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;  // 家中几口人（需承担的开支人数）
  
  // 其他选项
  workYears: '0-1' | '1-3' | '3-5' | '5-8' | '8-15' | '15+';  // 工作年限
  workEnv: 'remote' | 'office' | 'hybrid' | 'outdoor';  // 工作环境
  benefits: 'excellent' | 'good' | 'average' | 'poor';  // 公司福利
  cityTier: '1' | '2' | '3' | '4' | '5';  // 城市级别
}

// 加班频率选项（具体可衡量）
export const OVERTIME_OPTIONS = [
  { value: 'flex', label: '弹性/自由安排', hours: '≤40h/周', desc: '闲云野鹤，逍遥自在' },
  { value: 'normal', label: '准时下班（朝九晚六）', hours: '40-45h/周', desc: '卯入酉出，按时当值' },
  { value: 'occasional', label: '偶尔加班（月末/项目期）', hours: '45-50h/周', desc: '月末年末，略有忙碌' },
  { value: 'frequent', label: '经常加班（每周2-3天）', hours: '50-60h/周', desc: '三日一休，伏案劳形' },
  { value: '996', label: '996（早9晚9，周六上班）', hours: '72h+/周', desc: '鸡鸣而起，戌亥方归' },
  { value: 'extreme', label: '007/随时待命', hours: '无固定', desc: '枕戈待旦，夙夜在公' },
] as const;

// 工作年限选项
export const WORK_YEARS_OPTIONS = [
  { value: '0-1', label: '初入职场（1年以内）', desc: '新科及第，初入仕途' },
  { value: '1-3', label: '崭露头角（1-3年）', desc: '历练初成，渐入门径' },
  { value: '3-5', label: '独当一面（3-5年）', desc: '技艺纯熟，可委重任' },
  { value: '5-8', label: '经验丰富（5-8年）', desc: '资历深厚，经验丰富' },
  { value: '8-15', label: '中流砥柱（8-15年）', desc: '栋梁之材，柱石之臣' },
  { value: '15+', label: '德高望重（15年以上）', desc: '德高望重，众望所归' },
] as const;

// 工作环境选项
export const WORK_ENV_OPTIONS = [
  { value: 'remote', label: '居家办公', desc: '深居简出，闭门造车' },
  { value: 'office', label: '写字楼', desc: '高堂大厦，锦衣玉食' },
  { value: 'hybrid', label: '混合办公', desc: '亦官亦隐，动静皆宜' },
  { value: 'outdoor', label: '外勤/户外', desc: '风餐露宿，披星戴月' },
] as const;

// 福利选项 - 参考《宛署杂记》中的各种待遇
export const BENEFITS_OPTIONS = [
  { 
    value: 'excellent', 
    label: '优渥（五险一金+补充医疗+股票期权）', 
    desc: '恩宠优渥，赏赐丰厚',
    ancientDesc: '朝廷恩宠，俸禄优厚，另有冰敬炭敬、养廉银等厚赏'
  },
  { 
    value: 'good', 
    label: '良好（五险一金+年终奖）', 
    desc: '待遇尚可，衣食无忧',
    ancientDesc: '正俸按时发放，偶有赏赐，生活安稳'
  },
  { 
    value: 'average', 
    label: '一般（基本社保）', 
    desc: '勉强糊口，聊胜于无',
    ancientDesc: '仅有正俸，无额外赏赐，日子紧巴'
  },
  { 
    value: 'poor', 
    label: '较差（无社保或外包）', 
    desc: '朝不保夕，艰难度日',
    ancientDesc: '无俸无禄，形同白役，苦不堪言'
  },
] as const;

// 城市级别选项
export const CITY_TIER_OPTIONS = [
  { value: '1', label: '京师/一线城市', desc: '天子脚下，寸土寸金' },
  { value: '2', label: '省城/新一线', desc: '省会重镇，繁华之地' },
  { value: '3', label: '府城/二线城市', desc: '府城要地，商贾云集' },
  { value: '4', label: '县城/三线城市', desc: '县城小镇，安逸之所' },
  { value: '5', label: '乡镇/四线及以下', desc: '乡野之地，宁静致远' },
] as const;

// 家庭人口选项（需承担的开支人数）
export const FAMILY_SIZE_OPTIONS = [
  { value: 1, label: '1人', desc: '独自一人，开支较轻' },
  { value: 2, label: '2人', desc: '二人同行，相互扶持' },
  { value: 3, label: '3人', desc: '三口之家，添丁进口' },
  { value: 4, label: '4人', desc: '四口之家，负担渐重' },
  { value: 5, label: '5人（标准）', desc: '五口之家，古代标准家庭' },
  { value: 6, label: '6人', desc: '六口之家，人丁兴旺' },
  { value: 7, label: '7人', desc: '七口之家，子孙满堂' },
  { value: 8, label: '8人及以上', desc: '大家庭，开支甚巨' },
] as const;

// 古代身份结果
export interface AncientIdentity {
  level: number;           // 等级 L0-L28
  title: string;           // 官阶名称
  dynasty: string;         // 朝代（明/清）
  salaryInTael: number;    // 折合白银两数
  verdict: string;         // 判词
  purchasingPower: {       // 购买力
    items: Array<{
      name: string;
      quantity: number;
      unit: string;
      image?: string;      // 物品图片
      modernEquivalent?: string;  // 现代等价物
    }>;
    landArea?: number;     // 可选：折合田地亩数
    lifestyle: string;     // 生活方式
  };
}

// 等级映射项
export interface LevelMapping {
  minSalary: number;       // 最低年薪（元）
  maxSalary: number;       // 最高年薪（元）
  level: number;
  title: string;
  dynasty: string;
  verdict: string;
  historicalFigure?: string;  // 历史人物对比
  dailyLife?: string;         // 你可能的一天
}

// 物品价格
export interface ItemPrice {
  name: string;
  price: number;           // 白银两数
  unit: string;
  category: 'food' | 'clothing' | 'housing' | 'luxury';
  image: string;           // 物品图片路径
  modernEquivalent: string; // 现代等价物描述
}
