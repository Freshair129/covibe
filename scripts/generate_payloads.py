import os

def generate_payload(name, target_tokens):
    # ประมาณการ 1 token = 4 ตัวอักษร (เฉลี่ยสำหรับโค้ด/อังกฤษ)
    target_chars = target_tokens * 4
    
    base_text = """
    // CoVibe Project Context Simulation
    // Architecture: React + Vite + WebSocket + YouTube IFrame API
    // This is a dummy context used to fill the context window for stress testing.
    // The goal is to see how the model handles retrieval and logic when the KV cache is heavily populated.
    
    interface TripRoom {
        id: string;
        hostId: string;
        passengers: string[];
        currentVideoId: string;
        isPlaying: boolean;
        serverTime: number;
    }
    
    function calculateSyncAction(clientTime: number, serverTime: number, drift: number) {
        if (drift < 250) return 'ignore';
        if (drift < 800) return 'adjust_rate';
        return 'seek';
    }
    """
    
    content = base_text
    while len(content) < target_chars:
        content += base_text
        
    file_path = f"G:/covibe/payloads/payload_{name}.txt"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content[:target_chars])
    
    print(f"Generated {file_path} (~{target_tokens} tokens)")

generate_payload("4k", 4096)
generate_payload("8k", 8192)
generate_payload("16k", 16384)
generate_payload("32k", 32768)
generate_payload("64k", 65536)
