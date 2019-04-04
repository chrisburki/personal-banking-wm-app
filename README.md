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
https://docs.google.com/document/d/1Qo8o5C4UpGwMF7Mg02kLTaU4-xCSfJjLcnIFNveMEEA/edit#heading=h.tremawe2ds3r
https://cloud.google.com/istio/docs/istio-on-gke/installing



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

docker build -t wm-address .
docker tag wm-address chrisburki/wm-address
docker push chrisburki/wm-address:latest

docker build -t wm-testrestclient .
docker tag wm-testrestclient chrisburki/wm-testrestclient
docker push chrisburki/wm-testrestclient:latest

docker build -t wm-kafkapublisher .

docker build -t wm-kafkaconsumer .


3b. Docker commands
-------------------
FOR /f "tokens=*" %i IN ('docker ps -q') DO docker stop %i
FOR /f "tokens=*" %i IN ('docker container ls -a') DO docker rm %i


4. run docker image
-------------------
docker run --name wm-customer-db -e POSTGRES_USER=buc -e POSTGRES_PASSWORD=buc -e POSTGRES_DB=wm-customer -p 5432:5432 -d postgres
docker run --name wm-customer -p 8090:8080 --link wm-customer-db:postgres -d wm-customer
docker run --name wm-address -p 8091:8080 -d wm-address
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
kubectl apply -f ./src/k8s/loadbalancer

chmod +x ./src/k8s/wm-loadbalancer.sh
./src/k8s/wm-loadbalancer.sh

-- ingress
-- var 1 - nginx ingress controller
kubectl apply -f ./src/k8s/ingress/ingress-controller1

-- var 2 - nginxinc ingress
https://github.com/nginxinc/kubernetes-ingress/blob/master/docs/installation.md

-- var 3 - standard GCP load balancer via ingress
see directory ingress-std

** cleanup
kubectl delete namespace ingress-nginx (only needed for var 3)
run wm-ingress-cleanup.sh

-- deploy app for ingress
kubectl apply -f ./src/k8s/ingress

-- start stop with gcp load balaner
https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer


--------------------------
-- create & delete cluster (project-id: 281928467963)
--------------------------
-- create cluster
gcloud config set project buc-personal-banking
gcloud config set compute/zone europe-west3-c
gcloud container clusters create personalbanking --machine-type=g1-small --disk-size=30GB --num-nodes=1
gcloud container clusters get-credentials personalbanking

-- create deployments for app
kubectl create -f src/k8s/ingress/wm-customer-db-deploy.yaml
kubectl create configmap hostname-config --from-literal=postgres_host=$(kubectl get svc wm-customer-db -o jsonpath="{.spec.clusterIP}")
kubectl create -f src/k8s/ingress/wm-customer-deploy-ingress.yaml
kubectl create -f src/k8s/ingress/wm-app-deploy-ingress.yaml
kubectl create -f src/k8s/ingress/ingress-std/wm-ingress.yaml

-- create kafka
kubectl create -f src/k8s/kafka/wm-zookeeper-deploy.yaml
kubectl create -f src/k8s/kafka/wm-kafka-deploy.yaml
kubectl create -f src/k8s/ingress/wm-kafka-client-deploy.yaml

-- create pubsub
gcloud services enable pubsub.googleapis.com
gcloud pubsub topics create buc
gcloud pubsub subscriptions create buc-sub --topic buc --ack-deadline=60

gcloud iam service-accounts create wm-pubsub-app --display-name "wm-pubsub-app"
gcloud projects add-iam-policy-binding buc-personal-banking --member "serviceAccount:wm-pubsub-app@buc-personal-banking.iam.gserviceaccount.com" --role "roles/pubsub.admin"
gcloud iam service-accounts keys create ~/wm-pubsub-key.json --iam-account wm-pubsub-app@buc-personal-banking.iam.gserviceaccount.com
kubectl create secret generic wm-pubsub-key --from-file=key.json=wm-pubsub-key.json

kubectl create -f src/k8s/pubsub/wm-pubsub-deploy.yaml

-- delete deployments
kubectl delete -f src/k8s/ingress/ingress-std/wm-ingress.yaml
kubectl delete -f src/k8s/ingress/wm-app-deploy-ingress.yaml
kubectl delete -f src/k8s/ingress/wm-customer-deploy-ingress.yaml
kubectl delete configmap hostname-config
kubectl delete -f src/k8s/ingress/wm-customer-db-deploy.yaml

-- delete kafka
kubectl delete -f src/k8s/ingress/wm-kafka-client-deploy.yaml
kubectl delete -f src/k8s/kafka/wm-kafka-deploy.yaml
kubectl delete -f src/k8s/kafka/wm-zookeeper-deploy.yaml

-- delete pubsub
kubectl delete -f src/k8s/pubsub/wm-pubsub-deploy.yaml

gcloud pubsub subscriptions delete buc-sub
gcloud pubsub topics delete buc

kubectl delete secret wm-pubsub-key
gcloud iam service-accounts keys delete ~/wm-pubsub-key.json --iam-account wm-pubsub-app@buc-personal-banking.iam.gserviceaccount.com
gcloud projects remove-iam-policy-binding buc-personal-banking --member "serviceAccount:wm-pubsub-app@buc-personal-banking.iam.gserviceaccount.com" --role "roles/pubsub.admin"
gcloud iam service-accounts delete wm-pubsub-app@buc-personal-banking.iam.gserviceaccount.com

-- delete cluster
gcloud container clusters delete personalbanking
--------------------------
-- create & delete cluster
--------------------------


7. debug on kubernetes
----------------------
--- show logs within a container
docker run -i -t --volumes-from wm-app --name wm-app2 debian /bin/bash
https://blog.docker.com/2015/04/tips-for-deploying-nginx-official-image-with-docker/

-- run pod for debug reasons
kubectl run -it --rm --restart=Never busybox --image=busybox sh
kubectl run -it --rm --restart=Never busybox --image=radial/busyboxplus:curl sh

kubectl run curl-<YOUR NAME> --image=radial/busyboxplus:curl -i --tty --rm

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

yaml
----
kubectl get deploy deploymentname -o yaml --export


8. documentations
-----------------
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

Ports
-----
to access service from busybox (other service):
pod must on port 8080 (targetPort of service), service can run on port 80 or 8080 (Port of service)

kubectl run wm-address --image=chrisburki/wm-address:latest --port=8080
kubectl expose deployment wm-address --target-port=8080 --port=8080 --type=NodePort

kubectl run wm-tc --image=chrisburki/wm-testrestclient:latest --port=8080
kubectl expose deployment wm-tc --target-port=8080 --port=8080 --type=NodePort


9. Kafka
--------
https://github.com/kubernetes/contrib/tree/master/statefulsets/kafka
https://www.learningjournal.guru/courses/kafka/kafka-foundation-training/
https://thepracticaldeveloper.com/2018/11/24/spring-boot-kafka-config/
https://github.com/TechPrimers/spring-boot-kafka-producer-example
https://robertbrem.github.io/Microservices_with_Kubernetes/19_CQRS_with_Kafka/01_Setup_Kafka/
https://imti.co/kafka-kubernetes/
https://dojoblog.dellemc.com/dojo/deploy-kafka-cluster-kubernetes/
https://github.com/kow3ns/kubernetes-kafka/blob/master/manifests/README.md



-- Check it out locally
https://medium.com/@itseranga/kafka-and-zookeeper-with-docker-65cff2c2c34f
https://hub.docker.com/r/bitnami/kafka/

** create a network "buc-kafka"
docker network create buc-kafka --driver bridge

** start zookeeper
docker run -d --name zookeeper --network buc-kafka -e ALLOW_ANONYMOUS_LOGIN=yes -p 2181:2181 bitnami/zookeeper:latest

** start kafka
docker run -d --name kafka --network buc-kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e ALLOW_PLAINTEXT_LISTENER=yes -p 9092:9092 bitnami/kafka:latest

** create a topic "buc"
docker run --rm --network buc-kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 bitnami/kafka:latest kafka-topics.sh --create --topic buc --replication-factor 1 --partitions 1 --zookeeper zookeeper:2181

** list all topics
docker run --rm --network buc-kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 bitnami/kafka:latest kafka-topics.sh --list --zookeeper zookeeper:2181

** create publisher
docker run --rm --name kafka-publisher --interactive --network buc-kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 bitnami/kafka:latest kafka-console-producer.sh --topic buc --broker-list kafka:9092

** create consumer
docker run --rm --name kafka-consumer --network buc-kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 bitnami/kafka:latest kafka-console-consumer.sh --topic buc --from-beginning --bootstrap-server kafka:9092

** create wm-kafkapublisher
docker run -d --name wm-kafkapublisher --network buc-kafka -p 8081:8080 wm-kafkapublisher:latest

http://localhost:8080/publisher/messages
{
    "id": 2,
    "name": "HUGO"
}

curl --header "Content-Type: application/json" --request POST --data '{"id":"2","name":"ANIEL"}' http://10.27.252.110:80/publisher/messages

** create wm-kafkaconsumer
docker run -d --name wm-kafkaconsumer --network buc-kafka -p 8080:8080 wm-kafkaconsumer:latest

http://localhost:8081/consumer/messages
http://localhost:8081/consumer/messages/{id}

curl http://10.27.248.209:80/consumer/messages

-- Check it out on kubernetes

** bitnami
// create a topic "buc"
kubectl run -ti --rm --restart=Never --image=bitnami/kafka:latest createtopic -- kafka-topics.sh --create --topic buc --replication-factor 1 --partitions 1 --zookeeper zookeeper.default.svc.cluster.local:2181

// list all topics
kubectl run -it --rm --restart=Never --image=bitnami/kafka:latest listtopic -- kafka-topics.sh --list --zookeeper zookeeper.default.svc.cluster.local:2181

// create publisher
kubectl run -it --rm --restart=Never --image=bitnami/kafka:latest kafka-publisher -- kafka-console-producer.sh --topic buc --broker-list kafka.default.svc.cluster.local:9092

// create consumer
kubectl run -it --rm --restart=Never  --env=KAFKA_ZOOKEEPER_CONNECT=zookeeper.default.svc.cluster.local:2181 --image=bitnami/kafka:latest kafka-consumer -- kafka-console-consumer.sh --topic buc --from-beginning --bootstrap-server kafka.default.svc.cluster.local:9092


** confluentinc: with test-client
// create a topic "test"
kubectl -n wm-kafka exec kafka-test-client -- /usr/bin/kafka-topics --zookeeper kafka-zookeeper:2181 --topic test --create --partitions 1 --replication-factor 1

// list all topics
kubectl -n wm-kafka exec kafka-test-client -- /usr/bin/kafka-topics --zookeeper kafka-zookeeper:2181 --list

// create publisher
kubectl -n wm-kafka exec -ti kafka-test-client -- /usr/bin/kafka-console-producer --broker-list kafka:9092 --topic test

// create consumer
kubectl -n wm-kafka exec -ti kafka-test-client -- /usr/bin/kafka-console-consumer --bootstrap-server kafka:9092 --topic test --from-beginning

** confluentinc: with ad hoc pod
// create a topic "test"
kubectl run -ti --rm --restart=Never --image=confluentinc/cp-kafka:4.1.2-2 createtopic -- kafka-topics --create --topic test --replication-factor 1 --partitions 1 --zookeeper kafka-zookeeper.wm-kafka.svc.cluster.local:2181

// list all topics
kubectl run -it --rm --restart=Never --image=confluentinc/cp-kafka:4.1.2-2 listtopic -- kafka-topics --list --zookeeper kafka-zookeeper.wm-kafka.svc.cluster.local:2181

// create publisher
kubectl run -it --rm --restart=Never --image=confluentinc/cp-kafka:4.1.2-2 kafka-publisher -- kafka-console-producer --topic buc --broker-list kafka.wm-kafka.svc.cluster.local:9092

// create consumer
kubectl run -it --rm --restart=Never --image=confluentinc/cp-kafka:4.1.2-2 kafka-consumer -- kafka-console-consumer --topic buc --from-beginning --bootstrap-server kafka.wm-kafka.svc.cluster.local:9092

10. PubSub
----------
https://medium.com/quintoandar-tech-blog/creating-google-cloud-pub-sub-publishers-and-subscribers-with-spring-cloud-gcp-part-1-setup-a96c53025fec
https://github.com/spring-cloud/spring-cloud-gcp/tree/master/spring-cloud-gcp-samples/spring-cloud-gcp-pubsub-sample
https://cloud.google.com/blog/products/gcp/calling-java-developers-spring-cloud-gcp-1-0-is-now-generally-available
https://docs.spring.io/spring-cloud-gcp/docs/1.1.0.M1/reference/html/_spring_cloud_gcp_for_pub_sub.html
https://cloud.google.com/kubernetes-engine/docs/tutorials/authenticating-to-cloud-platform
https://cloud.google.com/pubsub/docs/reference/libraries#client-libraries-install-java


gcloud services enable pubsub.googleapis.com
gcloud pubsub topics create buc
gcloud pubsub subscriptions create buc-sub --topic buc --ack-deadline=60
gcloud pubsub topics list
gcloud pubsub subscriptions list
gcloud pubsub topics publish buc --message hello
gcloud pubsub topics publish buc --message goodbye
gcloud pubsub subscriptions pull --auto-ack --limit=2 buc-sub

curl http://10.27.250.17:80/pubSub/pull?subscription1=buc-sub