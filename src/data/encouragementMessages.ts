// 亏空时的鼓励语 - 根据官职类型提供不同的鼓励

import type { OccupationCategory } from './occupationClassifier';

/**
 * 根据官职类型获取亏空时的鼓励语
 * @param category 官职类型
 * @returns 鼓励语
 */
export function getEncouragementMessage(category: OccupationCategory): string {
  const messages: Record<OccupationCategory, string[]> = {
    labor: [
      '虽然艰难，但总有出头之日！',
      '勤劳终会有回报，莫灰心！',
      '今日之苦，他日必能苦尽甘来！',
      '天道酬勤，坚持下去！'
    ],
    
    craft: [
      '总有一天会学成归来的！',
      '手艺精进，前程似锦！',
      '磨刀不误砍柴工，技艺日精自有出头之日！',
      '三年学徒，七年小成，坚持便是胜利！',
      '今日伙计，他日掌柜！',
      '勤快机灵，终会有赏识之人！'
    ],
    
    merchant: [
      '生意有起落，今年亏来年赚！',
      '塞翁失马，焉知非福？暂时亏损不算什么！',
      '做生意讲究细水长流，莫急莫躁！',
      '熬过这关，定能东山再起！'
    ],
    
    clerk: [
      '公门之中，忍耐为上，他日必有升迁！',
      '今日清贫，他日必有出头之日！',
      '熬资历、长见识，前程不可限量！',
      '衙门路长，且行且珍惜！'
    ],
    
    scholar: [
      '书中自有黄金屋，坚持学问必有回报！',
      '十年寒窗苦，一朝得意时！',
      '才学在身，不愁前程！',
      '暂时清贫，乃士人本色，莫忘初心！'
    ],
    
    official: [
      '为官一任，造福一方，清廉自守方为正道！',
      '官场沉浮，守得云开见月明！',
      '清廉自守，上天自有眷顾！',
      '忠臣不惧暂时困顿，日后必有重用！'
    ],
    
    elite: [
      '位高权重，清廉自守方是正途！',
      '为国为民，不计个人得失！',
      '封疆大吏，当以苍生为念！',
      '大器晚成，暂时艰难实乃磨砺！'
    ],
    
    royal: [
      '皇室虽尊，亦需节俭持家！',
      '天潢贵胄，当以天下为己任！',
      '龙子龙孙，自有天福庇佑！',
      '君王之道，在于仁政爱民，非在奢华！'
    ]
  };
  
  const categoryMessages = messages[category];
  
  // 随机选择一条鼓励语（使用时间戳保证每次刷新可能不同）
  const index = Math.floor(Date.now() / 1000) % categoryMessages.length;
  return categoryMessages[index];
}
