#!/bin/bash

#delete deployments
kubectl delete deployment wm-app
kubectl delete deployment wm-customer
kubectl delete deployment wm-customer-db


#delete services
kubectl delete service wm-app
kubectl delete service wm-customer
kubectl delete service wm-customer-db


#delete ingress
kubectl delete ingress wm-ingress
