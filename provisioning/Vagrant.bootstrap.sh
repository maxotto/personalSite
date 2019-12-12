#!/usr/bin/env bash

# ---------------------------------------
#          Virtual Machine Setup
# ---------------------------------------

# read this!!! https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-in-ubuntu-16-04
#---------------------------------------
#        NGINX sites
#---------------------------------------

# Setup hosts files
echo -e "\n--- VHOSTS install ---\n"
rm /etc/nginx/sites-available/default
rm /etc/nginx/sites-enabled/default
# rm /etc/nginx/sites-available/backend
# rm /etc/nginx/sites-available/frontend
# rm /etc/nginx/sites-available/api
# rm /etc/nginx/sites-available/test

VHOST1=$(cat <<EOF
server {
    listen 80;
    listen [::]:80;
    root /var/www/agmsite/www;
    index index.php index.html index.htm index.nginx-debian.html;
    error_page 404 /index.html;
    server_name www.agmsite.com;
    location / {
            index  index.html index.php;
            if (!-e \$request_filename){
                rewrite ^/(.*) /index.php?r=\$1 last;
            }
    }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.1-fpm.sock;
    }
    location ~ /\.ht {
        deny all;
    }
}
EOF
)
touch /etc/nginx/sites-available/frontend
echo "${VHOST1}" >> /etc/nginx/sites-available/frontend
ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/frontend

VHOST3=$(cat <<EOF
server {
    listen 80;
    listen [::]:80;
    root /var/www/agmsite/engine/frontend/web;
    index index.php index.html index.htm index.nginx-debian.html;
    # сервер API должен позволять CORS!
    # add_header 'Access-Control-Allow-Origin' "\$http_origin";
    server_name api.agmsite.com;
    location / {
            index index.html index.php;
            if (!-e \$request_filename){
                rewrite ^/(.*) /index.php?r=\$1 last;
            }
    }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.1-fpm.sock;
    }
    location ~ /\.ht {
        deny all;
    }
}
EOF
)
touch /etc/nginx/sites-available/api
echo "${VHOST3}" >> /etc/nginx/sites-available/api
ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/api


VHOST2=$(cat <<EOF
server {
    listen 80;
    listen [::]:80;
    root /var/www/agmsite/engine/backend/web;
    index index.php index.html index.htm index.nginx-debian.html;
    server_name admin.agmsite.com;
    location / {
            index  index.html index.php;
            if (!-e \$request_filename){
                rewrite ^/(.*) /index.php?r=\$1 last;
            }
    }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.1-fpm.sock;
    }
    location ~ /\.ht {
        deny all;
    }
    location /phpmyadmin {
               root /usr/share/;
               index index.php index.html index.htm;
               location ~ ^/phpmyadmin/(.+\.php)$ {
                       try_files \$uri =404;
                       root /usr/share/;
                       fastcgi_pass unix:/run/php/php7.1-fpm.sock;
                       fastcgi_index index.php;
                       fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
                       include /etc/nginx/fastcgi_params;
               }
               location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
                       root /usr/share/;
               }
        }
        location /phpMyAdmin {
               rewrite ^/* /phpmyadmin last;
        }
}
EOF
)
touch /etc/nginx/sites-available/backend
echo "${VHOST2}" >> /etc/nginx/sites-available/backend
ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/backend
nginx -s reload 

# install MC
echo -e "\n--- MC install ---\n"
apt-get install -y mc >> /vagrant/vm_build.log 2>&1

deb http://archive.ubuntu.com/ubuntu bionic main universe
deb http://archive.ubuntu.com/ubuntu bionic-security main universe
deb http://archive.ubuntu.com/ubuntu bionic-updates main universe

DBNAME=yii2
DBPASSWD=secret

echo -e "\n--- Setting up our MySQL db ---\n"
mysql -uroot -p$DBPASSWD -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DBPASSWD';" >> /vagrant/vm_build.log 2>&1
mysql -uroot -p$DBPASSWD -e "CREATE DATABASE $DBNAME" >> /vagrant/vm_build.log 2>&1
# дадим возможность подключаться к этой базе с хоста
mysql -uroot -p$DBPASSWD -e "GRANT ALL PRIVILEGES ON $DBNAME.* TO root@'%' IDENTIFIED BY '$DBPASSWD' WITH GRANT OPTION;" >> /vagrant/vm_build.log 2>&1
mysqladmin -u root -p$DBPASSWD flush-privileges >> /vagrant/vm_build.log 2>&1
# провести миграции
cd /var/www/agmsite/engine
php yii migrate --interactive=0
php yii migrate --migrationPath=@yii/rbac/migrations/ --interactive=0
php yii migrate --migrationPath=@mdm/admin/migrations/ --interactive=0
# mysql -uroot -p$DBPASSWD -e "grant all privileges on $DBNAME.* to '$DBUSER'@'localhost' identified by '$DBPASSWD'" > /vagrant/vm_build.log

echo -e "\n--- Provisioning finished ---\n"

exit 0
