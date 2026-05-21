#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py populate_fixtures
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').delete(); User.objects.create_superuser('admin', 'admin@smartstore.com', 'admin123')"
