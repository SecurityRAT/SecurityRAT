This is an image enabling a quick&easy start if you want to play around with the SecurityRAT tool (otherwise available at [https://github.com/SecurityRAT](https://github.com/SecurityRAT)). Hope it works.

**Important: the setup is not suitable for a production environment!**

# How To
- run docker `run -i-t -p 9002:9002 securityrat/all_in_one`
- once the image has started, navigate to [https://localhost:9002](https://localhost:9002) and accept the self-signed certificate in your browser
- authenticate with one of the default users `admin/admin` or `user/user`
- start playing around 

# Run commands into running container
- open another terminal and run `docker ps`. This will list the containers running.
- fire `docker exec -it --user securityrat <container-id> bash`. The password to the `securityrat` user is the same as the username