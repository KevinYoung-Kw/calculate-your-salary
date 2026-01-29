import { useState } from 'react';
import type { UserInput } from '@/types';
import InputForm from '@/sections/InputForm';
import Calculating from '@/sections/Calculating';
import Result from '@/sections/Result';

// 应用状态类型
type AppState = 'input' | 'calculating' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  // 处理表单提交
  const handleFormSubmit = (data: UserInput) => {
    setUserInput(data);
    setAppState('calculating');
  };

  // 处理计算完成
  const handleCalculationComplete = () => {
    setAppState('result');
  };

  // 重置应用
  const handleReset = () => {
    setUserInput(null);
    setAppState('input');
  };

  return (
    <div className="min-h-screen">
      {/* 页面切换动画 */}
      <div className="relative">
        {appState === 'input' && (
          <div className="fade-in">
            <InputForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {appState === 'calculating' && (
          <div className="fade-in">
            <Calculating onComplete={handleCalculationComplete} />
          </div>
        )}

        {appState === 'result' && userInput && (
          <div className="fade-in">
            <Result 
              userInput={userInput} 
              onReset={handleReset} 
            />
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer className="py-6 text-center text-[#8B7355] text-sm">
        <p>官途算略 · 古今职场价值镜像</p>
        <p className="mt-1 text-xs opacity-70">
          仅供娱乐，历史数据仅供参考
        </p>
      </footer>
    </div>
  );
}

export default App;
