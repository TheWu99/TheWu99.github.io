docker build -t mathforai .
docker run -t --name mathforai -p 5000:5000 mathforai

#debug
docker logs mathforai

#list the running container
docker ps

#save Docker image to .tar file
docker save -o mathforai.tar mathforai

#copy .tar to NAS
sftp nas:/docker/
put mathforai.tar 

#load image on NAS
ssh nas
cd /volume1/docker/
docker load -i mathforai.tar

#run docker
docker run -t --name mathforai -p 5000:5000 mathforai

#push to Docker Hub
docker login
docker tag mathforai flydragonpulse/mathforai:latest
docker push flydragonpulse/mathforai:latest
