# **เอกสารความต้องการของผลิตภัณฑ์ (Product Requirement Document \- PRD)**

## **ชื่อโปรเจกต์: CoVibe (ระบบแชร์เพลงเรียลไทม์และคิวเพลงข้ามอุปกรณ์สำหรับคนขับและคนซ้อนมอเตอร์ไซค์)**

**เวอร์ชัน:** 1.6 (ปรับปรุงสถาปัตยกรรมรองรับ Wi-Fi / Hotspot Mode, ระบบจัดการเสียง Dual Bluetooth, วิเคราะห์โอกาสร่วมกับตลาด Earbuds/TWS ปี 2026 และเปรียบเทียบกับ Apple Share Audio)

**สถานะ:** ร่างแบบโครงสร้างทางเทคนิค (Draft)

**กลุ่มผู้ใช้เป้าหมาย:** คนขับขี่มอเตอร์ไซค์ (Rider), คนซ้อนท้าย (Passenger), กลุ่มขับขี่ออกทริปเดินทาง (Convoy)

## **1\. บทนำและวิสัยทัศน์ของผลิตภัณฑ์ (Product Vision)**

**CoVibe** คือเว็บแอปพลิเคชันระบบแชร์เพลงและคิวเพลงแบบเรียลไทม์ (Real-time Music Synchronization) ที่ออกแบบมาเพื่อการใช้งานขณะเดินทางด้วยรถมอเตอร์ไซค์โดยเฉพาะ ระบบนี้ช่วยให้ **"คนขับ"** และ **"คนซ้อน"** (หรือกลุ่มเพื่อนที่ร่วมออกทริป) สามารถฟังเพลงเดียวกันไปพร้อมกันได้อย่างแม่นยำผ่านหูฟังบลูทูธหรืออินเตอร์คอมติดหมวกกันน็อคของตนเอง โดยประมวลผลผ่านสมาร์ทโฟนของแต่ละคน

ระบบนี้ทลายข้อจำกัดระบบแชร์เพลงเดิมๆ โดยใช้ระบบ **Dual YouTube IFrame Player** ที่ทำงานซิงค์กันผ่านสัญญาณเน็ต หรือส่งข้อมูลซิงค์กันผ่านวง **Wi-Fi Hotspot** ระหว่างสองเครื่องโดยตรง ทำให้ประหยัดแบตเตอรี่หมวกกันน็อค ส่งสัญญาณเสียงได้เสถียร และใช้งานได้กับหูฟังบลูทูธทุกยี่ห้อในโลก รวมถึงรองรับการจัดการช่องสัญญาณเสียงคู่ขนาน (Audio Orchestration) เพื่อให้ผู้ขับขี่สามารถฟังเพลง นำทาง GPS และคุยสายอินเตอร์คอมไปได้พร้อมๆ กันโดยไม่มีสัญญาณใดขาดหาย

## **2\. ปัญหาที่ต้องการแก้ไข (Pain Points & Solutions)**

| ปัญหาของการแชร์เพลงบนมอเตอร์ไซค์ในปัจจุบัน | แนวทางแก้ไขของ CoVibe (Solutions) |
| :---- | :---- |
| **แบตเตอรี่หมวกกันน็อคหมดไว:** ระบบแชร์เพลงผ่านบลูทูธติดหมวกโดยตรง ต้องส่งสัญญาณเสียงข้ามหมวกตลอดเวลา | **โยนภาระให้สมาร์ทโฟน:** ให้โทรศัพท์ประมวลผลสตรีมเพลง บลูทูธหมวกทำหน้าที่แค่รับเสียง (Audio Receiver) ทั่วไป ช่วยยืดอายุแบตเตอรี่หมวกได้หลายเท่า |
| **ติดล็อกเฉพาะยี่ห้อ (Brand Lock-in):** ระบบแชร์เพลงบลูทูธค่ายดังมักใช้ได้เฉพาะแบรนด์เดียวกัน | **Universal Web Platform:** ทำงานผ่านเว็บเบราว์เซอร์บนมือถือ ทำให้ใช้ร่วมกับบลูทูธติดหมวกกันน็อคยี่ห้อใดก็ได้ในโลก |
| **ระยะทางที่จำกัด / สัญญาณหลุดง่าย:** สัญญาณบลูทูธแชร์เพลงมักกระตุกหากคนขับและคนซ้อนห่างกัน | **Wi-Fi Hotspot / Cloud WebSockets:** ใช้สัญญาณ Wi-Fi จาก Hotspot หรืออินเทอร์เน็ตมือถือในการส่งข้อมูลซิงค์ ซึ่งมีความเข้มข้นของสัญญาณและระยะส่งไกลกว่าบลูทูธมาก |
| **อันตรายหากคนขับต้องเปลี่ยนเพลง:** คนขับไม่สามารถปล่อยมือจากแฮนด์เพื่อกดเลือกเพลงขณะขับขี่ได้ | **ระบบให้คนซ้อนควบคุม (Passenger Remote):** คนซ้อนสามารถใช้มือถือของตัวเองเป็นคีย์บอร์ดค้นหาและจัดคิวเพลงได้โดยไม่ต้องกวนคนขับ |
| **รอยต่อระหว่างเพลงที่เงียบเกินไป:** ขับรถตากลมแรงๆ หากเพลงเงียบไปเฉยๆ จะทำให้อารมณ์ขาดตอน | **Dual-Player Crossfade:** ระบบเครื่องเล่น 2 ช่องสัญญาณ ค่อยๆ เฟดเพลงเก่าลงและเฟดเพลงใหม่ขึ้นอย่างนุ่มนวล ปิดช่องว่างแห่งความเงียบ |
| **สัญญาณเสียงตีกัน (Audio Clashing):** เมื่อเปิดเพลงแชร์กัน เสียงเพลงมักไปกลบหรือตัดช่องสัญญาณเตือนของแผนที่นำทาง (GPS) หรือสัญญาณคุยสาย (Intercom) ทำให้ใช้งานพร้อมกันไม่ได้ | **Dual Bluetooth Audio Orchestrator:** ระบบแบ่งระดับความสำคัญของเสียง (Audio Priority System) ปรับลดระดับเสียงเพลงลงอัตโนมัติ (Ducking) เมื่อมีเสียงนำทาง หรือรองรับการใช้แชตเสียงในวง Hotspot เพื่อสื่อสารคู่ขนานไปพร้อมกัน |

## **3\. สถาปัตยกรรมระบบการเชื่อมต่อ (System Architecture)**

ระบบถูกออกแบบมาให้รองรับการเชื่อมต่อ **2 รูปแบบ** ตามสภาพแวดล้อมในการขับขี่:

### **3.1 รูปแบบที่ 1: Hybrid Cloud Mode (เหมาะสำหรับขับขี่ในเมืองที่มีเน็ตตลอดทาง)**

ใช้ Cloud Server เป็นตัวเชื่อมประสานคิวและเวลาเพลงผ่านสัญญาณ 4G/5G

\[ iphoneA (Rider/Master) \] \<--- 4G/5G \---\> \[ Cloud Server \] \<--- 4G/5G \---\> \[ iphoneB (Passenger/Slave) \]  
            |                                                                           |  
     Bluetooth (A2DP)                                                            Bluetooth (A2DP)  
            v                                                                           v  
     \[ BT-Headset A \]                                                            \[ BT-Headset B \]

### **3.2 รูปแบบที่ 2: Local Hotspot Mode (แนะนำ: เสถียรที่สุด / ใช้ได้แม้ในจุดอับสัญญาณ)**

คนขับเปิด **Personal Hotspot (Wi-Fi)** จากเครื่องตัวเอง แล้วให้คนซ้อนเชื่อมต่อเข้ามา วิธีนี้มีจุดเด่นหลายประการ:

1. **แชร์อินเทอร์เน็ต:** คนซ้อนใช้งานเน็ตจากคนขับเพื่อโหลดเพลง YouTube ได้ทันที แม้คนซ้อนจะไม่มีสัญญาณเน็ตหรือไม่มีซิมการ์ด  
2. **ความหน่วงต่ำที่สุด (Ultra-low Latency):** หากรันเซิร์ฟเวอร์ควบคุมภายในวงแลนเดียวกัน (Local Signaling Server) ข้อมูลเวลาเพลงจะวิ่งเข้าหากันทันทีผ่านสัญญาณ Wi-Fi ที่ระยะห่างไม่เกิน 1 ม. ความดีเลย์จะเป็น 0ms  
3. **เสถียรภาพสูง:** สัญญาณ Wi-Fi แข็งแกร่งกว่าบลูทูธ และไม่ส่งคลื่นรบกวนสัญญาณเสียงที่ส่งไปยังหูฟังหมวกกันน็อค

          \[ iphoneA (Rider/Master) \]  \<=== เปิด Personal Hotspot (Wi-Fi) \===+  
            |                  |                                            |  
     Bluetooth (A2DP)     (รัน Local WS Server)                             |  
            v                  |                                            v  
     \[ BT-Headset A \]          \+--------- ส่งข้อมูลซิงค์เพลง (0ms) \---------\> \[ iphoneB (Passenger/Slave) \]  
                                                                            |  
                                                                     Bluetooth (A2DP)  
                                                                            v  
                                                                     \[ BT-Headset B \]

### **3.3 การวิเคราะห์เชิงเปรียบเทียบทางเทคนิค: ทำไมต้อง Wi-Fi Hotspot แทนที่จะเป็น Mesh?**

การวิเคราะห์ความแตกต่างระหว่างระบบแชร์เพลงผ่าน **Wi-Fi Hotspot ของ CoVibe** และระบบ **Mesh Intercom ของค่ายใหญ่ (Sena / Cardo)** เพื่ออธิบายทางเลือกทางเทคนิคที่เหมาะสมที่สุดสำหรับโปรดักต์:

| มิติการเปรียบเทียบ | ระบบ Mesh Intercom (Sena / Cardo) | ระบบ Wi-Fi Hotspot (CoVibe) |
| :---- | :---- | :---- |
| **วัตถุประสงค์หลัก** | การสนทนาพูดคุยกลุ่มขนาดใหญ่แบบเรียลไทม์และปลอดภัย | การแชร์คิวเพลงสเตอริโอและควบคุมเครื่องเล่นร่วมกัน |
| **แบนด์วิดท์ (Bandwidth)** | **ต่ำมาก** เน้นบีบอัดเสียงสนทนาให้เบาที่สุด (Compressed Mono) เพื่อประหยัดช่องสัญญาณสำหรับการเตือนภัย | **สูงมาก** รองรับข้อมูลเสียงสเตอริโอคุณภาพสูง (Stereo High-Fidelity) พร้อมกันสองเครื่องได้ราบรื่น |
| **ปัญหา Brand Lock-in** | **สูง** ต้องใช้อุปกรณ์ยี่ห้อและซีรีส์เดียวกัน หากใช้ข้ามแบรนด์ (Sena vs Cardo) จะแชร์เพลงไม่ได้ | **ไม่มี** ทำงานบนระบบ OS มือถือ ทำให้หูฟังบลูทูธหรืออินเตอร์คอมยี่ห้อใดๆ ก็ตามสามารถรับฟังเพลงร่วมกันได้ |
| **การจัดการพลังงาน** | ตัวชิปส่งสัญญาณประหยัดพลังงานมาก แต่ถ้าเปิดใช้ฟังก์ชันแชร์เพลงร่วมด้วย แบตเตอรี่หมวกจะหมดไวขึ้น 2 เท่า | โทรศัพท์มือถือรับภาระประมวลผลและการสตรีมสัญญาณ โดยโทรศัพท์สามารถเสียบสายชาร์จในรถได้ ทำให้หมวกกันน็อคแบตไม่เสื่อมไว |
| **ความหน่วงของเพลง** | ต่ำมาก (10-50ms) สำหรับเสียงพูด แต่เพลงมักจะมีปัญหากระตุกหากมีคนพูดแทรกหรือช่องสัญญาณหนาแน่น | ต่ำ (0-10ms ผ่าน Local Hotspot) เพลงเล่นไปพร้อมเพรียงกันอย่างลื่นไหลโดยไม่มีสัญญาณเสียงพูดมาเบียดแบนด์วิดท์ |
| **โครงสร้างสถาปัตยกรรม** | **Decentralized (ไร้จุดศูนย์กลาง)** คันไหนหลุดไปคนอื่นยังคุยได้ แต่แชร์เพลงให้ฟังพร่ำเพรื่อได้ยาก | **Client-Server (ผ่าน Hotspot ระยะประชิด)** สำหรับกลุ่มเล็ก (คนขับ-คนซ้อน) ระยะทาง 1 เมตร สัญญาณ Wi-Fi เสถียร 100% |

**สรุปเหตุผลการเลือกเทคโนโลยี:** ระบบ Mesh ของค่ายใหญ่ออกแบบมาได้ดีที่สุดสำหรับ "การพูดคุยเตือนภัย" แต่เนื่องจากสถาปัตยกรรมดังกล่าวมีแบนด์วิดท์จำกัด จึงส่งผลให้ระบบ "แชร์เพลง" ของ Mesh มีคุณภาพเสียงที่แย่ ล็อกเฉพาะยี่ห้อ และกินแบตเตอรี่หมวกอย่างมหาศาล ระบบ **CoVibe** จึงปิดช่องว่างนี้ด้วยการเปลี่ยนมาใช้ท่อส่งสัญญาณขนาดใหญ่ของ **Wi-Fi Hotspot** บนโทรศัพท์มือถือที่ทุกคนมีอยู่แล้ว เพื่อแลกเปลี่ยนข้อมูลวินาทีและคิวเพลง โดยโยนภาระจากหมวกกันน็อคมาที่สมาร์ทโฟนแทน

### **3.4 สถาปัตยกรรมโหมดเสียงคู่ขนาน (Dual Bluetooth Mode Architecture)**

ในการขับขี่จริง เพื่อให้ผู้ใช้สามารถฟังเพลง (Music) ซิงค์พิกัดแผนที่ (GPS) และพูดคุยกับเพื่อน (Intercom/Voice Call) ได้พร้อมกันโดยไม่มีช่องสัญญาณใดตีกันหรือตัดกัน ระบบจะใช้การเชื่อมต่อระดับฮาร์ดแวร์และซอฟต์แวร์แบบ **Dual Bluetooth & OS Audio Focus Mix** ดังแผนภาพด้านล่าง:

                  \+--------------------------------------------------------+  
                  |               \[ โทรศัพท์ของผู้ใช้ (iOS/Android) \]       |  
                  |                                                        |  
                  |  \[ CoVibe App (Music) \]  \[ GPS App \]  \[ Voice Chat \] |  
                  |            \\                    |             /        |  
                  |             \\                   |            /         |  
                  |        (Audio Focus / AVAudioSession Mixing Engine)    |  
                  \+----------------------------+---------------------------+  
                                               |  
                             Bluetooth Multi-Point Stream (A2DP / HFP)  
                                               |  
                                               v  
                                  \[ หูฟังบลูทูธติดหมวกกันน็อค \]  
                                  \- ขับเสียงดนตรีพื้นหลังแบบสเตอริโอ  
                                  \- เสียงนำทาง GPS แทรกแบบ Ducking  
                                  \- เปิดไมค์สนทนาแบบ Low-latency (VoIP)

การแยกส่วนการทำงานของเสียงแบ่งออกเป็น 3 โหมดพฤติกรรมหลัก:

1. **Music Player (CoVibe):** ส่งสัญญาณเสียงระดับพรีเมียม (A2DP \- Stereo Profile)  
2. **GPS Navigation:** รับฟีดสัญญาณแจ้งเตือนและเข้าแทรกแบบชั่วคราว (Transient Ducking Profile)  
3. **Intercom / Voice Call:** เชื่อมต่อคุยสายไร้รอยต่อโดยใช้โปรโตคอล VoIP ผ่านวง Wi-Fi Hotspot เดียวกัน (ไม่ต้องใช้ระบบอินเตอร์คอมบลูทูธแบบดั้งเดิมข้ามเครื่องเพื่อประหยัดแบตเตอรี่หมวก) หรือเปิดใช้งานแบบผสมผสานร่วมกับระบบ Mesh/Bluetooth Intercom ทางกายภาพของอุปกรณ์ติดหมวกที่รองรับ Bluetooth Multi-point

### **3.5 การวิเคราะห์และเปรียบเทียบระดับฮาร์ดแวร์ปลายทาง (Earbuds vs Helmet Intercom)**

เพื่อช่วยให้การออกแบบโครงสร้างการสลับสตรีมระดับเสียงของ **CoVibe** เข้ากันได้กับฮาร์ดแวร์รับสัญญาณเสียงในตลาดปี 2026 แผนภูมิตารางนี้เปรียบเทียบข้อดีและข้อจำกัดระหว่างการใช้ **หูฟังไร้สาย (TWS)** และ **ระบบอินเตอร์คอมติดหมวกกันน็อค (Helmet Intercom)**:

| หัวข้อเปรียบเทียบ | หูฟังไร้สาย (Earbuds / TWS) | ระบบอินเตอร์คอม (Helmet Intercom) | ผู้ชนะสำหรับโปรดักต์ |
| :---- | :---- | :---- | :---- |
| **ความสบายใต้หมวกกันน็อค** | ปานกลาง (ขึ้นอยู่กับรูปทรงหูและขนาดหมวก มีโอกาสกดเจ็บหูหากใช้เป็นเวลานาน) | **ดีเยี่ยม** (ติดตั้งลำโพงบางพิเศษด้านในนวมแก้มของหมวกโดยเฉพาะ) | **Helmet Intercom** |
| **คุณภาพเสียงเพลง** | **ดีเยี่ยม** (มีเทคโนโลยี ANC ตัดเสียงลมรอบข้าง, มิติเสียงเบสลึก, Spatial Audio) | ปานกลาง (มักจะเจอปัญหาสัญญาณลมรบกวนภายนอกที่ความเร็วสูงกว่า 80 กม./ชม.) | **Earbuds (TWS)** |
| **ระบบการสื่อสารแบบกลุ่ม** | ไม่มีในตัว (ต้องใช้งานแอป VoIP ตัวช่วยที่มี Latency สูง เช่น BlinkTalk) | **ดีเยี่ยม** (มีโครงสร้างฮาร์ดแวร์ Mesh แชตคุยแบบ Low-latency คุมระยะทางไกล) | **Helmet Intercom** |
| **ระบบตัดเสียงลม (Noise Isolation)** | ดีมาก (หากสวมปลอกจุกหูฟังที่พอดีและเปิดโหมด ANC ช่วยลดเสียงลมพัดใต้หมวก) | ดีปานกลาง (มีไมโครโฟนตัดเสียงลมนอกหมวก แต่ผู้ฟังยังคงได้ยินเสียงลมหวนอยู่) | **Earbuds (TWS)** |
| **ความเสถียร Bluetooth** | ปานกลาง (อาจพบปัญหาสัญญาณกระตุกที่ความเร็วสูงจากการรับลมและความร้อน) | **ดีเยี่ยม** (สายอากาศและวงจรรับสัญญาณบลูทูธผลิตมาสำหรับทนทานกลางแจ้งความเร็วสูง) | **Helmet Intercom** |
| **ชั่วโมงการใช้งานแบตเตอรี่** | 4 \- 8 ชั่วโมงต่อการชาร์จหนึ่งครั้ง (ต้องเก็บใส่เคสชาร์จระหว่างวัน) | **10 \- 24 ชั่วโมง** (แบตเตอรี่ก้อนใหญ่ แต่อัตราการใช้วิ่งสูงเมื่อสตรีมผ่าน Bluetooth) | **Helmet Intercom** |
| **ความประหยัดและคุ้มค่า** | **ดีมาก** (ราคาเฉลี่ย 1,000 \- 8,000 บาท สามารถนำไปใช้งานในชีวิตประจำวันอื่นๆ ได้) | สูง (ราคาเฉลี่ย 3,000 \- 15,000 บาท ล็อกติดอยู่กับหมวกใบใดใบหนึ่ง) | **Earbuds (TWS)** |
| **ความสะดวกในการติดตั้ง** | **ง่ายที่สุด** (หยิบสวมใส่เข้าในหูแล้วสวมหมวกทับได้ทันที) | ยุ่งยาก (ต้องติดตั้งเดินสายลำโพง ติดกาว แซะนวมรองแก้ม และสลับหมวกทำได้ยาก) | **Earbuds (TWS)** |
| **ความยืดหยุ่นสากล (Universal)** | **สูงสุด** (เชื่อมต่อข้ามแพลตฟอร์ม OS และหูฟังต่างยี่ห้อได้ทันที) | ต่ำ (ติดขัดการเชื่อมต่อข้ามค่ายยักษ์ใหญ่ต่างยี่ห้อ เช่น Sena ข้าม Cardo) | **Earbuds (TWS)** |

### **3.6 บทวิเคราะห์และโอกาสทางการตลาดเชิงกลยุทธ์ (Market Analysis & Strategic Position)**

#### **3.6.1 ขนาดการเติบโตของตลาดหูฟัง (TWS Market Size & CAGR)**

* **การเติบโตอย่างรวดเร็ว:** ตลาดหูฟังไร้สาย True Wireless Stereo (TWS) ทั่วโลกมีขนาดตลาดในระยะปี 2025-2026 อยู่ที่ประมาณ **32,000 \- 42,000 ล้านดอลลาร์สหรัฐ** โดยเซกเมนต์ TWS ครองส่วนแบ่งสูงถึง 68 \- 73% ของหูฟังแบบไร้สายทั้งหมด และคาดว่าตลาดนี้จะรักษาอัตราการเติบโต (CAGR) ที่ระดับ **9 \- 15%** ไปจนถึงทศวรรษหน้า  
* **จุดเด่นทางภูมิศาสตร์:** ภูมิภาคเอเชียแปซิฟิก (APAC) ซึ่งรวมถึงประเทศไทยเป็นตลาดที่มีสัดส่วนผู้ใช้ TWS สูงเป็นอันดับหนึ่งของโลก (คิดเป็น 35 \- 39% ของยอดแชร์ทั่วโลก) ด้วยพฤติกรรมยอดซื้อหูฟังพรีเมียมราคาคุ้มค่า ประกอบกับวัฒนธรรมการเดินทางด้วยจักรยานยนต์และการท่องเที่ยวแบบทัวร์ริ่ง (Motorcycle Touring) ที่สูงเป็นเอกลักษณ์

#### **3.6.2 โอกาสระดับบลูโอเชียน (Blue Ocean Software Companion)**

* **ซอฟต์แวร์เสรีไร้รอยต่อ (Universal Companion):** CoVibe จะวางตำแหน่งทางการตลาดไม่ใช่เพื่อการแข่งขันกับผู้ผลิตอุปกรณ์ฮาร์ดแวร์ แต่เป็น **"ตัวเติมเต็มความสามารถ" (Software Enabler)** ที่เชื่อมต่อระบบนิเวศระหว่างโทรศัพท์มือถือ หูฟัง TWS ทุกยี่ห้อในตลาด และชุดบลูทูธติดหมวกกันน็อค  
* **แก้ข้อจำกัดของ TWS สำหรับผู้ใช้สองล้อ:** แอปพลิเคชันช่วยอุดรอยรั่วเรื่องปุ่มกดการสั่งคิวเพลงแบบแชร์ร่วมกัน (Passenger Remote), ระบบสลับเสียงเหลื่อมสมูท (Crossfade) และการคุยสาย VoIP แบบ Real-time บนวง LAN ท้องถิ่น ทำให้กลุ่มผู้ใช้หูฟังทั่วไปที่ไม่อยากซื้อฮาร์ดแวร์อินเตอร์คอมราคาสูง สามารถรับประสบการณ์ท่องเที่ยวแชร์เพลงระดับเวิลด์คลาสได้ทันที

#### **3.6.3 ตัวเลือกการกำหนดโครงสร้างและพฤติกรรมผู้ใช้ (User Configuration Profiles)**

เพื่อเพิ่มขีดความสามารถและสร้างฐานลูกค้าได้รวดเร็ว CoVibe จะรองรับการใช้แบบยืดหยุ่นใน 3 รูปแบบกลุ่มผู้ใช้:

1. **Pure Earbuds Setup (กลุ่มประหยัดและรักเสียงสเตอริโอ):** \* คนขับและคนซ้อนใช้หูฟัง TWS ปกติ เชื่อมกับสมาร์ทโฟนของตนเอง แล้วซิงค์เพลงและแชต VoIP ท้องถิ่นผ่านเครือข่าย Wi-Fi Hotspot ของคนขับ  
2. **Pure Intercom Setup (กลุ่มทัวร์ริ่งดั้งเดิม):** \* คนขับและคนซ้อนใช้อุปกรณ์ติดหมวกราคาสูง แต่เชื่อมต่อผ่านแอป CoVibe ในมือถือเพื่อแก้ปัญหาเพลงขาดตอนหรืออาการหน่วงเวลาแชร์เพลงดนตรีคลาสสิก  
3. **Hybrid Setup (ทางเลือกแนะนำเพื่อประสิทธิภาพสูงสุด):** \* ใช้ **Earbuds คุณภาพสูงที่ใส่สบาย** (เช่นแบรนด์ Soundcore, Sony หรือประเภท Open-Ear/Bone Conduction) สวมใส่สำหรับการฟังเพลงสเตอริโอที่มี ANC ตัดเสียงลมถนนได้อย่างมีประสิทธิภาพ  
   * ร่วมกับการใช้งาน **Helmet Intercom ระดับเริ่มต้นหรือราคาย่อมเยา** (เช่น Fodsports, Lexin) สำหรับส่งสัญญาณพูดคุยสนทนากลุ่ม  
   * บูรณาการทั้งสองโครงข่ายโดยใช้ซอฟต์แวร์ **CoVibe** เป็นตัวแชร์และควบคุมคิวเพลงส่วนกลาง

### **3.7 การวิเคราะห์เชิงเปรียบเทียบทางเทคนิค: CoVibe vs Apple Share Audio**

การวิเคราะห์เพื่อชี้แจงข้อแตกต่างเชิงลึกและทลายข้อจำกัดทางเทคนิคของฟีเจอร์แชร์เสียงระบบปิดของ Apple (Share Audio) เพื่อพิสูจน์ความจำเป็นของ CoVibe ในหมวดหมู่การใช้งานขับขี่จริงบนท้องถนน:

| มิติการเปรียบเทียบ | Apple Share Audio (ฟีเจอร์ระดับ OS ของ Apple) | CoVibe (ซอฟต์แวร์ทางเลือกของเรา) |
| :---- | :---- | :---- |
| **ข้อจำกัดเชิงฮาร์ดแวร์ (Ecosystem Lock-in)** | **สูงมาก** รองรับเฉพาะผลิตภัณฑ์หูฟังในเครือ Apple และ Beats เท่านั้น (AirPods ทุกรุ่น และ Beats) | **ไม่มี (Universal Approach)** รองรับหูฟังบลูทูธและอินเตอร์คอมติดหมวกกันน็อคทุกรุ่น ทุกสัญชาติ และทุกยี่ห้อในโลก |
| **สิทธิ์และการควบคุม (Control Hierarchy)** | **ผูกขาดจากเครื่องแม่** (iPhone คนขับควบคุมคนเดียว) คนซ้อนไม่มีหน้าจอส่วนตัวในการค้นหาหรือจัดการคิวเพลง | **เป็นประชาธิปไตย (Shared Remote)** คนขับและคนซ้อนมีแผงรีโมตส่วนตัวเพื่อพิมพ์ค้นหาและเพิ่มเพลงในคิวได้อิสระ |
| **ความเข้ากันได้ข้ามระบบ (Cross-platform compatibility)** | **ไม่มี** จำกัดสิทธิ์เฉพาะระบบปฏิบัติการ iOS สตรีมหากันข้ามค่ายไม่ได้ | **สมบูรณ์แบบ** รองรับการเชื่อมต่อและซิงค์เพลงร่วมกันแบบข้ามค่ายได้อย่างไร้รอยต่อ **(iOS \<-\> Android)** |
| **การคุยสนทนาขณะฟังเพลง (Intercom Support)** | หากเปิดไมค์คุย ระบบจะปรับสตรีมดนตรีเป็น Mono คุณภาพต่ำ (HFP) หรือหยุดแชร์สตรีมหลักไปเลย | **คุณภาพเสียงเพลงยังคงเป็น Stereo** คมชัดคงเดิม เนื่องจากแยกท่อข้อมูลเสียงคุย (VoIP) และเพลงออกจากกัน |
| **ระยะการเชื่อมต่อทางกายภาพ (Working Range)** | จำกัดมาก ไม่เกิน 5 \- 10 เมตรตามความแรง Bluetooth เครื่องแม่ (หากนั่งห่างกันนิดเดียวระบบจะตัดเสียงทันที) | **ไกลกว่าหลายสิบเท่า** สัญญาณเชื่อมต่อคุยกันผ่าน Wi-Fi Hotspot หรือเสาสัญญาณคลาวด์ 4G/5G ทำให้สตรีมได้ไกลข้ามเลนถนน |

## **4\. ความต้องการเชิงฟังก์ชันการทำงาน (Functional Requirements)**

### **4.1 ฟังก์ชันสำหรับคนขับ (Host/Rider Flow)**

* **การสร้างทริปและเปิด Hotspot:** ระบบจะแสดงคำแนะนำให้คนขับเปิด Personal Hotspot บนเครื่อง จากนั้นหน้าเว็บจะแสดง QR Code และบอกเลข IP เครื่องโฮสต์ (เช่น 192.168.1.1 หรือ 172.20.10.1) ให้คนซ้อนเชื่อมต่อ  
* **หน้าจอ Rider Dashboard UI:** ปุ่มควบคุมขนาดใหญ่พิเศษสไตล์เรียบง่าย เหมาะกับการกดขณะขับขี่และสวมถุงมือ  
* **โหมดประหยัดพลังงานหน้าจอ (OLED Saver / Black Screen):** ปุ่มปิดภาพวิดีโอ YouTube ให้เหลือเพียงหน้าจอดำสนิท เพื่อลดความร้อนของสมาร์ทโฟนขณะยึดติดกับแฮนด์รถตากแดด และช่วยยืดอายุแบตเตอรี่โทรศัพท์  
* **โหมดออฟไลน์ (Offline Playlist Mode):** หากขับรถเข้าป่าหรือขึ้นเขาที่ไม่มีสัญญาณอินเทอร์เน็ตเลย คนขับสามารถสลับโหมดมาเล่นไฟล์เพลงในเครื่อง (Local Storage/Offline MP3) และซิงค์ไฟล์เสียงข้ามเครื่องผ่านระบบ Local Wi-Fi ได้  
* **ระบบจัดการเสียง Dual Bluetooth (Simultaneous Audio Config):** หน้าต่างเปิด-ปิดการแชร์ช่องสัญญาณเสียงร่วมกับแอปนำทาง GPS และสวิตช์เปิดการคุยสายผ่านไมโครโฟนไปพร้อมๆ กับการเล่นเพลง

### **4.2 ฟังก์ชันสำหรับคนซ้อน (Passenger Remote Flow)**

* **การเชื่อมต่อด่วน (Fast Join):** เมื่อเชื่อมต่อ Wi-Fi Hotspot ของคนขับแล้ว คนซ้อนเพียงสแกน QR Code เพื่อเปิดหน้าจอรีโมตควบคุมได้ทันที  
* **การค้นหาและรุมคิวเพลง (Search & Ride-Queue):** ค้นหา จัดคิวเพลง หรือแชร์ลิงก์ YouTube ส่งตรงเข้าสู่แถวเล่นเพลงส่วนกลาง  
* **ระบบปรับระดับเสียงแยกอิสระ (Independent Volume Control):** แม้เพลงจะเล่นซิงค์วินาทีเดียวกันเป๊ะ แต่แต่ละเครื่องสามารถเลื่อนปรับระดับเสียงในหูฟังหมวกตัวเองได้อิสระตามความพึงพอใจและสรีระหมวกกันน็อค  
* **ระบบส่งเสียงคุยไมโครโฟน (Local Intercom Switch):** ปุ่มเปิด-ปิดไมโครโฟนของตัวเอง เพื่อส่งเสียงพูดผ่านระบบ VoIP ท้องถิ่นไปยังหูฟังของคนขับได้ทันทีแบบเรียลไทม์

## **5\. รายละเอียดเชิงลึกทางเทคนิค: ระบบซิงค์และสลับสัญญาณเสียงระดับระบบปฏิบัติการ (Technical Deep Dive)**

### **5.1 การค้นหาและการระบุตัวตนในวง LAN (Local Peer Discovery)**

* เมื่อเครื่องของคนซ้อนต่อ Hotspot ของเครื่องคนขับสำเร็จ ตัวสมาร์ทโฟนของคนซ้อนจะได้รับ IP Address ที่อยู่ใน Subnet เดียวกัน (เช่น 172.20.10.x สำหรับ iOS Hotspot)  
* เครื่องคนขับซึ่งทำหน้าที่เป็น Master จะสตาร์ทเครื่องข่าย Socket Server ในตัวแอปที่พอร์ตเฉพาะ (เช่น ws://172.20.10.1:8080) ทำให้เครื่องคนซ้อนสามารถเชื่อมต่อสายตรงคุยกันได้โดยไม่ต้องวิ่งออกอินเทอร์เน็ตภายนอกเพื่อซิงค์ข้อมูลเวลาเพลง

### **5.2 การควบคุมการเล่นเหลื่อมสองเครื่องเล่นคู่ขนาน (Dual-Player Crossfade Process)**

\*แต่ละเครื่องจะรัน playerA และ playerB ทับซ้อนกันอยู่บนเบราว์เซอร์ของตัวเอง

* **วินาทีที่ 0-230:** playerA เล่นเพลงที่ 1 ระดับเสียง 100%  
* **วินาทีที่ 230 (เหลือ 10 วินาทีสุดท้าย):** เครื่อง Master (คนขับ) สั่งรันชุดคำสั่ง "Crossfade\_Trigger" ไปยังห้อง  
* เครื่อง Slave (คนซ้อน) ได้รับสัญญาณทันทีผ่าน Wi-Fi และสั่งเริ่มโหลดเพลงถัดไปใน playerB ของเครื่องตัวเองล่วงหน้าทันที  
* **วินาทีที่ 230-240:** ฟังก์ชัน JavaScript บนมือถือของแต่ละเครื่องจะทำการลดเสียง playerA พร้อมกับเพิ่มเสียง playerB เป็นขั้นบันได (Step Change) พร้อมกันแบบไร้ความหน่วงของเสียง

### **5.3 ตรรกะการจัดลำดับเสียงและลดทอนเสียงระดับ OS (Audio Focus & Ducking Engine)**

เพื่อไม่ให้เสียงเพลงขัดจังหวะความปลอดภัยในการเตือนภัยของระบบแผนที่นำทางและระบบคุยสายอินเตอร์คอม ตัวแอปพลิเคชันจะรันการจัดลำดับเสียงผ่าน API ท้องถิ่นของแต่ละระบบปฏิบัติการดังนี้:

#### **5.3.1 สำหรับสถาปัตยกรรม iOS (AVAudioSession)**

บนอุปกรณ์ iOS ตัวแอปพลิเคชันจะกำหนดค่าพารามิเตอร์ของหมวดหมู่และตัวเลือกของ AVAudioSession เพื่ออนุญาตการสตรีมเสียงแบบผสมผสาน (Audio Mixing):

* **Category:** กำหนดเป็น AVAudioSessionCategoryPlayback (เพื่อให้สตรีมเสียงต่อได้ในโหมดเบื้องหลัง)  
* **CategoryOptions:** เปิดใช้งานการตั้งค่า AVAudioSessionCategoryOptionMixWithOthers และ AVAudioSessionCategoryOptionDuckOthers  
* **การทำงาน:** เมื่อมีการนำทาง GPS จากภายนอกแอป (เช่น Google Maps) ส่งสัญญาณเสียงเตือนเลี้ยว ระบบปฏิบัติการ iOS จะทำการ **Ducking** (ลดระดับเสียงเพลง CoVibe อัตโนมัติลงเหลือ 20%) ชั่วคราว และจะเพิ่มเสียงกลับคืนมาเป็น 100% ทันทีเมื่อเสียงเตือนนำทางจบลง

#### **5.3.2 สำหรับสถาปัตยกรรม Android (AudioFocusRequest)**

บนอุปกรณ์ Android ตัวแอปพลิเคชันจะใช้ตัวจัดการเสียง AudioManager เพื่อจับตาดูและบริหารลำดับความสำคัญของช่องเสียง:

* **Audio Attributes:** ตั้งค่าการใช้งานเป็น Usage: USAGE\_MEDIA และ ContentType: CONTENT\_TYPE\_MUSIC  
* **Focus Request:** ยื่นขอตรวจสอบผ่านโหมดการรับสิทธิ์โฟกัสชั่วคราวพร้อมการหรี่เสียง (AUDIOFOCUS\_GAIN\_TRANSIENT\_MAY\_DUCK)  
* **ตรรกะการลดทอนเสียง (Ducking Algorithm):![][image1]**  
  โดยปกติกำหนดค่า ![][image2] (ลดเสียงเหลือ 20% ของระดับเสียงหลัก) เมื่อตรวจพบสัญญาณอีเวนต์ OnAudioFocusChangeListener ส่งค่าสิทธิ์ AUDIOFOCUS\_LOSS\_TRANSIENT\_CAN\_DUCK กลับมาจากตัวระบบปฏิบัติการเมื่อแอปภายนอกต้องการกระจายเสียงเตือน

#### **5.3.3 สถาปัตยกรรมระบบอินเตอร์คอมผ่านวงเครือข่ายจำลอง (Local VoIP Intercom)**

ในกรณีที่หูฟังติดหมวกของผู้ใช้ไม่รองรับการคุยสายผ่านบลูทูธแบบ Multi-point (ไม่สามารถแชร์เพลงและคุยอินเตอร์คอมฮาร์ดแวร์ไปพร้อมกันได้) ตัวแอปจะทำหน้าที่สร้างช่องทางเชื่อมโยงไมค์คุยสายภายในตัวแอปพลิเคชันโดยตรงผ่านสัญญาณ Wi-Fi Hotspot:

* **โปรโตคอล:** ใช้ WebRTC ในการแลกเปลี่ยนกระแสสัญญาณข้อมูลเสียง (Audio Streams) แบบจุดต่อจุด (Peer-to-Peer) ในวงเครือข่าย LAN เดียวกัน  
* **Audio Routing:** เสียงไมค์ของคนซ้อนจะถูกส่งผ่านช่องสตรีมเน็ตเวิร์กเข้าผสมรวมอยู่ใน Audio Track ท้องถิ่นของคนขับทันที ส่งผลให้เสียงของเพื่อนและเสียงเพลงออกมาจากพอร์ตเสียงเดียวกัน (Single Output Device) ป้องกันปัญหาช่องเสียงหมวกกันน็อคปิดกั้นกันเอง แบตเตอรี่หมวกจึงกินไฟต่ำตามเดิมเพราะคุยผ่านสายสตรีมหลักของโทรศัพท์

## **6\. ความต้องการเชิงคุณภาพและกรณีพิเศษ (Non-Functional & Edge Cases)**

* **ความเสถียรของสัญญาณ Wi-Fi ระยะประชิด:** เนื่องจากระยะห่างระหว่างคนขับและคนซ้อนไม่เกิน 1.5 เมตร สัญญาณ Wi-Fi จะมีความเข้มข้นสูงสุด (Full Signal Strength) ตลอดเวลา อัตราการสูญเสียแพ็กเก็ตข้อมูล (Packet Loss) จะต่ำกว่า 0.1% ส่งผลให้เวลาเพลงตรงกันอย่างสมบูรณ์แบบ  
* **การจัดการพลังงานและความร้อน:** ตัวแอปพลิเคชันจะปิดการเรนเดอร์วิดีโอ 3D หรือแอนิเมชันเคลื่อนไหวทั้งหมดในโหมดขับขี่ เพื่อป้องกันไม่ให้ชิปโมเด็ม Wi-Fi และหน้าจอทำงานหนักจนโทรศัพท์ของคนขับปิดตัวเองจากความร้อนสูง (Thermal Throttling)  
* **การอยู่ร่วมกับระบบควบคุมทางกายภาพของหมวก (Hardware Integration Compatibility):** ตัวแอปพลิเคชันต้องรองรับการส่งผ่านสัญญาณตามมาตรฐาน AVRCP (Audio/Video Remote Control Profile) เพื่อให้ผู้ใช้สามารถข้ามเพลงหรือหยุดเพลงได้โดยการกดปุ่มทางกายภาพที่ตัวหมวกบลูทูธโดยตรง แม้จะอยู่ในโหมดการสตรีมเสียงร่วมกัน

## **7\. แผนพัฒนาในอนาคต (Future Roadmap)**

* **ระบบสั่งงานด้วยเสียง (Voice Control System):** สั่งงานข้ามเพลง หรือหยุดเพลงชั่วคราวด้วยคำพูด เพื่อความปลอดภัยสูงสุดของคนขับ  
* **การแชร์แผนที่และตำแหน่ง (Rider GPS Tracking):** หากใช้ในกรณีเดินทางเป็นขบวน (Convoy) สมาชิกทุกคนที่ต่ออินเทอร์เน็ตจะสามารถเห็นตำแหน่ง GPS ของเพื่อนร่วมทริปบนหน้าจอแสดงผลคิวเพลงได้แบบเรียลไทม์

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>