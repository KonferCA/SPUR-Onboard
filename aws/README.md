# AWS EC2 Instance Setup Guide

## 1. Create a new instance in the AWS console.

Use an instance template or create a new instance with Ubuntu 24.04LTS.

## 2. Run `launchscript.sh`

> > You should SSH into the instance to verify that it is working correctly.

Use `scp` to copy the script to the instance.

```
scp -i /path/to/private.pem launchscript.sh ubuntu@remote-ip:/home/ubuntu
```

After the script has been copied to the remote server, SSH into the server and run the following comands:

1. Add executable permission to script

```
chmod +x /home/ubuntu/launchscript.sh
```

2. Set the required environment variables in `launchscript.sh`

    - Edit the file using editor of choice, in this case `vim`. Follow the comments for more information.
    - Another way is to edit the script before uploading it to the remote server.

3. Run script with `sudo`

```
sudo ./launchscript.sh
```

4. Make sure that all the basic software and configurations are installed and ready.

    - [ ] Make sure Go has been installed by running `go version`
    - [ ] Make sure `goose` has been installed by running `goose -version`
    - [ ] Make sure Docker is up and running with `docker -v` and `sudo systemctl status docker`
    - [ ] Make sure Nginx is enabled and running with `sudo systemctl status nginx`
    - [ ] Make sure site configuration for Nginx exists and its correct with `cat /etc/nginx/sites-available/${site_name}`
        - [ ] The `server_name` is correct
        - [ ] The paths for `ssl_certificate` and `ssl_certificate_key` is correct
        - [ ] The path for `root` points to the public folder for static resources (html/css/js/images)
        - [ ] The `location`s are setup correctly for both front-end and back-end
    - [ ] Exit the session and start a new one to make sure the user `ubuntu` has been added to the group `docker` with command `groups`

## 3. Setup SSL & Enable Site

> > This section assumes that DNS has been configured and it has been populated.

1. Get the SSL certificate and private key from Cloudflare
2. Upload the certificate and private key using `scp`, the same method to upload the `launchscript.sh` file
3. SSH into the server
4. Move the uploaded certificate and private key files
    - `sudo mv /path/to/cert /etc/ssl/${APP_NAME}/${APP_ENV}/cert.pem`
    - `sudo mv /path/to/pk /etc/ssl/${APP_NAME}/${APP_ENV}/key.pem`
5. Enable the site by creating a symlink
    - `sudo ln -s /etc/nginx/sites-available/${APP_NAME}-${APP_ENV} /etc/nginx/sites-enabled/${APP_NAME}-${APP_ENV}`
6. Test the configuration
    - `sudo nginx -t`
7. If all good, restart Nginx
    - `sudo nginx -s reload`
8. You can now create a test index.html in the public directory of the site and see if it works.
