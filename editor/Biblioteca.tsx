import React, { useEffect, useRef, useState } from "react";
import { filtrarBiblioteca, tamanhoLegivel, type ItemBiblioteca, type TipoMidia } from "./regrasBiblioteca";
import { COR, VEU, botaoAmarelo, botaoContorno, caixaTexto } from "./tema";

// Aba "Biblioteca": arquivos de mídia de public/ (GET /api/biblioteca, só leitura). Não existe
// apagar. Os arquivos em si o Vite já serve na raiz ("/images/…"), por isso a prévia funciona.

// Lista buscada UMA vez por página e compartilhada (aba e seletor de campos de arquivo).
type EstadoBiblioteca = { itens: ItemBiblioteca[]; erro: string | null; carregando: boolean };
let promessa: Promise<EstadoBiblioteca> | null = null;
const buscar = (): Promise<EstadoBiblioteca> => {
  promessa ??= fetch("/api/biblioteca")
    .then(async (r) => {
      const j = await r.json();
      if (!r.ok) return { itens: [], erro: j.erro ?? `erro ${r.status}`, carregando: false };
      return { itens: j.itens as ItemBiblioteca[], erro: null, carregando: false };
    })
    .catch((e) => ({ itens: [], erro: String(e), carregando: false }));
  return promessa;
};
export const usarBiblioteca = (): EstadoBiblioteca => {
  const [estado, setEstado] = useState<EstadoBiblioteca>({ itens: [], erro: null, carregando: true });
  useEffect(() => {
    let vivo = true;
    void buscar().then((e) => vivo && setEstado(e));
    return () => {
      vivo = false;
    };
  }, []);
  return estado;
};

const TIPOS: { tipo: TipoMidia | "todos"; rotulo: string }[] = [
  { tipo: "todos", rotulo: "Tudo" },
  { tipo: "imagem", rotulo: "Imagens" },
  { tipo: "audio", rotulo: "Sons" },
  { tipo: "video", rotulo: "Vídeos" },
];

export const Biblioteca: React.FC<{
  agulhaTexto: string; // ex.: "0:12.4" (tempo ORIGINAL), só para mostrar
  podeAdicionar: boolean; // sem fps/agulha válida = botões desligados
  aoAdicionarImagem: (item: ItemBiblioteca) => void;
  aoAdicionarAudio: (item: ItemBiblioteca, tipo: "efeito" | "musica") => void;
}> = ({ agulhaTexto, podeAdicionar, aoAdicionarImagem, aoAdicionarAudio }) => {
  const { itens, erro, carregando } = usarBiblioteca();
  const [filtro, setFiltro] = useState("");
  const [tipo, setTipo] = useState<TipoMidia | "todos">("todos");
  const [tocando, setTocando] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audio.current?.pause(), []);

  const ouvir = (item: ItemBiblioteca) => {
    if (tocando === item.caminho) {
      audio.current?.pause();
      setTocando(null);
      return;
    }
    audio.current?.pause();
    const a = new Audio(`/${item.caminho}`);
    a.onended = () => setTocando(null);
    a.onerror = () => setTocando(null);
    audio.current = a;
    setTocando(item.caminho);
    void a.play().catch(() => setTocando(null));
  };

  const lista = filtrarBiblioteca(itens, filtro, tipo);
  const pequeno: React.CSSProperties = { ...botaoContorno, padding: "0.1rem 0.4rem", fontSize: "0.75rem" };

  return (
    <div style={{ fontSize: "0.85rem" }}>
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.4rem" }}>
        <input aria-label="filtrar a biblioteca pelo nome" placeholder="filtrar pelo nome…" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ ...caixaTexto(false), width: "14rem" }} />
        {TIPOS.map((t) => (
          <button key={t.tipo} type="button" onClick={() => setTipo(t.tipo)} style={t.tipo === tipo ? { ...botaoAmarelo, padding: "0.1rem 0.5rem" } : { ...botaoContorno, padding: "0.1rem 0.5rem" }}>
            {t.rotulo}
          </button>
        ))}
        <span style={{ opacity: 0.8 }}>
          {carregando ? "carregando…" : `${lista.length} de ${itens.length}`} · agulha em {agulhaTexto}
        </span>
      </div>
      {erro ? <div style={{ color: COR.vermelho }}>Não consegui ler a biblioteca: {erro}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(9.5rem, 1fr))", gap: "0.4rem" }}>
        {lista.map((i) => (
          <div key={i.caminho} style={{ background: VEU.leve, borderRadius: "0.25rem", padding: "0.3rem", display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
            {i.tipo === "imagem" ? (
              <img src={`/${i.caminho}`} alt={i.nome} loading="lazy" style={{ width: "100%", height: "5rem", objectFit: "contain", background: "rgba(0,0,0,0.25)" }} />
            ) : (
              <div style={{ height: "2rem", display: "flex", alignItems: "center", opacity: 0.8 }}>{i.tipo === "audio" ? "♪ som" : "▶ vídeo"}</div>
            )}
            <div title={i.caminho} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {i.nome}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
              {i.pasta} · {tamanhoLegivel(i.tamanho)}
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {i.tipo === "imagem" ? (
                <button type="button" style={pequeno} disabled={!podeAdicionar} onClick={() => aoAdicionarImagem(i)} title={`Novo elemento com esta imagem em ${agulhaTexto}, 3 s`}>
                  + na agulha
                </button>
              ) : null}
              {i.tipo === "audio" ? (
                <>
                  <button type="button" style={pequeno} onClick={() => ouvir(i)}>
                    {tocando === i.caminho ? "■ parar" : "▶ ouvir"}
                  </button>
                  <button type="button" style={pequeno} disabled={!podeAdicionar} onClick={() => aoAdicionarAudio(i, "efeito")} title={`Efeito sonoro em ${agulhaTexto}`}>
                    + efeito
                  </button>
                  <button type="button" style={pequeno} onClick={() => aoAdicionarAudio(i, "musica")} title="Música de fundo (o vídeo todo)">
                    + música
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
