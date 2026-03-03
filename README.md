# ClassBridge

Sistema escolar con portal web para maestros/admin y app movil para padres.

## Estructura del monorepo

```
classbridge/
  backend/       - API REST (Node.js + Express + Sequelize + MySQL)
  dashboard/     - Portal web (maestros y admin)
  app_movil/     - App movil (padres)
  database/      - Scripts SQL de referencia
  scripts/       - Scripts de utilidad
  docs/          - Documentacion general
```

## Inicio rapido - Backend

```bash
cd backend
npm install
# Configurar .env (ver backend/README.md)
npm run db:migrate
npm run db:seed
npm run dev
```

Para mas detalles consulta [backend/README.md](backend/README.md).
