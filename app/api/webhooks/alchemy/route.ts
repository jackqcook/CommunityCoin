import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Alchemy webhook types
interface AlchemyWebhookEvent {
  webhookId: string;
  id: string;
  createdAt: string;
  type: 'MINED_TRANSACTION' | 'GRAPHQL';
  event: {
    network: string;
    activity: AlchemyActivity[];
  };
}

interface AlchemyActivity {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  value: number;
  asset: string;
  category: string;
  rawContract: {
    rawValue: string;
    address: string;
    decimals: number;
  };
  log?: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: boolean;
  };
}

// Event signature hashes (keccak256)
const EVENT_TOPICS = {
  GroupCreated: '0x' + crypto.createHash('sha3-256')
    .update('GroupCreated(address,address,address,string,string,string,bool)')
    .digest('hex'),
  TokensPurchased: '0x' + crypto.createHash('sha3-256')
    .update('TokensPurchased(address,uint256,uint256,uint256)')
    .digest('hex'),
  TokensSold: '0x' + crypto.createHash('sha3-256')
    .update('TokensSold(address,uint256,uint256,uint256)')
    .digest('hex'),
};

// Verify Alchemy webhook signature
function verifyAlchemySignature(body: string, signature: string): boolean {
  const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) {
    console.warn('ALCHEMY_WEBHOOK_SIGNING_KEY not set, skipping verification');
    return true; // Allow in development
  }
  
  const hmac = crypto.createHmac('sha256', signingKey);
  const digest = hmac.update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Decode log data
function decodeLogData(data: string, types: string[]): bigint[] {
  // Remove 0x prefix and split into 32-byte chunks
  const cleanData = data.slice(2);
  const values: bigint[] = [];
  
  for (let i = 0; i < types.length; i++) {
    const chunk = cleanData.slice(i * 64, (i + 1) * 64);
    values.push(BigInt('0x' + chunk));
  }
  
  return values;
}

// Decode indexed address from topic
function decodeAddress(topic: string): string {
  return '0x' + topic.slice(26);
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Check required env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ 
      error: 'Missing required environment variables',
    }, { status: 500 });
  }
  
  try {
    const body = await req.text();
    const signature = req.headers.get('x-alchemy-signature') || '';
    
    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyAlchemySignature(body, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    const webhook: AlchemyWebhookEvent = JSON.parse(body);
    
    console.log(`Received Alchemy webhook: ${webhook.type}`, {
      id: webhook.id,
      activityCount: webhook.event.activity?.length || 0,
    });
    
    // Dynamic imports to avoid build-time initialization
    const { handleGroupCreated, handleTokensPurchased, handleTokensSold } = await import('@/lib/indexer');
    
    // Process each activity
    for (const activity of webhook.event.activity || []) {
      if (!activity.log) continue;
      
      const { log } = activity;
      const eventTopic = log.topics[0];
      const blockNumber = BigInt(log.blockNumber);
      const logIndex = parseInt(log.logIndex, 16);
      
      try {
        // Handle GroupCreated events
        if (eventTopic === EVENT_TOPICS.GroupCreated) {
          // Decode indexed parameters from topics
          const tokenAddress = decodeAddress(log.topics[1]);
          const treasuryAddress = decodeAddress(log.topics[2]);
          const creator = decodeAddress(log.topics[3]);
          
          // Decode non-indexed parameters from data
          // name, symbol, charterCid, isPublic are in data
          // This is simplified - real implementation needs proper ABI decoding
          const event = {
            tokenAddress,
            treasuryAddress,
            creator,
            name: '', // Would need proper ABI decoding
            symbol: '',
            charterCid: '',
            isPublic: true,
          };
          
          await handleGroupCreated(event, log.transactionHash, blockNumber);
        }
        
        // Handle TokensPurchased events
        else if (eventTopic === EVENT_TOPICS.TokensPurchased) {
          const buyer = decodeAddress(log.topics[1]);
          const [ethIn, tokensOut, newPrice] = decodeLogData(log.data, ['uint256', 'uint256', 'uint256']);
          
          await handleTokensPurchased(
            log.address,
            { buyer, ethIn, tokensOut, newPrice },
            log.transactionHash,
            blockNumber,
            logIndex
          );
        }
        
        // Handle TokensSold events
        else if (eventTopic === EVENT_TOPICS.TokensSold) {
          const seller = decodeAddress(log.topics[1]);
          const [tokensIn, ethOut, newPrice] = decodeLogData(log.data, ['uint256', 'uint256', 'uint256']);
          
          await handleTokensSold(
            log.address,
            { seller, tokensIn, ethOut, newPrice },
            log.transactionHash,
            blockNumber,
            logIndex
          );
        }
      } catch (error) {
        console.error('Error processing activity:', error, activity);
        // Continue processing other activities
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '84532';
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    chainId,
  });
}
