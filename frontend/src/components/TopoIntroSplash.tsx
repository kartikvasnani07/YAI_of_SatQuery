import React, { useEffect, useState } from 'react';
import { Satellite, ArrowRight } from 'lucide-react';

interface TopoIntroSplashProps {
  onComplete: () => void;
}

export const TopoIntroSplash: React.FC<TopoIntroSplashProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'drawing' | 'title' | 'fadeout'>('drawing');

  useEffect(() => {
    // Stage 1: Draw realistic contour lines (1.0s)
    const timer1 = setTimeout(() => {
      setStage('title');
    }, 1000);

    // Stage 2: Fade out splash (3.0s)
    const timer2 = setTimeout(() => {
      setStage('fadeout');
    }, 3000);

    // Stage 3: Complete intro splash (3.6s)
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center select-none transition-opacity duration-700 ${
        stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* SVG Animated Realistic Topographical Contouring Map Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Ridge Peak Mass Alpha - Top Right Elevation */}
        <path d="M 600 120 C 720 30, 920 40, 1060 150 C 1170 250, 1140 430, 990 490 C 820 550, 650 420, 680 270 Z" fill="none" stroke="#373737" strokeWidth="1.2" className="topo-path path-1" />
        <path d="M 640 140 C 740 60, 900 70, 1020 170 C 1120 260, 1090 400, 960 450 C 810 500, 680 390, 710 260 Z" fill="none" stroke="#545454" strokeWidth="1.2" className="topo-path path-2" />
        <path d="M 680 160 C 770 90, 880 100, 980 190 C 1070 270, 1040 370, 930 410 C 800 450, 710 360, 730 250 Z" fill="none" stroke="#6C6C6C" strokeWidth="1.5" className="topo-path path-3" />
        <path d="M 720 180 C 790 120, 860 125, 940 210 C 1010 280, 980 340, 890 370 C 790 400, 740 330, 760 240 Z" fill="none" stroke="#888888" strokeWidth="1.8" className="topo-path path-4" />
        <path d="M 760 200 C 820 150, 860 155, 910 220 C 960 280, 930 320, 860 340 C 790 360, 760 300, 780 240 Z" fill="none" stroke="#AAAAAA" strokeWidth="2.0" className="topo-path path-1" />
        <path d="M 790 220 C 830 180, 850 185, 880 230 C 910 270, 890 295, 840 310 C 790 320, 780 280, 790 245 Z" fill="none" stroke="#CCCCCC" strokeWidth="2.2" className="topo-path path-2" />
        <path d="M 815 235 C 840 210, 850 212, 865 240 C 880 265, 870 280, 840 285 C 815 290, 810 270, 815 245 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" className="topo-path path-3" />

        {/* Ridge Peak Mass Beta - Center Left Valley & Mass */}
        <path d="M -120 230 C -10 80, 230 60, 410 160 C 570 260, 530 490, 360 600 C 190 700, -20 610, -100 460 Z" fill="none" stroke="#373737" strokeWidth="1.2" className="topo-path path-2" />
        <path d="M -80 250 C 20 110, 220 90, 370 180 C 510 270, 480 450, 330 550 C 180 640, 0 560, -60 430 Z" fill="none" stroke="#545454" strokeWidth="1.2" className="topo-path path-3" />
        <path d="M -40 270 C 50 140, 200 120, 330 200 C 450 280, 420 420, 290 500 C 160 570, 20 510, -30 400 Z" fill="none" stroke="#6C6C6C" strokeWidth="1.5" className="topo-path path-4" />
        <path d="M 0 290 C 80 170, 180 150, 290 220 C 390 290, 370 390, 260 450 C 150 510, 40 460, 0 370 Z" fill="none" stroke="#888888" strokeWidth="1.8" className="topo-path path-1" />
        <path d="M 40 310 C 110 200, 170 180, 250 240 C 330 300, 310 365, 220 410 C 140 450, 60 410, 40 340 Z" fill="none" stroke="#AAAAAA" strokeWidth="2.0" className="topo-path path-2" />
        <path d="M 80 330 C 130 230, 170 210, 220 260 C 270 310, 260 345, 190 380 C 130 410, 80 375, 80 330 Z" fill="none" stroke="#CCCCCC" strokeWidth="2.2" className="topo-path path-3" />
        <path d="M 120 345 C 150 280, 175 270, 200 290 C 225 315, 215 335, 170 355 C 135 370, 115 350, 120 330 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" className="topo-path path-4" />

        {/* Continuous Hydrographic & Topographic Elevation Contour Runs */}
        <path d="M -150 60 C 220 -40, 620 130, 920 20 C 1120 -50, 1250 120, 1400 60" fill="none" stroke="#373737" strokeWidth="1" className="topo-path path-1" />
        <path d="M -150 160 C 180 70, 520 230, 820 110 C 1050 10, 1200 220, 1400 150" fill="none" stroke="#545454" strokeWidth="1" className="topo-path path-2" />
        <path d="M -150 700 C 170 580, 540 800, 840 650 C 1040 540, 1200 730, 1400 660" fill="none" stroke="#373737" strokeWidth="1" className="topo-path path-3" />
      </svg>

      {/* Intro Branding & Title */}
      <div className="z-10 text-center space-y-4 px-6 max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E1E1E] border border-[#373737] shadow-2xl text-[#6C6C6C] mb-2 animate-bounce">
          <Satellite className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-widest text-[#FFFFFF] font-mono">
            SAT QUERY AI
          </h1>
          <p className="text-xs font-mono tracking-wider text-[#545454] uppercase">
            Earth Observation Intelligence Workstation
          </p>
        </div>

        {/* Enter Workspace Button */}
        <button
          onClick={onComplete}
          className="pt-4 text-xs font-mono text-[#545454] hover:text-[#6C6C6C] transition-colors flex items-center space-x-1 mx-auto"
        >
          <span>Enter Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

