from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('phone', 'city', 'address', 'avatar')


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'profile')

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=20, default='', allow_blank=True)
    city = serializers.CharField(max_length=100, default='', allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe una cuenta con este email.')
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        return attrs

    def save(self):
        data = self.validated_data
        parts = data.get('full_name', '').split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else ''
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        UserProfile.objects.create(
            user=user,
            phone=data.get('phone', ''),
            city=data.get('city', ''),
        )
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Email ya en uso.')
        return value.lower()

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError('No se proporcionaron campos para actualizar.')
        return attrs

    def save(self):
        user = self.context['request'].user
        data = self.validated_data
        if 'full_name' in data:
            parts = data['full_name'].split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        if 'email' in data:
            user.email = data['email']
            user.username = data['email']
        user.save()
        profile = user.profile
        for field in ('phone', 'city', 'address'):
            if field in data:
                setattr(profile, field, data[field])
        profile.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Accept 'email' in the request body; parent serializer uses username_field
    # to name the credential field and to pass it to authenticate().
    # By setting username_field = 'email', the field is named 'email' in the
    # request, but authenticate() is called with email=<value>.
    # Django's ModelBackend doesn't accept email kwarg, so we override validate
    # to remap the value to 'username' (which equals email in our User setup).
    username_field = 'email'

    def validate(self, attrs):
        # Parent reads attrs[self.username_field] = attrs['email'] and calls
        # authenticate(email=...) — Django's ModelBackend won't find the user.
        # Remap to 'username' which is the actual DB column / authenticate kwarg.
        credentials = {
            'username': attrs.get('email', ''),
            'password': attrs.get('password', ''),
        }
        from django.contrib.auth import authenticate
        self.user = authenticate(**credentials)
        if not self.user:
            from rest_framework import exceptions
            raise exceptions.AuthenticationFailed(
                self.error_messages['no_active_account'], 'no_active_account'
            )
        from rest_framework_simplejwt.tokens import RefreshToken as RT
        refresh = RT.for_user(self.user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
