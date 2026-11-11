/* Xômano Newton — Treinando a Física do ENEM · CC BY-NC 4.0 · sem servidor, progresso salvo no aparelho */
(function(){
'use strict';
const D=window.XN_DADOS;
const Q={};D.questoes.forEach(q=>Q[q.id]=q);

/* ===== REGRAS PEDAGÓGICAS (ajuste aqui) ===== */
const R={
  vidas:5,              // vidas por lição
  tamLicao:6,           // questões por lição
  tamLicaoSI:5,         // lições de abertura (Grandezas e S.I.)
  janela:3,             // olha as últimas N respostas da habilidade
  errosJanela:2,        // se errou X das últimas N  -> reforço
  errosUnidade:3,       // ou se acumulou X erros da habilidade na unidade -> reforço
  tamReforco:4,         // questões do bloco de reforço
  xpCerta:10, xpReforco:5, xpLicao:20, xpTresEstrelas:10
};
const COR=['teal','pur','mag','yel'];
const CORVAR={teal:'var(--teal-d)',pur:'var(--pur)',mag:'var(--mag)',yel:'var(--yel)'};
const KEY='xn_progresso_v1';

/* ===== estado e armazenamento ===== */
const hoje=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const novo=()=>({v:1,nome:'',criado:Date.now(),xp:0,dias:[],vistos:{},viaRem:{},erros:[],hab:{},jan:{},eu:{},licoes:{},tent:{},pedidos:{}});
let S=carregar();
function carregar(){try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&j.v===1)return Object.assign(novo(),j)}catch(e){}return novo()}
function salvar(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ===== plano da trilha ===== */
const PLANO=D.unidades.map((nome,u)=>{
  const ids=D.questoes.filter(q=>q.u===u&&!q.x&&!q.r)
    .sort((a,b)=>a.n-b.n||(a.id<b.id?-1:1)).map(q=>q.id);
  const tam=u===0?R.tamLicaoSI:R.tamLicao,lic=[];
  for(let i=0;i<ids.length;i+=tam)lic.push(ids.slice(i,i+tam));
  if(lic.length>1&&lic[lic.length-1].length<3){const t=lic.pop();lic[lic.length-1]=lic[lic.length-1].concat(t)}
  return{u,nome,cor:COR[u%4],licoes:lic};
});
const kL=(u,i)=>u+'.'+i;
const idsLicao=(u,i)=>S.tent[kL(u,i)]||PLANO[u].licoes[i].filter(id=>!S.viaRem[id]);
const feita=(u,i)=>!!S.licoes[kL(u,i)]||(!S.tent[kL(u,i)]&&idsLicao(u,i).length===0);
const liberada=(u,i)=>i>0?feita(u,i-1):(u===0||PLANO[u-1].licoes.every((_,j)=>feita(u-1,j)));
function atual(){for(const P of PLANO)for(let i=0;i<P.licoes.length;i++)if(!feita(P.u,i))return{u:P.u,i};return null}

/* ===== utilidades ===== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);
const HAB=n=>D.habilidades[n-1];
function streak(){const d=new Set(S.dias);let n=0;const t=new Date();
  const f=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  if(!d.has(f(t)))t.setDate(t.getDate()-1);
  while(d.has(f(t))){n++;t.setDate(t.getDate()-1)}return n}
function toast(msg){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}

/* ícones (SVG inline) */
const I={
 fogo:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.2-.8 4.6-2.2 6.3C8.4 10 7 11.6 7 14.2A5 5 0 0 0 12 19a5 5 0 0 0 5-4.8c0-2.2-1-3.6-2-4.8.1 1.4-.4 2.3-1.2 2.9.5-3.6-.6-7.5-1.8-10.3z"/></svg>',
 raio:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2 5 13.5h5.6L9.5 22 19 9.8h-5.8z"/></svg>',
 vida:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5.3-8-11.1A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9C20 15.700 12 21 12 21z"/></svg>',
 estrela:c=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${c}" d="m12 2.5 2.9 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8z"/></svg>`,
 cad:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
 ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
 trilha:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 20 7v10l-8 5-8-5V7zm0 5.200-3.500 2.200v4.400l3.500 2.200 3.500-2.200V9.400z"/></svg>',
 graf:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>',
 lupa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6"/><path d="m15 15 6 6M10.500 8v5M8 10.500h5"/></svg>'
};
const RAPOSA='icons/newton.png';
/* Epígrafe da tela de abertura: escreva o texto entre as crases (uma linha por verso). Vazio = não aparece. */
const EPIGRAFE=``;
const EPIGRAFE_FONTE='';

/* ===== guia (ruiva): rosto preservado, só recortado em círculo ===== */
const G={
 aplaude:{f:'guia/aplaude.png',w:238,h:185,fx:.58,fy:.37,fw:.30},
 estudo:{f:'guia/estudo.png',w:150,h:139,fx:.53,fy:.33,fw:.23},
 calculo:{f:'guia/calculo.png',w:154,h:114,fx:.25,fy:.44,fw:.22},
 ceu:{f:'guia/ceu.png',w:164,h:138,fx:.58,fy:.36,fw:.32},
 nota:{f:'guia/nota.png',w:186,h:142,fx:.51,fy:.41,fw:.34},
 dica:{f:'guia/dica.png',w:124,h:167,fx:.43,fy:.36,fw:.40}
};
function av(k,size){const g=G[k],bw=size*.62/g.fw,bh=bw*g.h/g.w,x=size/2-g.fx*bw,y=size/2-g.fy*bh;
  return`<div class="av" role="img" aria-label="Guia do Xômano Newton" style="width:${size}px;height:${size}px;background-image:url(${g.f});background-size:${bw}px ${bh}px;background-position:${x}px ${y}px"></div>`}
function figGuia(k,larg){const g=G[k];return`<img class="av-g" src="${g.f}" alt="Guia do Xômano Newton" width="${larg}" style="width:${larg}px;height:auto">`}

/* ===== navegação ===== */
let tela='trilha',LI=null,promptInstalar=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInstalar=e;if(!LI)render()});
function render(){
  const app=$('#app');
  if(!S.nome&&!S.pulou){app.innerHTML=telaBoas();return}
  app.innerHTML=topo()+'<main id="principal">'+(tela==='trilha'?telaTrilha():tela==='prog'?telaProg():telaSobre())+'</main>'+nav();
}
function topo(){return`<header class="topo"><button class="marca" data-act="ir" data-t="trilha" aria-label="Ir para a trilha"><img src="${RAPOSA}" alt=""><span>Xômano Newton<small>Treinando a Física do ENEM</small></span></button>
<span class="chip fogo" title="Dias seguidos">${I.fogo}${streak()}</span><span class="chip xp" title="Pontos de experiência">${I.raio}${S.xp}</span></header>`}
function nav(){const b=(t,ic,n)=>`<button data-act="ir" data-t="${t}" ${tela===t?'aria-current="page"':''}>${ic}${n}</button>`;
  return`<nav class="nav" aria-label="Menu principal">${b('trilha',I.trilha,'Trilha')}${b('prog',I.graf,'Progresso')}${b('sobre',I.info,'Sobre')}</nav>`}
function logosApoio(){return`<img src="logos/seduc.png" alt="SEDUC – Secretaria de Estado de Educação, Governo de Mato Grosso"><img class="pre" src="logos/pre-enem.png" alt="Pré-Enem Digit@l MT"><img class="dre" src="logos/dre.png" alt="DRE – Diretoria Regional de Educação de Primavera do Leste">`}

function telaBoas(){return`<main class="boas"><img class="raposa" src="${RAPOSA}" alt="Xômano Newton, mascote do app">
<h1>Xômano Newton</h1><p class="sub">Treinando a Física do ENEM</p>
<div class="guia-card">${av('dica',84)}<p>Oi! Eu vou te acompanhar nas questões. Você começa pelas grandezas e o Sistema Internacional e, se travar em algum assunto, eu separo um reforço.</p></div>
<label for="nome">Como podemos te chamar?</label><input id="nome" maxlength="24" autocomplete="given-name" placeholder="Seu nome ou apelido">
<div style="width:100%;margin-top:16px"><button class="btn" data-act="comecar">Começar</button></div>
<div class="apoio">${logosApoio()}</div>
${EPIGRAFE?`<blockquote class="epigrafe">${EPIGRAFE.trim().split('\n').map(l=>l.trim()).join('<br>')}${EPIGRAFE_FONTE?`<cite>${EPIGRAFE_FONTE}</cite>`:''}</blockquote>`:''}
<p class="rodape-lic"><a href="https://creativecommons.org/licenses/by-nc/4.0/deed.pt-br" target="_blank" rel="noopener">CC BY-NC 4.0</a></p>
<p class="rodape-presente">Um presente de <b>Laura de Faveri</b> e <b>Claudiana Cardoso</b> para nossa regional.</p>
<p class="contador"><img src="https://hits.sh/lfaveri.github.io/X-mano-Newton.svg?label=acessos&color=00897b" alt="Contador de acessos" onerror="this.parentNode.style.display='none'"></p></main>`}

function telaTrilha(){
  const a=atual(),feitas=Object.keys(S.licoes).length;
  const msg=feitas===0?`Fala${S.nome?', <b>'+esc(S.nome)+'</b>':''}! Vamos começar pelas grandezas e o Sistema Internacional.`:
    a?`Bora${S.nome?', <b>'+esc(S.nome)+'</b>':''}! Próxima parada: <b>${esc(PLANO[a.u].nome)}</b>.`:`Você percorreu toda a trilha${S.nome?', <b>'+esc(S.nome)+'</b>':''}! Use o Progresso para refazer seus erros.`;
  let h=`<section class="saudacao">${av('estudo',64)}<p>${msg}</p></section>`;
  PLANO.forEach(P=>{
    const lib=liberada(P.u,0),n=P.licoes.length,fe=P.licoes.filter((_,i)=>feita(P.u,i)).length;
    const cor=P.cor;
    h+=`<section class="unidade" aria-label="${esc(P.nome)}"><div class="u-cab ${cor==='yel'?'amarelo':''} ${lib?'':'bloq'}" style="--c:${CORVAR[cor]}"><h2>${esc(P.nome)}</h2><p>${lib?`${fe} de ${n} lições concluídas`:'Conclua a unidade anterior para liberar'}</p></div><div class="caminho">`;
    const dx=[0,34,52,34,0,-34,-52,-34];
    P.licoes.forEach((_,i)=>{
      const fz=feita(P.u,i),lb=liberada(P.u,i),at=a&&a.u===P.u&&a.i===i,e=S.licoes[kL(P.u,i)];
      const cls=['no',cor==='yel'?'amarelo':'',fz?'feito':at?'atual':'bloq'].join(' ');
      const est=fz&&e?`<span class="estrelas">${[1,2,3].map(s=>I.estrela(s<=e.e?'#ffdc50':'#d8d7e4')).join('')}</span>`:'';
      const rot=fz?'concluída':at?'atual':'bloqueada';
      h+=`<button class="${cls}" style="--c:${CORVAR[cor]};--dx:${dx[i%8]}px" ${lb?'':'disabled'} data-act="licao" data-u="${P.u}" data-i="${i}" aria-label="${esc(P.nome)}, lição ${i+1}, ${rot}">
      ${at?'<span class="anel"></span><span class="balao">Começar</span>':''}<span class="sombra"></span><span class="hex"></span><span class="cont">${fz?I.ok:lb?(i+1):I.cad}</span>${est}</button>`;
    });
    h+='</div></section>';
  });
  return h+'<p class="nota" style="text-align:center;padding:6px 16px 20px">Use o Progresso para salvar seu avanço antes de trocar de celular.</p>';
}

function telaProg(){
  const feitas=Object.keys(S.licoes).length,tot=Object.values(S.hab).reduce((a,b)=>a+b.t,0),ac=Object.values(S.hab).reduce((a,b)=>a+b.ok,0);
  let h=`<div class="pag"><h1>Seu progresso</h1><div class="grade3"><div class="num"><b>${S.xp}</b><span>pontos</span></div><div class="num"><b>${streak()}</b><span>dias seguidos</span></div><div class="num"><b>${feitas}</b><span>lições feitas</span></div></div>
  <p class="nota" style="margin-top:12px">${tot?`Você respondeu ${tot} questões e acertou ${Math.round(100*ac/tot)}%.`:'Responda a primeira lição para ver seu desempenho aqui.'}</p>`;
  h+=`<h2>Desempenho por habilidade</h2><div class="cartao">`;
  for(let n=1;n<=12;n++){if(n===10)continue;const s=S.hab[n],p=s&&s.t?Math.round(100*s.ok/s.t):null;
    h+=`<div class="barra-h"><div class="l"><span>${esc(HAB(n))}</span><span>${p===null?'—':p+'%'}</span></div><div class="trilho" role="progressbar" aria-valuenow="${p||0}" aria-valuemin="0" aria-valuemax="100"><i class="${p!==null&&p<50?'baixo':p!==null&&p<75?'medio':''}" style="width:${p||0}%"></i></div>${s?`<span class="nota">${s.ok} de ${s.t} certas</span>`:''}</div>`}
  h+='</div>';
  h+=`<h2>Revisar erros</h2><div class="cartao"><p style="margin-top:0">${S.erros.length?`Você tem <b>${S.erros.length}</b> questão(ões) para refazer. Aqui não perde vida.`:'Nenhuma questão errada para refazer agora.'}</p><button class="btn pur" data-act="revisar" ${S.erros.length?'':'disabled'}>Refazer meus erros</button></div>`;
  h+=`<h2>Salvar ou trocar de aparelho</h2><div class="cartao"><p style="margin-top:0" class="nota">Seu progresso fica salvo só neste aparelho. Para levar para outro celular, gere o código abaixo e cole lá em “Restaurar”.</p>
  <div class="fila"><button class="btn sec peq" data-act="gerar">Gerar código</button><button class="btn sec peq" data-act="baixar">Baixar arquivo</button></div>
  <textarea class="cod" id="codigo" aria-label="Código do progresso" placeholder="O código aparece aqui, ou cole um código para restaurar." spellcheck="false"></textarea>
  <div class="fila"><button class="btn sec peq" data-act="copiar">Copiar</button><button class="btn peq" data-act="restaurar">Restaurar do código</button><label class="btn sec peq" style="cursor:pointer">Abrir arquivo<input type="file" id="arq" accept=".txt,.xn" hidden></label></div></div>
  <div class="cartao"><button class="btn sec peq" data-act="apagar" style="color:var(--mag-d)">Apagar todo o progresso</button></div></div>`;
  return h;
}

function telaSobre(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  return`<div class="pag"><h1>Sobre o app</h1>
  <div class="cartao" style="display:flex;gap:14px;align-items:center">${av('ceu',76)}<p style="margin:0"><b>Xômano Newton</b> é um simulado de Física com questões do ENEM, organizado em trilhas curtas. As questões crescem em dificuldade e, se você errar muito uma habilidade, entra um reforço de ${R.tamReforco} questões antes de voltar à trilha.</p></div>
  <h2>Como funciona</h2><ul><li>Cada lição tem de ${R.tamLicaoSI} a ${R.tamLicao+2} questões e você tem ${R.vidas} vidas.</li><li>Ao errar 2 das últimas 3 questões de uma mesma habilidade, ou 3 na mesma unidade, o app pausa a trilha e traz ${R.tamReforco} questões dessa habilidade.</li><li>Terminado o reforço, a trilha continua de onde parou.</li><li>O gabarito mostra só a letra certa. Peça a resolução ao seu professor.</li></ul>
  ${promptInstalar?'<div class="cartao"><button class="btn" data-act="instalar">Instalar o app neste aparelho</button></div>':`<h2>Instalar no celular</h2><p>${ios?'No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.':'No Android: abra o menu do navegador e toque em “Instalar app” ou “Adicionar à tela inicial”.'} Depois de aberto uma vez, o app funciona sem internet.</p>`}
  <h2>Apoio institucional</h2><div class="logos">${logosApoio()}</div><p class="nota">Projeto da Diretoria Regional de Educação de Primavera do Leste, com a SEDUC-MT e o Pré-Enem Digit@l MT.</p>
  <h2>Licença e créditos</h2><p class="nota">Código, trilha pedagógica, banco de questões originais (2026) e identidade visual sob licença <b>CC BY-NC 4.0</b>: pode compartilhar e adaptar com atribuição, <b>sem qualquer fim lucrativo</b>. As questões do ENEM pertencem ao INEP/MEC. Logotipos e ilustrações da guia não estão incluídos na licença.</p>
  <p class="nota">Versão 1.0 · ${D.questoes.length} questões · Raposa e identidade visual com as cores da DRE Primavera do Leste.</p></div>`;
}

/* ===== lição ===== */
function iniciar(u,i,rev){
  let ids,k,treino=false,vidas=R.vidas;
  if(rev){ids=S.erros.slice(-R.tamLicao).reverse();k='rev';treino=true;vidas=99}
  else{if(!liberada(u,i)){toast('Termine a lição anterior primeiro.');return}
    k=kL(u,i);treino=!!S.licoes[k];ids=idsLicao(u,i);S.tent[k]=ids;salvar();if(!ids.length)return}
  LI={k,u:rev?-1:u,i,ids,pos:0,vidas,vidas0:vidas,acertos:0,erros:0,treino,rev:!!rev,rem:null,pend:null,fase:'q',sel:-1,chk:false,ultimoOk:false,xp:0};
  document.body.style.overflow='hidden';desenhar();
}
function qAtual(L){return Q[L.rem?L.rem.ids[L.rem.pos]:L.ids[L.pos]]}
function montaReforco(q,L){
  const alvo=Math.max(1,q.n-1),usados=new Set(L.ids);
  const cand=D.questoes.filter(x=>!x.x&&x.id!==q.id&&!usados.has(x.id)&&!(x.id in S.vistos));
  const sc=x=>{const d=x.n-alvo;return(d>0?10+d:-d)-(x.r?.5:0)};
  const a=cand.filter(x=>x.h===q.h).sort((p,r)=>sc(p)-sc(r)),b=cand.filter(x=>x.h!==q.h&&x.h2===q.h).sort((p,r)=>sc(p)-sc(r));
  return a.concat(b).slice(0,R.tamReforco).map(x=>x.id);
}
function registrar(L,q,ok){
  const reforco=!!L.rem;
  S.vistos[q.id]=ok?1:0;if(reforco)S.viaRem[q.id]=1;
  const hb=S.hab[q.h]||(S.hab[q.h]={ok:0,t:0});hb.t++;if(ok)hb.ok++;
  if(ok)S.erros=S.erros.filter(x=>x!==q.id);else if(!S.erros.includes(q.id))S.erros.push(q.id);
  const g=ok&&!L.treino?(reforco?R.xpReforco:R.xpCerta):0;S.xp+=g;L.xp+=g;
  const d=hoje();if(!S.dias.includes(d)){S.dias.push(d);if(S.dias.length>400)S.dias.shift()}
  if(!reforco&&!L.rev){
    S.jan[q.h]=(S.jan[q.h]||[]).concat(ok?1:0).slice(-R.janela);
    if(!ok){const ke=L.u+'.'+q.h;S.eu[ke]=(S.eu[ke]||0)+1;
      const j=S.jan[q.h],gat=j.filter(x=>x===0).length>=R.errosJanela||S.eu[ke]>=R.errosUnidade;
      if(gat&&!L.pend){const ids=montaReforco(q,L);if(ids.length)L.pend={h:q.h,ids};else S.pedidos[q.h]=(S.pedidos[q.h]||0)+1}}
  }
  salvar();
}
function verificar(){
  const L=LI,q=qAtual(L);if(L.sel<0||L.chk)return;
  const ok=L.sel===q.g;L.chk=true;L.ultimoOk=ok;
  if(!L.rem){if(ok)L.acertos++;else{L.erros++;if(!L.rev)L.vidas--}}
  registrar(L,q,ok);desenhar();
  const f=$('.feed');if(f)f.querySelector('button').focus();
}
function continuar(){
  const L=LI;
  if(L.rem){L.rem.pos++;
    if(L.rem.pos>=L.rem.ids.length){S.jan[L.rem.h]=[];S.eu[L.u+'.'+L.rem.h]=0;salvar();L.rem=null;
      if(L.pos>=L.ids.length)return fim(L);toast('Reforço concluído. De volta à trilha!')}
  }else{
    L.pos++;
    if(L.vidas<=0){L.fase='sem';L.chk=false;return desenhar()}
    if(L.pend){L.fase='remintro';L.chk=false;L.sel=-1;return desenhar()}
    if(L.pos>=L.ids.length)return fim(L);
  }
  L.sel=-1;L.chk=false;L.fase='q';desenhar();
}
function comecarReforco(){const L=LI;L.rem={h:L.pend.h,ids:L.pend.ids,pos:0};L.pend=null;L.sel=-1;L.chk=false;L.fase='q';desenhar()}
function fim(L){
  const n=L.ids.length,p=n?L.acertos/n:1;L.est=p>=.9?3:p>=.7?2:1;L.pct=Math.round(p*100);
  if(!L.rev){const primeira=!S.licoes[L.k];
    if(primeira){const b=R.xpLicao+(L.est===3?R.xpTresEstrelas:0);S.xp+=b;L.xp+=b;S.licoes[L.k]={e:L.est,p:L.pct}}
    else if(S.licoes[L.k]&&L.est>S.licoes[L.k].e)S.licoes[L.k]={e:L.est,p:L.pct};
    delete S.tent[L.k]}
  salvar();L.fase='fim';desenhar();
}
function tentarDeNovo(){const L=LI;Object.assign(L,{pos:0,vidas:R.vidas,acertos:0,erros:0,rem:null,pend:null,fase:'q',sel:-1,chk:false});desenhar()}
function sair(){LI=null;const e=$('#licao');if(e)e.remove();document.body.style.overflow='';render();window.scrollTo(0,0)}

/* ===== desenho da lição ===== */
function desenhar(){
  let el=$('#licao');if(!el){el=document.createElement('div');el.id='licao';el.className='licao';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Lição');document.body.appendChild(el)}
  const L=LI;let h='';
  const barra=()=>{const tot=L.ids.length,pr=L.fase==='fim'?100:Math.round(100*L.pos/tot);
    return`<div class="l-topo"><button class="fechar" data-act="sair" aria-label="Sair da lição">${I.x}</button><div class="prog ${L.rem?'rem':''}" role="progressbar" aria-valuenow="${pr}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pr}%"></i></div>${L.rev?'':`<div class="vidas" aria-label="${Math.max(0,L.vidas)} vidas">${I.vida}${Math.max(0,L.vidas)}</div>`}</div>`};
  if(L.fase==='remintro'){
    const hb=HAB(L.pend.h),n=L.pend.ids.length;
    h=barra()+`<div class="cheia"><span class="rem-tag">Hora do reforço</span>${figGuia('nota',150)}<h2>Vamos reforçar um ponto</h2><p>Você errou algumas questões de <b>${esc(hb)}</b>. Faça ${n} de reforço e depois a trilha continua de onde parou.</p></div><div class="l-rodape"><button class="btn mag" data-act="reforco">Começar o reforço</button></div>`;
  }else if(L.fase==='sem'){
    h=barra()+`<div class="cheia">${figGuia('nota',150)}<h2>Acabaram as vidas</h2><p>Tudo bem, isso faz parte do treino. Tente a lição de novo com calma.</p></div><div class="l-rodape"><button class="btn" data-act="denovo">Tentar de novo</button><div style="height:10px"></div><button class="btn sec" data-act="sair">Voltar para a trilha</button></div>`;
  }else if(L.fase==='fim'){
    const bom=L.est>=2;
    h=barra()+`<div class="cheia">${figGuia(bom?'aplaude':'estudo',bom?190:170)}<div class="estrelas-g" aria-label="${L.est} de 3 estrelas">${[1,2,3].map(s=>I.estrela(s<=L.est?'#ffdc50':'#d8d7e4')).join('')}</div><h2>${L.rev?'Revisão concluída':'Lição concluída!'}</h2><p>${bom?'Mandou bem, '+esc(S.nome||'craque')+'.':'Terminou a lição. Na próxima, vai mais fácil.'}</p>
    <div class="stats"><div><b>${L.acertos}/${L.ids.length}</b><span>certas</span></div><div><b>${L.pct}%</b><span>aproveitamento</span></div><div><b>+${L.xp}</b><span>pontos</span></div></div></div><div class="l-rodape"><button class="btn" data-act="sair">Continuar</button></div>`;
  }else{
    const q=qAtual(L),rem=L.rem;
    const meta=`<div class="q-meta"><span>${esc(q.p)}</span>${rem?`<span>${esc(HAB(q.h))}</span>`:''}</div>`;
    let corpo='';
    if(q.m==='i'){corpo=`<button class="zoom" data-act="zoom" data-src="${q.i}"><img src="${q.i}" alt="Enunciado da questão (imagem)"><span class="lupa">${I.lupa}Ampliar</span></button><p class="dica-img">Toque na imagem para ampliar e ler com mais conforto.</p>`}
    else{corpo=`<div class="enun">${q.e.map(p=>`<p>${p}</p>`).join('')}</div>`;
      if(q.m==='f')corpo+=`<div class="figs">${q.f.map(f=>`<button class="zoom" style="margin:0" data-act="zoom" data-src="${f}"><img src="${f}" alt="Figura da questão"><span class="lupa">${I.lupa}Ampliar</span></button>`).join('')}</div>`}
    const L5='ABCDE';
    const ops=`<div class="opcoes ${q.m==='i'?'letras':''}" role="group" aria-label="Alternativas">`+[0,1,2,3,4].map(i=>{
      let c='opc';if(L.chk){if(i===q.g)c+=' certa';else if(i===L.sel)c+=' errada'}
      const txt=q.m==='i'?`<span class="letra">${L5[i]}</span>`:`<span class="letra">${L5[i]}</span><span>${q.a[i]}</span>`;
      return`<button class="${c}" data-act="op" data-i="${i}" aria-pressed="${L.sel===i}" ${L.chk?'disabled':''} aria-label="Alternativa ${L5[i]}">${txt}</button>`}).join('')+'</div>';
    let faixa='';
    if(rem)faixa=`<div class="faixa-rem">${av('nota',40)}<span><b>Reforço · ${rem.pos+1} de ${rem.ids.length}</b>${esc(HAB(rem.h))}</span></div>`;
    let rod='';
    if(L.chk){const ok=L.ultimoOk,certa='ABCDE'[q.g];
      const m1=['Isso aí!','Mandou bem!','Acertou em cheio!','Boa! Raciocínio afiado.','Correto!'],m2=['Ainda não foi.','Quase lá.','Errar faz parte do treino.','Vamos de novo na próxima.'];
      const ms=(ok?m1:m2)[(L.pos+(L.rem?L.rem.pos:0)+q.id.length)%(ok?m1.length:m2.length)];
      rod=`<div class="feed ${ok?'':'erro'}" role="status"><div class="f-l">${av(ok?(q.h<=5?'calculo':'aplaude'):'nota',56)}<div><b>${ms}</b>${ok?(L.xp&&!L.treino?`<span>+${rem?R.xpReforco:R.xpCerta} pontos</span>`:''):`<span>A alternativa certa é <b style="display:inline;font-size:inherit;color:inherit">${certa}</b>.</span>`}</div></div><button class="btn ${ok?'':'mag'}" data-act="cont" autofocus>Continuar</button></div>`;
    }else rod=`<div class="l-rodape"><button class="btn" data-act="verificar" ${L.sel<0?'disabled':''}>Verificar</button></div>`;
    h=barra()+faixa+`<div class="l-corpo" id="corpo">${meta}${corpo}${ops}</div>${rod}`;
  }
  el.innerHTML=h;
  const c=$('#corpo');if(c&&!LI.chk)c.scrollTop=0;
}

/* zoom */
function zoom(src){const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-label','Imagem ampliada');
  m.innerHTML=`<div class="barra"><span>Arraste para ver tudo</span><button data-act="fzoom">Fechar</button></div><div class="rolar"><img src="${src}" alt="Imagem ampliada da questão"></div>`;document.body.appendChild(m);m.querySelector('button').focus()}

/* backup */
function codigo(){return'XN1-'+btoa(unescape(encodeURIComponent(JSON.stringify(S))))}
function restaurarDe(txt){txt=(txt||'').trim();if(!txt.startsWith('XN1-'))throw 0;const j=JSON.parse(decodeURIComponent(escape(atob(txt.slice(4)))));if(!j||j.v!==1)throw 0;S=Object.assign(novo(),j);salvar()}

/* ===== eventos ===== */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  switch(a){
    case'ir':tela=b.dataset.t;render();window.scrollTo(0,0);break;
    case'comecar':{const n=($('#nome').value||'').trim();if(n)S.nome=n;else S.pulou=1;salvar();render();break}
    case'licao':iniciar(+b.dataset.u,+b.dataset.i);break;
    case'revisar':if(S.erros.length)iniciar(0,0,true);break;
    case'op':if(!LI.chk){LI.sel=+b.dataset.i;desenhar();const bt=$('[data-act=verificar]');if(bt)bt.focus({preventScroll:true})}break;
    case'verificar':verificar();break;
    case'cont':continuar();break;
    case'reforco':comecarReforco();break;
    case'denovo':tentarDeNovo();break;
    case'sair':if(LI&&LI.fase==='q'&&(LI.pos>0||LI.chk)&&!confirm('Sair da lição? Seu avanço nela será perdido.'))break;sair();break;
    case'zoom':zoom(b.dataset.src);break;
    case'fzoom':b.closest('.modal').remove();break;
    case'gerar':$('#codigo').value=codigo();break;
    case'copiar':{const t=$('#codigo');if(!t.value)t.value=codigo();t.select();try{navigator.clipboard.writeText(t.value);toast('Código copiado.')}catch(_){document.execCommand&&document.execCommand('copy');toast('Código copiado.')}break}
    case'baixar':{const bl=new Blob([codigo()],{type:'text/plain'}),u=URL.createObjectURL(bl),x=document.createElement('a');x.href=u;x.download='xomano-newton-progresso.txt';document.body.appendChild(x);x.click();x.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);break}
    case'restaurar':try{restaurarDe($('#codigo').value);toast('Progresso restaurado.');render()}catch(_){toast('Código inválido. Confira se copiou tudo.')}break;
    case'apagar':if(confirm('Apagar todo o seu progresso neste aparelho? Isso não pode ser desfeito.')){S=novo();salvar();tela='trilha';render()}break;
    case'instalar':if(promptInstalar){promptInstalar.prompt();promptInstalar=null}break;
  }
});
document.addEventListener('change',e=>{if(e.target.id==='arq'){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{restaurarDe(r.result);toast('Progresso restaurado.');render()}catch(_){toast('Arquivo inválido.')}};r.readAsText(f)}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){const m=$('.modal');if(m){m.remove();return}}
  if(!LI||LI.fase!=='q'||e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT')return;
  const k=e.key.toUpperCase();
  if(!LI.chk&&'ABCDE'.includes(k)&&k.length===1){LI.sel='ABCDE'.indexOf(k);desenhar()}
  else if(e.key==='Enter'){if(LI.chk)continuar();else if(LI.sel>=0)verificar()}
});

window.XN={estado:()=>S,plano:PLANO,regras:R,licao:()=>LI};
render();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
})();
