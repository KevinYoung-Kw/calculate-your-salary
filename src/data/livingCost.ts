// 生活成本计算模块
// 基于《宛署杂记》《醒贪简要录》《万历会计录》等史料
// 
// 史料参考：
// - 普通五口之家基础生存：约30两/年（《宛署杂记》）
// - 七品县令实际开支：约60-100两/年（《醒贪简要录》）
// - 四品知府实际开支：约150-300两/年
// - 高官显贵开支：数百至上千两/年
//
// 核心逻辑：基础生存 + 消费升级（收入越高，消费标准越高）

// ========== 生活成本分类 ==========
export interface LivingCostCategory {
  id: string;
  name: string;           // 支出项名称
  baseCost: number;       // 五口之家基础支出(两/年)
  description: string;    // 古风描述
  perCapitaFactor: number; // 人均系数（1人=此系数，5人=1）
  upgradeRate: number;    // 消费升级系数（收入每增加100两，此项支出增加的比例）
  isFood: boolean;        // 是否为食物类支出（用于计算恩格尔系数）
}

// 基础支出分类（基于史料）
// 史料来源：《宛署杂记》记载物价，《醒贪简要录》记载官员生活
export const LIVING_COST_CATEGORIES: LivingCostCategory[] = [
  { 
    id: 'food_staple',
    name: '口粮米面', 
    baseCost: 16, 
    description: '一日三餐之主食',
    perCapitaFactor: 0.3,
    upgradeRate: 0.02,    // 主食升级空间小
    isFood: true
  },
  { 
    id: 'food_side',
    name: '副食菜肉', 
    baseCost: 7,  
    description: '油盐酱醋、鱼肉蔬果',
    perCapitaFactor: 0.35,
    upgradeRate: 0.08,    // 副食升级空间大（穷人素食，富人鱼肉）
    isFood: true
  },
  { 
    id: 'clothing',
    name: '衣着布匹', 
    baseCost: 3,  
    description: '四季衣裳、鞋帽布料',
    perCapitaFactor: 0.4,
    upgradeRate: 0.10,    // 衣着升级明显（布衣→绸缎）
    isFood: false
  },
  { 
    id: 'fuel',
    name: '燃料照明', 
    baseCost: 3,  
    description: '柴炭蜡烛、取暖照明',
    perCapitaFactor: 0.5,
    upgradeRate: 0.03,    // 燃料升级空间小
    isFood: false
  },
  { 
    id: 'medical',
    name: '医药备用', 
    baseCost: 2,  
    description: '小病小灾、汤药调理',
    perCapitaFactor: 0.4,
    upgradeRate: 0.05,    // 医药随收入增加
    isFood: false
  },
  { 
    id: 'housing',
    name: '房租杂费', 
    baseCost: 5,  
    description: '房租、修缮、家具',
    perCapitaFactor: 0.6,
    upgradeRate: 0.12,    // 住房升级明显
    isFood: false
  },
  { 
    id: 'social',
    name: '人情往来', 
    baseCost: 3,  
    description: '红白喜事、节礼应酬',
    perCapitaFactor: 0.5,
    upgradeRate: 0.15,    // 社交随身份地位增加
    isFood: false
  },
  { 
    id: 'servant',
    name: '仆役杂用', 
    baseCost: 0,  
    description: '仆人工钱、杂役开支',
    perCapitaFactor: 0.3,
    upgradeRate: 0.20,    // 只有富人才雇仆人
    isFood: false
  },
];

// 基准：五口之家年支出约39两（基础生存）
export const BASE_FAMILY_SIZE = 5;
export const BASE_ANNUAL_COST = 39;

// ========== 城市成本系数 ==========
// 史料依据：京师物价普遍高于外省，《宛署杂记》所载即为京师宛平县物价
export const CITY_COST_MULTIPLIER: Record<string, { multiplier: number; desc: string }> = {
  '1': { multiplier: 1.5, desc: '京师物价腾贵，寸土寸金' },
  '2': { multiplier: 1.2, desc: '省城繁华，物价略高' },
  '3': { multiplier: 1.0, desc: '府城物价，中规中矩' },
  '4': { multiplier: 0.8, desc: '县城偏远，物价稍低' },
  '5': { multiplier: 0.6, desc: '乡野之地，自给自足' },
};

// ========== 生活水平判定 ==========
// 综合考量：结余率 + 绝对收入水平
// 
// 史料参考（明朝年收入）：
// - 普通农户：约10-20两
// - 七品县令：正俸约45两
// - 四品知府：正俸约90两
// - 一品大员：正俸约180两
// - 富商巨贾：数百至数千两
// - 权贵豪门：数千两以上（含灰色收入）

export interface LifestyleLevel {
  id: string;
  name: string;
  surplusRange: [number, number];  // 结余率范围 [min, max)
  incomeRange: [number, number];   // 绝对收入范围 [min, max) 两/年
  description: string;
  detailDesc: string;
}

// 判定规则：结余率和收入都要满足才能达到该等级
// 如果结余率高但收入低，则降级
export const LIFESTYLE_LEVELS: LifestyleLevel[] = [
  {
    id: 'deficit',
    name: '入不敷出',
    surplusRange: [-Infinity, 0],
    incomeRange: [0, Infinity],
    description: '捉襟见肘',
    detailDesc: '入不敷出，捉襟见肘，日子过得甚是艰难。常需举债度日，寅吃卯粮。'
  },
  {
    id: 'poor',
    name: '贫困',
    surplusRange: [0, 15],
    incomeRange: [0, 30],
    description: '勉强糊口',
    detailDesc: '食不果腹之际虽少，然粗茶淡饭，一年难得几次荤腥。稍有意外便捉襟见肘。'
  },
  {
    id: 'subsistence',
    name: '温饱',
    surplusRange: [15, 35],
    incomeRange: [30, 80],
    description: '量入为出',
    detailDesc: '一日三餐有保障，精打细算，量入为出。虽无大富，亦无大忧。'
  },
  {
    id: 'comfortable',
    name: '小康',
    surplusRange: [35, 55],
    incomeRange: [80, 200],
    description: '衣食无忧',
    detailDesc: '衣食无忧，逢年过节有肉吃，略有积蓄。日子过得安稳踏实。'
  },
  {
    id: 'wealthy',
    name: '富裕',
    surplusRange: [55, 75],
    incomeRange: [200, 500],
    description: '生活优渥',
    detailDesc: '积蓄颇丰，可雇佣仆人，生活甚是体面。'
  },
  {
    id: 'elite',
    name: '豪富',
    surplusRange: [75, Infinity],
    incomeRange: [500, Infinity],
    description: '家资殷实',
    detailDesc: '家资殷实，深宅大院，仆从成群，好不快活。'
  },
];

// ========== 计算结果接口 ==========
export interface LivingCostResult {
  // 各项支出明细
  items: Array<{
    id: string;
    name: string;
    cost: number;
    ratio: number;
    description: string;
  }>;
  // 汇总
  totalCost: number;        // 年度总支出（两）
  foodCost: number;         // 食物支出（两）
  income: number;           // 年度收入（两）
  surplus: number;          // 结余（两），负数表示亏空
  surplusRatio: number;     // 结余率（%），负数表示亏空率
  engleCoefficient: number; // 恩格尔系数（%）
  // 生活水平判定
  lifestyleLevel: LifestyleLevel;
  // 与基准的对比
  vsBaseFamily: {
    baseCost: number;       // 五口之家基准支出
    actualCost: number;     // 实际支出
    difference: number;     // 差额
    ratio: number;          // 倍数
  };
}

// ========== 核心计算函数 ==========
/**
 * 计算生活成本
 * @param salaryInTael 年收入（两白银）
 * @param familySize 家庭人口数
 * @param cityTier 城市等级
 * @returns 生活成本计算结果
 */
export function calculateLivingCosts(
  salaryInTael: number,
  familySize: number,
  cityTier: string
): LivingCostResult {
  // 1. 获取城市系数
  const cityMultiplier = CITY_COST_MULTIPLIER[cityTier]?.multiplier || 1.0;
  
  // 2. 计算各项支出（考虑消费升级）
  // 消费升级逻辑：收入越高，生活标准越高
  // 参考史料：七品县令（45两正俸）实际开支约60-100两
  
  const items = LIVING_COST_CATEGORIES.map(cat => {
    // Step 1: 计算家庭人口调整系数
    let familyFactor: number;
    if (familySize <= 1) {
      familyFactor = cat.perCapitaFactor;
    } else if (familySize >= BASE_FAMILY_SIZE) {
      familyFactor = familySize / BASE_FAMILY_SIZE;
    } else {
      // 1-5人之间，线性插值
      const t = (familySize - 1) / (BASE_FAMILY_SIZE - 1);
      familyFactor = cat.perCapitaFactor + t * (1 - cat.perCapitaFactor);
    }
    
    // Step 2: 特殊处理 - 仆役支出
    // 史料：雇佣一个仆人约5-10两/年，只有年收入100两以上的家庭才雇得起
    if (cat.id === 'servant') {
      const SERVANT_THRESHOLD = 100;  // 雇佣仆人的收入门槛
      const SERVANT_COST_PER = 8;     // 每个仆人年费约8两
      
      if (salaryInTael < SERVANT_THRESHOLD) {
        return {
          id: cat.id,
          name: cat.name,
          cost: 0,
          ratio: 0,
          description: '收入尚不足以雇佣仆役',
          isFood: cat.isFood,
        };
      }
      
      // 收入越高，雇佣的仆人越多
      // 100-200两：1人；200-400两：2人；400两以上：3人及以上
      let servantCount = 1;
      if (salaryInTael >= 400) {
        servantCount = Math.min(Math.floor(salaryInTael / 150), 6);
      } else if (salaryInTael >= 200) {
        servantCount = 2;
      }
      
      const servantCost = Math.round(servantCount * SERVANT_COST_PER * cityMultiplier * 10) / 10;
      
      return {
        id: cat.id,
        name: cat.name,
        cost: servantCost,
        ratio: servantCost,
        description: `仆役${servantCount}名`,
        isFood: cat.isFood,
      };
    }
    
    // Step 3: 计算基础支出
    const baseCostAdjusted = cat.baseCost * familyFactor * cityMultiplier;
    
    // Step 4: 计算消费升级（收入越高，消费标准越高）
    // 公式：升级额度 = 收入 × 升级系数 × 家庭系数 × 城市系数
    // 但有上限：升级额度不超过基础支出的3倍
    const upgradePotential = salaryInTael * cat.upgradeRate * (familyFactor / BASE_FAMILY_SIZE) * cityMultiplier;
    const maxUpgrade = baseCostAdjusted * 3;
    const upgradeAmount = Math.min(upgradePotential, maxUpgrade);
    
    // Step 5: 最终支出 = 基础支出 + 升级额度
    const cost = Math.round((baseCostAdjusted + upgradeAmount) * 10) / 10;
    
    return {
      id: cat.id,
      name: cat.name,
      cost,
      ratio: cost, // 临时存储，后面会重新计算比例
      description: cat.description,
      isFood: cat.isFood,
    };
  });
  
  // 4. 汇总计算
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  const foodCost = items
    .filter(item => item.isFood)
    .reduce((sum, item) => sum + item.cost, 0);
  
  // 重新计算各项占比
  const itemsWithRatio = items.map(item => ({
    id: item.id,
    name: item.name,
    cost: item.cost,
    ratio: totalCost > 0 ? item.cost / totalCost : 0,
    description: item.description,
  }));
  
  const surplus = salaryInTael - totalCost;
  const surplusRatio = salaryInTael > 0 ? (surplus / salaryInTael) * 100 : -100;
  const engleCoefficient = totalCost > 0 ? (foodCost / totalCost) * 100 : 0;
  
  // 5. 判定生活水平
  // 综合考量：结余率 + 绝对收入水平
  // 规则：找到结余率和收入都满足的最高等级
  let lifestyleLevel = LIFESTYLE_LEVELS[0]; // 默认入不敷出
  
  // 从最低等级开始，逐级检查，找到最高匹配等级
  for (let i = LIFESTYLE_LEVELS.length - 1; i >= 0; i--) {
    const level = LIFESTYLE_LEVELS[i];
    const [minSurplus, maxSurplus] = level.surplusRange;
    const [minIncome, maxIncome] = level.incomeRange;
    
    // 结余率和收入都要在范围内
    const surplusMatch = surplusRatio >= minSurplus && surplusRatio < maxSurplus;
    const incomeMatch = salaryInTael >= minIncome && salaryInTael < maxIncome;
    
    if (surplusMatch && incomeMatch) {
      lifestyleLevel = level;
      break;
    }
  }
  
  // 如果没有精确匹配，则按结余率降级处理
  if (lifestyleLevel.id === 'deficit' && surplusRatio >= 0) {
    // 有结余但收入不高，根据结余率给一个合理等级
    if (surplusRatio >= 55) {
      lifestyleLevel = LIFESTYLE_LEVELS.find(l => l.id === 'wealthy') || lifestyleLevel;
    } else if (surplusRatio >= 35) {
      lifestyleLevel = LIFESTYLE_LEVELS.find(l => l.id === 'comfortable') || lifestyleLevel;
    } else if (surplusRatio >= 15) {
      lifestyleLevel = LIFESTYLE_LEVELS.find(l => l.id === 'subsistence') || lifestyleLevel;
    } else {
      lifestyleLevel = LIFESTYLE_LEVELS.find(l => l.id === 'poor') || lifestyleLevel;
    }
  }
  
  // 6. 与基准对比
  const baseCostForCity = BASE_ANNUAL_COST * cityMultiplier;
  
  return {
    items: itemsWithRatio,
    totalCost: Math.round(totalCost * 10) / 10,
    foodCost: Math.round(foodCost * 10) / 10,
    income: salaryInTael,
    surplus: Math.round(surplus * 10) / 10,
    surplusRatio: Math.round(surplusRatio * 10) / 10,
    engleCoefficient: Math.round(engleCoefficient * 10) / 10,
    lifestyleLevel,
    vsBaseFamily: {
      baseCost: Math.round(baseCostForCity * 10) / 10,
      actualCost: Math.round(totalCost * 10) / 10,
      difference: Math.round((totalCost - baseCostForCity) * 10) / 10,
      ratio: Math.round((totalCost / baseCostForCity) * 100) / 100,
    },
  };
}

// ========== 古风描述生成 ==========
export function generateCostNarrative(result: LivingCostResult): string {
  const { lifestyleLevel, surplus, surplusRatio, engleCoefficient } = result;
  
  let narrative = lifestyleLevel.detailDesc;
  
  // 添加具体数字描述
  if (surplus >= 0) {
    narrative += `\n\n岁末结算，尚余纹银${surplus.toFixed(1)}两，占岁入${surplusRatio.toFixed(0)}%。`;
  } else {
    narrative += `\n\n岁末结算，亏空纹银${Math.abs(surplus).toFixed(1)}两，需另寻他途填补。`;
  }
  
  // 恩格尔系数描述
  if (engleCoefficient > 60) {
    narrative += '口粮支出占大头，实乃为口腹之欲所累。';
  } else if (engleCoefficient > 50) {
    narrative += '柴米油盐仍是大头，但尚有余力添置衣物。';
  } else if (engleCoefficient > 40) {
    narrative += '饮食开销适中，生活颇有品质。';
  } else {
    narrative += '饮食不过小事，更有余力享受人生。';
  }
  
  return narrative;
}
