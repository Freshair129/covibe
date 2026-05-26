import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Settings, 
  Award, 
  Terminal, 
  ChevronRight, 
  CheckCircle, 
  RefreshCw, 
  Info, 
  Lock,
  Skull,
  Play,
  Flame
} from 'lucide-react';

export default function App() {
  // state สำหรับจำลองการทำงานของ Inference Simulator
  const [selectedModel, setSelectedModel] = useState('sushi');
  const [selectedTask, setSelectedTask] = useState('react-hook');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState('');
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [simulatedGpuTemp, setSimulatedGpuTemp] = useState(48);
  const [simulatedGpuLoad, setSimulatedGpuLoad] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // overview, simulator, gap-analysis
  const [showRcaId, setShowRcaId] = useState(null);

  // ข้อมูลของโมเดลผู้ชนะ (Champions)
  const models = {
    sushi: {
      name: 'Sushi-Coder RL (9B)',
      speed: 40.85,
      quality: 'Excellence (RL-Tuned)',
      verdict: 'ดีที่สุดสำหรับอัลกอริทึมที่ซับซ้อนและการจัดการ State เสถียรสูงที่ 8K/16K context',
      impact: 'Very Low / Cool',
      tempMax: 56,
      powerMax: 70,
      vram: '8.4 GB',
      rank: '🥇 อันดับ 1: Master Coder',
      color: 'from-amber-400 to-yellow-600',
      badgeColor: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
      sampleCode: `// Sushi-Coder RL - High Performance React Audio Player
import React, { useRef, useState, useEffect, useCallback, useReducer } from 'react';

/**
 * ARCHITECTURE:
 * Uses a provider pattern and custom hooks to decouple Audio logic from UI.
 * Implements OffscreenCanvas rendering for 60fps oscilloscope.
 */

const useAudioPlayer = (audioUrl) => {
    const audioContext = useRef(null);
    const analyser = useRef(null);
    // ... complex logic for MediaElementAudioSourceNode and cleanup ...
    return { play, pause, setVolume, analyser };
};

const Oscilloscope = ({ analyser }) => {
    const canvasRef = useRef(null);
    // ... uses ResizeObserver and requestAnimationFrame for high-DPI rendering ...
    return <canvas ref={canvasRef} />;
};

export default function App() {
    const { play, pause, analyser } = useAudioPlayer('source.mp3');
    return (
        <div className="audio-app">
            <Oscilloscope analyser={analyser} />
            <div className="controls">...</div>
        </div>
    );
}`
    },
    qwen35: {
      name: 'Qwen 3.5 (4B)',
      speed: 55.41,
      quality: 'Great (Clean React/Hooks)',
      verdict: 'เร็วที่สุด เสถียรที่สุด เหมาะสำหรับงานประจำวัน, UI components และแก้ไขปัญหาเร่งด่วน',
      impact: 'Negligible (น้อยมาก)',
      tempMax: 49,
      powerMax: 55,
      vram: '4.2 GB',
      rank: '🥈 อันดับ 2: Rapid Prototyper',
      color: 'from-cyan-400 to-blue-600',
      badgeColor: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
      sampleCode: `// Qwen 3.5 (4B) - SonicScope Lightweight Player
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';

/**
 * SPEED OPTIMIZED:
 * Focuses on fast delivery of modular hooks for visualization.
 * Minimal re-renders during 60fps canvas updates.
 */

const AudioPlayer = () => {
    const { play, pause, isPlaying } = useAudioLogic();
    const canvasRef = useOscilloscope();

    return (
        <div className="sonic-scope-container">
            <canvas ref={canvasRef} />
            <button onClick={isPlaying ? pause : play}>
                {isPlaying ? <Pause /> : <Play />}
            </button>
        </div>
    );
};`
    },
    qwen3: {
      name: 'Qwen 3 (14B-Safe)',
      speed: 27.26,
      quality: 'High (Senior-level Reasoning)',
      verdict: 'ใช้รีวิวโค้ดขั้นสุดท้ายและวางแผนโครงสร้างสถาปัตยกรรม (ต้องจำกัด Context ที่ 8K เพื่อกันจอดำ)',
      impact: 'Moderate (ต้องการการคุมพลังงาน)',
      tempMax: 71,
      powerMax: 90,
      vram: '11.2 GB (เกือบเต็ม VRAM!)',
      rank: '🥉 อันดับ 3: Senior Architect',
      color: 'from-emerald-400 to-teal-600',
      badgeColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
      sampleCode: `// Qwen 3 (14B-Safe) - Senior Architect Implementation
      import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

      /**
      * REASONING:
      * 1. Handles Autoplay Policy by resuming AudioContext on user interaction.
      * 2. Uses useLayoutEffect for flicker-free canvas drawing.
      * 3. Includes robust cleanup of AudioContext to prevent memory leaks.
      */

      const AudioPlayer = ({ src }) => {
      const audioContextRef = useRef(null);
      const [currentTime, setCurrentTime] = useState(0);

      const togglePlay = () => {
        // ... logic to resume context and play element ...
      };

      return (
        <div className="player">
            <audio src={src} />
            <canvas width={800} height={200} />
            <button onClick={togglePlay}>Toggle Play</button>
        </div>
      );
      };`
      },
  };

  // แผนงานโจทย์จำลอง
  const tasks = {
    'react-hook': 'เขียน Custom React Hook สำหรับจัดการ State',
    'ui-comp': 'เขียน UI Component ด้วย Tailwind CSS',
    'security': 'ตรวจสอบช่องโหว่ความปลอดภัยและสถาปัตยกรรม'
  };

  // โมเดลที่พัง (Decommissioned)
  const failedModels = [
    {
      id: 'heretic',
      name: 'Heretic Thinking (12B)',
      status: 'FAILED',
      reason: 'เกิดอาการลูปไม่สิ้นสุด (Severe infinite looping) และตอบคำถามเพ้อเจ้อ (Hallucination)',
      rca: 'ตรรกะพังเมื่อเจอคำสั่งสเตตซับซ้อน ตัวโมเดลสูญเสีย Context แนะนำให้เลิกใช้ถาวร'
    },
    {
      id: 'claude',
      name: 'Claude-MoE (14B-A3B)',
      status: 'FAILED',
      reason: 'Logic loops และใช้ภาษาผิด (พยายามเขียน Python ในโครงงาน TypeScript)',
      rca: 'การแบ่งน้ำหนัก MoE สับสน และจัดการไวยากรณ์สลับไปมาเมื่อรันในสภาพแวดล้อมจำกัดพลังงาน'
    },
    {
      id: 'qwen3-raw',
      name: 'Official Qwen3 (14B - Non Safe)',
      status: 'CRASHED',
      reason: 'เกิดปัญหาจอดำ / TDR Crash ทันทีเมื่อรันบน 12GB VRAM แบบไม่มีการจูน',
      rca: 'การไม่ได้จำกัด Layer Offloading ส่งผลให้หน่วยความจำ VRAM ทะลักเกิน 12GB จนไดรเวอร์การ์ดจอรีเซ็ต'
    }
  ];

  // การจำลองพิมพ์โค้ด (Inference Code Generation Emulator)
  useEffect(() => {
    let interval;
    if (isSimulating) {
      const selectedModelData = models[selectedModel];
      const code = selectedModelData.sampleCode;
      let currentIndex = 0;
      setSimulatedOutput('');
      setSimulatedProgress(0);
      
      // คำนวณความเร็วในการพิมพ์ตาม t/s ของโมเดลจริง
      // ยิ่ง t/s สูง ยิ่งพิมพ์เร็วขึ้นต่อรอบ
      const intervalMs = Math.max(5, Math.floor(1000 / (selectedModelData.speed * 2)));

      interval = setInterval(() => {
        if (currentIndex < code.length) {
          // สุ่มดึงตัวอักษรทีละ 2-4 ตัวเพื่อความไหลลื่น
          const charsToAppend = Math.floor(Math.random() * 3) + 2;
          const nextSegment = code.substring(currentIndex, currentIndex + charsToAppend);
          setSimulatedOutput((prev) => prev + nextSegment);
          currentIndex += charsToAppend;
          
          // คำนวณความก้าวหน้า
          const progress = Math.min(100, Math.round((currentIndex / code.length) * 100));
          setSimulatedProgress(progress);

          // จำลองการโหลด GPU และความร้อนขณะทำงาน
          setSimulatedGpuLoad(Math.min(95, Math.floor(Math.random() * 15) + (selectedModel === 'qwen3' ? 80 : selectedModel === 'sushi' ? 45 : 15)));
          setSimulatedGpuTemp(prev => {
            const maxTemp = selectedModelData.tempMax;
            if (prev < maxTemp) return prev + 1;
            return prev + (Math.random() > 0.5 ? 1 : -1);
          });
        } else {
          setIsSimulating(false);
          setSimulatedGpuLoad(0);
          setSimulatedGpuTemp(selectedModel === 'qwen3' ? 55 : selectedModel === 'sushi' ? 45 : 38);
          clearInterval(interval);
        }
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isSimulating, selectedModel]);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulatedGpuTemp(45);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-cyan-500/10">
              <Cpu className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CoVibe AI Benchmark
                </h1>
                <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                  v3.0 Safe
                </span>
              </div>
              <p className="text-xs text-slate-400">
                บอร์ดควบคุมรายงานและเปรียบเทียบความเสถียรของระบบ AI บนฮาร์ดแวร์ท้องถิ่น
              </p>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              ภาพรวมและประสิทธิภาพ
            </button>
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${activeTab === 'simulator' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              โปรแกรมจำลอง AI
            </button>
            <button 
              onClick={() => setActiveTab('gap-analysis')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${activeTab === 'gap-analysis' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              วิเคราะห์จุดขาดหาย (Gap Analysis)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* TOP STATUS CARDS (KPIs) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">ความเร็วสูงสุดที่เสถียร</span>
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">55.41 <span className="text-sm font-normal text-slate-400">t/s</span></div>
            <p className="text-[11px] text-cyan-400 mt-1 font-mono">Qwen 3.5 (4B)</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">โมเดลตรรกะสูงสุด (RL-Tuned)</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">Excellence</div>
            <p className="text-[11px] text-amber-400 mt-1 font-mono">Sushi-Coder RL (9B)</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">ระบบปรับแต่งความปลอดภัย</span>
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-1.5">
              <span>90% Power Limit</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">MSI Afterburner Safe Mode</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">โมเดลที่ไม่ผ่านเกณฑ์ (Failed)</span>
              <Skull className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-rose-400">3 รุ่น <span className="text-xs text-rose-500/70 font-normal">(พังจากการรันหนัก)</span></div>
            <p className="text-[11px] text-rose-400/80 mt-1 font-mono">มีโอกาสเสี่ยงจอดำ/TDR</p>
          </div>
        </section>

        {/* TAB 1: OVERVIEW & PERFORMANCE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: THE CHAMPIONS (Active Models) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      The Champions of CoVibe (โมเดลที่ดีที่สุด)
                    </h2>
                    <p className="text-xs text-slate-400">วัดผลความแม่นยำและการประมวลผลบนฮาร์ดแวร์ RTX 3060 (12GB)</p>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                    Safe-Tuned Active
                  </span>
                </div>

                {/* Model Lists */}
                <div className="space-y-4">
                  {Object.entries(models).map(([key, model]) => (
                    <div 
                      key={key} 
                      className="bg-slate-950/60 hover:bg-slate-950 transition border border-slate-900 rounded-xl p-5 relative overflow-hidden group"
                    >
                      {/* Gradient border light */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-indigo-500"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                              {model.name}
                            </h3>
                            <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full ${model.badgeColor}`}>
                              {model.rank}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            <span className="text-slate-400">ผลลัพธ์การทำงาน:</span> {model.verdict}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-cyan-400" /> GPU VRAM: {model.vram}
                            </span>
                            <span className="flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-amber-400" /> ฮาร์ดแวร์เสี่ยง: {model.impact}
                            </span>
                          </div>
                        </div>

                        {/* Speed badge/stats */}
                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-900 pt-3 md:pt-0 md:pl-6 min-w-[120px]">
                          <div className="text-right">
                            <div className="text-2xl font-black text-cyan-400 font-mono">
                              {model.speed}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase">tokens / sec</div>
                          </div>
                          <div className="mt-1">
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              {model.quality}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BAR CHART FOR OUTPUT SPEED (Custom implementation using SVG) */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4">
                  เปรียบเทียบความเร็วโทเค็น (Tokens per Second)
                </h3>
                <div className="space-y-4">
                  {Object.entries(models).map(([key, model]) => {
                    const pct = (model.speed / 60) * 100; // max around 60 t/s
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300">{model.name}</span>
                          <span className="text-cyan-400 font-bold">{model.speed} t/s</span>
                        </div>
                        <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full bg-gradient-to-r ${model.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                    <span>0 t/s (ช้าที่สุด)</span>
                    <span>30 t/s (ระดับเสถียรทั่วไป)</span>
                    <span>60 t/s (เร็วสูงสุด)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HARDWARE STABILITY & SAFE MODE */}
            <div className="space-y-6">
              
              {/* SAFE MODE TUNING CARD */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Settings className="w-24 h-24 text-cyan-400 rotate-45" />
                </div>
                
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <Lock className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Safe Mode Tuning Settings</h3>
                    <p className="text-[11px] text-emerald-400">เปิดการตั้งค่าจำกัดกำลังไฟเพื่อลดปัญหาระบบหลอมละลาย</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-900 space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Core Underclock:</span>
                    <span className="text-amber-400">-104 MHz</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Power Limit (Afterburner):</span>
                    <span className="text-amber-400">90% Max</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">GPU Priorities:</span>
                    <span className="text-cyan-400">Power over Temp</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Ollama Setup:</span>
                    <span className="text-cyan-400">Manual layer offloading</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono border-t border-slate-900 pt-2">
                    <span className="text-slate-400">Hardware Test Bed:</span>
                    <span className="text-slate-200 text-[11px]">i7-8700K / RTX 3060 12GB</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  * ผลพวงหลังจากการวิเคราะห์หาสาเหตุหลัก (RCA) ได้ทำการปรับลดความเร็ว Core คลื่นความถี่เพื่อหลีกเลี่ยงพลังงานกระชากจอดำ
                </p>
              </div>

              {/* FAILED / DECOMMISSIONED MODELS */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Skull className="w-5 h-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-100">Failed Models (โมเดลที่ยกเลิก)</h3>
                </div>
                
                <p className="text-xs text-slate-400 mb-4">
                  รายชื่อโมเดลที่ไม่เสถียรและก่อความเสียหายให้แก่ไดรเวอร์การ์ดจอจากการรัน 12GB VRAM
                </p>

                <div className="space-y-3">
                  {failedModels.map((item) => (
                    <div key={item.id} className="bg-slate-950/40 border border-slate-900 hover:border-rose-900/30 rounded-xl p-3.5 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        <span className="text-rose-400/80">อาการ:</span> {item.reason}
                      </p>
                      
                      {/* Interactive RCA Toggle */}
                      <button 
                        onClick={() => setShowRcaId(showRcaId === item.id ? null : item.id)}
                        className="text-[10px] text-cyan-400 mt-2 hover:underline flex items-center gap-1 font-mono"
                      >
                        {showRcaId === item.id ? 'ซ่อนการวิเคราะห์ RCA' : 'แสดงการวิเคราะห์หาสาเหตุ (RCA)'}
                        <ChevronRight className={`w-3 h-3 transform transition-transform ${showRcaId === item.id ? 'rotate-90' : ''}`} />
                      </button>

                      {showRcaId === item.id && (
                        <div className="mt-2 bg-rose-950/10 border border-rose-900/20 rounded p-2 text-[10px] text-rose-300 font-mono">
                          ⚡ <strong>RCA:</strong> {item.rca}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CONTROLS & MONITOR */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  ควบคุมการจำลอง AI
                </h2>

                <div className="space-y-4">
                  {/* Select Model */}
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">1. เลือกโมเดลทดสอบ</label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(models).map(([key, model]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedModel(key)}
                          disabled={isSimulating}
                          className={`w-full text-left p-3 rounded-xl border transition ${selectedModel === key ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">{model.name}</span>
                            <span className="text-[10px] font-mono text-cyan-400">{model.speed} t/s</span>
                          </div>
                          <span className="text-[10px] block text-slate-400 mt-0.5">{model.quality}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Task */}
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">2. เลือกโจทย์งานพัฒนา</label>
                    <select
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      disabled={isSimulating}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      {Object.entries(tasks).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 text-slate-950 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังประมวลผลตาม Token Speed...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>เริ่มการพิมพ์โค้ดจำลอง</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* REAL-TIME SIMULATED HARDWARE MONITOR */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  จำลองการตรวจวัดฮาร์ดแวร์ (GPU Sensor)
                </h3>

                {/* GPU load bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">GPU VRAM Load:</span>
                    <span className="text-cyan-400 font-bold">{simulatedGpuLoad}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${simulatedGpuLoad}%` }}
                    />
                  </div>
                </div>

                {/* GPU Temperature */}
                <div className="flex justify-between items-center text-xs font-mono border-t border-slate-900 pt-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" /> ความร้อน GPU:
                  </span>
                  <span className={`font-bold ${simulatedGpuTemp > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simulatedGpuTemp}°C
                  </span>
                </div>

                {/* GPU Power usage */}
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">จำกัดการจ่ายไฟ:</span>
                  <span className="text-amber-400 font-bold">90% Max (Safe-Cap)</span>
                </div>
                
                {/* 14B Risk indicator */}
                {selectedModel === 'qwen3' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-2 items-start mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-300 leading-normal">
                      แจ้งเตือน: Qwen 3 (14B) ต้องการ VRAM ใกล้เต็มโควต้า 12GB หากเปิด 16K Context อาจเกิดไดรเวอร์หน้าจอดับ (TDR Crash)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SIMULATION TERMINAL SCREEN */}
            <div className="lg:col-span-2 flex flex-col h-[520px] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900/40 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">covibe-terminal://simulator-output</span>
                </div>
                <div className="text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                  {models[selectedModel].speed} Tokens/sec
                </div>
              </div>

              {/* Terminal Screen Area */}
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-3 bg-slate-950/90 select-all">
                {simulatedOutput ? (
                  <pre className="whitespace-pre-wrap">{simulatedOutput}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 opacity-20" />
                    <p className="text-xs">พร้อมเริ่มระบบพิมพ์จำลอง เพื่อทดสอบความเร็วของ AI แบบเรียลไทม์</p>
                    <p className="text-[10px] max-w-sm text-slate-600">
                      เมื่อเริ่มรัน โค้ดของ {models[selectedModel].name} จะถูกพิมพ์ออกมากระพริบด้วยจังหวะเวลาเสมือนความเร็ว t/s จริง
                    </p>
                  </div>
                )}
              </div>

              {/* Progress bar info at the bottom of the screen */}
              {isSimulating && (
                <div className="p-3 bg-slate-900/60 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400">กำลังป้อนคำตอบ... ({simulatedProgress}%)</span>
                  <div className="w-32 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-cyan-400" style={{ width: `${simulatedProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: GAP ANALYSIS */}
        {activeTab === 'gap-analysis' && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Gap Analysis: วิเคราะห์จุดขาดหายและทางแก้</h2>
              </div>
              <p className="text-xs text-slate-400 max-w-3xl">
                จากการทดสอบเชิงลึกเกี่ยวกับขีดจำกัด AI และสถาปัตยกรรมภายในองค์กร CoVibe พบ 4 ช่องว่างที่ต้องปรับปรุงพัฒนาต่อดังนี้
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* GAP 1 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <h3 className="text-sm font-bold text-slate-200">1. The "16K Barrier"</h3>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    Hardware Limit
                  </span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-bold">สถานะปัจจุบัน (Current State):</span>
                    <p className="text-slate-300">รัน 16K Context บนรุ่น 14B แล้วเกิดอาการจอดำบ่อยครั้ง แม้จะลด Power Limit แล้ว</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-cyan-400 font-bold">แนวทางแก้ปัญหา (Next Steps):</span>
                    <p className="text-slate-300">ต้องลดการจอง VRAM เพิ่ม หรืออัปเดตสถาปัตยกรรมรุ่น 4.0 ที่จะจัดการ KV Cache ได้เสถียรขึ้น 50%+</p>
                  </div>
                </div>
              </div>

              {/* GAP 2 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <h3 className="text-sm font-bold text-slate-200">2. Multi-turn Context Memory</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    Software Limit
                  </span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-bold">สถานะปัจจุบัน (Current State):</span>
                    <p className="text-slate-300">เราเพิ่งทำการทดสอบปัญหาแบบโจทย์ครั้งเดียวจบ (Single-shot)</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-cyan-400 font-bold">แนวทางแก้ปัญหา (Next Steps):</span>
                    <p className="text-slate-300">ควรวางระบบทดสอบประวัติการตอบคำถามต่อเนื่องยาวนาน (Long-conversation recall) เนื่องจากรุ่น 4B อาจตอบหลงบริบทได้ง่ายกว่า 9B/14B</p>
                  </div>
                </div>
              </div>

              {/* GAP 3 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <h3 className="text-sm font-bold text-slate-200">3. Agentic Tool-Use</h3>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                    Execution Gap
                  </span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-bold">สถานะปัจจุบัน (Current State):</span>
                    <p className="text-slate-300">AI ภายในเครื่องส่วนใหญ่เน้นทำหน้าที่เขียนส่งโค้ดมาแสดงให้ดูเพียงอย่างเดียว</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-cyan-400 font-bold">แนวทางแก้ปัญหา (Next Steps):</span>
                    <p className="text-slate-300">ขาดความสามารถรันคำสั่ง Shell หรือแก้ไขไฟล์แบบอัตโนมัติอย่างปลอดภัย (Agentic workflow) อาจต้องนัดหมายทดสอบ OmniCoder เพื่อนำมาพิจารณาใช้</p>
                  </div>
                </div>
              </div>

              {/* GAP 4 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    <h3 className="text-sm font-bold text-slate-200">4. UI/UX Perception</h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    Evaluation Gap
                  </span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-bold">สถานะปัจจุบัน (Current State):</span>
                    <p className="text-slate-300">การวัดประสิทธิภาพหลักยังเน้นวิเคราะห์ที่ความเร็วและลอจิกใน CLI</p>
                  </div>
                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-cyan-400 font-bold">แนวทางแก้ปัญหา (Next Steps):</span>
                    <p className="text-slate-300">ยังไม่ได้รับการทดสอบความเข้าใจระบบการออกแบบ (Design System ของ CoVibe) เช่น ตัวแปร CSS และการสร้างหน้าจอ Responsive เพื่อป้องกันข้อผิดพลาดเวลาคัดลอกไปใช้วางบนโปรเจ็กต์</p>
                  </div>
                </div>
              </div>

            </div>

            {/* DECOMMISSIONED MODELS SECTION */}
            <div className="mt-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Skull className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-white">Decommissioned Models: โมเดลที่ถูกยกเลิกการใช้งาน</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <h4 className="text-xs font-bold text-rose-400 mb-1">Heretic Thinking (12B)</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">พบปัญหาติดลูปตรรกะตัวเอง (Infinite Loop) และมีการหลอนข้อมูลรุ่น React (Hallucination)</p>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <h4 className="text-xs font-bold text-rose-400 mb-1">Claude-MoE (14B-A3B)</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">ไม่เสถียร ติดลูป และพยายามเขียนภาษาผิดจากโจทย์ (เขียน Python แทน TypeScript)</p>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <h4 className="text-xs font-bold text-rose-400 mb-1">Official Qwen3 (14B)</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">กินไฟกระชากเกินขีดจำกัด VRAM 12GB ทำให้เครื่องจอดำ (TDR Crash) เมื่อใช้ 16K Context</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-900 mt-12 py-6 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            <span>เครื่องมือทดสอบฮาร์ดแวร์: i7-8700K / RTX 3060 12GB / 750W PSU</span>
          </div>
          <div>
            <span>© 2026 CoVibe Engineering. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}