from django.db import models
from django.utils.text import slugify
from django.core.validators import URLValidator


class Store(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, max_length=220)
    description = models.TextField(blank=True)
    logo = models.URLField(max_length=600, blank=True, default='')
    banner = models.URLField(max_length=600, blank=True, default='')
    categories = models.JSONField(
        default=list,
        help_text='Lista de nombres de categorías que maneja esta tienda'
    )
    website = models.URLField(blank=True, validators=[URLValidator()])
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Tienda'
        verbose_name_plural = 'Tiendas'
        indexes = [
            models.Index(fields=['name'], name='store_name_idx'),
            models.Index(fields=['is_active', 'name'], name='store_active_name_idx'),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Store.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
