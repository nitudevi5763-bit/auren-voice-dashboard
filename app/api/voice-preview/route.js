import { NextResponse } from 'next/server';

export async function POST(request) {
  const { voice } = await request.json();
  if (!voice) return NextResponse.json({ error: 'Voice required' }, { status: 400 });

  const sampleText = "Hello! Thank you for calling. How can I help you today?";

  const dgRes = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: sampleText }),
  });

  if (!dgRes.ok) {
    const errText = await dgRes.text();
    return NextResponse.json({ error: `Deepgram error: ${errText}` }, { status: 500 });
  }

  const audioBuffer = await dgRes.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
