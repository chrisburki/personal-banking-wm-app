#!/bin/bash

#delete deployments
kubectl delete deployment wm-app
kubectl delete deployment wm-customer

#delete services
kubectl delete service wm-app
kubectl delete service wm-customer
