# ---------------------------------------------------------------------
# launch scripts on aws run as root so there is no need to add 'sudo' |
# ---------------------------------------------------------------------

# intialize launch script log file
LOG_FILE=/tmp/launchscript.log
touch $LOG_FILE

# update packages
echo "update packages >> apt-get update -y" >> $LOG_FILE
apt-get update -y

# constants
GO_PKG_NAME=go1.23.6.linux-amd64.tar.gz
GO_DOWNLOAD_URL="https://go.dev/dl/$GO_PKG_NAME"

# donwload go
echo "download go >> wget $GO_DOWNLOAD_URL" >> $LOG_FILE
apt-get install -y wget
wget $GO_DOWNLOAD_URL

# install go
echo "unpack go pkg >> rm -rf /usr/local/go && tar -c /usr/local -xzf $GO_PKG_NAME" >> $LOG_FILE
rm -rf /usr/local/go && tar -c /usr/local -xzf $GO_PKG_NAME

echo "install goose for migrations" >> $LOG_FILE
go install github.com/pressly/goose/v3/cmd/goose@v3.22.1

# add docker's official gpg key:
echo "install docker build dependency tools" >> $LOG_FILE
apt-get install -y ca-certificates curl
echo "install docker repository gpg key" >> $LOG_FILE
install -m 0755 -d /etc/apt/keyrings
echo "download docker .asc file" >> $LOG_FILE
curl -fssl https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "chmod /etc/apt/keyrings/docker.asc" >> $LOG_FILE
chmod a+r /etc/apt/keyrings/docker.asc

# add the repository to apt sources:
echo "add repository to apt sources" >> $LOG_FILE
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${ubuntu_codename:-$version_codename}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
echo "update packages after adding docker repository to apt sources" >> $LOG_FILE
apt-get update -y

# install docker
echo "install docker" >> $LOG_FILE
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# install nginx
echo "install nginx" >> $LOG_FILE
apt-get install -y nginx
echo "enable nginx" >> $LOG_FILE
systemctl enable nginx
echo "start nginx" >> $LOG_FILE
systemctl start nginx


SITE_URL=onboard.konfer.ca
HTML_DIR=/etc/html/onboard
echo "Make html file directory" >> $LOG_FILE
mkdir -p /etc/html/onboard
echo "Setup Nginx site file" >> $LOG_FILE
echo "limit_req_zone \$binary_remote_addr zone=two:10m rate=10r/s;

server {
    listen 443 ssl;
    server_name $SITE_URL;

    ssl_certificate /etc/ssl/onboard-cert.pem;
    ssl_certificate_key /etc/ssl/onboard-key.pem;

    root $HTML_DIR;
    index index.html

    gzip on;
    gzip_vary on;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript
 application/x-javascript application/xml;
    gzip_disable \"MSIE [1-6]\.\";


    # frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options \"SAMEORIGIN\";
        add_header X-XSS-Protection \"1; mode=block\";
        add_header X-Content-Type-Options \"nosniff\";
    }


    # backend
    location /api/v1 {
        limit_req zone=two burst=20 nodelay;
        limit_req_status 444;
        proxy_pass http://127.0.0.1:6969;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-App-Name nk-staging;
    }

    # deny access to hidden files
    location ~ /\. {
        deny all;
    }
}" >> /etc/nginx/sites-available/onboard
