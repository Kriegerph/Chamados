# Chamados Web (Angular + Firebase)

Aplicativo web para controle de chamados usando Angular (standalone) e Firebase Firestore (Web SDK modular).

## Como executar

1. `npm install`
2. `npm run check:firebase` (deve listar apenas `firebase` como dependencia principal)
3. `npm start` (ou `ng serve`)

Acesse `http://localhost:4200`.

## Autenticacao (Email/Senha)

- No Firebase Console: Authentication → Sign-in method → Email/Password (Enable).

## Estrutura principal

- `src/environments/environment.ts` configuracao do Firebase
- `src/app/services/firebase.service.ts` inicializa Firebase e Firestore
- `src/app/services/chamados.service.ts` regras de acesso e consultas
- `src/app/pages/abertos.component.*`
- `src/app/pages/concluidos.component.*`
- `src/app/pages/dashboard.component.*`
- `src/app/models/chamado.model.ts`

## Observacao sobre dados antigos

- Dados existentes em `/chamados` (colecao global) nao sao mais lidos. Os novos registros ficam em `users/{uid}/chamados`.

## Scripts utiles

- `npm run check:firebase`
- `npm run install:clean:win` (Windows)

## Troubleshooting

- Mais de uma versao do Firebase no `npm ls firebase`:
  - No Windows: `npm run install:clean:win`
  - Em outros ambientes: apague `node_modules` e `package-lock.json`, depois rode `npm install`

- Erro de permissao no Firestore:
  - Verifique as regras do projeto Firebase e a conectividade com a internet.

## Publicacao

O projeto pode ser publicado em qualquer hosting estatico (ex.: Firebase Hosting) apos `ng build`.
