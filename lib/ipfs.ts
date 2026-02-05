// IPFS upload utilities using Pinata
// For MVP, we'll use a placeholder CID if Pinata isn't configured

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export interface CharterData {
  name: string;
  description: string;
  charter: string;
  createdAt: string;
  version: string;
}

/**
 * Upload charter document to IPFS via Pinata
 * Returns the CID (Content Identifier)
 */
export async function uploadCharterToIPFS(data: CharterData): Promise<string> {
  // If Pinata isn't configured, return a placeholder CID for development
  if (!PINATA_JWT) {
    console.warn('PINATA_JWT not configured, using placeholder CID');
    // Generate a deterministic placeholder based on content
    const hash = await hashContent(JSON.stringify(data));
    return `Qm${hash.slice(0, 44)}`; // Fake CID format
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `charter-${data.name}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Fallback to placeholder for development
    const hash = await hashContent(JSON.stringify(data));
    return `Qm${hash.slice(0, 44)}`;
  }
}

/**
 * Get the IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `${PINATA_GATEWAY}/${cid}`;
}

/**
 * Fetch charter data from IPFS
 */
export async function fetchCharterFromIPFS(cid: string): Promise<CharterData | null> {
  try {
    const response = await fetch(getIPFSUrl(cid));
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Simple hash function for generating placeholder CIDs
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
