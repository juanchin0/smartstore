import json
import re
import logging
from rdflib import Graph, Namespace, RDF, OWL, RDFS, URIRef
from django.conf import settings

logger = logging.getLogger(__name__)

SMARTSTORE = Namespace("http://www.smartstore.org/ontology#")

STOPWORDS_ES = {
    'de', 'la', 'el', 'en', 'con', 'para', 'por', 'un', 'una', 'los', 'las',
    'del', 'al', 'y', 'e', 'o', 'u', 'que', 'se', 'lo', 'le', 'a', 'su', 'sus',
    'es', 'son', 'muy', 'mas', 'más', 'poco', 'mucho', 'gran', 'grande',
    'pequeño', 'este', 'esta', 'estos', 'estas', 'mi', 'me', 'nos',
}

# ── Singleton a nivel de módulo ──────────────────────────────────────────────
_graph: Graph | None = None


def _get_graph() -> Graph:
    global _graph
    if _graph is None:
        g = Graph()
        g.parse(str(settings.ONTOLOGY_PATH), format='xml')
        _graph = g
        logger.info("Ontología cargada: %d triples", len(g))
    return _graph


def reload_graph() -> None:
    """Fuerza recarga del grafo (útil tras editar el OWL en desarrollo)."""
    global _graph
    _graph = None


# ── Servicio ─────────────────────────────────────────────────────────────────

class OntologyService:

    @property
    def graph(self) -> Graph:
        return _get_graph()

    # ─────────────────────────────────────────────────────────────────────────
    # MÉTODO PÚBLICO 1 — Clases de producto
    # ─────────────────────────────────────────────────────────────────────────

    def get_product_classes(self) -> list[dict]:
        """
        Retorna todas las clases que son subclase (directa o transitiva) de ss:Product.
        Incluye label, comment, local_name y clase padre inmediata.
        """
        query = """
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX ss: <http://www.smartstore.org/ontology#>

        SELECT DISTINCT ?class ?label ?comment ?parent WHERE {
            ?class a owl:Class .
            ?class rdfs:subClassOf+ ss:Product .
            OPTIONAL { ?class rdfs:label ?label FILTER(LANG(?label) = "es") }
            OPTIONAL { ?class rdfs:comment ?comment FILTER(LANG(?comment) = "es") }
            OPTIONAL {
                ?class rdfs:subClassOf ?parent .
                FILTER(?parent != owl:Thing)
            }
        }
        ORDER BY ?label
        """
        results = []
        for row in self.graph.query(query):
            uri = str(row['class'])
            parent_uri = str(row.parent) if row.parent else str(SMARTSTORE.Product)
            results.append({
                'uri': uri,
                'local_name': uri.split('#')[-1],
                'label': str(row.label) if row.label else uri.split('#')[-1],
                'comment': str(row.comment) if row.comment else '',
                'parent': parent_uri.split('#')[-1],
            })
        # Deduplicate (una clase puede tener varias subClassOf)
        seen = set()
        unique = []
        for r in results:
            if r['uri'] not in seen:
                seen.add(r['uri'])
                unique.append(r)
        return unique

    # ─────────────────────────────────────────────────────────────────────────
    # MÉTODO PÚBLICO 2 — Filtros dinámicos
    # GET /api/ontology/filters/?class=Smartphone
    # ─────────────────────────────────────────────────────────────────────────

    def get_dynamic_filters(self, ontology_class: str) -> dict:
        """
        Dado el nombre corto o URI completa de una clase OWL, retorna un dict
        con todas las propiedades filtrables heredadas de la jerarquía.

        Retorna:
        {
          "hasBrand":  {"label": "Marca", "type": "select", "values": ["Samsung", ...]},
          "hasColor":  {"label": "Color", "type": "select", "values": ["Negro", ...]},
          "hasScreenSize": {"label": "Tamaño de pantalla", "type": "range", "values": null},
          ...
        }
        """
        class_uri = self._resolve_uri(ontology_class)

        # Recorre jerarquía de clases para heredar filtros
        classes_to_check = [class_uri] + self._get_ancestor_classes(class_uri)

        filters: dict = {}
        for cls_uri in classes_to_check:
            sparql = f"""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ss: <http://www.smartstore.org/ontology#>

            SELECT DISTINCT ?prop ?label ?filterType ?filterValues WHERE {{
                ?prop rdfs:domain <{cls_uri}> ;
                      ss:isFilterable "true" .
                OPTIONAL {{ ?prop rdfs:label ?label FILTER(LANG(?label) = "es") }}
                OPTIONAL {{ ?prop ss:filterType ?filterType }}
                OPTIONAL {{ ?prop ss:filterValues ?filterValues }}
            }}
            """
            for row in self.graph.query(sparql):
                key = str(row.prop).split('#')[-1]
                if key not in filters:  # clase más específica tiene prioridad
                    raw_values = str(row.filterValues) if row.filterValues else None
                    parsed_values = None
                    if raw_values:
                        try:
                            parsed_values = json.loads(raw_values)
                        except (json.JSONDecodeError, ValueError):
                            parsed_values = [v.strip() for v in raw_values.split(',')]
                    filters[key] = {
                        "label": str(row.label) if row.label else key,
                        "type": str(row.filterType) if row.filterType else "text",
                        "values": parsed_values,
                    }
        return filters

    # ─────────────────────────────────────────────────────────────────────────
    # MÉTODO PÚBLICO 3 — Búsqueda semántica
    # POST /api/ontology/semantic-search/
    # ─────────────────────────────────────────────────────────────────────────

    def semantic_search(self, query_text: str, store_id: int | None = None) -> dict:
        """
        Búsqueda semántica en dos fases:

        Fase 1 (Ontología):
          - Tokeniza la query en términos significativos
          - Para cada token, busca clases OWL via rdfs:label y ss:synonym
          - Puntúa cada clase por número de tokens que la mencionan × semanticWeight
          - Identifica la clase más relevante y sus subclases

        Fase 2 (Base de datos):
          - Consulta productos con ontology_class == clases identificadas
          - Añade matches por nombre/descripción (fallback)
          - Retorna IDs, clase inferida y confianza

        Retorna:
        {
          "products": [<ids>],
          "inferred_class": "RunningShoe",
          "inferred_class_uri": "http://...#RunningShoe",
          "confidence": 0.85,
          "matched_tokens": ["zapatillas", "running", "ligeras"],
          "expanded_classes": ["RunningShoe", "SportswearProduct", ...]
        }
        """
        tokens = self._tokenize(query_text)
        if not tokens:
            return {
                "products": [], "inferred_class": None,
                "confidence": 0.0, "matched_tokens": [],
            }

        # ── Fase 1: Scoring de clases via SPARQL ────────────────────────────
        class_scores: dict[str, float] = {}

        for token in tokens:
            safe_token = token.replace('"', '\\"')
            sparql = f"""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX ss: <http://www.smartstore.org/ontology#>

            SELECT ?class ?weight WHERE {{
                ?class a owl:Class .
                {{
                    ?class rdfs:label ?lbl
                    FILTER(CONTAINS(LCASE(STR(?lbl)), LCASE("{safe_token}")))
                }} UNION {{
                    ?class ss:synonym ?syn
                    FILTER(CONTAINS(LCASE(STR(?syn)), LCASE("{safe_token}")))
                }}
                OPTIONAL {{ ?class ss:semanticWeight ?weight }}
            }}
            """
            for row in self.graph.query(sparql):
                uri = str(row['class'])
                weight = float(str(row.weight)) if row.weight else 1.0
                class_scores[uri] = class_scores.get(uri, 0) + weight

        # ── Fallback: búsqueda solo en DB si ontología no devuelve nada ─────
        if not class_scores:
            return self._fallback_text_search(tokens, store_id, query_text)

        # ── Clase con mayor score ────────────────────────────────────────────
        best_class = max(class_scores, key=class_scores.get)
        max_score = class_scores[best_class]
        confidence = round(min(max_score / len(tokens), 1.0), 2)

        # Expandir a subclases para ampliar búsqueda
        subclasses = self._get_subclasses(best_class)
        all_classes = [best_class] + subclasses

        # ── Fase 2: Consulta DB ──────────────────────────────────────────────
        from apps.products.models import Product
        from django.db.models import Q

        q = Q(ontology_class__in=all_classes)
        for token in tokens:
            q |= Q(name__icontains=token) | Q(description__icontains=token)

        qs = Product.objects.filter(q, is_active=True)
        if store_id:
            qs = qs.filter(store_id=store_id)

        product_ids = list(qs.values_list('id', flat=True)[:50])

        price_constraints = self._parse_price_constraints(query_text)

        return {
            "products": product_ids,
            "inferred_class": best_class.split('#')[-1],
            "inferred_class_uri": best_class,
            "confidence": confidence,
            "matched_tokens": tokens,
            "expanded_classes": [c.split('#')[-1] for c in all_classes],
            **price_constraints,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # MÉTODO PÚBLICO 4 — Inferencia de etiquetas
    # POST /api/ontology/infer/
    # ─────────────────────────────────────────────────────────────────────────

    def infer_tags(self, product_id: int) -> dict:
        """
        Dado un product_id, consulta las InferenceRule en la ontología y evalúa
        cada condición contra los atributos del producto en la DB.

        También genera tags de compatibilidad usando ss:compatibleWith.

        Retorna:
        {
          "tags": ["Muy valorado", "En oferta", "Compatible con Auriculares"],
          "confidence": [0.95, 0.99, 0.95],
          "rules_evaluated": 12,
          "rules_matched": 3
        }
        """
        from apps.products.models import Product
        try:
            product = Product.objects.select_related('store').get(id=product_id)
        except Product.DoesNotExist:
            return {"tags": [], "confidence": [], "rules_evaluated": 0, "rules_matched": 0}

        # ── Consultar todas las reglas de la ontología ───────────────────────
        rules_query = """
        PREFIX ss: <http://www.smartstore.org/ontology#>

        SELECT ?condition ?tag ?confidence ?targetClass WHERE {
            ?rule a ss:InferenceRule ;
                  ss:condition ?condition ;
                  ss:tag ?tag .
            OPTIONAL { ?rule ss:confidence ?confidence }
            OPTIONAL { ?rule ss:targetClass ?targetClass }
        }
        ORDER BY DESC(?confidence)
        """

        tags: list[str] = []
        confidences: list[float] = []
        rules_evaluated = 0
        rules_matched = 0

        product_class_uri = product.ontology_class or ''
        product_ancestors = (
            self._get_ancestor_classes(product_class_uri)
            if product_class_uri else []
        )
        all_product_classes = (
            {product_class_uri} | set(product_ancestors)
            if product_class_uri else set()
        )

        for row in self.graph.query(rules_query):
            condition = str(row.condition)
            tag = str(row.tag)
            confidence = float(str(row.confidence)) if row.confidence else 0.8
            target_class_uri = str(row.targetClass) if row.targetClass else None

            rules_evaluated += 1

            # ── Filtrar por clase objetivo ───────────────────────────────────
            if target_class_uri:
                # La regla aplica si la clase del producto coincide con targetClass
                # o si targetClass es un ancestro del producto
                if target_class_uri not in all_product_classes:
                    continue

            # ── Evaluar condición ────────────────────────────────────────────
            if self._evaluate_rule(condition, product):
                tags.append(tag)
                confidences.append(confidence)
                rules_matched += 1

        # ── Tags de compatibilidad via ss:compatibleWith ─────────────────────
        compat_tags = self._get_compatibility_tags(product)
        for ct in compat_tags:
            if ct["tag"] not in tags:
                tags.append(ct["tag"])
                confidences.append(ct["confidence"])

        return {
            "tags": tags,
            "confidence": confidences,
            "rules_evaluated": rules_evaluated,
            "rules_matched": rules_matched,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # HELPERS PRIVADOS
    # ─────────────────────────────────────────────────────────────────────────

    def _resolve_uri(self, class_name: str) -> str:
        """Convierte nombre corto a URI completa si es necesario."""
        if class_name.startswith('http'):
            return class_name
        return str(SMARTSTORE[class_name])

    def _tokenize(self, text: str) -> list[str]:
        """Tokeniza eliminando stopwords en español y tokens muy cortos."""
        text = text.lower().strip()
        text = re.sub(r'[^\w\sáéíóúüñ]', ' ', text)
        words = text.split()
        return [w for w in words if w not in STOPWORDS_ES and len(w) >= 3]

    def _get_ancestor_classes(self, class_uri: str) -> list[str]:
        """Recorre rdfs:subClassOf de forma recursiva hasta llegar a owl:Thing."""
        ancestors: list[str] = []
        visited: set[str] = set()
        queue: list[URIRef] = [URIRef(class_uri)]

        while queue:
            current = queue.pop(0)
            current_str = str(current)
            if current_str in visited:
                continue
            visited.add(current_str)

            for parent in self.graph.objects(current, RDFS.subClassOf):
                parent_str = str(parent)
                if parent_str != str(OWL.Thing) and parent_str not in visited:
                    ancestors.append(parent_str)
                    queue.append(URIRef(parent_str))

        return ancestors

    def _get_subclasses(self, class_uri: str) -> list[str]:
        """Devuelve todas las subclases directas e indirectas de una clase."""
        query = f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        SELECT ?sub WHERE {{
            ?sub a owl:Class .
            ?sub rdfs:subClassOf+ <{class_uri}> .
        }}
        """
        return [str(row.sub) for row in self.graph.query(query)]

    def _evaluate_rule(self, condition: str, product) -> bool:
        """
        Evalúa una condición textual contra un objeto Product.

        Formatos soportados:
        - "rating >= 4.5"          → comparación numérica de campo del modelo
        - "has_discount"           → product.compare_price > product.price
        - "has_tag:5G"             → "5G" en product.semantic_tags (lista JSON)
        - "ontology_class == http://...#Smartphone"  → comparación de string
        """
        condition = condition.strip()

        # Booleano especial: descuento
        if condition == 'has_discount':
            return bool(
                product.compare_price is not None
                and product.compare_price > product.price
            )

        # Tag semántico: has_tag:<valor>
        if condition.startswith('has_tag:'):
            tag_val = condition.split(':', 1)[1].strip()
            tags = product.semantic_tags or []
            return tag_val in tags

        # Comparación: campo operador valor
        match = re.match(r'(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)', condition)
        if not match:
            return False

        field, op, value_str = match.groups()
        value_str = value_str.strip().strip('"\'')
        field_value = getattr(product, field, None)

        if field_value is None:
            return False

        # Comparación de strings
        if isinstance(field_value, str):
            return {'==': field_value == value_str, '!=': field_value != value_str}.get(op, False)

        # Comparación numérica
        try:
            num_val = float(str(field_value))
            cmp_val = float(value_str)
            return {
                '>=': num_val >= cmp_val,
                '<=': num_val <= cmp_val,
                '>':  num_val >  cmp_val,
                '<':  num_val <  cmp_val,
                '==': num_val == cmp_val,
                '!=': num_val != cmp_val,
            }.get(op, False)
        except (ValueError, TypeError):
            return False

    def _get_compatibility_tags(self, product) -> list[dict]:
        """
        Consulta ss:compatibleWith en la ontología para la clase del producto.
        Retorna tags del tipo "Compatible con <label>".
        """
        if not product.ontology_class:
            return []

        query = f"""
        PREFIX ss: <http://www.smartstore.org/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT ?targetLabel ?confidence WHERE {{
            <{product.ontology_class}> ss:compatibleWith ?target .
            ?target rdfs:label ?targetLabel FILTER(LANG(?targetLabel) = "es") .
            OPTIONAL {{ <{product.ontology_class}> ss:compatibilityConfidence ?confidence }}
        }}
        """
        tags = []
        for row in self.graph.query(query):
            label = str(row.targetLabel)
            confidence = float(str(row.confidence)) if row.confidence else 0.85
            tags.append({"tag": f"Compatible con {label}", "confidence": confidence})
        return tags

    def _parse_price_constraints(self, query_text: str) -> dict:
        """Extract price_min / price_max from natural language price expressions."""
        text = query_text.lower()
        constraints: dict = {}

        max_patterns = [
            r'menos\s+de\s+(\d+(?:[.,]\d+)?)',
            r'm[áa]ximo\s+(\d+(?:[.,]\d+)?)',
            r'no\s+m[áa]s\s+de\s+(\d+(?:[.,]\d+)?)',
            r'hasta\s+(\d+(?:[.,]\d+)?)',
        ]
        min_patterns = [
            r'm[áa]s\s+de\s+(\d+(?:[.,]\d+)?)',
            r'm[íi]nimo\s+(\d+(?:[.,]\d+)?)',
            r'desde\s+(\d+(?:[.,]\d+)?)',
        ]
        range_pat = r'entre\s+(\d+(?:[.,]\d+)?)\s+y\s+(\d+(?:[.,]\d+)?)'

        m = re.search(range_pat, text)
        if m:
            constraints['price_min'] = float(m.group(1).replace(',', '.'))
            constraints['price_max'] = float(m.group(2).replace(',', '.'))
            return constraints

        for pat in max_patterns:
            m = re.search(pat, text)
            if m:
                constraints['price_max'] = float(m.group(1).replace(',', '.'))
                break

        for pat in min_patterns:
            m = re.search(pat, text)
            if m:
                constraints['price_min'] = float(m.group(1).replace(',', '.'))
                break

        if not constraints:
            if any(k in text for k in ('barato', 'económico', 'asequible', 'low cost')):
                constraints['price_max'] = 1000.0
            elif any(k in text for k in ('premium', 'lujo', 'lujoso', 'exclusivo')):
                constraints['price_min'] = 5000.0

        return constraints

    def _fallback_text_search(self, tokens: list[str], store_id: int | None, query_text: str = '') -> dict:
        """Búsqueda solo por texto en DB cuando la ontología no resuelve nada."""
        from apps.products.models import Product
        from django.db.models import Q

        q = Q()
        for token in tokens:
            q |= Q(name__icontains=token) | Q(description__icontains=token)

        qs = Product.objects.filter(q, is_active=True)
        if store_id:
            qs = qs.filter(store_id=store_id)

        price_constraints = self._parse_price_constraints(query_text) if query_text else {}

        return {
            "products": list(qs.values_list('id', flat=True)[:50]),
            "inferred_class": None,
            "inferred_class_uri": None,
            "confidence": 0.0,
            "matched_tokens": tokens,
            "expanded_classes": [],
            **price_constraints,
        }
