import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import pdfParse from 'pdf-parse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const agentIdsRaw = formData.get('agent_ids');
    const agent_ids = agentIdsRaw ? JSON.parse(agentIdsRaw) : [];

    if (!file || !name) {
      return NextResponse.json({ error: 'File aur name required hai' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdfParse(buffer);
    const extractedText = parsed.text.trim();

    if (!extractedText) {
      return NextResponse.json({ error: 'PDF se text nahi mila (shayad scanned image hai)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const filePath = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('knowledge-files')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from('knowledge-files').getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert([{
        name,
        type: 'pdf',
        content: extractedText,
        file_url: urlData.publicUrl,
        status: 'active',
      }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const source = data[0];
    if (agent_ids.length > 0) {
      const links = agent_ids.map((agentId) => ({ agent_id: agentId, knowledge_source_id: source.id }));
      await supabase.from('agent_knowledge').insert(links);
    }

    return NextResponse.json({ source }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'PDF process nahi ho paya' }, { status: 500 });
  }
}
