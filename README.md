# GIBASHOP - Política de Segurança e Guia de Hospedagem

Este repositório foi preparado para hospedar o projeto no GitHub com as melhores práticas de segurança.

## 🛡️ Políticas de Segurança

### 1. Proteção de Chaves e Segredos
- **Firebase**: As configurações do Firebase estão em `firebase-applet-config.json`. Em produção, recomendamos restringir as chaves de API no console do Firebase para aceitar apenas o domínio final do site (ex: `gibashop.github.io`).
- **AI (Gemini)**: O serviço está configurado para usar `process.env.GEMINI_API_KEY`. 
    - **Atenção**: Ao hospedar de forma estática (GitHub Pages), chaves injetadas no build tornam-se públicas. Recomendamos o uso de um backend ou Firebase Functions para processar chamadas de IA de forma segura.
- **Git**: O arquivo `.gitignore` impede a subida de arquivos `.env` e outros arquivos sensíveis. Nunca remova esta proteção.

### 2. Segurança de Dados (Firestore)
- As regras em `firestore.rules` foram endurecidas seguindo a estratégia de "Fortaleza":
    - **Acesso Admin**: Restrito ao e-mail `gibasuporte@gmail.com` com verificação de e-mail obrigatória.
    - **Validação de Schema**: Todos os dados recebidos são validados quanto ao tipo, tamanho e integridade.
    - **Imutabilidade**: IDs de autor e datas de criação não podem ser alterados após o cadastro.

## 🚀 Como Hospedar no GitHub

### Opção A: GitHub Pages (Estático)
1. Crie um repositório no GitHub.
2. O site está configurado com `HashRouter`, o que significa que as URLs terão um `/#/` (ex: `gibashop.github.io/#/catalogo`). Isso é necessário para que a navegação funcione perfeitamente em servidores estáticos.
3. Pressione o código:
   ```bash
   git init
   git add .
   git commit -m "Arquivos iniciais"
   git remote add origin https://github.com/SEU_USUARIO/gibashop.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings > Pages** e escolha `GitHub Actions` como fonte.
4. O arquivo `.github/workflows/deploy.yml` (se presente) automatiza o build e deploy.

### ⚙️ Variáveis de Ambiente
No repositório do GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:
- `GEMINI_API_KEY`: Sua chave do Google AI.
- `VITE_FIREBASE_CONFIG`: (Opcional, se quiser separar a config do código).

## 📄 Especificação de Segurança
Veja o arquivo `security_spec.md` para detalhes técnicos das regras de firewall do banco de dados.
