import { useState, useMemo, useEffect, useCallback } from 'react';
import type { UserInput } from '@/types';
import { 
  OVERTIME_OPTIONS, 
  WORK_YEARS_OPTIONS, 
  WORK_ENV_OPTIONS, 
  BENEFITS_OPTIONS,
  CITY_TIER_OPTIONS,
  FAMILY_SIZE_OPTIONS
} from '@/types';
import { Scroll, Coins, Gift, Calendar, Building2, MapPin, Heart, Briefcase, Scale, Users } from 'lucide-react';

import { Footer } from '@/components/Footer';

// ========== localStorage 缓存 ==========
const STORAGE_KEY = 'ancient-salary-form-data';

// 从 localStorage 读取数据
function loadFormData(): Partial<UserInput> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('读取缓存失败:', e);
  }
  return null;
}

// 保存数据到 localStorage
function saveFormData(data: UserInput): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('保存缓存失败:', e);
  }
}

// 必填标识组件 - 紧凑上标样式
const RequiredMark = () => (
  <span className="text-[#C9372C] text-xs align-super" title="必填">*</span>
);

// 选填标识组件 - 更紧凑
const OptionalMark = () => (
  <span className="text-[#8B7355] text-[10px] ml-0.5 opacity-50">选填</span>
);

// ========== 动态购买力平价模型（PPP）==========
// 库平银标准：1两 = 37.3克
const KUPING_SILVER_WEIGHT = 37.3;
// 历史购买力参考值：基于史料综合估算（参考值，非精确值）
const PPP_ANCHOR = 600;
// PPP混合权重：市价权重（0-1），剩余为历史购买力权重
const MARKET_WEIGHT = 0.35;

/**
 * 计算动态购买力平价汇率
 * @param silverPricePerGram 今日银价（元/克）
 * @returns { marketRate, pppRate, explanation }
 */
function calculatePPPExchangeRate(silverPricePerGram: number | undefined): {
  finalRate: number;
  marketRate: number;
  explanation: string;
} {
  // 如果未输入银价，返回默认锚点值
  if (!silverPricePerGram || silverPricePerGram <= 0) {
    return {
      finalRate: PPP_ANCHOR,
      marketRate: 0,
      explanation: ''
    };
  }

  // 步骤A：计算白银基准市价（银价 × 库平银标准重）
  const marketRate = Math.round(silverPricePerGram * KUPING_SILVER_WEIGHT);
  
  // 步骤B：PPP混合加权校正
  // 最终汇率 = 市价权重 × 白银基准市价 + 历史权重 × PPP锚点
  const finalRate = Math.round(MARKET_WEIGHT * marketRate + (1 - MARKET_WEIGHT) * PPP_ANCHOR);
  
  // 生成解释文案
  const explanation = `系统依据阁下录入之银价（${silverPricePerGram}元/克），结合《宛署杂记》中史实进行购买力平价（PPP）校正。白银基准市价：${silverPricePerGram}元/克 × ${KUPING_SILVER_WEIGHT}克/两 = ${marketRate}元/两；经PPP加权校正后，最终核算：1两白银 ≈ ${finalRate}元人民币。`;
  
  return {
    finalRate,
    marketRate,
    explanation
  };
}

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
}

// 默认表单数据
const DEFAULT_FORM_DATA: UserInput = {
  annualSalary: 0,
  overtimeFreq: 'normal',
  bonus: 0,
  exchangeRate: 1000,
  silverPricePerGram: undefined,
  calculationMode: 'weight',  // 默认克重换算
  familySize: 1,  // 默认1人
  workYears: '1-3',
  workEnv: 'office',
  benefits: 'good',
  cityTier: '2',
};

export default function InputForm({ onSubmit }: InputFormProps) {
  // 初始化时从 localStorage 读取已保存的数据
  const [formData, setFormData] = useState<UserInput>(() => {
    const saved = loadFormData();
    if (saved) {
      return { ...DEFAULT_FORM_DATA, ...saved };
    }
    return DEFAULT_FORM_DATA;
  });

  // 数据变化时自动保存到 localStorage
  const updateFormData = useCallback((newData: UserInput) => {
    setFormData(newData);
    saveFormData(newData);
  }, []);

  // 使用PPP模型计算汇率
  const pppResult = useMemo(() => {
    return calculatePPPExchangeRate(formData.silverPricePerGram);
  }, [formData.silverPricePerGram]);

  // 根据选择的计算模式确定有效汇率
  const effectiveExchangeRate = useMemo(() => {
    if (formData.calculationMode === 'weight') {
      // 克重换算模式：使用白银克重 × 银价
      const silverPrice = formData.silverPricePerGram || 16; 
      return Math.round(KUPING_SILVER_WEIGHT * silverPrice);
    } else {
      // PPP模式：使用混合加权的购买力平价汇率
      if (formData.silverPricePerGram && formData.silverPricePerGram > 0) {
        return pppResult.finalRate;
      }
      return formData.exchangeRate;
    }
  }, [formData.calculationMode, formData.silverPricePerGram, formData.exchangeRate, pppResult.finalRate]);
  
  // 组件挂载时检查是否有缓存数据，提示用户
  const [showCacheHint, setShowCacheHint] = useState(false);
  useEffect(() => {
    const saved = loadFormData();
    if (saved && saved.annualSalary) {
      setShowCacheHint(true);
      // 3秒后自动隐藏提示
      const timer = setTimeout(() => setShowCacheHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.annualSalary > 0) {
      // 提交时使用PPP计算后的汇率
      onSubmit({
        ...formData,
        exchangeRate: effectiveExchangeRate
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-0 sm:px-4 py-8 relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#C9372C" strokeWidth="2"/>
            <text x="50" y="55" textAnchor="middle" fill="#C9372C" fontSize="20" className="font-ancient">官</text>
          </svg>
        </div>
        <div className="absolute bottom-20 right-10 w-40 h-40 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M20,50 Q50,20 80,50 Q50,80 20,50" fill="none" stroke="#2E4A62" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* 主容器 */}
      <div className="relative w-full max-w-2xl fade-in z-10">
        {/* 顶部匾额 */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block relative">
            <div className="bg-[#2E4A62] text-[#F5E6C8] px-6 sm:px-12 py-3 sm:py-4 rounded-sm shadow-lg border-2 border-[#C9A961]/30">
              <h1 className="font-ancient text-2xl sm:text-4xl tracking-[0.2em] sm:tracking-[0.3em] text-shadow-ancient">
                官途算略
              </h1>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-[#C9A961]"></div>
          </div>
          <p className="mt-3 sm:mt-4 text-[#5A4A3A] text-sm sm:text-lg tracking-wider font-medium">
            看看你穿越回古代的生活待遇如何
          </p>
        </div>

        {/* 奏折表单 */}
        <div className="scroll-fold rounded-lg p-4 sm:p-6 md:p-12 relative overflow-hidden">
          {/* 奏折装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C9A961] via-[#8B7355] to-[#C9A961] opacity-30"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* 标题 */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="font-ancient text-2xl sm:text-3xl text-[#2E4A62] flex items-center justify-center gap-2 sm:gap-3">
                <Scroll className="w-6 h-6 sm:w-8 sm:h-8 text-[#C9372C]" />
                呈递履历
              </h2>
              <div className="mt-2 sm:mt-3 w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-[#C9372C] to-transparent mx-auto opacity-50"></div>
              
              {/* 缓存恢复提示 */}
              {showCacheHint && (
                <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-[#2E4A62] bg-[#C9A961]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-2 fade-in">
                  <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-pulse"></span>
                  已恢复上次填写的内容
                </div>
              )}
            </div>

            {/* 必填说明 */}
            <div className="text-[10px] sm:text-xs text-[#8B7355] text-right mb-2 opacity-70">
              <span className="text-[#C9372C]">*</span> 为必填项
            </div>

            {/* 基本信息区域 */}
            <div className="space-y-4 sm:space-y-6">
              {/* 年薪 - 必填 */}
              <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-1.5 sm:gap-2 md:gap-4 items-center">
                <span className="text-[#5A4A3A] text-base sm:text-lg font-ancient flex items-center gap-1 whitespace-nowrap">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A961] flex-shrink-0" />
                  岁入银两<RequiredMark />
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="number"
                    value={formData.annualSalary || ''}
                    onChange={(e) => updateFormData({ ...formData, annualSalary: Number(e.target.value) })}
                    placeholder="税前年薪"
                    className="ancient-input flex-1 text-base sm:text-lg text-left pl-3 sm:pl-4 font-bold text-[#2E4A62]"
                    min="0"
                    required
                  />
                  <span className="text-[#5A4A3A] text-base sm:text-lg font-ancient">元</span>
                </div>
              </div>

              {/* 年终奖 - 选填 */}
              <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-1.5 sm:gap-2 md:gap-4 items-center">
                <span className="text-[#5A4A3A] text-base sm:text-lg font-ancient flex items-center gap-1 whitespace-nowrap">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9372C] flex-shrink-0" />
                  冰敬炭敬<OptionalMark />
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="number"
                    value={formData.bonus || ''}
                    onChange={(e) => updateFormData({ ...formData, bonus: Number(e.target.value) })}
                    placeholder="年终奖/福利"
                    className="ancient-input flex-1 text-base sm:text-lg text-left pl-3 sm:pl-4"
                    min="0"
                  />
                  <span className="text-[#5A4A3A] text-base sm:text-lg font-ancient">元</span>
                </div>
              </div>

              {/* 家庭人口 - 用于计算生活成本 */}
              <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-1.5 sm:gap-2 md:gap-4 items-center">
                <span className="text-[#5A4A3A] text-base sm:text-lg font-ancient flex items-center gap-1 whitespace-nowrap">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7355] flex-shrink-0" />
                  家中几口
                </span>
                <div className="relative">
                  <select
                    value={formData.familySize}
                    onChange={(e) => updateFormData({ ...formData, familySize: Number(e.target.value) as UserInput['familySize'] })}
                    className="ancient-input w-full text-base sm:text-lg bg-transparent cursor-pointer appearance-none text-left pl-3 sm:pl-4"
                  >
                    {FAMILY_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#8B7355] mt-1 pl-2 opacity-80">
                    {FAMILY_SIZE_OPTIONS.find(o => o.value === formData.familySize)?.desc}
                  </p>
                </div>
              </div>

              {/* 动态购买力平价模型 - 汇率设置 */}
              <div className="mt-2 p-3 sm:p-4 bg-[#C9A961]/10 rounded border border-[#C9A961]/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3">
                  <span className="text-[#5A4A3A] text-sm sm:text-sm font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C9A961]" />
                    白银汇率设置
                  </span>
                  <span className="text-xs text-[#8B7355] italic">参考《宛署杂记》· PPP模型</span>
                </div>
                
                {/* 计算模式选择 */}
                <div className="mb-3 p-2 bg-white/70 rounded border border-[#C9A961]/30">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateFormData({ ...formData, calculationMode: 'weight' })}
                      className={`px-3 py-2 rounded text-xs sm:text-sm transition-all ${
                        formData.calculationMode === 'weight'
                          ? 'bg-[#C9372C] text-white font-bold'
                          : 'bg-white text-[#5A4A3A] hover:bg-[#C9372C]/10'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>克重换算</span>
                        <span className="text-[10px] opacity-70">简单直接</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData({ ...formData, calculationMode: 'ppp' })}
                      className={`px-3 py-2 rounded text-xs sm:text-sm transition-all ${
                        formData.calculationMode === 'ppp'
                          ? 'bg-[#2E4A62] text-white font-bold'
                          : 'bg-white text-[#5A4A3A] hover:bg-[#2E4A62]/10'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>PPP购买力</span>
                        <span className="text-[10px] opacity-70">科学准确 ✓</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8B7355] mt-2 text-center">
                    {formData.calculationMode === 'weight' 
                      ? '警告：克重换算仅考虑白银重量，不考虑历史购买力变化'
                      : '推荐：PPP购买力平价参考史料，综合估算历史购买力'}
                  </p>
                </div>
                
                {/* 克重模式：显示银价输入 */}
                {formData.calculationMode === 'weight' && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white/50 rounded border border-[#C9A961]/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <span className="text-[#5A4A3A] text-sm font-medium whitespace-nowrap flex items-center">
                        今日银价
                        <OptionalMark />
                      </span>
                      <input
                        type="number"
                        value={formData.silverPricePerGram || ''}
                        onChange={(e) => updateFormData({ 
                          ...formData, 
                          silverPricePerGram: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        placeholder="输入当前银价"
                        className="ancient-input flex-1 text-center text-base sm:text-lg font-bold text-[#2E4A62]"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-[#5A4A3A] text-sm whitespace-nowrap">元/克</span>
                    </div>
                    <p className="text-xs text-[#8B7355] opacity-70">
                      可查询今日实时银价填入，按克重换算（默认6元/克）
                    </p>
                  </div>
                )}
                
                {/* PPP模式：显示实物购买力说明 */}
                {formData.calculationMode === 'ppp' && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-[#2E4A62]/5 rounded border border-[#2E4A62]/20">
                    <div className="text-sm text-[#5A4A3A] space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-[#2E4A62] font-bold text-lg">史</span>
                        <div className="flex-1">
                          <p className="font-medium text-[#2E4A62]">基于《宛署杂记》史料核算</p>
                          <p className="text-xs text-[#8B7355] mt-1">明万历二十一年至二十四年（1593-1596年）北京宛平县实录物价</p>
                        </div>
                      </div>
                      <div className="pl-6 space-y-1 text-xs leading-relaxed">
                        <p className="text-[#5A4A3A]">
                          <span className="font-medium">史料记载：</span>白米每石（约120市斤）售银0.6-0.7两
                        </p>
                        <p className="text-[#5A4A3A]">
                          <span className="font-medium">换算：</span>1两白银 ≈ 购大米约<span className="text-[#C9372C] font-bold">170-200斤</span>
                        </p>
                        <p className="text-[#5A4A3A]">
                          <span className="font-medium">现代米价：</span>约2.85元/斤（2026年1月商务部数据）
                        </p>
                        <p className="text-[#5A4A3A]">
                          <span className="font-medium">米价基准：</span>180斤 × 2.85元/斤 ≈ 513元
                        </p>
                        <p className="text-[#2E4A62] font-bold">
                          系统采用：1两白银 = 1000元（参考估算值）
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#2E4A62]/10">
                        <p className="text-xs text-[#8B7355] italic">
                          说明：单纯米价换算约513元。考虑到明代与现代的生活成本结构差异（住房、交通、服务等占比不同）及通货因素，系统采用600元作为综合参考值，便于理解和对比
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 汇率结果显示 */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <span className="text-[#5A4A3A] text-sm sm:text-base">1两白银 =</span>
                  <div className="relative">
                    {formData.calculationMode === 'ppp' ? (
                      // PPP模式：固定显示1000元
                      <div className="ancient-input w-24 sm:w-28 text-center text-base sm:text-lg font-bold text-[#2E4A62] bg-[#2E4A62]/5 cursor-not-allowed">
                        {PPP_ANCHOR}
                      </div>
                    ) : (
                      // 克重模式：可编辑
                      <input
                        type="number"
                        value={effectiveExchangeRate}
                        onChange={(e) => {
                          updateFormData({ 
                            ...formData, 
                            exchangeRate: Number(e.target.value) || 1000,
                            silverPricePerGram: e.target.value ? formData.silverPricePerGram : undefined
                          });
                        }}
                        className="ancient-input w-24 sm:w-28 text-center text-base sm:text-lg font-bold text-[#2E4A62]"
                        min="1"
                      />
                    )}
                  </div>
                  <span className="text-[#5A4A3A] text-sm sm:text-base">元人民币</span>
                </div>

                {/* 计算说明 */}
                <div className="text-xs text-[#5A4A3A] mt-2 sm:mt-3 p-2 bg-[#F5E6C8]/50 rounded border-l-2 border-[#C9372C]">
                  {formData.calculationMode === 'ppp' ? (
                    <div>
                      <p className="leading-relaxed">
                        <span className="font-medium text-[#2E4A62]">PPP购买力平价模式</span>
                        <br />
                        参考《宛署杂记》《醒贪简要录》等史料，综合估算购买力
                      </p>
                      <p className="mt-1 font-bold text-[#C9372C]">
                        1两白银 = {PPP_ANCHOR}元（参考值）
                      </p>
                      <p className="mt-1 text-[10px] text-[#8B7355] opacity-80">
                        基于史料中米价、工钱等指标，结合现代生活成本结构综合估算
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="leading-relaxed">
                        <span className="font-medium">克重换算模式</span>
                        <br />
                        当前银价 {formData.silverPricePerGram || 18}元/克 × 库平银{KUPING_SILVER_WEIGHT}克/两 = {effectiveExchangeRate}元/两
                      </p>
                      <p className="mt-1 text-[#C9372C] font-medium">
                        ⚠️ 此模式仅考虑白银重量，未考虑购买力变化，结果可能偏差较大
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center gap-4 py-2 opacity-60">
              <div className="flex-1 h-px bg-[#8B7355]"></div>
              <span className="text-[#8B7355] text-xs font-ancient tracking-widest">更多履历信息</span>
              <div className="flex-1 h-px bg-[#8B7355]"></div>
            </div>

            {/* 详细选项区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* 工作年限 */}
              <div className="space-y-1">
                <span className="text-[#5A4A3A] text-xs sm:text-sm font-ancient flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
                  仕途资历
                </span>
                <div className="relative">
                  <select
                    value={formData.workYears}
                    onChange={(e) => updateFormData({ ...formData, workYears: e.target.value as UserInput['workYears'] })}
                    className="ancient-input w-full text-sm sm:text-base bg-transparent cursor-pointer appearance-none text-left pl-2"
                  >
                    {WORK_YEARS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* 工作环境 */}
              <div className="space-y-1">
                <span className="text-[#5A4A3A] text-xs sm:text-sm font-ancient flex items-center gap-2 mb-1">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
                  衙署所在
                </span>
                <div className="relative">
                  <select
                    value={formData.workEnv}
                    onChange={(e) => updateFormData({ ...formData, workEnv: e.target.value as UserInput['workEnv'] })}
                    className="ancient-input w-full text-sm sm:text-base bg-transparent cursor-pointer appearance-none text-left pl-2"
                  >
                    {WORK_ENV_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* 公司福利 */}
              <div className="space-y-1">
                <span className="text-[#5A4A3A] text-xs sm:text-sm font-ancient flex items-center gap-2 mb-1">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
                  朝廷恩赏
                </span>
                <div className="relative">
                  <select
                    value={formData.benefits}
                    onChange={(e) => updateFormData({ ...formData, benefits: e.target.value as UserInput['benefits'] })}
                    className="ancient-input w-full text-sm sm:text-base bg-transparent cursor-pointer appearance-none text-left pl-2"
                  >
                    {BENEFITS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* 城市级别 */}
              <div className="space-y-1">
                <span className="text-[#5A4A3A] text-xs sm:text-sm font-ancient flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
                  治所所在
                </span>
                <div className="relative">
                  <select
                    value={formData.cityTier}
                    onChange={(e) => updateFormData({ ...formData, cityTier: e.target.value as UserInput['cityTier'] })}
                    className="ancient-input w-full text-sm sm:text-base bg-transparent cursor-pointer appearance-none text-left pl-2"
                  >
                    {CITY_TIER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* 加班频率 */}
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[#5A4A3A] text-xs sm:text-sm font-ancient flex items-center gap-2 mb-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
                  劳作强度
                </span>
                <div className="relative">
                  <select
                    value={formData.overtimeFreq}
                    onChange={(e) => updateFormData({ ...formData, overtimeFreq: e.target.value as UserInput['overtimeFreq'] })}
                    className="ancient-input w-full text-sm sm:text-base bg-transparent cursor-pointer appearance-none text-left pl-2"
                  >
                    {OVERTIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}（{opt.hours}）
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8B7355]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 opacity-60">
              <div className="flex-1 h-px bg-[#8B7355]"></div>
              <span className="text-[#8B7355] text-xs sm:text-sm font-ancient">（恳请过目）</span>
              <div className="flex-1 h-px bg-[#8B7355]"></div>
            </div>

            {/* 提交按钮 */}
            <div className="text-center">
              <button
                type="submit"
                className="ancient-btn pulse-glow text-lg sm:text-xl px-8 sm:px-12 py-2.5 sm:py-3 rounded hover:scale-105 transform transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">呈递吏部</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </form>

          {/* 底部装饰 */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-[#8B7355] text-[10px] sm:text-xs opacity-70">
              <div className="w-6 sm:w-8 h-px bg-[#8B7355]"></div>
              <span>基于《宛署杂记》《醒贪简要录》</span>
              <div className="w-6 sm:w-8 h-px bg-[#8B7355]"></div>
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-4 sm:mt-6 text-center text-[#8B7355] text-[10px] sm:text-xs opacity-80 px-4">
          <p>默认换算：1000元人民币 ≈ 1两白银（明朝万历年间购买力锚点）</p>
          <p className="mt-1">库平银标准：1两 = {KUPING_SILVER_WEIGHT}克</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
