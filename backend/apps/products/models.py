from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.stores.models import Store


class Product(models.Model):
    store = models.ForeignKey(
        Store, on_delete=models.CASCADE, related_name='products'
    )
    name = models.CharField(max_length=300)
    slug = models.SlugField(blank=True, max_length=320)
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    compare_price = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True,
        validators=[MinValueValidator(0)],
        help_text='Precio original antes del descuento'
    )
    image = models.URLField(max_length=1000, blank=True, null=True)
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    rating_count = models.PositiveIntegerField(default=0)
    semantic_tags = models.JSONField(
        default=list,
        help_text='Etiquetas semánticas generadas por inferencia ontológica'
    )
    ontology_class = models.CharField(
        max_length=300, blank=True, db_index=True,
        help_text='URI completa de la clase OWL: http://www.smartstore.org/ontology#Smartphone'
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('store', 'slug')
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        indexes = [
            models.Index(fields=['store', 'is_active'], name='product_store_active_idx'),
            models.Index(fields=['price'], name='product_price_idx'),
            models.Index(fields=['rating'], name='product_rating_idx'),
            models.Index(fields=['store', 'price'], name='product_store_price_idx'),
            models.Index(fields=['ontology_class', 'is_active'], name='product_ontology_active_idx'),
        ]

    def __str__(self):
        return f'[{self.store.name}] {self.name}'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(store=self.store, slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return round((1 - self.price / self.compare_price) * 100)
        return None
