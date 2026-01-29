// 官职分类系统 - 直接基于Level分类（与levelMapping完全对应）

/**
 * 官职类型枚举
 */
export type OccupationCategory = 
  | 'labor'      // 体力劳动者：L0-L4（流民、雇工、学徒、小工、杂役）
  | 'craft'      // 工匠手艺人：L5-L10（伙计、工匠、力役脚夫等）
  | 'merchant'   // 商贾富户：L11-L14（小商人、掌柜、富户、地主）
  | 'clerk'      // 衙门吏员：L15-L23（衙役、捕快、书吏、师爷、押司等）
  | 'scholar'    // 九品八品：L24-L34（典史、巡检、教谕、县丞等）
  | 'official'   // 七品-五品：L35-L50（知县、知府、通判等）
  | 'elite'      // 四品-一品：L51-L66（道员、巡抚、尚书、大学士等）
  | 'royal';     // 皇室成员：L67-L74（亲王、郡王、太子、皇帝等）

/**
 * Level到分类的映射表（精确对应levelMapping.ts的75个等级）
 * 
 * L0-L4:   labor    - 流民、雇工、学徒、小工、杂役
 * L5-L10:  craft    - 伙计、店铺伙计、小贩、力役脚夫、工匠、资深工匠
 * L11-L14: merchant - 小商人、小掌柜、富户、小地主
 * L15-L23: clerk    - 衙役、捕快、书吏、门子、账房、师爷、主簿、押司、大掌柜
 * L24-L34: scholar  - 典史、巡检、教谕、训导、富商、县丞、州同、学正、教授
 * L35-L50: official - 县令、知县、评事、推官、州判、豪商、主事、通判、知州、知府
 * L51-L66: elite    - 道员、按察使、布政使、巡抚、总督、尚书、大学士、太保
 * L67-L74: royal    - 亲王、郡王、议政王、铁帽子王、摄政王、监国太子、太上皇、皇帝
 */
const LEVEL_TO_CATEGORY: Record<number, OccupationCategory> = {
  // L0-L4: 底层体力劳动者
  0: 'labor',   // 流民
  1: 'labor',   // 雇工
  2: 'labor',   // 学徒
  3: 'labor',   // 小工
  4: 'labor',   // 杂役
  
  // L5-L10: 工匠/伙计/小贩
  5: 'craft',   // 伙计
  6: 'craft',   // 店铺伙计
  7: 'craft',   // 小贩
  8: 'craft',   // 力役脚夫
  9: 'craft',   // 工匠
  10: 'craft',  // 资深工匠
  
  // L11-L14: 商贾富户
  11: 'merchant', // 小商人
  12: 'merchant', // 小掌柜
  13: 'merchant', // 富户
  14: 'merchant', // 小地主
  
  // L15-L23: 衙门吏员
  15: 'clerk',  // 衙役
  16: 'clerk',  // 捕快
  17: 'clerk',  // 书吏
  18: 'clerk',  // 门子
  19: 'clerk',  // 账房
  20: 'clerk',  // 师爷
  21: 'clerk',  // 主簿
  22: 'clerk',  // 押司
  23: 'clerk',  // 大掌柜
  
  // L24-L34: 九品-八品（初级官员/文职）
  24: 'scholar', // 从九品·典史
  25: 'scholar', // 正九品·巡检
  26: 'scholar', // 从九品·教谕
  27: 'scholar', // 正九品·训导
  28: 'scholar', // 富商
  29: 'scholar', // 从八品·县丞
  30: 'scholar', // 正八品·州同
  31: 'scholar', // 从八品·学正
  32: 'scholar', // 正八品·教授
  33: 'scholar', // 从八品·训导
  34: 'scholar', // 大商人
  
  // L35-L50: 七品-五品（中级官员）
  35: 'official', // 从七品·县令
  36: 'official', // 正七品·知县
  37: 'official', // 从七品·评事
  38: 'official', // 正七品·推官
  39: 'official', // 从七品·州判
  40: 'official', // 豪商巨贾
  41: 'official', // 从六品·主事
  42: 'official', // 正六品·通判
  43: 'official', // 从六品·都事
  44: 'official', // 正六品·员外郎
  45: 'official', // 从六品·郎中
  46: 'official', // 从五品·知州
  47: 'official', // 正五品·知府
  48: 'official', // 从五品·同知
  49: 'official', // 正五品·参政
  50: 'official', // 从五品·佥事
  
  // L51-L66: 四品-一品（高级官员）
  51: 'elite', // 从四品·道员
  52: 'elite', // 正四品·知府
  53: 'elite', // 从四品·参政
  54: 'elite', // 正四品·参议
  55: 'elite', // 从三品·按察使
  56: 'elite', // 正三品·布政使
  57: 'elite', // 从三品·副使
  58: 'elite', // 正三品·参政
  59: 'elite', // 从二品·巡抚
  60: 'elite', // 正二品·总督
  61: 'elite', // 从二品·侍郎
  62: 'elite', // 正二品·巡抚（加衔）
  63: 'elite', // 从一品·尚书
  64: 'elite', // 正一品·大学士
  65: 'elite', // 从一品·太子太保
  66: 'elite', // 正一品·少傅
  
  // L67-L74: 皇室成员
  67: 'royal', // 亲王（低俸）
  68: 'royal', // 郡王
  69: 'royal', // 亲王（高俸）
  70: 'royal', // 议政王
  71: 'royal', // 铁帽子王
  72: 'royal', // 摄政王
  73: 'royal', // 监国太子
  74: 'royal', // 太上皇
};

/**
 * 根据Level直接获取官职分类（最准确的方式）
 * @param level 官职等级 (0-74)
 * @returns 官职类型
 */
export function classifyByLevel(level: number): OccupationCategory {
  // 直接查表
  if (LEVEL_TO_CATEGORY[level]) {
    return LEVEL_TO_CATEGORY[level];
  }
  
  // 兜底：按范围判断
  if (level >= 67) return 'royal';
  if (level >= 51) return 'elite';
  if (level >= 35) return 'official';
  if (level >= 24) return 'scholar';
  if (level >= 15) return 'clerk';
  if (level >= 11) return 'merchant';
  if (level >= 5) return 'craft';
  return 'labor';
}

/**
 * 根据官职等级和名称识别类型（兼容旧接口）
 * @param _title 官职名称（未使用，保留兼容性）
 * @param level 官职等级
 * @returns 官职类型
 */
export function classifyOccupationWithLevel(_title: string, level: number): OccupationCategory {
  return classifyByLevel(level);
}

/**
 * 根据官职名称识别类型（兼容旧接口，但推荐使用classifyByLevel）
 * @param title 官职名称
 * @returns 官职类型
 */
export function classifyOccupation(title: string): OccupationCategory {
  // 保留关键词匹配作为兜底（当没有level信息时）
  const keywords: Record<string, OccupationCategory> = {
    '皇帝': 'royal', '太上皇': 'royal', '亲王': 'royal', '郡王': 'royal',
    '王爷': 'royal', '太子': 'royal', '摄政': 'royal', '铁帽子': 'royal',
    
    '尚书': 'elite', '侍郎': 'elite', '大学士': 'elite', '总督': 'elite',
    '巡抚': 'elite', '布政使': 'elite', '按察使': 'elite', '道员': 'elite',
    
    '知府': 'official', '知州': 'official', '知县': 'official', '通判': 'official',
    '县令': 'official', '推官': 'official', '员外郎': 'official', '郎中': 'official',
    
    '教谕': 'scholar', '训导': 'scholar', '学正': 'scholar', '教授': 'scholar',
    '县丞': 'scholar', '典史': 'scholar', '巡检': 'scholar',
    
    '押司': 'clerk', '师爷': 'clerk', '主簿': 'clerk', '书吏': 'clerk',
    '衙役': 'clerk', '捕快': 'clerk', '门子': 'clerk', '账房': 'clerk',
    
    '掌柜': 'merchant', '商人': 'merchant', '地主': 'merchant', '富户': 'merchant',
    
    '工匠': 'craft', '伙计': 'craft', '小贩': 'craft', '脚夫': 'craft',
    
    '流民': 'labor', '雇工': 'labor', '学徒': 'labor', '小工': 'labor',
  };
  
  for (const [keyword, category] of Object.entries(keywords)) {
    if (title.includes(keyword)) {
      return category;
    }
  }
  
  return 'clerk'; // 默认
}
