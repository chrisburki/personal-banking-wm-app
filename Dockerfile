FROM nginx:alpine

COPY ./dist/wm-app /usr/share/nginx/html/
COPY ./.docker/nginx.conf /etc/nginx/conf.d/nginx.conf
#COPY ./.docker/nginx.conf /etc/nginx/nginx.conf
VOLUME /var/log/nginx/log