import uuid
from django.conf import settings
from django.db import models
from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelado'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'

    def __str__(self):
        return f'Order #{self.order_number} — {self.user.email}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            from django.db import IntegrityError as _IE
            for _ in range(10):
                try:
                    self.order_number = uuid.uuid4().hex[:8].upper()
                    super().save(*args, **kwargs)
                    return
                except _IE:
                    self.order_number = ''
            raise RuntimeError('Could not generate a unique order number after 10 attempts')
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items',
    )
    name = models.CharField(max_length=300)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Línea de orden'
        verbose_name_plural = 'Líneas de orden'

    def __str__(self):
        return f'{self.name} ×{self.quantity}'
