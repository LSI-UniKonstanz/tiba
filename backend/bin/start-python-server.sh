#!/bin/bash

cd /home/nicolai/tiba-uni-konstanz/backend
source env/bin/activate
cd public
python3 -m http.server 8080
