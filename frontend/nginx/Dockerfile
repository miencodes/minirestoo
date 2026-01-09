# kita pake base image nginx yg enteng
FROM nginx:1.25-alpine

# ngehapus file konfigurasi default dari Nginx
RUN rm /etc/nginx/conf.d/default.conf

# ngopy file konfigurasi kita
COPY nginx.conf /etc/nginx/conf.d/default.conf