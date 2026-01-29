import { ExternalLink, Video, Heart, X, Github } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center space-y-6 animate-in fade-in duration-700 w-full z-20 relative">
      {/* 官网链接 */}
      <div className="flex items-center justify-center px-4">
        <a 
          href="https://www.kw-aigc.cn" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-6 py-2 bg-[#2E4A62]/5 hover:bg-[#2E4A62]/10 rounded-full transition-all duration-300 border border-[#2E4A62]/10 hover:border-[#2E4A62]/30 max-w-full"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9372C] animate-pulse flex-shrink-0"></span>
          <span className="text-[#2E4A62] font-medium font-ancient tracking-wider group-hover:scale-105 transition-transform truncate">
            更多有意思的：www.kw-aigc.cn
          </span>
          <ExternalLink className="w-3 h-3 text-[#8B7355] group-hover:text-[#2E4A62] transition-colors flex-shrink-0" />
        </a>
      </div>
      
      {/* 社交媒体二维码 */}
      <div className="flex justify-center items-center gap-8">
        <QRCodeDialog 
          title="关注微信公众号" 
          imageSrc="/wechat-channel-qr.webp" 
          label="微信公众号"
          icon={<Video className="w-4 h-4" />}
        />
        <div className="w-px h-4 bg-[#8B7355]/30"></div>
        <QRCodeDialog 
          title="关注小红书" 
          imageSrc="/xiaohongshu-qr.webp" 
          label="小红书"
          icon={<Heart className="w-4 h-4" />}
        />
        <div className="w-px h-4 bg-[#8B7355]/30"></div>
        <a href="https://github.com/KevinYoung-Kw/calculate-your-salary" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-[#8B7355] hover:text-[#2E4A62] transition-all duration-300">
          <span className="p-1.5 rounded-full bg-[#8B7355]/10 group-hover:bg-[#2E4A62]/10 transition-colors"><Github className="w-4 h-4" /></span>
          <span className="text-sm font-ancient border-b border-transparent group-hover:border-[#2E4A62] transition-all">开源地址</span>
        </a>
      </div>
    </footer>
  );
}

interface QRCodeDialogProps {
  title: string;
  imageSrc: string;
  label: string;
  icon: React.ReactNode;
}

function QRCodeDialog({ title, imageSrc, label, icon }: QRCodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group flex items-center gap-2 text-[#8B7355] hover:text-[#C9372C] transition-all duration-300 outline-none">
          <span className="p-1.5 rounded-full bg-[#8B7355]/10 group-hover:bg-[#C9372C]/10 transition-colors">
            {icon}
          </span>
          <span className="text-sm font-ancient border-b border-transparent group-hover:border-[#C9372C] transition-all">
            {label}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl bg-[#FDF8E8] border-[#C9A961] p-0 overflow-hidden shadow-2xl focus:outline-none">
        <div className="relative p-6 sm:p-10 flex flex-col items-center">
            {/* 装饰背景 */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#2E4A62] rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#2E4A62] rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#2E4A62] rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#2E4A62] rounded-br-xl"></div>
            </div>

            <DialogTitle className="text-[#2E4A62] font-ancient text-2xl sm:text-3xl mb-6 sm:mb-8 tracking-widest font-bold border-b-2 border-[#C9A961]/30 pb-3 px-4 z-10 relative w-full text-center">
                {title}
            </DialogTitle>
            
            <div className="p-4 bg-white rounded-lg shadow-inner border border-[#C9A961]/30 mb-6 z-10 relative w-full max-w-md aspect-square flex items-center justify-center">
                <img 
                    src={imageSrc} 
                    alt={title} 
                    className="w-full h-full object-contain"
                />
            </div>
            
            <p className="text-[#8B7355] text-base sm:text-lg font-ancient tracking-widest opacity-80 mt-2 z-10 relative bg-[#FDF8E8]/80 px-4 py-2 rounded">
                长按识别 · 扫码关注
            </p>

            <DialogClose asChild>
                <button className="mt-8 px-12 py-3 border-2 border-[#8B7355]/40 rounded-full text-[#8B7355] hover:bg-[#8B7355]/10 hover:text-[#2E4A62] hover:border-[#2E4A62]/40 transition-all duration-300 text-lg font-ancient flex items-center gap-2 z-10 relative bg-[#FDF8E8] focus:outline-none cursor-pointer active:scale-95 font-bold shadow-sm">
                    <X className="w-5 h-5" />
                    关闭
                </button>
            </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
