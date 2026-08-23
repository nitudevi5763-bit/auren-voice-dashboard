import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(request) {
  const body = await request.json();
  const { agentId } = body;

  if (!agentId) return NextResponse.json({ error: 'agentId required hai' }, { status: 400 });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'LiveKit env vars Vercel mein missing hain' }, { status: 500 });
  }

  const roomName = `test_${agentId}_${Date.now()}`;
  const identity = `tester_${Math.random().toString(36).slice(2, 8)}`;

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  return NextResponse.json({ token, url: wsUrl, roomName });
}
