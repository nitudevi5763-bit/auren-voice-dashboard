import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('phone_numbers')
    .select('*, clients(business_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ numbers: data });
}

export async function POST(request) {
  const body = await request.json();
  const { number, provider, country, direction, sip_trunk_id, sip_domain, sip_username, sip_password, assigned_agent_id } = body;

  if (!number) return NextResponse.json({ error: 'Number required hai' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('phone_numbers')
    .insert([{
      number,
      provider: provider || 'vobiz',
      country: country || 'IN',
      direction: direction || 'inbound',
      sip_trunk_id: sip_trunk_id || null,
      sip_domain: sip_domain || null,
      sip_username: sip_username || null,
      sip_password: sip_password || null,
      assigned_agent_id: assigned_agent_id || null,
      status: 'active',
    }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ number: data[0] }, { status: 201 });
}
