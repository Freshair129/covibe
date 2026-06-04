import { 
  Bike, Users, Music, Headphones, Zap, Flame, Smile, Heart 
} from "lucide-react";
import { AVATARS } from "../constants";

const ICON_MAP: Record<string, any> = {
  bike: Bike,
  users: Users,
  music: Music,
  headphones: Headphones,
  zap: Zap,
  flame: Flame,
  smile: Smile,
  heart: Heart
};

interface AvatarPickerProps {
  selected: string;
  onSelect: (name: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="avatar-picker">
      <p className="section-subtitle">เลือกไอคอนของคุณ</p>
      <div className="avatar-grid">
        {AVATARS.map((name) => {
          const Icon = ICON_MAP[name];
          return (
            <button
              key={name}
              type="button"
              className={`avatar-item ${selected === name ? 'active' : ''}`}
              onClick={() => onSelect(name)}
              aria-label={`Select ${name} avatar`}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>

      <style>{`
        .avatar-picker {
          margin-bottom: 20px;
        }
        .section-subtitle {
          font-size: 0.9rem;
          color: #a8b6b0;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .avatar-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          color: #a8b6b0;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .avatar-item.active {
          background: rgba(120, 244, 191, 0.15);
          border-color: #78f4bf;
          color: #78f4bf;
          box-shadow: 0 0 15px rgba(120, 244, 191, 0.2);
        }
      `}</style>
    </div>
  );
}
