import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by Vercel Cron or an external service
// to periodically index blockchain events

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('CRON_SECRET not set, allowing request');
    return true;
  }
  
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check required env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ 
      error: 'Missing required environment variables',
      message: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required'
    }, { status: 500 });
  }
  
  try {
    // Dynamic imports to avoid build-time initialization
    const { createServerSupabaseClient } = await import('@/lib/supabase');
    const { indexGroupFromBlock, createBlockchainClient } = await import('@/lib/indexer');
    const { DEFAULT_CHAIN_ID } = await import('@/lib/contracts');
    
    const supabase = createServerSupabaseClient();
    const client = createBlockchainClient(DEFAULT_CHAIN_ID);
    
    // Get current block number
    const currentBlock = await client.getBlockNumber();
    
    // Get all groups that need indexing
    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, contract_address, last_indexed_block')
      .not('contract_address', 'is', null)
      .order('last_indexed_at', { ascending: true })
      .limit(10); // Process 10 groups per run
    
    if (error) {
      throw error;
    }
    
    const results: { groupId: string; eventsProcessed: number; error?: string }[] = [];
    
    for (const group of groups || []) {
      if (!group.contract_address) continue;
      
      try {
        const fromBlock = BigInt(group.last_indexed_block || 0) + 1n;
        const toBlock = currentBlock;
        
        // Skip if already up to date
        if (fromBlock >= toBlock) {
          results.push({
            groupId: group.id,
            eventsProcessed: 0,
          });
          continue;
        }
        
        // Index in chunks of 2000 blocks
        const chunkSize = 2000n;
        let processedEvents = 0;
        
        for (let start = fromBlock; start < toBlock; start += chunkSize) {
          const end = start + chunkSize < toBlock ? start + chunkSize : toBlock;
          
          await indexGroupFromBlock(
            group.contract_address,
            start,
            end,
            DEFAULT_CHAIN_ID
          );
          
          processedEvents++; // Simplified count
        }
        
        results.push({
          groupId: group.id,
          eventsProcessed: processedEvents,
        });
      } catch (err) {
        console.error(`Error indexing group ${group.id}:`, err);
        results.push({
          groupId: group.id,
          eventsProcessed: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      currentBlock: currentBlock.toString(),
      groupsProcessed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
