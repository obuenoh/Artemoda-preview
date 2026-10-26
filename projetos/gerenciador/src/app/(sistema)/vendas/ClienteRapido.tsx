'use client';

import { useState } from 'react';
import { cadastrarClienteRapido, type ClienteRapido as Cliente } from './acoes';

/**
 * Cadastro de cliente dentro da venda, sem trocar de tela. Ao salvar, o
 * cliente volta para quem chamou ja para ser escolhido.
 */
export function ClienteRapido({
  tipoInicial,
  onCadastrado,
  onCancelar,
}: {
  tipoInicial: 'pessoa' | 'escola';
  onCadastrado: (c: Cliente) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<string>(tipoInicial);
  const [whatsapp, setWhatsapp] = useState('');
  const [contato, setContato] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [condicao, setCondicao] = useState('a_vista');
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    setCampos({});
    setSalvando(true);
    const r = await cadastrarClienteRapido({
      nome,
      tipo: tipo as 'escola' | 'empresa' | 'marca' | 'pessoa',
      whatsapp,
      contato,
      cnpj,
      condicaoPagamento: condicao as 'a_vista' | '30' | '30_60',
    });
    setSalvando(false);
    if ('erro' in r) {
      setErro(r.erro);
      setCampos(r.campos ?? {});
      return;
    }
    onCadastrado(r.cliente);
  }

  const aviso = (c: string) =>
    campos[c] ? (
      <p role="alert" className="mt-1 text-sm">
        <span aria-hidden="true" className="mr-1 text-gold">↳</span>
        {campos[c]}
      </p>
    ) : null;

  return (
    <div className="mt-3 rounded border border-fio bg-cream p-3">
      <p className="text-rotulo font-bold uppercase text-gold">Novo cliente</p>

      <div className="mt-3">
        <label htmlFor="rapidoNome" className="rotulo-campo">Nome</label>
        <input id="rapidoNome" value={nome} onChange={(e) => setNome(e.target.value)} className="campo mt-1.5" autoFocus />
        {aviso('nome')}
      </div>

      <div className="mt-3">
        <label htmlFor="rapidoTipo" className="rotulo-campo">Tipo</label>
        <select id="rapidoTipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="campo mt-1.5">
          <option value="pessoa">Pessoa (balcão)</option>
          <option value="escola">Escola</option>
          <option value="empresa">Empresa</option>
          <option value="marca">Marca (private label)</option>
        </select>
      </div>

      <div className="mt-3">
        <label htmlFor="rapidoWhats" className="rotulo-campo">
          WhatsApp <span className="font-normal normal-case tracking-normal">opcional</span>
        </label>
        <input
          id="rapidoWhats"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          placeholder="(11) 99999-9999"
          className="campo mt-1.5"
        />
        {aviso('whatsapp')}
      </div>

      {tipo !== 'pessoa' && (
        <>
          <div className="mt-3">
            <label htmlFor="rapidoContato" className="rotulo-campo">
              Pessoa de contato <span className="font-normal normal-case tracking-normal">opcional</span>
            </label>
            <input id="rapidoContato" value={contato} onChange={(e) => setContato(e.target.value)} className="campo mt-1.5" />
          </div>
          <div className="mt-3">
            <label htmlFor="rapidoCnpj" className="rotulo-campo">
              CNPJ <span className="font-normal normal-case tracking-normal">opcional</span>
            </label>
            <input id="rapidoCnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="campo mt-1.5" />
          </div>
          <div className="mt-3">
            <label htmlFor="rapidoCondicao" className="rotulo-campo">Como costuma pagar</label>
            <select id="rapidoCondicao" value={condicao} onChange={(e) => setCondicao(e.target.value)} className="campo mt-1.5">
              <option value="a_vista">À vista</option>
              <option value="30">30 dias</option>
              <option value="30_60">30/60 dias</option>
            </select>
          </div>
        </>
      )}

      {erro && !Object.keys(campos).length && (
        <p role="alert" className="mt-3 text-sm">
          <span aria-hidden="true" className="mr-1 text-gold">↳</span>
          {erro}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={salvar} disabled={salvando} className="bt bt-cheio">
          {salvando ? 'Salvando…' : 'Salvar e escolher'}
        </button>
        <button type="button" onClick={onCancelar} className="bt bt-vazio">
          Cancelar
        </button>
      </div>
    </div>
  );
}
