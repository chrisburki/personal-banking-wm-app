#!/bin/bash

#create cluster
gcloud config set project buc-personal-banking
gcloud config set compute/zone europe-west3-c
gcloud container clusters create personalbanking --machine-type=g1-small --disk-size=30GB --num-nodes=1
gcloud container clusters get-credentials personalbanking

#create deployments
kubectl create -f src/k8/ingress/wm-customer-db-deploy.yaml
kubectl create configmap hostname-config --from-literal=postgres_host=$(kubectl get svc wm-customer-db -o jsonpath="{.spec.clusterIP}")
kubectl create -f src/k8/ingress/wm-address-deploy-ingress.yaml
kubectl create -f src/k8/ingress/wm-customer-deploy-ingress.yaml
kubectl create -f src/k8/ingress/wm-app-deploy-ingress.yaml
kubectl create -f src/k8/ingress/ingress-std/wm-ingress.yaml




#delete deployments
kubectl delete -f src/k8/ingress/ingress-std/wm-ingress.yaml
kubectl delete -f src/k8/ingress/wm-app-deploy-ingress.yaml
kubectl delete -f src/k8/ingress/wm-customer-deploy-ingress.yaml
kubectl delete configmap hostname-config
kubectl delete -f src/k8/ingress/wm-address-deploy-ingress.yaml
kubectl delete -f src/k8/ingress/wm-customer-db-deploy.yaml

#delete configmap
kubectl delete configmap hostname-config
kubectl delete configmap postgres-config

#delete cluster
gcloud container clusters delete personalbanking

