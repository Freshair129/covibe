import { Bluetooth, ChevronDown } from "lucide-react";

export function HeroSection() {
  const scrollToSetup = () => {
    const element = document.getElementById('display-name-input');
    element?.scrollIntoView({ behavior: 'smooth' });
    element?.focus();
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-logo">
          <Bluetooth size={64} aria-hidden="true" />
        </div>
        <h1 className="hero-title">CoVibe</h1>
        <p className="hero-subtitle">
          Listen together on the move. Your music, synced perfectly.
        </p>
        <p className="hero-description">
          แชร์เพลงและสนทนากับคนซ้อนท้ายแบบเรียลไทม์ <br/>
          ไม่ต้องมี Intercom แพงๆ แค่มีหูฟังบลูทูธก็พอ
        </p>
        <button className="hero-cta" onClick={scrollToSetup}>
          เริ่มออกทริปเลย
          <ChevronDown size={20} />
        </button>
      </div>

      <style>{`
        .hero-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          background: radial-gradient(circle at top, rgba(120, 244, 191, 0.08) 0%, transparent 70%);
        }
        .hero-content {
          max-width: 600px;
          animation: fade-in-up 0.8s ease-out;
        }
        .hero-logo {
          color: #78f4bf;
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }
        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 12px;
          background: linear-gradient(to bottom, #f3f7f4, #a8b6b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.5rem;
          color: #78f4bf;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .hero-description {
          font-size: 1.1rem;
          color: #a8b6b0;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        .hero-cta {
          background: #78f4bf;
          color: #101418;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(120, 244, 191, 0.3);
        }
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(120, 244, 191, 0.4);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 560px) {
          .hero-title { font-size: 3rem; }
          .hero-subtitle { font-size: 1.2rem; }
        }
      `}</style>
    </section>
  );
}
