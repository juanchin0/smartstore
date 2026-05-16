from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileModelTest(TestCase):
    def test_profile_created_with_user(self):
        user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=user, phone='5551234567', city='CDMX')
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.phone, '5551234567')
        self.assertEqual(profile.city, 'CDMX')

    def test_profile_deleted_with_user(self):
        user = User.objects.create_user(
            username='del@example.com',
            email='del@example.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=user)
        user_id = user.id
        user.delete()
        self.assertFalse(UserProfile.objects.filter(user_id=user_id).exists())
