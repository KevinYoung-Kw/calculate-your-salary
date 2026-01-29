import { useEffect, useState } from 'react';
import { BookOpen, Calculator, Scroll, Stamp } from 'lucide-react';

interface CalculatingProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  { icon: BookOpen, text: '查阅《宛署杂记》...' },
  { icon: Calculator, text: '核算购买力平价...' },
  { icon: Scroll, text: '比对《醒贪简要录》俸禄体系...' },
  { icon: Stamp, text: '拟定官阶...' },
];

export default function Calculating({ onComplete }: CalculatingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="abacus" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="#2E4A62"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#abacus)"/>
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* 主容器 */}
        <div className="scroll-fold rounded-lg p-10 text-center relative overflow-hidden shadow-2xl">
          {/* 装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent opacity-50"></div>

          {/* 标题 */}
          <h2 className="font-ancient text-4xl text-[#2E4A62] mb-8 font-bold tracking-widest">
            吏部核算中
          </h2>

          {/* 进度条容器 */}
          <div className="relative mb-12 px-4">
            {/* 印章进度条背景 */}
            <div className="h-4 bg-[#E5D5B8]/30 rounded-full overflow-hidden border border-[#8B7355]/20">
              <div 
                className="h-full bg-gradient-to-r from-[#C9372C] to-[#D94A3F] transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
              </div>
            </div>
            
            {/* 印章图标 */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10"
              style={{ left: `calc(${progress}% - 16px)` }}
            >
              <div className="w-12 h-12 bg-[#C9372C] rounded shadow-lg flex items-center justify-center transform rotate-12 border-2 border-[#E5D5B8]">
                <div className="border border-[#E5D5B8]/50 w-10 h-10 flex items-center justify-center">
                    <span className="text-[#E5D5B8] font-ancient text-sm font-bold writing-vertical">吏部</span>
                </div>
              </div>
            </div>
          </div>


          {/* 步骤列表 */}
          <div className="space-y-4">
            {LOADING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isPast = index < currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-center gap-3 transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? 'bg-[#2E4A62] text-[#F5E6C8]' 
                      : 'bg-[#E5D5B8] text-[#8B7355]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-lg transition-all duration-500 ${
                    isActive ? 'text-[#2E4A62]' : 'text-[#8B7355]'
                  }`}>
                    {step.text}
                  </span>
                  {isPast && (
                    <span className="text-[#C9372C] text-sm">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 装饰算盘 */}
          <div className="mt-10 flex justify-center">
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-0.5 h-8 bg-[#8B7355]"></div>
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i <= (progress / 100) * 6 ? 'bg-[#C9372C]' : 'bg-[#C9A961]'
                    }`}
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      animation: progress >= 100 ? 'none' : `bounce 0.5s ease-in-out ${i * 0.1}s infinite alternate`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* 百分比 */}
          <div className="mt-6 font-ancient text-2xl text-[#C9372C]">
            {progress}%
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
