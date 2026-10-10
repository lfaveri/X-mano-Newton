# Xômano Newton – Treinando a Física do ENEM

Aplicativo de simulado de Física do ENEM em trilhas curtas, estilo "lições", para o projeto da DRE Primavera do Leste. Funciona no celular como app instalável, **sem login, sem servidor e sem coletar dados**. O progresso de cada aluno fica salvo no próprio aparelho.

- 203 questões: 155 do ENEM (2009–2014) e 48 originais (ORIGINAL - 2026)
- 12 unidades, de Grandezas e S.I. até Física Moderna
- Reforço automático: se o aluno erra muito uma habilidade, a trilha pausa, entram 4 questões dessa habilidade e depois ela continua de onde parou
- Gabarito só com a letra correta (sem resolução)
- Funciona offline depois do primeiro acesso

## Publicar no GitHub (passo a passo)

1. **Conta.** Crie uma conta gratuita em https://github.com (se ainda não tiver).
2. **Repositório.** Clique em **New repository**. Nome sugerido: `xomano-newton`. Marque **Public** e clique em **Create repository**.
3. **Enviar os arquivos.** Na página do repositório, clique em **uploading an existing file**.
   O GitHub aceita **até 100 arquivos por envio**, e este app tem mais que isso. Envie em duas etapas:
   - **Etapa 1:** arraste tudo que está na pasta, **exceto a pasta `img`** (ou seja: `index.html`, `app.js`, `dados.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `README.md`, `LICENSE.md` e as pastas `fonts`, `guia`, `icons`, `logos` e `docs`). Clique em **Commit changes**.
   - **Etapa 2:** volte ao repositório, clique em **Add file → Upload files**, arraste só a pasta `img` e clique em **Commit changes**.
4. **Ativar a página.** Vá em **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, branch **main** e pasta **/ (root)**, e clique em **Save**.
5. **Pegar o link.** Espere de 1 a 3 minutos e atualize a página. O endereço aparece no topo: algo como `https://SEU-USUARIO.github.io/xomano-newton/`.
6. **Testar.** Abra o link em um celular, responda uma lição e confira se tudo aparece (textos, figuras e gráficos).

## Instalar no celular dos alunos

- **Android (Chrome):** abra o link, toque nos três pontinhos e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

Depois disso o ícone da raposa aparece na tela inicial e o app abre em tela cheia. Basta abrir o app uma vez com internet para ele funcionar offline.

## Trocar de celular sem perder o progresso

Em **Progresso → Salvar ou trocar de aparelho**: gere o código (ou baixe o arquivo), abra o app no outro celular e use **Restaurar do código**.

## Atualizar o app depois de publicado

Cada vez que você trocar qualquer arquivo no GitHub (clique no arquivo, no lápis de edição ou envie um novo por cima):

1. Abra `sw.js` e mude o texto da linha `const VERSAO='...'` (por exemplo, para `'xn-2'`, depois `'xn-3'`). **Sem isso, os celulares continuam usando a versão antiga guardada.**
2. Salve com **Commit changes** e aguarde 1 a 3 minutos.
3. Os alunos veem a versão nova na próxima vez que abrirem o app com internet (às vezes é preciso abrir duas vezes).

### Corrigir o gabarito de uma questão
Abra `dados.js`, procure o código da questão (por exemplo `"id":"E012"`) e mude o valor de `"g"`: 0 = A, 1 = B, 2 = C, 3 = D, 4 = E.

### Tirar uma questão da trilha
Na mesma linha da questão, acrescente `"x":1,` logo depois do `"id"`. Já está assim a **E006**, que o gabarito original diz estar mal formulada.

### Ajustar as regras do reforço
No começo de `app.js` existe o bloco `REGRAS PEDAGÓGICAS`. Ali você muda, por exemplo, quantas questões vêm no reforço (`tamReforco`) ou quantos erros disparam o reforço (`errosJanela`, `errosUnidade`).

## O que tem na pasta

| Item | Para que serve |
|---|---|
| `index.html`, `style.css`, `app.js` | O aplicativo |
| `dados.js` | As 203 questões, com habilidade, nível e gabarito |
| `img/` | Figuras, gráficos e questões em imagem |
| `guia/`, `logos/`, `icons/`, `fonts/` | Identidade visual |
| `sw.js`, `manifest.webmanifest` | Instalação no celular e uso offline |
| `docs/etiquetagem_questoes.xlsx` | Planilha de revisão das etiquetas |
| `LICENSE.md` | Licença CC BY-NC 4.0 |

## Créditos
Projeto da Diretoria Regional de Educação de Primavera do Leste, com a SEDUC-MT e a SECITECI-MT. Questões do ENEM: INEP/MEC. Questões originais, código e identidade visual: CC BY-NC 4.0 (ver `LICENSE.md`).
