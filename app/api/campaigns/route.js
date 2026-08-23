import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, clients(business_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns: data });
}

export async function POST(request) {
  const body = await request.json();
  const { name, agent_id, contacts } = body;

  if (!name) return NextResponse.json({ error: 'Campaign name required hai' }, { status: 400 });
  if (!contacts || contacts.length === 0) return NextResponse.json({ error: 'Kam se kam 1 contact chahiye CSV mein' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: campaignData, error: campaignError } = await supabase
    .from('campaigns')
    .insert([{ name, agent_id: agent_id || null, status: 'draft', total_contacts: contacts.length }])
    .select();

  if (campaignError) return NextResponse.json({ error: campaignError.message }, { status: 500 });
  const campaign = campaignData[0];

  const contactRows = contacts.map((c) => ({
    name: c.name || null,
    phone: c.phone,
    email: c.email || null,
    source: 'campaign',
    status: 'new',
    agent_id: agent_id || null,
  }));

  const { data: insertedContacts, error: contactsError } = await supabase
    .from('contacts')
    .insert(contactRows)
    .select();

  if (contactsError) return NextResponse.json({ error: contactsError.message }, { status: 500 });

  const links = insertedContacts.map((c) => ({ campaign_id: campaign.id, contact_id: c.id, status: 'pending' }));
  await supabase.from('campaign_contacts').insert(links);

  return NextResponse.json({ campaign }, { status: 201 });
}
