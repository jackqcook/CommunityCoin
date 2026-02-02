# CommunityCoin

**Mobilize Your Movement** — Infrastructure for collective action on the internet.

CommunityCoin transforms online communities into coordinated organizations with encrypted communication, liquid tokens, shared treasuries, and collective governance.

## The Vision

The internet is full of vibrant subcultures—from TPOT to MusicTok to niche political movements—that have immense cultural capital but no mechanism to mobilize. CommunityCoin provides the infrastructure for these communities to:

- **Organize** in encrypted, sovereign spaces
- **Fund** their ideas through tokenized treasuries
- **Govern** collectively with on-chain voting
- **Act** together on real-world goals

## Features

### 🔐 Encrypted Group Chat
Discord/Slack-style communication with end-to-end encryption. Your conversations stay private.

### 💰 Automatic Token Launch
Every group gets a token on creation. Bonding curve provides instant liquidity—no order books, no waiting.

### 🏛️ On-Chain Governance
Create proposals, vote with your tokens, and deploy treasury funds. All transparent and verifiable.

### 📜 Public Charters
Publish your mission to the world. Let outsiders understand what you're building.

### 💎 Growing Treasury
2% of every trade flows to the community treasury. Members decide how to spend it.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State**: Zustand
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Group creation flow
│   ├── explore/page.tsx      # Browse communities
│   └── group/[id]/
│       ├── page.tsx          # Group dashboard (chat, token, treasury, governance)
│       └── charter/page.tsx  # Public charter page
├── lib/
│   └── store.ts              # Zustand state management
└── ...config files
```

## Prototype Scope

This is a functional prototype demonstrating the core user flow:

1. **Landing** → Understand the vision
2. **Create** → Launch a group with auto-deployed token
3. **Dashboard** → Chat, trade tokens, view treasury, vote on proposals
4. **Charter** → Public page explaining the community

### What's Mocked

- Token transactions (simulated bonding curve)
- Message persistence (in-memory)
- User authentication
- Blockchain interactions

### What's Next

- Real wallet authentication (Privy/Dynamic)
- Smart contract deployment (Base/Solana)
- E2E encryption (Signal Protocol/MLS)
- Persistent database (PostgreSQL)
- Real-time sync (WebSockets)

## License

MIT
