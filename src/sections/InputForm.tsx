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
// 历史购买力锚点：明万历年间1两白银的购买力（约等于现代1000元人民币）
const PPP_ANCHOR = 1000;
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

  // 当PPP计算结果变化时，更新汇率
  const effectiveExchangeRate = formData.silverPricePerGram && formData.silverPricePerGram > 0 
    ? pppResult.finalRate 
    : formData.exchangeRate;
  
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
                
                {/* 银价输入 - 选填 */}
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
                    可查询今日实时银价填入，系统将自动计算PPP汇率
                  </p>
                </div>

                {/* 汇率结果显示 */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <span className="text-[#5A4A3A] text-sm sm:text-base">1两白银 =</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={effectiveExchangeRate}
                      onChange={(e) => {
                        // 手动修改时清除银价，使用手动输入的汇率
                        updateFormData({ 
                          ...formData, 
                          exchangeRate: Number(e.target.value) || 1000,
                          silverPricePerGram: undefined
                        });
                      }}
                      className="ancient-input w-24 sm:w-28 text-center text-base sm:text-lg font-bold text-[#2E4A62]"
                      min="1"
                    />
                    {formData.silverPricePerGram && formData.silverPricePerGram > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#C9372C] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[#5A4A3A] text-sm sm:text-base">元人民币</span>
                </div>

                {/* 动态计算说明 */}
                {formData.silverPricePerGram && formData.silverPricePerGram > 0 ? (
                  <div className="text-xs text-[#5A4A3A] mt-2 sm:mt-3 p-2 bg-[#F5E6C8]/50 rounded border-l-2 border-[#C9372C]">
                    <p className="leading-relaxed">
                      <span className="italic">系统依据阁下录入之银价，结合《宛署杂记》中史实进行购买力平价（PPP）校正。</span>
                    </p>
                    <p className="mt-1 leading-relaxed">
                      <span className="text-[#8B7355]">
                        基准市价：{formData.silverPricePerGram}元/克 × {KUPING_SILVER_WEIGHT}克/两 = {pppResult.marketRate}元/两
                      </span>
                    </p>
                    <p className="mt-1 font-bold text-[#2E4A62]">
                      最终核算：<span className="text-[#C9372C]">1两白银 ≈ {pppResult.finalRate}元人民币</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#8B7355] mt-2 opacity-80">
                    默认值1000元/两（明朝万历年间购买力锚点），您可输入今日银价自动计算，或直接手动调整
                  </p>
                )}
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
