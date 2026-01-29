// 场景生成器 - 基于官职类型的智能场景匹配

import type { UserInput } from '../types';
import type { SceneContent } from './sceneContent';
import {
  getSceneByCategory,
  applySceneModifiers,
} from './sceneContent';
import { classifyOccupationWithLevel } from './occupationClassifier';

// ========== 场景生成主函数 ==========
/**
 * 根据官职名称和用户输入生成完整场景
 * @param userInput 用户输入
 * @param level 收入等级
 * @param title 官职名称
 * @param normalizedQoL 归一化后的生活质量（未使用，保留接口兼容性）
 * @returns 场景内容
 */
export function generateScene(
  userInput: UserInput,
  level: number,
  title: string,
  normalizedQoL: number
): SceneContent {
  // 1. 根据官职名称和等级识别官职类型
  const category = classifyOccupationWithLevel(title, level);
  
  // 2. 根据官职类型和加班强度获取基础场景
  const baseScene = getSceneByCategory(category, userInput.overtimeFreq);
  
  // 3. 应用修饰（城市、年限、福利等）
  const finalScene = applySceneModifiers(baseScene, {
    workEnv: userInput.workEnv,
    cityTier: userInput.cityTier,
    workYears: userInput.workYears,
    benefits: userInput.benefits,
    overtime: userInput.overtimeFreq,
    level: level,
  });
  
  return finalScene;
}

// ========== 导出生成的每日生活 ==========
export interface GeneratedDailyLife {
  morning: string;
  afternoon: string;
  evening: string;
  mood: string;
}

export function generateDailyLifeFromScene(
  userInput: UserInput,
  level: number,
  title: string,
  normalizedQoL: number
): GeneratedDailyLife {
  const scene = generateScene(userInput, level, title, normalizedQoL);
  return {
    morning: scene.morning,
    afternoon: scene.afternoon,
    evening: scene.evening,
    mood: scene.mood,
  };
}
