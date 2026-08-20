import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('contacts')
    .select('*, clients(business_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data });
}

export async function POST(request) {
  const body = await request.json();
  const { name, phone, email, source, status, agent_id, notes } = body;

  if (!phone) return NextResponse.json({ error: 'Phone number required hai' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      name: name || null,
      phone,
      email: email || null,
      source: source || 'manual',
      status: status || 'new',
      agent_id: agent_id || null,
      notes: notes || null,
    }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contact: data[0] }, { status: 201 });
}
