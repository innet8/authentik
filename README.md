## 首次安装

brew install  pwgen

echo "PG_PASS=$(pwgen -s 40 1)" >> .env

echo "AUTHENTIK_SECRET_KEY=$(pwgen -s 50 1)" >> .env

echo "AUTHENTIK_ERROR_REPORTING__ENABLED=true" >> .env


在.env目录中加入以下：

AUTHENTIK_IMAGE=ghcr.io/goauthentik/dev-server
AUTHENTIK_TAG=gh-next
AUTHENTIK_OUTPOSTS__CONTAINER_IMAGE_BASE=ghcr.io/goauthentik/dev-%(type)s:gh-next
AUTHENTIK_LOG_LEVEL=debug

AUTHENTIK_PORT_HTTP=8081
AUTHENTIK_PORT_HTTPS=444∂

然后执行

docker-compose pull

docker-compose up -d







