from django.contrib import admin

try:
    from .models import UserProfile

    @admin.register(UserProfile)
    class UserProfileAdmin(admin.ModelAdmin):
        list_display = ('user', 'phone', 'city')
        raw_id_fields = ('user',)
except ImportError:
    pass
