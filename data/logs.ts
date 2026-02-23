import { LogEntry, LogCategory } from '../types';

export const logs: LogEntry[] = [
    {
        id: 'L-108',
        date: '2024.02.15',
        category: LogCategory.DEV,
        title: 'Building a Real-Time WebSocket Dashboard',
        readTime: '8 MIN',
        preview: 'Implementing a live monitoring dashboard with WebSockets, React, and D3.js for visualizing streaming sensor data.',
        content: `# Building a Real-Time WebSocket Dashboard

## The Problem

Most dashboards poll APIs at fixed intervals. For our IoT sensor network, we needed **sub-second latency** — polling wasn't going to cut it.

## Architecture

\`\`\`
┌─────────┐    WebSocket    ┌──────────┐    React State    ┌───────────┐
│ Sensors │ ──────────────> │  Server  │ ────────────────> │ Dashboard │
└─────────┘                 └──────────┘                   └───────────┘
\`\`\`

## Implementation

The key was using a custom \`useWebSocket\` hook:

\`\`\`typescript
const useWebSocket = (url: string) => {
  const [data, setData] = useState<SensorData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(url);
    wsRef.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setData(prev => [...prev.slice(-100), parsed]);
    };
    return () => wsRef.current?.close();
  }, [url]);

  return data;
};
\`\`\`

## Performance Considerations

- **Ring buffer pattern**: Keep only the last 100 data points in state
- **requestAnimationFrame**: Batch DOM updates for D3 charts
- **Web Workers**: Offload heavy data transformations

> The real bottleneck wasn't the WebSocket — it was React re-renders. Memoization was critical.

## Results

Final dashboard handles **500 messages/second** with smooth 60fps animations on a mid-range laptop.
`,
        tags: ['websocket', 'react', 'real-time'],
    },
    {
        id: 'L-107',
        date: '2024.01.20',
        category: LogCategory.RESEARCH,
        title: 'Attention Is All You Need — Paper Breakdown',
        readTime: '15 MIN',
        preview: 'A personal deep dive into the Transformer architecture paper, with annotated diagrams and implementation notes.',
        content: `# Attention Is All You Need — Paper Breakdown

## Why This Paper Matters

Published in 2017, this paper introduced the **Transformer architecture** that now powers GPT, BERT, and virtually every modern LLM.

## Key Insight: Self-Attention

The core innovation is replacing recurrence with **multi-head self-attention**:

\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k) · V
\`\`\`

Where:
- **Q** (Query): What am I looking for?
- **K** (Key): What do I contain?
- **V** (Value): What do I actually output?

## Multi-Head Attention

Instead of single attention, run **h parallel heads**:

\`\`\`python
def multi_head_attention(Q, K, V, num_heads=8):
    d_model = Q.shape[-1]
    d_k = d_model // num_heads

    heads = []
    for i in range(num_heads):
        Q_i = Q @ W_q[i]  # Project to subspace
        K_i = K @ W_k[i]
        V_i = V @ W_v[i]
        heads.append(attention(Q_i, K_i, V_i))

    return concat(heads) @ W_o
\`\`\`

## Positional Encoding

Since Transformers have no inherent notion of sequence order, positional information is injected via sinusoidal encoding:

\`\`\`
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
\`\`\`

> My takeaway: the brilliance is in *removing* complexity (no recurrence, no convolution) rather than adding it.
`,
        tags: ['ai', 'research', 'transformers'],
    },
    {
        id: 'L-106',
        date: '2023.12.15',
        category: LogCategory.THOUGHTS,
        title: 'The Singularity of Generative AI in Code',
        readTime: '5 MIN',
        preview: 'Analyzing the impact of LLMs on the daily workflow of a full-stack engineer. Are we moving towards being architects rather than bricklayers?',
        content: `# The Singularity of Generative AI in Code

## The Shift

Six months ago, I started using Copilot full-time. Three months ago, I added GPT-4 to my workflow. The change has been... unsettling.

## What Changed

| Task | Before | After |
|------|--------|-------|
| Boilerplate code | 30 min | 2 min |
| Debug investigation | Hours | Minutes |
| Learning new API | Read docs | Ask AI |
| Architecture design | Still me | **Still me** |

The last row is the key insight.

## The Architect's Role

> We are becoming architects, not bricklayers. The AI lays bricks faster than any human could. But it doesn't know *where* to build.

What AI can't do:
- Understand business context
- Make taste-based design decisions
- Navigate organizational politics
- Question requirements

## My Prediction

Within 2 years, "writing code" will be a secondary skill for software engineers. **Systems thinking** and **communication** will be primary.

The engineers who thrive will be the ones who can:
1. Decompose ambiguous problems
2. Evaluate tradeoffs at scale
3. Communicate technical decisions to non-technical stakeholders

*The code writes itself. The question is what to write.*
`,
        tags: ['ai', 'career', 'opinion'],
    },
    {
        id: 'L-105',
        date: '2023.11.28',
        category: LogCategory.HARDWARE,
        title: 'Building a Custom Mechanical Keyboard from Scratch',
        readTime: '10 MIN',
        preview: 'Designing a PCB, 3D-printing a case, and hand-soldering a 65% keyboard with QMK firmware and per-key RGB.',
        content: `# Building a Custom Mechanical Keyboard from Scratch

## Design Goals

- **65% layout** — no numpad, no function row, arrow keys preserved
- **Hot-swap sockets** — change switches without desoldering
- **Per-key RGB** — because cyberpunk aesthetic is non-negotiable
- **QMK firmware** — full programmability, layers, macros

## The PCB

Designed in KiCad. Key decisions:
- **ATmega32U4** microcontroller (USB HID native support)
- **Column-stagger matrix** — 5 rows × 15 columns = 67 keys
- **SK6812 Mini-E** LEDs for per-key RGB

\`\`\`
Matrix wiring:
COL0  COL1  COL2  ... COL14
  |     |     |         |
ROW0 ─ SW1 ─ SW2 ─ ... SW15
ROW1 ─ SW16 ─ SW17 ... SW30
  ...
ROW4 ─ SW53 ─ SW54 ... SW67
\`\`\`

## 3D Printed Case

Material: **PETG** (better heat resistance than PLA)

The case has:
- 7° typing angle
- Integrated cable channel
- Gasket mount standoffs

## Assembly

Total assembly time: **6 hours**
- PCB soldering: 2h
- Case finishing: 1.5h
- Switch lubing: 2h (the therapeutic part)
- Final assembly: 30min

> The most satisfying moment: first key press after flashing QMK. It *worked*.
`,
        tags: ['hardware', 'keyboard', 'diy'],
    },
    {
        id: 'L-104',
        date: '2023.11.01',
        category: LogCategory.TUTORIAL,
        title: 'Reverse Engineering Bluetooth LE Packets',
        readTime: '12 MIN',
        preview: 'A deep dive into sniffing and decoding BLE traffic from smart home devices using Wireshark and a nRF52840 dongle.',
        content: `# Reverse Engineering Bluetooth LE Packets

## Tools Required

- **nRF52840 Dongle** — for BLE packet sniffing
- **Wireshark** — with Nordic BLE sniffer plugin
- **Python 3** — for packet analysis scripts
- A target BLE device (I used a smart light bulb)

## Step 1: Setting Up the Sniffer

\`\`\`bash
# Flash the sniffer firmware
nrfutil dfu usb-serial -pkg sniffer_nrf52840dongle.zip -p COM3

# Start Wireshark with the nRF sniffer interface
wireshark -i nRF_Sniffer -k
\`\`\`

## Step 2: Capturing Advertisements

BLE devices broadcast **advertisement packets** on channels 37, 38, 39. These contain:
- Device name
- Service UUIDs
- Manufacturer-specific data

## Step 3: Decoding the Protocol

After pairing, I captured the GATT writes that control the bulb:

\`\`\`
Handle: 0x0025
Value:  7e 04 04 ff 00 00 00 00 ef
        │  │  │  │  │  │
        │  │  │  R  G  B
        │  │  └─ Command: Set Color
        │  └──── Length
        └─────── Header
\`\`\`

## Step 4: Building a Custom Controller

\`\`\`python
import asyncio
from bleak import BleakClient

async def set_color(address, r, g, b):
    async with BleakClient(address) as client:
        cmd = bytes([0x7e, 0x04, 0x04, r, g, b, 0x00, 0x00, 0xef])
        await client.write_gatt_char("0000fff3-...", cmd)

asyncio.run(set_color("AA:BB:CC:DD:EE:FF", 0, 255, 255))
\`\`\`

> Now I control all my lights from a Python script. The smart home app has been deleted.
`,
        tags: ['ble', 'reverse-engineering', 'tutorial'],
    },
    {
        id: 'L-103',
        date: '2023.10.20',
        category: LogCategory.THOUGHTS,
        title: 'Designing for the Void: Dark Mode UX',
        readTime: '4 MIN',
        preview: 'Why pure black (#000000) causes smearing on OLED screens and how to pick the perfect dark grey for long-session readability.',
        content: `# Designing for the Void: Dark Mode UX

## The #000000 Problem

Pure black on OLED screens causes **black smearing** — a ghosting effect when scrolling. This happens because OLED pixels physically turn off at \`#000000\`, and the re-activation latency creates visible trails.

## The Sweet Spot

After testing on 5 different OLED phones:

| Background | Result |
|-----------|--------|
| \`#000000\` | Smearing on scroll |
| \`#050505\` | Minimal smearing, deep black feel |
| \`#0a0a0a\` | No smearing, slightly elevated |
| \`#121212\` | Material Design recommendation |
| \`#1a1a1a\` | Safe, but loses the "void" feeling |

I settled on **\`#050505\`** — the darkest value before smearing becomes noticeable.

## Typography on Dark

Light text on dark backgrounds requires **reduced font weight**. A \`font-weight: 700\` that looks perfect on white backgrounds feels **heavy and blinding** on black.

My rule: subtract 100-200 from your intended font weight for dark mode.

## Contrast Ratios

WCAG AA requires 4.5:1 contrast. On \`#050505\`:
- \`#e0e0e0\` → 16.5:1 ✓ (primary text)
- \`#808080\` → 5.6:1 ✓ (secondary text)
- \`#404040\` → 2.5:1 ✗ (too dim, use for decorative only)
`,
        tags: ['design', 'ux', 'dark-mode'],
    },
    {
        id: 'L-102',
        date: '2023.10.05',
        category: LogCategory.DEV,
        title: 'Optimizing React Renders with useMemo Deep Dive',
        readTime: '7 MIN',
        preview: 'When useMemo actually helps, when it hurts, and the mental model for making the right call every time.',
        content: `# Optimizing React Renders with useMemo Deep Dive

## The Common Mistake

\`\`\`tsx
// ❌ WRONG: useMemo for simple values
const name = useMemo(() => user.firstName + ' ' + user.lastName, [user]);

// ✅ RIGHT: just compute it
const name = user.firstName + ' ' + user.lastName;
\`\`\`

\`useMemo\` has overhead: it stores the previous value, compares dependencies, and manages memory. For simple computations, this overhead **exceeds the cost of just re-computing**.

## When useMemo Actually Helps

1. **Expensive computations** (>1ms)
2. **Referential equality** for child component props
3. **Derived state** from large datasets

\`\`\`tsx
// ✅ GOOD: expensive filter + sort
const filteredItems = useMemo(() => {
  return items
    .filter(item => item.category === selectedCategory)
    .sort((a, b) => b.score - a.score);
}, [items, selectedCategory]);
\`\`\`

## The Mental Model

Ask yourself two questions:
1. **Is this computation expensive?** If < 1ms, skip useMemo.
2. **Is referential equality important?** If the result is passed to a \`React.memo\` child or used in another hook's dependency array, use useMemo.

> Profile first, memoize second. Premature memoization is premature optimization.
`,
        tags: ['react', 'performance', 'tutorial'],
    },
    {
        id: 'L-101',
        date: '2023.09.05',
        category: LogCategory.SYSTEM,
        title: 'System Migration: NTU Life',
        readTime: '3 MIN',
        preview: 'Relocating base of operations. Establishing new neural links at Nanyang Technological University. Initializing academic protocols.',
        content: `# System Migration: NTU Life

## Status Update

\`\`\`
> MIGRATING base_of_operations...
> SOURCE: Hainan, China
> DESTINATION: Nanyang Technological University, Singapore
> STATUS: COMPLETE
\`\`\`

## New Environment Variables

- **TIMEZONE**: UTC+8 (unchanged, conveniently)
- **LANGUAGE_PRIMARY**: English
- **HUMIDITY**: EXTREME
- **FOOD_QUALITY**: OUTSTANDING

## Initialization Log

Week 1: Orientation. Met fellow nodes in the network. Campus is massive — Google Maps is now a survival tool.

Week 2: Classes begin. Computer Science curriculum is rigorous but well-structured. The lab equipment is impressive.

Week 3: Found the good coffee spots. This is the real milestone.

## System Adaptations

- Switched to lightweight IDE setup (VS Code remote) for working on the go
- Adopted a standing desk workflow for dorm coding sessions
- Set up a local Raspberry Pi server for personal projects

> New neural links established. Academic protocols initialized. System nominal.
`,
        tags: ['life', 'university'],
    },
];

export const getLogById = (id: string): LogEntry | undefined => {
    return logs.find(log => log.id === id);
};

export const getLogsByCategory = (category: LogCategory): LogEntry[] => {
    return logs.filter(log => log.category === category);
};

export const getAllCategories = (): LogCategory[] => {
    return Object.values(LogCategory);
};
