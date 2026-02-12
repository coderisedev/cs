#!/bin/bash
NODE22="$HOME/.nvm/versions/node/v22.22.0/bin/node"
CLI_JS="/home/coderisedev/cs/node_modules/.pnpm/@medusajs+cli@2.10.3_@mikro-orm+core@6.4.3_@mikro-orm+knex@6.4.3_@mikro-orm+core@6.4.3__469669f75d07014106405db9ff77eab7/node_modules/@medusajs/cli/cli.js"

export NODE_PATH="/home/coderisedev/cs/node_modules/.pnpm/@medusajs+cli@2.10.3_@mikro-orm+core@6.4.3_@mikro-orm+knex@6.4.3_@mikro-orm+core@6.4.3__469669f75d07014106405db9ff77eab7/node_modules/@medusajs/cli/node_modules:/home/coderisedev/cs/node_modules/.pnpm/@medusajs+cli@2.10.3_@mikro-orm+core@6.4.3_@mikro-orm+knex@6.4.3_@mikro-orm+core@6.4.3__469669f75d07014106405db9ff77eab7/node_modules/@medusajs/node_modules:/home/coderisedev/cs/node_modules/.pnpm/@medusajs+cli@2.10.3_@mikro-orm+core@6.4.3_@mikro-orm+knex@6.4.3_@mikro-orm+core@6.4.3__469669f75d07014106405db9ff77eab7/node_modules:/home/coderisedev/cs/node_modules/.pnpm/node_modules"

cd /home/coderisedev/cs/apps/medusa
exec "$NODE22" "$CLI_JS" start
