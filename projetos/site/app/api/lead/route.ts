import { NextResponse } from 'next/server';
import { registrarLead, type Anexo } from '@/lib/leads';

export const runtime = 'nodejs';

const MAX_ARQUIVO = 5 * 1024 * 1024; // 5 MB

/**
 * A rota nao decide nada: valida o formato do transporte e delega para
 * lib/leads.ts. Toda a regra de lead vive la.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const bruto = form.get('payload');
    if (typeof bruto !== 'string') {
      return NextResponse.json({ ok: false, erro: 'Requisição malformada.' }, { status: 400 });
    }

    let anexo: Anexo | undefined;
    const arquivo = form.get('arquivo');

    if (arquivo instanceof File && arquivo.size > 0) {
      if (arquivo.size > MAX_ARQUIVO) {
        return NextResponse.json(
          { ok: false, erro: 'O arquivo passa de 5 MB. Manda no WhatsApp que a gente recebe.' },
          { status: 413 },
        );
      }
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      anexo = {
        nome: arquivo.name,
        tipo: arquivo.type,
        conteudoBase64: buffer.toString('base64'),
      };
    }

    const resultado = await registrarLead(JSON.parse(bruto), anexo);

    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 });
  } catch (erro) {
    console.error('[api/lead]', erro);
    return NextResponse.json(
      { ok: false, erro: 'Algo quebrou do nosso lado. Chama no WhatsApp que a gente responde na hora.' },
      { status: 500 },
    );
  }
}
