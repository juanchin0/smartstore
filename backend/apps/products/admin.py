from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'price', 'rating', 'ontology_class', 'is_active', 'created_at']
    list_filter = ['is_active', 'store', 'created_at']
    search_fields = ['name', 'description', 'ontology_class']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'discount_percent']
    list_select_related = ['store']
    fieldsets = (
        ('Información básica', {
            'fields': ('store', 'name', 'slug', 'description', 'image')
        }),
        ('Precios', {
            'fields': ('price', 'compare_price', 'discount_percent')
        }),
        ('Valoración', {
            'fields': ('rating', 'rating_count')
        }),
        ('Semántica (Ontología)', {
            'fields': ('ontology_class', 'semantic_tags'),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
