# office-365-simple-oauth-node-webapp

### nginx
nginx is used here for basic https server...

#### Basic Commands
```
sudo nginx
sudo nginx -s stop
```


#### Config Path
```
Mac
/usr/local/etc/nginx/nginx.conf
```



#### Sample nginx config for https
```
    # only if needed
    sudo mkdir -p /var/log/nginx/
```
```
worker_processes  1;

error_log  /var/log/nginx/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;
#pid        logs/nginx.pid;

events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;
    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    proxy_buffering off;
    fastcgi_buffers 16 16k;
    fastcgi_buffer_size 32k;
    proxy_buffer_size   128k;
    proxy_buffers   4 256k;
    proxy_busy_buffers_size   256k;

    server {
        listen       8443;
        server_name  localhost;
        ssl on;
        ssl_certificate /Users/syle/Documents/_git/_personal/office-365-simple-oauth-node-webapp/cert/server.crt;
        ssl_certificate_key /Users/syle/Documents/_git/_personal/office-365-simple-oauth-node-webapp/cert/server.key;
        location / {
            proxy_pass      http://127.0.0.1:8080;
        }
    }


    include servers/*;
}
```
