FROM docker.1ms.run/node:20-alpine AS appbuild
WORKDIR /usr/src/app

# COPY . .

# # 依赖 && 构建
COPY ./dist ./dist

COPY ./nginx.conf ./nginx.conf

# RUN npm install -g pnpm --registry=https://registry.npmmirror.com/

# RUN pnpm i --registry=https://registry.npmmirror.com/

# RUN pnpm build

FROM hub.onchainplm.com:444/onchain-plm/base-front/nginx1.23:latest
WORKDIR /usr/src/app

# 拷贝静态资源
COPY --from=appbuild /usr/src/app/dist /www/server/dist
COPY --from=appbuild /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80