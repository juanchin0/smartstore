from rest_framework import serializers


class SemanticSearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField(
        min_length=2, max_length=500,
        help_text='Texto de búsqueda en lenguaje natural'
    )
    store_id = serializers.IntegerField(
        required=False, allow_null=True,
        help_text='ID de tienda para limitar el scope (opcional)'
    )


class InferTagsRequestSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(
        min_value=1,
        help_text='ID del producto al que se le inferirán etiquetas'
    )
