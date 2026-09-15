#!/usr/bin/env sh
# Start do gerenciador em producao (Render).
# Garante que o banco existe e tem dados antes de subir o servidor.
set -e

echo "--> Sincronizando o schema do banco..."
npx prisma db push --skip-generate

if node scripts/banco-vazio.mjs; then
  echo "--> Banco vazio: populando com os dados iniciais..."
  npx prisma db seed
else
  echo "--> Banco ja tem dados: seed pulado."
fi

echo "--> Subindo o servidor..."
exec npm start
