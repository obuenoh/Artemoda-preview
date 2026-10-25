'use client';

import { useActionState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { Aviso } from '@/components/Ui';
import { conferirCaixa, type Resultado } from '../acoes';
import { semLimpar } from '@/components/enviar';

export function FormConferir({ abriu }: { abriu: boolean }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(conferirCaixa, null);
  const e = estado?.campos ?? {};

  return (
    <form onSubmit={semLimpar(acao)} className="mt-7 flex max-w-[520px] flex-col gap-6">
      <Campo
        id="valor"
        label="Quanto a empresa tem agora"
        erro={e.valor}
        ajuda="Some o dinheiro da gaveta com o saldo do banco. Se a conta estiver no vermelho, use o sinal de menos."
      >
        <input id="valor" name="valor" inputMode="decimal" placeholder="0,00" className="campo" />
      </Campo>

      {abriu && (
        <Campo id="motivo" label="Se não bater, o que aconteceu" opcional erro={e.motivo}>
          <input id="motivo" name="motivo" className="campo" placeholder="Ex.: tarifa do banco que não foi lançada" />
        </Campo>
      )}

      {estado?.ok && <Aviso>{estado.ok}</Aviso>}
      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Conferindo…' : abriu ? 'Conferir' : 'Começar o caixa com este valor'}
        </button>
        <a href="/financeiro" className="bt bt-vazio">
          Voltar
        </a>
      </div>
    </form>
  );
}
