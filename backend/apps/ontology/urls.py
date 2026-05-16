from django.urls import path
from . import views

urlpatterns = [
    path('suggestions/',     views.search_suggestions, name='ontology-suggestions'),
    path('classes/',         views.product_classes,    name='ontology-classes'),
    path('filters/',         views.dynamic_filters,    name='ontology-filters'),
    path('semantic-search/', views.semantic_search,    name='ontology-semantic-search'),
    path('infer/',           views.infer_tags,         name='ontology-infer'),
    path('reload/',          views.reload_ontology,    name='ontology-reload'),
]
