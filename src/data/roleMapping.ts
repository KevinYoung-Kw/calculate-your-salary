/**
 * 个性化评语决策树 - 修饰因素权重映射及加权算法
 * 
 * 决策树架构：
 * 1. 核心层：收入等级(75级) → 官职/身份 + 基础评语 + 默认历史人物
 * 2. 修饰层：5大因素加权 → 生活质量指数(QoL) → 动态调整历史人物对照
 */

import type { UserInput } from '@/types';

// ========== 修饰因素权重定义 ==========

/**
 * 加班频率权重（影响最大，占比30%）
 * QoL影响范围：-30 ~ +20
 */
export const OVERTIME_WEIGHTS: Record<UserInput['overtimeFreq'], number> = {
  flex: 20,      // 弹性自由
  normal: 10,    // 准时下班
  occasional: 0, // 偶尔加班
  frequent: -10, // 经常加班
  '996': -20,    // 996
  extreme: -30,  // 007/随时待命
};

/**
 * 城市级别权重（占比25%）
 * QoL影响范围：-20 ~ +15
 */
export const CITY_WEIGHTS: Record<UserInput['cityTier'], number> = {
  '1': -20, // 一线城市
  '2': -10, // 新一线
  '3': 0,   // 二线城市
  '4': 10,  // 三线城市
  '5': 15,  // 四线及以下
};

/**
 * 工作年限权重（占比15%）
 * QoL影响范围：-10 ~ +15
 */
export const YEARS_WEIGHTS: Record<UserInput['workYears'], number> = {
  '0-1': -10,  // 初入职场
  '1-3': -5,   // 崭露头角
  '3-5': 0,    // 独当一面
  '5-8': 5,    // 经验丰富
  '8-15': 10,  // 中流砥柱
  '15+': 15,   // 德高望重
};

/**
 * 工作环境权重（占比15%）
 * QoL影响范围：-10 ~ +10
 */
export const ENV_WEIGHTS: Record<UserInput['workEnv'], number> = {
  remote: 10,   // 居家办公
  hybrid: 5,    // 混合办公
  office: 0,    // 写字楼
  outdoor: -10, // 外勤/户外
};

/**
 * 福利待遇权重（占比15%）
 * QoL影响范围：-15 ~ +20
 */
export const BENEFITS_WEIGHTS: Record<UserInput['benefits'], number> = {
  excellent: 20, // 优渥
  good: 10,      // 良好
  average: 0,    // 一般
  poor: -15,     // 较差
};

// ========== 修饰因素描述词映射 ==========

/**
 * 加班频率描述词
 */
export const OVERTIME_DESC: Record<UserInput['overtimeFreq'], string> = {
  flex: '逍遥自在，不拘时辰',
  normal: '卯入酉出，按时当值',
  occasional: '偶有忙碌，尚能从容',
  frequent: '日有操劳，夙夜匪懈',
  '996': '焚膏继晷，形神俱疲',
  extreme: '枕戈待旦，油尽灯枯',
};

/**
 * 城市级别描述词
 */
export const CITY_DESC: Record<UserInput['cityTier'], string> = {
  '1': '身居京师，寸土寸金，虽俸禄不薄，奈何开支甚巨',
  '2': '居于省城，物价不菲，日子尚可却不敢懈怠',
  '3': '住在府城，生活便利，收支尚能平衡',
  '4': '居于县城，生活安逸，颇有闲适之感',
  '5': '身处小城，物价低廉，虽俸禄不高却也安居乐业',
};

/**
 * 工作年限描述词
 */
export const YEARS_DESC: Record<UserInput['workYears'], string> = {
  '0-1': '初入此道，尚在摸索，前路漫漫',
  '1-3': '历练数载，渐入门径',
  '3-5': '技艺日精，已能独当一面',
  '5-8': '经验老到，游刃有余',
  '8-15': '资深行家，深谙门道',
  '15+': '此道宗师，举重若轻',
};

/**
 * 工作环境描述词
 */
export const ENV_DESC: Record<UserInput['workEnv'], string> = {
  remote: '深居简出，免去舟车劳顿之苦',
  office: '高堂广厦，朝出暮归',
  hybrid: '亦官亦隐，动静皆宜',
  outdoor: '风餐露宿，披星戴月，甚是辛苦',
};

/**
 * 福利待遇描述词
 */
export const BENEFITS_DESC: Record<UserInput['benefits'], string> = {
  excellent: '恩宠优渥，赏赐丰厚，另有诸般贴补',
  good: '待遇尚可，衣食无忧，偶有恩赏',
  average: '仅有正俸，无额外恩赏，精打细算度日',
  poor: '俸禄微薄，形同白役，朝不保夕',
};

// ========== 特殊组合触发规则 ==========

interface SpecialCombo {
  condition: (input: UserInput) => boolean;
  desc: string;
}

/**
 * 特殊因素组合，会触发特殊描述词
 */
const SPECIAL_COMBOS: SpecialCombo[] = [
  {
    condition: (input) => input.overtimeFreq === '996' && input.cityTier === '1',
    desc: '京师熊熊烈火，燃尽心神',
  },
  {
    condition: (input) => input.overtimeFreq === 'extreme' && input.benefits === 'poor',
    desc: '卖命如牛马，所得不及温饱',
  },
  {
    condition: (input) => input.overtimeFreq === 'flex' && input.workEnv === 'remote' && input.benefits === 'excellent',
    desc: '神仙眷侣般的日子',
  },
  {
    condition: (input) => input.workEnv === 'outdoor' && input.overtimeFreq === 'frequent' && input.benefits === 'poor',
    desc: '风餐露宿，披星戴月，所得微薄，实乃苦命',
  },
  {
    condition: (input) => input.overtimeFreq === 'extreme' && input.cityTier === '1' && input.benefits === 'poor',
    desc: '京师苦役，身心俱疲，所得不足糊口',
  },
  {
    condition: (input) => input.workYears === '15+' && input.benefits === 'excellent' && input.overtimeFreq === 'flex',
    desc: '功成名就，坐享清福，人生赢家',
  },
  {
    condition: (input) => input.workYears === '0-1' && input.overtimeFreq === '996' && input.benefits === 'poor',
    desc: '初入职场便遭毒打，前途渺茫',
  },
  {
    condition: (input) => input.cityTier === '5' && input.workEnv === 'remote' && input.overtimeFreq === 'flex',
    desc: '隐居乡野，逍遥自在，不问世事',
  },
];

/**
 * 获取特殊组合描述词
 */
export function getSpecialComboDesc(userInput: UserInput): string | null {
  for (const combo of SPECIAL_COMBOS) {
    if (combo.condition(userInput)) {
      return combo.desc;
    }
  }
  return null;
}

// ========== 生活质量指数计算 ==========

/**
 * 根据收入等级（官阶）计算基础生活质量分数
 * 使用分段插值实现精确控制 + 边际递减效应
 * @param level 收入等级 (0-74)
 * @returns 基础分数 (15-100)，收入是核心决定因素，权重最高
 * 
 * 分数设计（边际递减）：
 * L0  → 15分  （流民，最低保障）
 * L5  → 45分  （伙计，基本温饱）
 * L10 → 60分  （工匠，小康入门）
 * L20 → 70分  （师爷，中产起步）
 * L37 → 80分  （知县，中产稳定）
 * L50 → 88分  （知州，富裕阶层）
 * L60 → 93分  （总督，权贵阶层）
 * L67 → 97分  （王爷，皇室成员）
 * L74 → 100分 （皇帝，九五之尊）
 * 
 * 边际增长递减：
 * L0→L10:  +45分/10级 = 4.5分/级（快速增长，脱贫阶段）
 * L10→L20: +10分/10级 = 1.0分/级
 * L20→L37: +10分/17级 = 0.6分/级
 * L37→L50: +8分/13级 = 0.6分/级
 * L50→L74: +12分/24级 = 0.5分/级（增长放缓，边际递减）
 */
function getIncomeBaseScore(level: number): number {
  if (level <= 0) return 15;
  if (level >= 74) return 100;
  
  // 关键节点定义（精确控制边际递减曲线）
  const keyPoints = [
    { level: 0, score: 15 },
    { level: 5, score: 45 },
    { level: 10, score: 60 },
    { level: 20, score: 70 },
    { level: 37, score: 80 },
    { level: 50, score: 88 },
    { level: 60, score: 93 },
    { level: 67, score: 97 },
    { level: 74, score: 100 },
  ];
  
  // 分段线性插值
  for (let i = 0; i < keyPoints.length - 1; i++) {
    const curr = keyPoints[i];
    const next = keyPoints[i + 1];
    
    if (level >= curr.level && level < next.level) {
      const ratio = (level - curr.level) / (next.level - curr.level);
      return Math.round(curr.score + ratio * (next.score - curr.score));
    }
  }
  
  return 100;
}

/**
 * 计算生活质量指数（收入为核心，权重最高，考虑边际递减效应）
 * @param userInput 用户输入
 * @param level 收入等级（官阶）
 * @returns 生活质量指数（范围约 -75 ~ 170）
 * 
 * 计算公式：收入基础分(10-90，对数曲线) + 修饰因素权重(-85 ~ +80)
 * 
 * 典型场景：
 * - 最惨情况（L0 + 所有负面因素）：10 + (-85) = -75 → 归一化后0分
 * - 底层996（L5 + 996 + 一线）：约22 + (-50) = -28 → 归一化后约15分
 * - 温饱正常（L10 + normal + 三线）：35 + 0 = 35 → 归一化后约45分
 * - 中产正常（L37 + normal + 二线）：60 + 0 = 60 → 归一化后约70分
 * - 高收入996（L60 + 996 + 一线）：80 + (-50) = 30 → 归一化后约43分（收入高但生活质量一般）
 * - 最爽情况（L74 + flex + 四线 + excellent）：90 + 80 = 170 → 归一化后100分
 * 
 * 边际递减体现：
 * - L0→L10: 10→35 (增长25分)
 * - L10→L20: 35→48 (增长13分)
 * - L37→L47: 60→69 (增长9分)
 * - L60→L70: 80→86 (增长6分)
 */
export function calculateQualityOfLife(userInput: UserInput, level: number): number {
  // 1. 收入基础分（权重最高，对数曲线，边际递减）
  const incomeBase = getIncomeBaseScore(level);
  
  // 2. 修饰因素权重（合计可达-85 ~ +80）
  const overtimeWeight = OVERTIME_WEIGHTS[userInput.overtimeFreq] || 0;
  const cityWeight = CITY_WEIGHTS[userInput.cityTier] || 0;
  const yearsWeight = YEARS_WEIGHTS[userInput.workYears] || 0;
  const envWeight = ENV_WEIGHTS[userInput.workEnv] || 0;
  const benefitsWeight = BENEFITS_WEIGHTS[userInput.benefits] || 0;
  
  const total = incomeBase + overtimeWeight + cityWeight + yearsWeight + envWeight + benefitsWeight;
  
  // 返回原始分数（可能为负），归一化在normalizeQoL中处理
  return total;
}

// ========== 等级调整机制 ==========

/**
 * 根据生活质量指数调整等级（用于历史人物对照）
 * @param level 原始等级
 * @param qol 生活质量指数（原始值，未归一化）
 * @returns 调整后的等级
 */
export function adjustLevelByQoL(level: number, qol: number): number {
  // 先归一化到0-100
  const normalizedQol = normalizeQoL(qol);
  
  let adjustment = 0;
  
  // 基于归一化后的分数调整
  if (normalizedQol >= 85) {
    adjustment = 2;  // 实际生活远超同僚
  } else if (normalizedQol >= 70) {
    adjustment = 1;  // 实际生活优于同侪
  } else if (normalizedQol >= 40) {
    adjustment = 0;  // 生活与官阶相当
  } else if (normalizedQol >= 25) {
    adjustment = -1; // 实际生活不如其位
  } else {
    adjustment = -2; // 虽居此位，实苦不堪言
  }
  
  // 确保调整后的等级在有效范围内 (0-74)
  const adjustedLevel = Math.max(0, Math.min(74, level + adjustment));
  return adjustedLevel;
}

/**
 * 获取生活质量评语
 * @param qol 生活质量指数
 * @returns 生活质量总评
 */
export function getQoLComment(qol: number): string {
  // 先归一化到0-100
  const normalizedQol = normalizeQoL(qol);
  
  if (normalizedQol >= 85) {
    return '实际生活远超同僚，颇有名士风范';
  } else if (normalizedQol >= 70) {
    return '实际生活优于同侪，日子颇为滋润';
  } else if (normalizedQol >= 55) {
    return '生活尚可，与官阶相称';
  } else if (normalizedQol >= 40) {
    return '生活中规中矩，不过不失';
  } else if (normalizedQol >= 25) {
    return '生活略有拮据，需精打细算';
  } else if (normalizedQol >= 15) {
    return '实际生活不如其位，颇为辛苦';
  } else {
    return '虽居此位，实苦不堪言';
  }
}

/**
 * 将生活质量指数归一化到0-100分
 * @param qol 生活质量指数（原始范围约-75到170）
 * @returns 归一化后的分数（0-100）
 * 
 * 映射关系（典型场景）：
 * -75  → 0分   （L0 + 所有负面：底层996一线无福利）
 * 0    → 31分  （L0 + 无修饰，或L10 + 严重负面）
 * 35   → 45分  （L10 + normal）
 * 60   → 55分  （L37 + normal，中产正常生活）
 * 90   → 67分  （L60 + 轻微正面）
 * 130  → 84分  （L70 + 较多正面）
 * 170  → 100分 （L74 + 所有正面：顶级 + 弹性 + 四线 + 优渥福利）
 */
export function normalizeQoL(qol: number): number {
  // 归一化设计：让中等收入+中性因素 = 65-70分（体面生活）
  // L22(71分) + 中性(0) = 71 → 归一化后约67分
  // L37(80分) + 中性(0) = 80 → 归一化后约70分
  // L50(88分) + 中性(0) = 88 → 归一化后约72分
  // 
  // 计算：(qol + 150) / 330 * 100
  // - L0最惨情况：15 + (-85) = -70 → (-70+150)/330*100 = 24分
  // - L74最好情况：100 + 80 = 180 → (180+150)/330*100 = 100分
  
  const MIN_QOL = -150; // 扩大范围底部，让正分的人得到更高分数
  const MAX_QOL = 180;  // 理论最高值
  
  // 归一化到0-100
  const normalized = ((qol - MIN_QOL) / (MAX_QOL - MIN_QOL)) * 100;
  
  // 确保在0-100范围内，并四舍五入
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

/**
 * 获取生活质量等级（10星制）
 * @param normalizedQol 归一化后的生活质量分数（0-100）
 * @returns 星级字符串
 */
export function getQoLStars(normalizedQol: number): string {
  if (normalizedQol >= 95) return '★★★★★★★★★★';  // 10星：极致完美
  if (normalizedQol >= 85) return '★★★★★★★★★☆';  // 9星：卓越优秀
  if (normalizedQol >= 75) return '★★★★★★★★☆☆';  // 8星：非常好
  if (normalizedQol >= 65) return '★★★★★★★☆☆☆';  // 7星：良好
  if (normalizedQol >= 55) return '★★★★★★☆☆☆☆';  // 6星：中上
  if (normalizedQol >= 45) return '★★★★★☆☆☆☆☆';  // 5星：中等
  if (normalizedQol >= 35) return '★★★★☆☆☆☆☆☆';  // 4星：中下
  if (normalizedQol >= 25) return '★★★☆☆☆☆☆☆☆';  // 3星：较差
  if (normalizedQol >= 15) return '★★☆☆☆☆☆☆☆☆';  // 2星：很差
  if (normalizedQol >= 5) return '★☆☆☆☆☆☆☆☆☆';   // 1星：极差
  return '☆☆☆☆☆☆☆☆☆☆';                          // 0星：最惨
}

// ========== 综合评语生成 ==========

export interface VerdictComponents {
  baseVerdict: string;      // 基础官职评语
  yearsDesc: string;        // 年限描述
  overtimeDesc: string;     // 加班描述
  cityDesc: string;         // 城市压力描述
  benefitsDesc: string;     // 福利待遇描述
  envDesc: string;          // 工作环境描述
  qolComment: string;       // 生活质量总评
  specialCombo?: string;    // 特殊组合描述（可选）
}

/**
 * 构建完整评语（精简版，只包含基础官职描述和生活质量总评）
 * @param components 评语组件
 * @returns 完整评语字符串
 */
export function buildVerdict(components: VerdictComponents): string {
  // 基础官职描述
  let verdict = components.baseVerdict;
  
  // 特殊组合描述或生活质量总评
  if (components.specialCombo) {
    verdict += ` ${components.specialCombo}`;
  } else {
    verdict += ` ${components.qolComment}`;
  }
  
  return verdict;
}

/**
 * 根据用户输入生成完整的评语组件
 * @param userInput 用户输入
 * @param baseVerdict 基础官职评语
 * @returns 评语组件
 */
export function generateVerdictComponents(userInput: UserInput, level: number, baseVerdict: string): VerdictComponents {
  const qol = calculateQualityOfLife(userInput, level);
  const specialCombo = getSpecialComboDesc(userInput);
  
  return {
    baseVerdict,
    yearsDesc: YEARS_DESC[userInput.workYears],
    overtimeDesc: OVERTIME_DESC[userInput.overtimeFreq],
    cityDesc: CITY_DESC[userInput.cityTier],
    benefitsDesc: BENEFITS_DESC[userInput.benefits],
    envDesc: ENV_DESC[userInput.workEnv],
    qolComment: getQoLComment(qol),
    specialCombo: specialCombo || undefined,
  };
}
