import { Headphones, Moon, RadioTower, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "ยินดีต้อนรับสู่ CoVibe Beta",
      icon: <RadioTower className="w-12 h-12 text-accent" />,
      content: "คุณกำลังเข้าสู่ระบบฟังเพลงพร้อมกันแบบเรียลไทม์ เพื่อประสบการณ์ที่ดีที่สุด กรุณาทำตามขั้นตอนสั้นๆ นี้",
      button: "ต่อไป"
    },
    {
      title: "เตรียมความพร้อม",
      icon: <Headphones className="w-12 h-12 text-accent" />,
      content: "สวมหูฟังและเปิดเสียงให้พร้อม ระบบจะซิงค์เพลงให้คุณและเพื่อนโดยอัตโนมัติ",
      button: "ต่อไป"
    },
    {
      title: "คำแนะนำการใช้งาน",
      icon: <Moon className="w-12 h-12 text-accent" />,
      content: "ห้ามล็อกหน้าจอมือถือขณะขับขี่ (จะทำให้เพลงหยุด) แนะนำให้ใช้ 'โหมดจอดำ' ในแอปเพื่อประหยัดแบตเตอรี่แทน",
      button: "ปลดล็อกเสียงและเริ่มทริป"
    }
  ];

  const current = steps[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="step-indicator">
            {steps.map((_, i) => (
              <div key={i} className={`step-dot ${i === step ? "active" : ""}`} />
            ))}
          </div>
          {current.icon}
          <h2>{current.title}</h2>
        </div>
        
        <div className="onboarding-content">
          <p>{current.content}</p>
        </div>

        <button 
          className="primary-action" 
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
        >
          {step === steps.length - 1 ? <CheckCircle2 className="mr-2" /> : null}
          {current.button}
        </button>
      </div>

      <style>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 13, 16, 0.95);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .onboarding-card {
          background: #1a1f24;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px 24px;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        .onboarding-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .step-indicator {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .step-dot.active {
          background: #78f4bf;
          box-shadow: 0 0 8px rgba(120, 244, 191, 0.4);
          width: 20px;
          border-radius: 4px;
        }
        .onboarding-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f3f7f4;
          margin: 0;
        }
        .onboarding-content p {
          color: #a8b6b0;
          line-height: 1.6;
          margin: 0;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
