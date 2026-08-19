import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data });
}

export async function POST(request) {
  const body = await request.json();
  const { business_name, system_prompt, voice, llm_model, phone_number, telephony_provider, call_direction, is_active } = body;

  if (!business_name || !system_prompt) {
    return NextResponse.json({ error: 'Business name aur system prompt required hai' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      business_name,
      system_prompt,
      voice: voice || 'aura-2-thalia-en',
      llm_model: llm_model || 'openai/gpt-oss-120b',
      phone_number: phone_number || null,
      telephony_provider: telephony_provider || 'exotel',
      call_direction: call_direction || 'inbound',
      is_active: is_active ?? true,
    }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data[0] }, { status: 201 });
}
