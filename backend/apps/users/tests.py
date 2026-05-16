from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer

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

class RegisterSerializerTest(TestCase):
    def _valid_data(self, email='a@b.com'):
        return {
            'email': email,
            'password': 'Str0ngPass!',
            'password2': 'Str0ngPass!',
            'full_name': 'Ana García',
            'phone': '5551111111',
            'city': 'CDMX',
        }

    def test_valid_registration_creates_user_and_profile(self):
        s = RegisterSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)
        user = s.save()
        self.assertEqual(user.email, 'a@b.com')
        self.assertEqual(user.username, 'a@b.com')
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.city, 'CDMX')

    def test_duplicate_email_is_invalid(self):
        User.objects.create_user(username='a@b.com', email='a@b.com', password='x')
        s = RegisterSerializer(data=self._valid_data())
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_password_mismatch_is_invalid(self):
        data = self._valid_data()
        data['password2'] = 'different'
        s = RegisterSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('password', s.errors)

class UserSerializerTest(TestCase):
    def test_serializes_user_and_profile(self):
        user = User.objects.create_user(
            username='x@y.com', email='x@y.com',
            password='pass', first_name='Luis', last_name='López',
        )
        UserProfile.objects.create(user=user, phone='5552222222', city='GDL')
        data = UserSerializer(user).data
        self.assertEqual(data['email'], 'x@y.com')
        self.assertEqual(data['full_name'], 'Luis López')
        self.assertEqual(data['profile']['city'], 'GDL')

class AuthEndpointsTest(APITestCase):
    def _register(self, email='user@test.com', password='Str0ngPass!'):
        return self.client.post('/api/auth/register/', {
            'email': email, 'password': password, 'password2': password,
            'full_name': 'Test User', 'phone': '', 'city': '',
        }, format='json')

    def test_register_returns_tokens(self):
        res = self._register()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)

    def test_login_returns_tokens(self):
        self._register()
        res = self.client.post('/api/auth/login/', {
            'email': 'user@test.com', 'password': 'Str0ngPass!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_me_requires_auth(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_user_data(self):
        reg = self._register()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {reg.data["access"]}')
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'user@test.com')

    def test_profile_update(self):
        reg = self._register()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {reg.data["access"]}')
        res = self.client.put('/api/auth/profile/', {
            'full_name': 'Ana López', 'phone': '5551234567', 'city': 'GDL', 'address': '',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['full_name'], 'Ana López')
        self.assertEqual(res.data['profile']['city'], 'GDL')

    def test_logout_blacklists_token(self):
        reg = self._register()
        res = self.client.post('/api/auth/logout/', {
            'refresh': reg.data['refresh'],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
