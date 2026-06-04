import { X, HelpCircle, Bluetooth, Wifi, Unlock, Music } from "lucide-react";

interface SupportPanelProps {
  onClose: () => void;
}

export function SupportPanel({ onClose }: SupportPanelProps) {
  const sections = [
    {
      icon: <Unlock size={20} />,
      title: "วิธีแก้ปัญหาเพลงไม่เล่น (Autoplay)",
      content: "เบราว์เซอร์บนมือถือมักจะบล็อกการเล่นวิดีโออัตโนมัติ ให้คุณกดที่ปุ่ม 'เล่น' หรือ 'Unlock' สีเหลืองบนหน้าจอเครื่องเล่น 1 ครั้ง เพื่ออนุญาตให้แอปทำงานได้"
    },
    {
      icon: <Bluetooth size={20} />,
      title: "การเชื่อมต่อหูฟังบลูทูธ",
      content: "แนะนำให้เชื่อมต่อหูฟังกับมือถือให้เรียบร้อยก่อนเปิดแอป CoVibe หากเชื่อมต่อทีหลัง อาจต้องรีเฟรชหน้าเว็บเพื่อให้ระบบตรวจพบอุปกรณ์เสียงใหม่"
    },
    {
      icon: <Wifi size={20} />,
      title: "โหมด P2P (ความหน่วงต่ำ)",
      content: "หากคนขับและคนซ้อนเชื่อมต่อ Hotspot เดียวกัน ระบบจะแสดงสัญลักษณ์ ⚡ P2P ซึ่งจะช่วยให้การซิงค์เพลงรวดเร็วและแม่นยำขึ้นมาก"
    },
    {
      icon: <Music size={20} />,
      title: "การเล่นเพลงจากเครื่อง (Offline)",
      content: "คุณสามารถอัปโหลดไฟล์ .mp3 ในหน้าค้นหา เพื่อเล่นเพลงโดยไม่ใช้เน็ต และสามารถกดปุ่ม 'Sync ไปยังคนซ้อน' เพื่อส่งไฟล์เพลงให้เพื่อนฟังด้วยกันได้"
    }
  ];

  return (
    <div className="support-overlay">
      <div className="support-card">
        <div className="support-header">
          <div className="title-with-icon">
            <HelpCircle className="help-icon" />
            <h2>ศูนย์ช่วยเหลือ & วิธีใช้งาน</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="ปิด">
            <X size={24} />
          </button>
        </div>

        <div className="support-content">
          {sections.map((section, idx) => (
            <div key={idx} className="support-item">
              <div className="item-header">
                <div className="item-icon">{section.icon}</div>
                <h3>{section.title}</h3>
              </div>
              <p>{section.content}</p>
            </div>
          ))}
        </div>

        <div className="support-footer">
          <p>CoVibe v1.5 - Ride Together, Listen Together</p>
        </div>
      </div>

      <style>{`
        .support-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        .support-card {
          width: 100%;
          max-width: 500px;
          background: rgba(25, 30, 35, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .support-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .help-icon {
          color: #78f4bf;
        }
        .support-header h2 {
          font-size: 1.4rem;
          margin: 0;
        }
        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #a8b6b0;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .support-content {
          overflow-y: auto;
          display: grid;
          gap: 20px;
          padding-right: 8px;
        }
        .support-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px;
        }
        .item-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: #78f4bf;
        }
        .item-icon {
          background: rgba(120, 244, 191, 0.1);
          padding: 8px;
          border-radius: 8px;
        }
        .item-header h3 {
          font-size: 1rem;
          margin: 0;
          font-weight: 700;
        }
        .support-item p {
          margin: 0;
          color: #a8b6b0;
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .support-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.8rem;
          color: #818b86;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
