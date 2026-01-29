// 场景生成器 - 决策树内容生成系统核心逻辑

import type { UserInput } from '../types';
import type { SceneContent } from './sceneContent';
import {
  DEFAULT_SCENE,
  SCENE_POOL,
  ENV_VARIANTS,
  CITY_FRAGMENTS,
} from './sceneContent';

// ========== 收入等级计算 ==========
export function getIncomeLevel(level: number): string {
  if (level <= 5) return 'poor';
  if (level <= 10) return 'low';
  if (level <= 15) return 'middle';
  if (level <= 20) return 'high';
  return 'elite';
}

// ========== 核心层：查找基础场景 ==========
function findCoreScene(
  occType: string,
  incLevel: string,
  overtime: string
): SceneContent {
  const key = `${occType}_${incLevel}_${overtime}`;
  
  // 1. 精确匹配
  if (SCENE_POOL[key]) {
    return { ...SCENE_POOL[key] };
  }
  
  // 2. 回退策略
  const fallbacks = [
    // 同职业同收入，尝试 normal 加班
    `${occType}_${incLevel}_normal`,
    // 同职业同加班，尝试 middle 收入
    `${occType}_middle_${overtime}`,
    // 同职业，默认配置
    `${occType}_middle_normal`,
    // 脑力作为通用兜底
    `mental_${incLevel}_${overtime}`,
    `mental_${incLevel}_normal`,
    `mental_middle_${overtime}`,
    // 最终兜底
    `mental_middle_normal`,
  ];
  
  for (const fb of fallbacks) {
    if (SCENE_POOL[fb]) {
      return { ...SCENE_POOL[fb] };
    }
  }
  
  return { ...DEFAULT_SCENE };
}

// ========== 环境变体层：处理远程/外勤 ==========
function applyEnvVariant(
  scene: SceneContent,
  workEnv: string,
  incLevel: string
): SceneContent {
  const result = { ...scene };
  
  if (workEnv === 'remote') {
    const variant = ENV_VARIANTS[`remote_${incLevel}`];
    if (variant?.morning) {
      result.morning = variant.morning;
    }
  } else if (workEnv === 'outdoor') {
    const variant = ENV_VARIANTS[`outdoor_${incLevel}`];
    if (variant?.morning) {
      result.morning = variant.morning;
    }
    if (variant?.afternoon) {
      result.afternoon = variant.afternoon;
    }
  }
  
  return result;
}

// ========== 城市修饰层：片段替换 ==========
function applyCityFragments(
  scene: SceneContent,
  cityTier: string
): SceneContent {
  const result = { ...scene };
  const fragments = CITY_FRAGMENTS[`tier${cityTier}`] || CITY_FRAGMENTS.tier3;
  
  // 追加片段
  if (fragments.morningAppend) {
    result.morning += fragments.morningAppend;
  }
  if (fragments.eveningAppend) {
    result.evening += fragments.eveningAppend;
  }
  
  // 词汇替换
  for (const [from, to] of fragments.replaces) {
    const regex = new RegExp(from, 'g');
    result.morning = result.morning.replace(regex, to);
    result.afternoon = result.afternoon.replace(regex, to);
    result.evening = result.evening.replace(regex, to);
  }
  
  return result;
}

// ========== 附加修饰符：资历、福利 ==========
function applyBonusModifiers(
  scene: SceneContent,
  ctx: { workYears: string; benefits: string; level: number }
): SceneContent {
  const result = { ...scene };
  
  // 资深员工
  if (['8-15', '15+'].includes(ctx.workYears)) {
    result.afternoon += ' 不时有后辈前来请教，自己也乐于指点一二。';
  }
  
  // 福利优渥 + 高收入
  if (ctx.benefits === 'excellent' && ctx.level >= 15) {
    result.evening += ' 另有东家送来的节礼，生活甚是优渥。';
  }
  
  // 新人入职
  if (ctx.workYears === '0-1') {
    result.mood = result.mood + '，初入此道，诸事生疏';
  }
  
  return result;
}

// ========== 主函数：组合三层生成场景 ==========
export function generateScene(userInput: UserInput, level: number): SceneContent {
  const incLevel = getIncomeLevel(level);
  
  // 1. 核心层：获取基础场景
  let scene = findCoreScene(
    userInput.occupationType,
    incLevel,
    userInput.overtimeFreq
  );
  
  // 2. 环境变体层：处理远程/外勤
  scene = applyEnvVariant(scene, userInput.workEnv, incLevel);
  
  // 3. 城市修饰层：片段替换
  scene = applyCityFragments(scene, userInput.cityTier);
  
  // 4. 附加修饰符
  scene = applyBonusModifiers(scene, {
    workYears: userInput.workYears,
    benefits: userInput.benefits,
    level,
  });
  
  return scene;
}

// ========== 导出生成的每日生活 ==========
export interface GeneratedDailyLife {
  morning: string;
  afternoon: string;
  evening: string;
  mood: string;
}

export function generateDailyLifeFromScene(userInput: UserInput, level: number): GeneratedDailyLife {
  const scene = generateScene(userInput, level);
  return {
    morning: scene.morning,
    afternoon: scene.afternoon,
    evening: scene.evening,
    mood: scene.mood,
  };
}
