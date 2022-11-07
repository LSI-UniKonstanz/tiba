#!/bin/bash

cd /home/nicolai/tiba-uni-konstanz/backend
source env/bin/activate
gunicorn backend.wsgi
