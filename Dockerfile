#FROM nginx:alpine

#COPY ./dist/wm-app /usr/share/nginx/html/
#COPY ./.docker/nginx.conf /etc/nginx/conf.d/nginx.conf
#VOLUME /var/log/nginx/log

FROM nginx
COPY ./dist/wm-app /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY ./.docker/nginx.conf /etc/nginx/conf.d