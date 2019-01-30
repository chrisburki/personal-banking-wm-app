1. product offerings based on banking data
------------------------------------------
- own history of products (asset class based, region based, currency based, ...)
- history of cash balances
- same based on peers data (age, hobbies, sex, place of residence, kind of residence, family/childrens, income, wealth, nationality, parents nationality, ...)
- social data (twitter, facebook, google, ...)


2. exchange with other peers / robot about financial advice
-----------------------------------------------------------
- enter some of your goals / dreams
- ask robot for proposals


Interesting Links
-----------------
Istio: istio.io
github.com/saturnism/istio-by-example-java

g.co/codelabs/cloud

https://github.com/arun-gupta/kubernetes-for-java-developers
https://github.com/arun-gupta/kubernetes-java-sample/blob/master/workshop.adoc#create-kubernetes-cluster
https://github.com/arun-gupta/kubernetes-java-sample

https://pixabay.com/de/

https://medium.freecodecamp.org/the-best-ways-to-connect-to-the-server-using-angular-cli-b0c6b699716c
https://www.sitepoint.com/angular-rxjs-create-api-service-rest-backend/
https://ordina-jworks.github.io/docker/2017/12/15/Docker-basic-networking.html
search with: configuration angular app with backend server in kubernetes

spring boot container: 
https://www.callicoder.com/spring-boot-docker-example/
https://www.baeldung.com/dockerizing-spring-boot-application
https://stackify.com/guide-docker-java/

3. build docker image
---------------------
docker build -t wm-app .
docker tag wm-app chrisburki/wm-app
docker push chrisburki/wm-app:latest

docker build -t wm-customer .
docker tag wm-customer chrisburki/wm-customer
docker push chrisburki/wm-customer:latest


4. run docker image
-------------------
docker run --name wm-customer-db -e POSTGRES_USER=buc -e POSTGRES_PASSWORD=buc -e POSTGRES_DB=wm-customer -p 5432:5432 -d postgres
docker run --name wm-customer -p 8090:8080 --link wm-customer-db:postgres -d wm-customer
docker run --name wm-app -p 8081:80 -d wm-app

4a. postgres db
---------------
docker exec -it wm-customer-db bash
psql -d wm-customer -U buc -W
http://www.postgresqltutorial.com/psql-commands/

doku
https://blog.nebrass.fr/playing-with-spring-boot-on-kubernetes/
https://github.com/mkjelland/spring-boot-postgres-on-k8s-sample


5. clone image from git
-----------------------
initial clone: git clone xxx
update: git pull orgin master


6. run on kubernetes
--------------------
-- loadbalancer
kubectl apply -f ./src/k8/loadbalancer

chmod +x ./src/k8/wm-loadbalancer.sh
./src/k8/wm-loadbalancer.sh

-- ingress
-- var 1 - nginx ingress controller
kubectl apply -f ./src/k8/ingress/ingress-controller1

-- var 2 - nginxinc ingress
https://github.com/nginxinc/kubernetes-ingress/blob/master/docs/installation.md

-- var 3 - standard GCP load balancer via ingress
see directory ingress-std

-- deploy app for ingress
kubectl apply -f ./src/k8/ingress

-- start stop with gcp load balaner
https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer

-- create cluster
gcloud config set project buc-personal-banking
gcloud config set compute/zone europe-west3-c
gcloud container clusters create personalbanking --machine-type=g1-small --disk-size=30GB --num-nodes=1
gcloud container clusters get-credentials personalbanking

-- create deployments
kubectl create -f src/k8/ingress/wm-customer-db-deploy.yaml
kubectl create configmap hostname-config --from-literal=postgres_host=$(kubectl get svc wm-customer-db -o jsonpath="{.spec.clusterIP}")
kubectl create -f src/k8/ingress/wm-customer-deploy-ingress.yaml
kubectl create -f src/k8/ingress/wm-app-deploy-ingress.yaml
kubectl create -f src/k8/ingress/ingress-std/wm-ingress.yaml



delete deployments

gcloud container clusters delete personalbanking


-- cleanup
kubectl delete namespace ingress-nginx (only needed for var 3)
run wm-ingress-cleanup.sh

--- show logs within a container
docker run -i -t --volumes-from wm-app --name wm-app2 debian /bin/bash
https://blog.docker.com/2015/04/tips-for-deploying-nginx-official-image-with-docker/

-- run pod for debug reasons
kubectl run -it --rm --restart=Never busybox --image=busybox sh
run: wget -qO- 10.11.250.20:80/customer/13
https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/

Problems
--------
no access to docker: sudo usermod -a -G docker $USER //(log out and in again)

kubernetes:
----------

start a proxy: kubectl proxy  / 
 - see in internal apis:  curl http://localhost:8001/version
 - https://kubernetes.io/docs/tutorials/kubernetes-basics/explore/explore-interactive/

kubectl exec [POD_NAME] env
kubectl exec -ti [POD_NAME] bash

nginx - front end / back-end
----------------------------
https://github.com/achalise/multi-tier-kubernetes/blob/master/front-end/frontend.conf
https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/
https://github.com/stablekernel/dart-k8s

nginx - routing
---------------
https://tech.holidayextras.com/routing-to-internal-kubernetes-services-using-proxies-and-ingress-controllers-e7eb44954d53
https://coderjourney.com/kubernetes-frontend-service-with-nginx/

IP routing
----------
https://support.acquia.com/hc/en-us/articles/360005257154-Use-cURL-s-resolve-option-to-pin-a-request-to-an-IP-address

adapt c:\Windows\System32\Drivers\etc\hosts, e.g. add 35.246.126.233  cafe.example.com 
then http://cafe.example.com/ or http://cafe.example.com/customer/13 in the browser
then run Clear-DnsClientCache in PowerShell as Admin

Call Rest Endpoint
------------------
https://jaxenter.com/spring-boot-tutorial-microservices-kubernetes-part-2-135518.html

Secrets
-------
https://itnext.io/migrating-a-spring-boot-service-to-kubernetes-in-5-steps-7c1702da81b6
