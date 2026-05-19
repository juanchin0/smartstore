from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='store',
            name='logo',
            field=models.URLField(blank=True, default='', max_length=600),
        ),
        migrations.AlterField(
            model_name='store',
            name='banner',
            field=models.URLField(blank=True, default='', max_length=600),
        ),
    ]
