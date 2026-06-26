FILOSOFIA INTERATIVA — VERSÃO 1.0

Estrutura:
- index.html: tela de login com Google.
- painel.html: painel do aluno e acesso ao jogo.
- js/firebase-config.js: configuração do seu projeto Firebase.
- js/firebase-service.js: funções de login, consulta e salvamento.
- jogos/heraclito/index.html: jogo Logos — Heráclito integrado ao Firebase.
- firestore.rules: regras de segurança para colar no Firestore.

IMPORTANTE:
1. Ative Authentication > Google no Firebase.
2. Crie o Firestore Database.
3. Cole o conteúdo de firestore.rules na aba Rules do Firestore e publique.
4. Para testar localmente, não abra com file://. Use Live Server no VS Code ou publique no GitHub Pages.
5. No Firebase Authentication > Settings > Authorized domains, inclua o domínio do GitHub Pages quando publicar.

Fluxo:
Aluno abre index.html > entra com Google > acessa painel.html > joga Heráclito > resultado é salvo em resultados_heraclito > segunda tentativa é bloqueada.
