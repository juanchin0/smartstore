#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py populate_fixtures
python manage.py create_admin
python manage.py populate_users
