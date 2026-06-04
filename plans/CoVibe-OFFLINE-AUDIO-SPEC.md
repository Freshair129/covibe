# Functional Specification: Offline Local Audio Support (v1.5)

**Status:** IN PROGRESS (Phase 1: Requirements Approved)

---

## Phase 1: Requirements Gathering

**Feature:** Hybrid Playback System (YouTube + Local MP3)
**Objective:** เพื่อให้แอปสามารถสลับการเล่นระหว่างเพลงออนไลน์ (YouTube) และเพลงออฟไลน์ (Local MP3) ได้อย่างไร้รอยต่อ โดยยังคงรักษาความสามารถในการซิงค์ข้อมูล (Playback Sync) ไว้เหมือนเดิม

### 1. User Stories
- **As a User**, I want the app to automatically switch to the local player when a local track is selected, so that I can listen to my MP3 files.
- **As a Rider**, I want to control the local audio player (Play, Pause, Seek) and have the Passenger's local player respond instantly, just like the YouTube player.
- **As a Passenger**, I want the app to automatically request/download a local file if the Rider starts playing one that I don't have in my machine's cache.

### 2. Acceptance Criteria (EARS Format)

#### Dynamic Player Switching
- **IF** the `currentTrack.source` is `'local'` **THEN** the system **SHALL** mount the `LocalAudioPlayer` component and unmount (or hide) the `YouTubeDeck`.
- **IF** the `currentTrack.source` is `'youtube'` **THEN** the system **SHALL** mount the `YouTubeDeck` component and unmount (or hide) the `LocalAudioPlayer`.

#### Local File Retrieval
- **WHEN** the `LocalAudioPlayer` is mounted **THEN** the system **SHALL** attempt to retrieve the `ArrayBuffer` from IndexedDB using the track's `sourceId` (hash).
- **IF** the file is found in IndexedDB **THEN** the system **SHALL** create a `Blob URL` and load it into the `<audio>` element.
- **IF** the file is NOT found (e.g., Passenger hasn't received it yet) **THEN** the system **SHALL** display a "File not found - Syncing from Rider..." status.

#### Unified Sync Control
- **WHEN** the user interacts with the UI controls (Play/Pause/Skip) **THEN** the system **SHALL** send the same `SYNC_OP` messages via WebRTC/WebSocket regardless of whether the source is Local or YouTube.
- **WHEN** a `SYNC_OP` is received via P2P **AND** the source is Local **THEN** the system **SHALL** apply the action (play/pause/seek) to the HTML5 `<audio>` element.

### 3. Constraints & Edge Cases
- **Constraint:** `Blob URL` ต้องมีการจัดการ `URL.revokeObjectURL` เมื่อมีการสลับเพลงเพื่อประหยัดหน่วยความจำ
- **Edge Case:** หากไฟล์ MP3 เสีย (Corrupted) หรือ Browser ไม่รองรับ Codec นั้น ระบบควรแสดงข้อความ Error และข้ามไปยังเพลงถัดไป
- **Constraint:** ระดับเสียง (Volume) ของ Local Player ต้องซิงค์กับ Slider ของระบบหลักเหมือน YouTube Player

---

## Phase 2: Design Documentation

**Status:** APPROVED

### 1. Overview
เราจะเพิ่มระบบ **Hybrid Player** ที่สามารถสลับระหว่างเครื่องเล่น YouTube (IFrame API) และเครื่องเล่นเพลงท้องถิ่น (HTML5 Audio) โดยใช้ตัวแปร `source` ในวัตถุ `Track` เป็นตัวตัดสิน

### 2. Architecture & Components

#### 2.1 Component: `LocalAudioPlayer` (New)
- **Role:** แสดงผลและควบคุมการเล่นไฟล์ MP3 จากหน่วยความจำ
- **State Management:**
  - `blobUrl`: เก็บ URL ชั่วคราวที่สร้างจาก `URL.createObjectURL(blob)`
  - `error`: เก็บสถานะเมื่อโหลดไฟล์ไม่สำเร็จ
- **Hooks Logic:**
  - `useEffect`: เมื่อโหลดคอมโพเนนต์ จะไปดึง `ArrayBuffer` จาก IndexedDB (ตาม `sourceId`) -> แปลงเป็น `Blob` -> สร้าง `blobUrl`
  - `useEffect`: เมื่อเปลี่ยนเพลงหรือ Unmount จะเรียก `URL.revokeObjectURL(blobUrl)` เพื่อคืนค่าหน่วยความจำ

#### 2.2 Integration Structure (App.tsx)
เราจะปรับโครงสร้างการ render ใน `App.tsx` จากเดิมที่เรียก `YouTubeDeck` ตรงๆ เป็นการเช็ค `room.currentTrack?.source`.

### 3. Data Models & Sync Logic

#### 3.1 Playback Sync Mapping
ระบบ `SYNC_OP` ที่เราทำไว้จะถูกนำมาแมพเข้ากับ HTML5 Audio ดังนี้:
- **`type: 'play'`** -> `audio.play()`
- **`type: 'pause'`** -> `audio.pause()`
- **`type: 'seek'`** -> `audio.currentTime = positionMs / 1000`

#### 3.2 Drift Correction (P2P)
แม้จะเป็นไฟล์ Local แต่หากตำแหน่งเวลาของ Rider และ Passenger คลาดเคลื่อนกันเกิน 300ms ระบบจะใช้ `currentTime` ปรับให้ตรงกันทันทีผ่านคำสั่งที่ส่งทาง P2P

### 4. Error Handling
- **File Not Found:** หากเครื่อง Passenger ไม่มีไฟล์ (Hash ไม่ตรง) ระบบจะแสดงสถานะเพื่อรอรับไฟล์ผ่าน P2P.

---

## Phase 4: Implementation & Integration

**Status:** COMPLETED

### 1. Key Accomplishments
- **LocalAudioPlayer:** สร้างคอมโพเนนต์เครื่องเล่นเพลง HTML5 ที่ดึงข้อมูลจาก IndexedDB ได้โดยตรง.
- **Hybrid Player Logic:** ใน `App.tsx` ระบบสามารถตรวจจับ `track.source` และสลับเครื่องเล่นให้อัตโนมัติ.
- **P2P File Transfer UI:** เพิ่มปุ่ม "Sync เพลงไปที่เครื่องคนซ้อน" สำหรับ Rider เพื่อเริ่มการส่งไฟล์ผ่าน WebRTC.
- **Unified Sync:** ทั้ง YouTube และ Local Player ใช้ชุดคำสั่ง `SYNC_OP` เดียวกัน ทำให้ระบบซิงค์ทำงานข้ามโหมดได้สมบูรณ์.

---
*Documentation finalized as part of v1.5 completion.*

