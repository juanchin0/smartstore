"""
Management command: populate_fixtures
Crea datos de prueba para SmartStore: 10 tiendas y 100+ productos con imágenes.

Uso:
    python manage.py populate_fixtures          # añade si no existe
    python manage.py populate_fixtures --flush  # borra todo y recrea
"""
from django.core.management.base import BaseCommand
from apps.stores.models import Store
from apps.products.models import Product

SS = "http://www.smartstore.org/ontology#"

# Unsplash base + query string
_U = "https://images.unsplash.com/photo-"
_Q = "?auto=format&fit=crop&w=600&q=80"

def img(photo_id):
    return f"{_U}{photo_id}{_Q}"

# ── Stores ────────────────────────────────────────────────────────────────────

STORES = [
    {
        "name": "ElectroHogar",
        "description": "Tu tienda de electrónica de confianza. Smartphones, laptops, audio y más con los mejores precios y garantía oficial.",
        "categories": ["Electrónica", "Smartphones", "Laptops", "Audio"],
        "website": "https://electrohogar.mx",
    },
    {
        "name": "TechStore",
        "description": "Gadgets y tecnología de vanguardia. Encuentra los dispositivos más innovadores del mercado con asesoría especializada.",
        "categories": ["Gadgets", "Electrónica", "Accesorios"],
        "website": "https://techstore.mx",
    },
    {
        "name": "Deportes Martínez",
        "description": "Equipamiento deportivo premium para corredores y atletas. Zapatillas, ropa técnica y accesorios de las mejores marcas.",
        "categories": ["Running", "Ropa Deportiva", "Zapatillas"],
        "website": "https://deportesmart.mx",
    },
    {
        "name": "Moda Urbana",
        "description": "Moda contemporánea con las últimas tendencias. Ropa casual y formal para todos los estilos de vida.",
        "categories": ["Ropa", "Moda", "Casual"],
        "website": "https://modaurbana.mx",
    },
    {
        "name": "Farmacia Plus",
        "description": "Tu farmacia online de confianza. Medicamentos, vitaminas, suplementos y productos de salud con entrega a domicilio.",
        "categories": ["Medicamentos", "Vitaminas", "Salud", "Bienestar"],
        "website": "https://farmaciaplus.mx",
    },
    {
        "name": "Libros y Café",
        "description": "El paraíso de los lectores. Libros, revistas, papelería y el mejor café de especialidad para acompañar tu lectura.",
        "categories": ["Libros", "Papelería", "Revistas", "Café"],
        "website": "https://librosycafe.mx",
    },
    {
        "name": "Hogar Moderno",
        "description": "Muebles y decoración contemporánea para transformar tu hogar. Diseño escandinavo, minimalista y funcional.",
        "categories": ["Muebles", "Decoración", "Iluminación", "Cocina"],
        "website": "https://hogarmoderno.mx",
    },
    {
        "name": "Supermercado Del Barrio",
        "description": "Tu supermercado de confianza. Alimentos frescos, orgánicos y de despensa con los mejores precios del barrio.",
        "categories": ["Alimentos", "Orgánicos", "Bebidas", "Snacks"],
        "website": "https://supermercadodelbarrio.mx",
    },
    {
        "name": "Nike Store",
        "description": "La tienda oficial de Nike. Zapatillas de running, ropa deportiva y equipamiento para atletas de todos los niveles.",
        "categories": ["Running", "Zapatillas", "Ropa Nike", "Entrenamiento"],
        "website": "https://nikestore.mx",
    },
    {
        "name": "Apple Premium",
        "description": "Reseller autorizado Apple. iPhone, MacBook, iPad, Apple Watch y AirPods con garantía oficial y soporte técnico especializado.",
        "categories": ["iPhone", "MacBook", "iPad", "Apple Watch", "AirPods"],
        "website": "https://applepremium.mx",
    },
]

# ── Products ──────────────────────────────────────────────────────────────────
# Tuple: (name, price, compare_price|None, rating, rating_count,
#         ontology_class_local, semantic_tags, description, image_url)

PRODUCTS = {
    "ElectroHogar": [
        (
            "Samsung Galaxy S24 Ultra",
            18999, None, 4.8, 287, "Smartphone",
            ["Samsung", "Galaxy S24 Ultra", "Android", "6.8\"", "4000mAh", "200MP", "5G"],
            "Pantalla Dynamic AMOLED 2X de 6.8\", procesador Snapdragon 8 Gen 3, cámara de 200 MP y S Pen integrado.",
            img("1610945415295-d9bbf067e59c"),
        ),
        (
            "Apple iPhone 15 Pro Max",
            24999, 27999, 4.9, 512, "Smartphone",
            ["Apple", "iPhone 15 Pro Max", "iOS", "6.7\"", "4422mAh", "48MP", "5G"],
            "Diseño de titanio, chip A17 Pro, sistema de cámara profesional de 48 MP y pantalla Super Retina XDR 6.7\".",
            img("1510915228340-29c85a43dcfe"),
        ),
        (
            "Laptop Dell XPS 15 9530",
            28999, None, 4.7, 134, "Laptop",
            ["Dell", "Intel Core i7", "16GB RAM", "512GB SSD", "15.6\"", "NVIDIA RTX 4060"],
            "Portátil premium con pantalla OLED 3.5K, procesador Intel Core i7-13700H y gráficos NVIDIA GeForce RTX 4060.",
            img("1603302576837-37561b2e2302"),
        ),
        (
            "MacBook Pro M3 14\"",
            42999, 45999, 4.9, 203, "Laptop",
            ["Apple", "chip M3", "16GB RAM", "512GB SSD", "14\"", "GPU 30 núcleos"],
            "Potencia extrema con chip Apple M3, pantalla Liquid Retina XDR y hasta 22 horas de batería.",
            img("1517336714731-489689fd1ca8"),
        ),
        (
            "Sony WH-1000XM5",
            7499, 8999, 4.8, 456, "Headphones",
            ["Sony", "inalámbrico", "cancelación de ruido", "30h batería", "Bluetooth 5.2", "LDAC"],
            "Auriculares inalámbricos con la mejor cancelación activa de ruido del mercado y 30 horas de autonomía.",
            img("1505740420928-5e560c06d30e"),
        ),
        (
            "Samsung Galaxy Tab S9 FE",
            8999, None, 4.5, 89, "Tablet",
            ["Samsung", "Galaxy Tab S9 FE", "Android", "10.9\"", "S Pen incluido", "WiFi 6", "5G"],
            "Tablet con pantalla TFT de 10.9\", S Pen incluido, resistencia IP68 y conectividad 5G.",
            img("1544244015-0df4b3ffc6b0"),
        ),
        (
            "Apple iPad Pro M2 11\"",
            17999, 19999, 4.8, 178, "Tablet",
            ["Apple", "iPad Pro M2", "iPadOS", "11\"", "Face ID", "USB-C Thunderbolt", "WiFi 6E"],
            "El iPad más potente con chip M2, pantalla Liquid Retina ProMotion y conector USB-C Thunderbolt.",
            img("1589739900266-43b2843f4c12"),
        ),
    ],

    "TechStore": [
        (
            "Xiaomi Redmi Note 13 Pro",
            7499, None, 4.5, 231, "Smartphone",
            ["Xiaomi", "Redmi Note 13 Pro", "Android", "6.67\"", "5000mAh", "200MP", "5G"],
            "Smartphone con cámara de 200 MP, pantalla AMOLED 120Hz y carga rápida Turbo de 67W.",
            img("1580910051074-3eb694886505"),
        ),
        (
            "Google Pixel 8",
            16999, 19999, 4.6, 167, "Smartphone",
            ["Google", "Pixel 8", "Android", "6.2\"", "4575mAh", "50MP", "5G"],
            "Experiencia Android pura con chip Tensor G3, cámara computacional de 50 MP y 7 años de actualizaciones.",
            img("1598327105666-5b89351aff97"),
        ),
        (
            "ASUS VivoBook 15 X1502",
            13999, None, 4.4, 78, "Laptop",
            ["ASUS", "Intel Core i5", "8GB RAM", "512GB SSD", "15.6\"", "GPU Intel Iris Xe"],
            "Portátil versátil con procesador Intel Core i5-12500H, pantalla Full HD 60Hz y gran autonomía.",
            img("1588872657578-7efd1f1555ed"),
        ),
        (
            "ASUS ROG Zephyrus G14",
            34999, 38999, 4.8, 112, "Laptop",
            ["ASUS", "AMD Ryzen 9", "16GB RAM", "512GB SSD", "14\"", "RTX 4060"],
            "Laptop gaming ultradelgada con AMD Ryzen 9 7940HS, NVIDIA RTX 4060 y pantalla QHD 165Hz.",
            img("1593642632559-0c6d3fc62b89"),
        ),
        (
            "JBL Tune 760NC",
            2799, 3499, 4.5, 203, "Headphones",
            ["JBL", "inalámbrico", "cancelación de ruido", "50h batería", "Bluetooth 5.0", "Pure Bass"],
            "Auriculares inalámbricos con cancelación activa de ruido, sonido Pure Bass JBL y 50 horas de reproducción.",
            img("1484704849700-f032a568e944"),
        ),
        (
            "Samsung 55\" Neo QLED 4K QN85B",
            22999, None, 4.6, 94, "SmartTV",
            ["Samsung", "55 pulgadas", "Neo QLED", "4K", "HDR10+", "Tizen OS", "Object Tracking Sound"],
            "Televisor Neo QLED 4K con tecnología Mini LED, procesador Neo Quantum Lite y sonido envolvente.",
            img("1593359677879-a4bb92f4e78a"),
        ),
        (
            "Anker 735 Cargador GaN 65W",
            799, None, 4.5, 345, "Charger",
            ["Anker", "GaN II", "65W", "USB-C", "carga rápida", "3 puertos", "compacto"],
            "Cargador GaN II de 65W con 3 puertos (2×USB-C + 1×USB-A), compatible con laptops, tablets y móviles.",
            img("1558618666-fcd25c85cd64"),
        ),
    ],

    "Deportes Martínez": [
        (
            "Nike Air Zoom Pegasus 40",
            2999, None, 4.8, 389, "RunningShoe",
            ["Asfalto", "Moderada", "transpirable", "neutral", "Air Zoom"],
            "Zapatilla de running neutra con unidad de aire Zoom Air en el antepié y entresuela React para máximo retorno.",
            img("1542291026-7eec264c27ff"),
        ),
        (
            "Adidas Ultraboost 23",
            3499, 3999, 4.9, 512, "RunningShoe",
            ["Asfalto", "Máxima", "Boost", "alta amortiguación", "energético"],
            "La zapatilla de running definitiva con entresuela Boost de nueva generación y upper Primeknit+ ultra-adaptable.",
            img("1543508282-6319a3e2621f"),
        ),
        (
            "Salomon Speedcross 6",
            3299, None, 4.7, 234, "RunningShoe",
            ["Trail", "Moderada", "ligeras", "agarre extremo", "montaña"],
            "Zapatilla trail con suela Contagrip TD, chevrones profundos para máximo agarre en terreno blando y técnico.",
            img("1551107696-a4b0c5a0d9a2"),
        ),
        (
            "Asics Gel-Kayano 30",
            2799, 3299, 4.6, 189, "RunningShoe",
            ["Asfalto", "Máxima", "GEL", "estabilidad", "overpronación"],
            "Zapatilla de estabilidad con tecnología GEL y FF BLAST PLUS ECO para running de larga distancia en asfalto.",
            img("1606107557195-0e29a4b5b4aa"),
        ),
        (
            "New Balance Fresh Foam X 1080v13",
            3199, None, 4.7, 156, "RunningShoe",
            ["Asfalto", "Máxima", "Fresh Foam X", "larga distancia", "Hypoknit"],
            "Máximo acolchado con entresuela Fresh Foam X y upper Hypoknit ultrasuave, ideal para rodajes largos.",
            img("1539794830467-1f1755804d13"),
        ),
        (
            "Nike Dri-FIT Camiseta Running",
            799, None, 4.5, 267, "Sportswear",
            ["Dri-FIT", "transpirable", "running", "UV50+", "ajuste regular"],
            "Camiseta de running con tecnología Dri-FIT que aleja el sudor, protección UV50+ y diseño sin costuras laterales.",
            img("1576566588028-4147f3842f27"),
        ),
        (
            "Adidas Tiro 23 Track Pants",
            699, 899, 4.4, 145, "Sportswear",
            ["Aeroready", "entrenamiento", "poliéster reciclado", "bolsillos con cremallera"],
            "Pantalón de entrenamiento con tecnología AEROREADY, confeccionado con al menos 70% de materiales reciclados.",
            img("1591195853828-11db59a44f43"),
        ),
        (
            "Under Armour HeatGear Compression",
            899, None, 4.6, 178, "Sportswear",
            ["compresión", "HeatGear", "secado rápido", "gym", "anti-olor"],
            "Camiseta de compresión HeatGear que regula la temperatura corporal, elimina el sudor y combate los olores.",
            img("1517841905240-472988babdf9"),
        ),
    ],

    "Farmacia Plus": [
        (
            "Vitamina C 1000mg Redoxon (30 tabletas)",
            299, None, 4.7, 456, "VitaminProduct",
            ["Vitamina C", "1000mg", "inmunidad", "efervescente", "antioxidante"],
            "Vitamina C efervescente de 1000mg. Refuerza el sistema inmunológico y actúa como antioxidante.",
            img("1584308666744-24d5c474f2ae"),
        ),
        (
            "Omega 3 Fish Oil 1000mg (60 cápsulas)",
            399, 499, 4.8, 312, "VitaminProduct",
            ["Omega 3", "corazón", "cerebro", "EPA", "DHA", "triglicéridos"],
            "Aceite de pescado rico en EPA y DHA. Contribuye a la salud cardiovascular, cerebral y reduce triglicéridos.",
            img("1556909114-f6e7ad7d3136"),
        ),
        (
            "Multivitamínico Centrum Hombre A-Z",
            499, None, 4.6, 234, "VitaminProduct",
            ["multivitamínico", "Hombre", "A-Z", "energía", "23 nutrientes"],
            "Fórmula completa con 23 vitaminas y minerales adaptada a las necesidades del hombre.",
            img("1628771065518-0d82f1938462"),
        ),
        (
            "Ibuprofeno 400mg (20 tabletas)",
            89, None, 4.5, 789, "MedicineProduct",
            ["ibuprofeno", "dolor", "inflamación", "fiebre", "analgésico"],
            "Analgésico y antiinflamatorio. Indicado para dolor de cabeza, muscular, dental y fiebre.",
            img("1550572017-edd951b55104"),
        ),
        (
            "Paracetamol 500mg (20 tabletas)",
            69, None, 4.6, 912, "MedicineProduct",
            ["paracetamol", "dolor de cabeza", "fiebre", "genérico", "analgésico"],
            "Analgésico y antipirético de eficacia probada. Alivia el dolor leve a moderado y reduce la fiebre.",
            img("1587854692152-cbe660dbde88"),
        ),
        (
            "Protector Solar Neutrogena FPS50+ Facial",
            349, None, 4.7, 567, "MedicineProduct",
            ["SPF50", "protección solar", "UVA", "UVB", "cara", "sin grasa"],
            "Protector solar facial FPS50+. Protección amplio espectro UVA/UVB, textura ultraligera no comedogénica.",
            img("1576426863848-c21f53c60b19"),
        ),
        (
            "Termómetro Digital Beurer FT65",
            599, 699, 4.8, 145, "MedicineProduct",
            ["termómetro", "digital", "fiebre", "axilar", "10 segundos"],
            "Termómetro clínico digital con medición axilar en 10 segundos. Memoria del último registro.",
            img("1631217868264-e5b90bb7e133"),
        ),
        (
            "Tensiómetro de Muñeca Omron M2",
            1299, None, 4.7, 89, "MedicineProduct",
            ["tensiómetro", "presión arterial", "digital", "muñeca", "Omron"],
            "Monitor de presión arterial de muñeca con detección de arritmia. Memoria para 60 mediciones.",
            img("1584308666744-24d5c474f2ae"),
        ),
        (
            "Vitamina D3 2000 UI (90 cápsulas)",
            349, 399, 4.8, 234, "VitaminProduct",
            ["Vitamina D", "D3", "huesos", "calcio", "inmunidad", "2000 UI"],
            "Vitamina D3 en forma de colecalciferol. Esencial para la absorción del calcio y salud ósea.",
            img("1616671276441-2f2c277b8bf6"),
        ),
        (
            "Mascarilla KN95 5 capas (pack 10)",
            199, None, 4.5, 234, "MedicineProduct",
            ["KN95", "mascarilla", "protección", "pack 10", "5 capas", "FFP2"],
            "Mascarilla KN95 de 5 capas con filtración mayor al 95%. Certificación CE. Pack de 10 unidades.",
            img("1590330297626-d33690ab4a28"),
        ),
        (
            "Gel Antibacterial Purell Advanced 500ml",
            149, 189, 4.6, 456, "MedicineProduct",
            ["antibacterial", "gel", "manos", "70%", "alcohol", "Purell"],
            "Gel antibacterial con 70% alcohol etílico. Elimina el 99.9% de los gérmenes sin agua ni jabón.",
            img("1584308666744-24d5c474f2ae"),
        ),
        (
            "Colágeno Hidrolizado + Vitamina C (60 sobres)",
            699, 799, 4.7, 178, "VitaminProduct",
            ["colágeno", "hidrolizado", "Vitamina C", "piel", "articulaciones", "sobres"],
            "Colágeno hidrolizado tipo I y III con Vitamina C. Mejora la elasticidad de la piel y articulaciones.",
            img("1607619056574-7b8d3ee536b2"),
        ),
    ],

    "Libros y Café": [
        (
            "Cien Años de Soledad - García Márquez",
            299, None, 4.9, 1205, "BookProduct",
            ["novela", "literatura latinoamericana", "García Márquez", "clásico", "realismo mágico"],
            "La obra cumbre del realismo mágico latinoamericano. La saga de la familia Buendía en el mítico Macondo.",
            img("1481627834876-b7833e8f5570"),
        ),
        (
            "El Principito - Antoine de Saint-Exupéry",
            189, None, 4.9, 2341, "BookProduct",
            ["infantil", "filosofía", "ilustrado", "clásico", "poético"],
            "Un clásico universal ilustrado que habla del amor, la amistad y los valores esenciales.",
            img("1544947950-fa07a98d237f"),
        ),
        (
            "Hábitos Atómicos - James Clear",
            399, 459, 4.8, 876, "BookProduct",
            ["autoayuda", "productividad", "hábitos", "desarrollo personal", "motivación"],
            "La guía definitiva para construir buenos hábitos y eliminar los malos. Método comprobado.",
            img("1512820790803-83ca734da794"),
        ),
        (
            "El Señor de los Anillos: Trilogía Completa",
            899, None, 4.9, 543, "BookProduct",
            ["fantasía", "trilogía", "Tolkien", "épico", "Middle Earth"],
            "La trilogía completa de J.R.R. Tolkien en un solo volumen. La obra épica de la fantasía moderna.",
            img("1585297605020-5b76f83be519"),
        ),
        (
            "Sapiens: De animales a dioses - Harari",
            349, 399, 4.7, 654, "BookProduct",
            ["historia", "humanidad", "no ficción", "Harari", "evolución", "ensayo"],
            "Historia breve de la humanidad desde el Homo sapiens hasta la era digital.",
            img("1456513080510-7bf3a84b82f8"),
        ),
        (
            "La Sombra del Viento - Carlos Ruiz Zafón",
            349, None, 4.9, 789, "BookProduct",
            ["novela", "misterio", "Barcelona", "Zafón", "bestseller", "gótico"],
            "Barcelona, 1945. Un niño descubre un libro misterioso en una aventura de amor y misterio.",
            img("1524995997946-a1c2e315a42f"),
        ),
        (
            "Cuaderno Leuchtturm1917 A5 Punteado",
            399, None, 4.8, 312, "BookProduct",
            ["cuaderno", "papelería", "punteado", "bullet journal", "A5", "encuadernado"],
            "El cuaderno favorito del bullet journal. Páginas punteadas numeradas, índice y bolsillo trasero.",
            img("1531346878377-a5be20888e57"),
        ),
        (
            "Bolígrafos Stabilo Boss Fluorescente (pack 8)",
            249, 299, 4.6, 189, "BookProduct",
            ["marcador", "fluorescente", "subrayador", "colores", "papelería", "Stabilo"],
            "Pack de 8 marcadores fluorescentes Stabilo Boss. Punta biselada, colores vivos.",
            img("1589829545856-d10d557cf95f"),
        ),
        (
            "Café de Especialidad Colombia Huila 250g",
            299, None, 4.8, 156, "BookProduct",
            ["café", "especialidad", "molido", "Colombia", "arábica", "single origin"],
            "Café de origen único del Huila, Colombia. Notas a frutas rojas, caramelo y chocolate negro.",
            img("1447933601403-0c6688de566e"),
        ),
        (
            "Educated: Una Memoria - Tara Westover",
            329, None, 4.8, 423, "BookProduct",
            ["autobiografía", "superación", "educación", "no ficción", "bestseller"],
            "La extraordinaria historia de una mujer que creció sin ir a la escuela y llegó a doctorarse en Cambridge.",
            img("1507003211169-0a1dd7228f2d"),
        ),
        (
            "National Geographic Suscripción 3 meses",
            499, 599, 4.7, 234, "BookProduct",
            ["revista", "ciencia", "naturaleza", "fotografía", "mensual", "suscripción"],
            "3 meses de la mejor revista de ciencia y naturaleza del mundo con fotografías impresionantes.",
            img("1504711434969-e33886168f5c"),
        ),
        (
            "Plumas Estilográficas Staedtler Mars (pack 3)",
            349, None, 4.5, 134, "BookProduct",
            ["pluma", "estilográfica", "escritura", "papelería", "Staedtler", "tinta azul"],
            "Pack de 3 plumas estilográficas con cartucho de tinta azul. Escritura suave y precisa.",
            img("1583485088034-697b5bc54ccd"),
        ),
    ],

    "Hogar Moderno": [
        (
            "Sofá 3 Plazas Oslo Tela Gris Marengo",
            12999, 15999, 4.6, 134, "FurnitureProduct",
            ["sofá", "sala", "3 plazas", "gris", "tela", "moderno", "escandinavo"],
            "Sofá de diseño escandinavo con estructura de madera maciza y tapizado en tela de alta resistencia.",
            img("1555041469-a586c61ea9bc"),
        ),
        (
            "Mesa de Comedor Extensible 6-8 Puestos",
            8999, None, 4.5, 89, "FurnitureProduct",
            ["mesa", "comedor", "extensible", "madera", "minimalista", "6 puestos", "8 puestos"],
            "Mesa de comedor extensible de 140 a 180cm. Tablero de roble y patas de acero lacado blanco.",
            img("1565031491910-e57fac031c41"),
        ),
        (
            "Silla Ergonómica Devio Plus con Apoyabrazos",
            4999, 6999, 4.7, 267, "FurnitureProduct",
            ["silla", "ergonómica", "oficina", "lumbar", "ajustable", "home office", "mesh"],
            "Silla de oficina ergonómica con respaldo en malla transpirable y soporte lumbar ajustable.",
            img("1567538096630-e0c55bd6374c"),
        ),
        (
            "Lámpara de Pie LED Arco Dorado 165cm",
            2299, None, 4.6, 178, "HomeProduct",
            ["lámpara", "LED", "pie", "iluminación", "decoración", "dorado", "arco"],
            "Lámpara de pie estilo arco con acabado dorado mate. Cabezal articulable 360° con regulador.",
            img("1513506003901-1e6a35f3a6b7"),
        ),
        (
            "Estantería Flotante Set 3 Niveles Roble",
            1299, None, 4.5, 234, "HomeProduct",
            ["estantería", "flotante", "pared", "libros", "decoración", "madera", "roble"],
            "Set de 3 estantes flotantes de madera de roble. Soportan hasta 15kg cada uno.",
            img("1558618666-fcd25c85cd64"),
        ),
        (
            "Espejo Redondo 80cm Marco Dorado Bisel",
            1899, None, 4.7, 112, "HomeProduct",
            ["espejo", "redondo", "80cm", "dorado", "decoración", "pared", "bisel"],
            "Espejo circular con marco de metal dorado y acabado biselado. Colgado horizontal o vertical.",
            img("1562184552-997c461cb44d"),
        ),
        (
            "Alfombra Bereber Lana 160x230 Crema/Gris",
            3999, 4999, 4.6, 78, "HomeProduct",
            ["alfombra", "bereber", "sala", "crema", "natural", "boho", "lana", "handmade"],
            "Alfombra artesanal de lana 100% natural estilo bereber. Tejida a mano por artesanos marroquíes.",
            img("1600166898405-da9535204843"),
        ),
        (
            "Cortinas Blackout 2 Paneles 140x250 Gris",
            1499, None, 4.5, 189, "HomeProduct",
            ["cortinas", "blackout", "oscurecedor", "habitación", "gris", "140x250", "dormitorio"],
            "Cortinas opacas 100% blackout. Bloquean hasta el 99% de la luz. Tela de micropoliéster.",
            img("1589101869735-28b5f93a4c1b"),
        ),
        (
            "Organizador de Cajones Bambú 5 Piezas",
            699, 899, 4.7, 234, "KitchenProduct",
            ["organizador", "cajones", "bambú", "cocina", "utensilios", "5 piezas", "ecológico"],
            "Set de 5 organizadores de bambú para cajones de cocina. Sostenible y antibacteriano.",
            img("1616627056839-0b7b92ef0de7"),
        ),
        (
            "Lámpara Colgante Industrial Vintage E27",
            1599, None, 4.6, 145, "HomeProduct",
            ["lámpara", "colgante", "industrial", "vintage", "E27", "negro", "metal", "techo"],
            "Lámpara colgante estilo industrial con pantalla de metal negro mate. Cable textil 1.5m.",
            img("1507473885765-e6ed057f782c"),
        ),
        (
            "Set Cojines Nórdicos 45x45 Pack 4 (gris/beige)",
            799, 999, 4.4, 156, "HomeProduct",
            ["cojines", "nórdicos", "sala", "gris", "beige", "pack 4", "decorativos", "45x45"],
            "Pack de 4 cojines decorativos de algodón. Diseño nórdico en tonos neutros gris y beige.",
            img("1560769629-975ec94e6a86"),
        ),
        (
            "Escritorio Flotante Plegable 100x45 Blanco",
            2499, 2999, 4.7, 198, "FurnitureProduct",
            ["escritorio", "flotante", "plegable", "blanco", "home office", "pequeño espacio"],
            "Escritorio mural plegable de MDF lacado blanco. Ideal para espacios pequeños. Hasta 30kg.",
            img("1593062096033-9a26b09da705"),
        ),
    ],

    "Supermercado Del Barrio": [
        (
            "Aceite de Oliva Extra Virgen Carbonell 750ml",
            349, None, 4.8, 456, "OrganicFood",
            ["aceite oliva", "extra virgen", "EVOO", "cocina", "España", "frío primera presión"],
            "Aceite de oliva virgen extra 100% de primera presión en frío. Denominación de Origen Andalucía.",
            img("1474979266404-7eaacbcd87c5"),
        ),
        (
            "Avena Quáker Tradicional 500g (pack 3)",
            129, None, 4.7, 678, "HealthyFood",
            ["avena", "fibra", "desayuno", "integral", "beta-glucanos", "sin azúcar"],
            "Avena en hojuelas tradicional 100% integral. Rica en fibra beta-glucanos. Pack de 3.",
            img("1517673132405-a56a62b18caf"),
        ),
        (
            "Yogur Griego Natural Fage 0% 500g",
            179, None, 4.8, 345, "HealthyFood",
            ["yogur", "griego", "proteína", "natural", "sin azúcar", "Fage", "0%"],
            "Yogur griego auténtico con 0% grasa y alto contenido proteico. Sin azúcares añadidos.",
            img("1571019613454-1cb2f99b2d8b"),
        ),
        (
            "Miel Orgánica de Abeja 100% Pura 500g",
            289, None, 4.9, 178, "OrganicFood",
            ["miel", "orgánica", "pura", "natural", "sin aditivos", "certificado", "artesanal"],
            "Miel cruda orgánica sin procesar. Certificado USDA Organic. Recolectada libre de pesticidas.",
            img("1558642452-9d2a7deb7f62"),
        ),
        (
            "Granola Artesanal Frutos Rojos 400g",
            249, None, 4.7, 145, "HealthyFood",
            ["granola", "artesanal", "frutos rojos", "avena", "desayuno", "sin azúcar refinada"],
            "Granola horneada con avena, miel, almendras, arándanos y frambuesas. Sin azúcar refinada.",
            img("1484723091739-30986300bee4"),
        ),
        (
            "Proteína Whey Gold Standard 1kg Vainilla",
            1299, 1499, 4.8, 234, "HealthyFood",
            ["proteína", "whey", "músculo", "gym", "vainilla", "Gold Standard", "Optimum"],
            "Proteína de suero Optimum Nutrition. 24g de proteína por servicio, 5.5g de BCAA.",
            img("1593095948071-474c5cc2989d"),
        ),
        (
            "Café Nescafé Clásico Frasco 200g",
            249, 289, 4.5, 567, "FoodProduct",
            ["café", "instantáneo", "Nescafé", "200g", "negro", "clásico"],
            "Café instantáneo Nescafé Clásico elaborado con granos 100% café. Sabor equilibrado.",
            img("1541167760496-1628856ab772"),
        ),
        (
            "Jugo Natural Naranja 1L Sin Conservantes",
            89, None, 4.6, 456, "HealthyFood",
            ["jugo", "naranja", "natural", "vitamina C", "sin conservantes", "frío"],
            "Jugo de naranja 100% natural prensado en frío. Sin azúcar añadida, sin conservantes.",
            img("1621506289937-a8e4df240d0b"),
        ),
        (
            "Mix Premium Frutos Secos 500g",
            399, None, 4.7, 189, "HealthyFood",
            ["frutos secos", "almendras", "nueces", "castañas", "snack", "premium", "proteína"],
            "Mix de almendras, nueces, anacardos y pistaches. Sin sal añadida. Rico en proteínas.",
            img("1490885578174-acda8905c2c6"),
        ),
        (
            "Leche Entera Alpura 1L (pack 6 unidades)",
            199, None, 4.6, 234, "FoodProduct",
            ["leche", "entera", "calcio", "pack 6", "Alpura", "UHT"],
            "Leche entera UHT de larga vida. Fuente natural de calcio y proteínas. Pack económico.",
            img("1550583724-b2692b85b150"),
        ),
        (
            "Mantequilla de Almendras Orgánica 370g",
            349, None, 4.8, 145, "OrganicFood",
            ["mantequilla", "almendras", "orgánica", "sin azúcar", "proteína", "saludable"],
            "Mantequilla de almendras 100% orgánica. Solo almendras tostadas, sin aceites ni azúcar.",
            img("1600348759986-c5e78ce4fcd2"),
        ),
        (
            "Pasta Barilla Espagueti N°5 (pack 5 × 500g)",
            229, None, 4.7, 389, "FoodProduct",
            ["pasta", "espagueti", "Barilla", "italiana", "pack 5", "cocina"],
            "Pasta italiana Barilla elaborada con sémola de trigo duro. Textura perfecta al dente.",
            img("1551462147-ff29053bfc14"),
        ),
    ],

    "Nike Store": [
        (
            "Nike Air Force 1 Low '07 Blanco",
            2299, None, 4.8, 789, "RunningShoe",
            ["casual", "Asfalto", "Moderada", "Air Force", "blanco", "clásico", "lifestyle", "Unisex"],
            "El icónico Air Force 1 en blanco puro. Suela de goma con tecnología Air en el talón.",
            img("1600185365483-26d0a4ea9834"),
        ),
        (
            "Nike React Infinity Run FK 4",
            3499, 3999, 4.7, 345, "RunningShoe",
            ["Asfalto", "Máxima", "React", "largo", "neutral", "running", "anti-lesiones"],
            "Diseñada para reducir lesiones con entresuela React de alta amortiguación.",
            img("1542291026-7eec264c27ff"),
        ),
        (
            "Nike Air Max 270 Negro/Rojo",
            2999, 3499, 4.7, 567, "RunningShoe",
            ["Asfalto", "Máxima", "Air Max", "streetwear", "lifestyle", "casual", "270 Air"],
            "Zapatilla lifestyle con la unidad Air más grande de Nike (270°). Entresuela foam súper ligera.",
            img("1608231387042-66d1773d3028"),
        ),
        (
            "Nike Free Run 5.0 Next Nature",
            2499, None, 4.6, 234, "RunningShoe",
            ["Asfalto", "Moderada", "flexible", "natural", "libre", "minimalista", "Unisex"],
            "Movimiento natural con suela altamente flexible. Upper con al menos 20% de materiales reciclados.",
            img("1539586345478-14ece4e75e32"),
        ),
        (
            "Nike Pegasus 41 Shield Impermeable",
            3799, 4299, 4.8, 456, "RunningShoe",
            ["Asfalto", "Moderada", "Zoom Air", "impermeable", "lluvia", "todo tiempo", "Shield"],
            "Versión impermeable del Pegasus 41 con upper water-repellent Shield y doble Zoom Air.",
            img("1542291026-7eec264c27ff"),
        ),
        (
            "Nike Zoom Fly 6 Placa Carbono",
            3799, 4299, 4.8, 178, "RunningShoe",
            ["Asfalto", "Máxima", "placa de carbono", "velocidad", "carrera", "competición"],
            "Zapatilla de carrera con placa de fibra de carbono y entresuela ZoomX para alto rendimiento.",
            img("1551107696-a4b0c5a0d9a2"),
        ),
        (
            "Nike Court Vision Low Blanco/Negro",
            1899, None, 4.6, 456, "RunningShoe",
            ["casual", "Asfalto", "Ligera", "court", "baloncesto", "lifestyle", "Unisex"],
            "Inspirada en el básquet clásico. Upper de cuero sintético y suela vulcanizada atemporal.",
            img("1606107557195-0e29a4b5b4aa"),
        ),
        (
            "Nike Pro Tights 7/8 Mujer (negro)",
            1099, None, 4.7, 234, "Sportswear",
            ["Mujer", "compresión", "Pro", "entrenamiento", "Dri-FIT", "leggings", "gym"],
            "Mallas 7/8 de compresión con tecnología Dri-FIT. Cinturilla alta y bolsillo en la cintura.",
            img("1571731956672-f2b94d7dd0cb"),
        ),
        (
            "Nike Dri-FIT Camiseta Running Hombre",
            799, None, 4.6, 345, "Sportswear",
            ["Hombre", "Dri-FIT", "transpirable", "running", "entrenamiento", "sin costuras"],
            "Camiseta de running Dri-FIT que aleja el sudor. Sin costuras laterales para mayor comodidad.",
            img("1576566588028-4147f3842f27"),
        ),
        (
            "Nike Tempo Brief-Lined Short 5\" Hombre",
            899, 1099, 4.5, 189, "Sportswear",
            ["Hombre", "shorts", "running", "Dri-FIT", "5 pulgadas", "bolsillo", "forrado"],
            "Short de running con forro interior integrado y bolsillo trasero con cremallera Dri-FIT.",
            img("1483389127117-b6a2102724ae"),
        ),
        (
            "Nike Windrunner Chaqueta Cortaviento",
            1999, 2499, 4.7, 267, "Sportswear",
            ["Unisex", "chaqueta", "cortaviento", "running", "viento", "lluvia ligera", "capucha"],
            "Chaqueta cortaviento ultraligera con capucha plegable y tejido repelente al agua.",
            img("1551488831-00ddcb6c6bd3"),
        ),
        (
            "Nike Headband + Wristband Set (3 piezas)",
            399, None, 4.5, 234, "Sportswear",
            ["Unisex", "cintillo", "muñequera", "sudor", "gym", "entrenamiento", "algodón"],
            "Set de cintillo y 2 muñequeras Nike. Tejido absorbente de algodón y poliéster.",
            img("1517841905240-472988babdf9"),
        ),
    ],

    "Apple Premium": [
        (
            "iPhone 16 Pro Max 256GB Titanio Natural",
            31999, None, 4.9, 345, "Smartphone",
            ["Apple", "iPhone 16 Pro Max", "iOS", "6.9\"", "4685mAh", "48MP", "5G"],
            "La experiencia iPhone más avanzada. Chip A18 Pro, cámara Pro y pantalla Super Retina XDR 6.9\".",
            img("1695048133142-1a20484d2569"),
        ),
        (
            "iPhone 15 128GB Negro Medianoche",
            21999, 24999, 4.8, 567, "Smartphone",
            ["Apple", "iPhone 15", "iOS", "6.1\"", "3877mAh", "48MP", "5G"],
            "Diseño de aluminio con Dynamic Island, chip A16 Bionic y conector USB-C.",
            img("1510915228340-29c85a43dcfe"),
        ),
        (
            "MacBook Air M3 15\" Medianoche",
            28999, None, 4.9, 234, "Laptop",
            ["Apple", "chip M3", "16GB RAM", "256GB SSD", "15\"", "GPU 10 núcleos"],
            "El laptop más delgado de Apple. Chip M3, 18 horas de batería y pantalla Liquid Retina 15.3\".",
            img("1517336714731-489689fd1ca8"),
        ),
        (
            "MacBook Pro M4 Pro 14\" Negro Espacial",
            44999, 47999, 4.9, 123, "Laptop",
            ["Apple", "chip M4 Pro", "24GB RAM", "512GB SSD", "14\"", "GPU 20 núcleos"],
            "Potencia profesional con chip M4 Pro, pantalla Liquid Retina XDR ProMotion 120Hz.",
            img("1496181133206-80ce9b88a853"),
        ),
        (
            "iPad Air M2 11\" WiFi 128GB Azul",
            14999, None, 4.8, 289, "Tablet",
            ["Apple", "iPad Air M2", "iPadOS", "11\"", "Face ID", "WiFi 6E", "chip M2"],
            "Potente y versátil. Chip M2, pantalla Liquid Retina 11\", compatible con Apple Pencil Pro.",
            img("1544244015-0df4b3ffc6b0"),
        ),
        (
            "Apple Watch Series 10 45mm Aluminio GPS",
            8999, 9999, 4.8, 456, "ElectronicProduct",
            ["Apple", "watchOS", "salud", "GPS", "ECG", "oxígeno en sangre", "45mm", "wearable"],
            "El Apple Watch más avanzado. ECG, oxígeno en sangre, sensor de temperatura y detección de crash.",
            img("1546868871-7041f2a55e12"),
        ),
        (
            "AirPods Pro 2ª Generación MagSafe",
            5999, None, 4.9, 678, "Headphones",
            ["Apple", "AirPods Pro", "cancelación de ruido", "H2 chip", "MagSafe", "24h batería", "spatial audio"],
            "Audio adaptativo, cancelación activa de ruido 2× mejor y audio espacial personalizado.",
            img("1588423771073-b8903fbb85b5"),
        ),
        (
            "AirPods 4 (estándar) USB-C",
            3499, None, 4.7, 345, "Headphones",
            ["Apple", "AirPods 4", "H2 chip", "USB-C", "audio espacial", "18h batería"],
            "Nuevo diseño con chip H2. Audio espacial personalizado y estuche USB-C.",
            img("1670428685965-2e3e1e86d00e"),
        ),
        (
            "Apple TV 4K Wi-Fi 64GB (3ª generación)",
            3499, None, 4.7, 145, "SmartTV",
            ["Apple", "tvOS", "A15 Bionic", "4K", "HDR", "Dolby Vision", "streaming", "HomeKit"],
            "Streaming 4K HDR con chip A15 Bionic, Siri Remote y compatible con HomeKit.",
            img("1593642632559-0c6d3fc62b89"),
        ),
        (
            "Magic Keyboard con Touch ID Español",
            2299, None, 4.7, 234, "ElectronicProduct",
            ["Apple", "Magic Keyboard", "Touch ID", "inalámbrico", "Mac", "Bluetooth", "USB-C"],
            "Teclado inalámbrico recargable con Touch ID. Diseño compacto y silencioso para Mac.",
            img("1587829741301-dc798b83add3"),
        ),
        (
            "iPad Pro M4 11\" WiFi 256GB Plata",
            24999, 26999, 4.9, 198, "Tablet",
            ["Apple", "iPad Pro M4", "iPadOS", "11\"", "OLED tandem", "Face ID", "WiFi 7"],
            "Pantalla OLED tandem más avanzada. Chip M4 y diseño más delgado que nunca.",
            img("1589739900266-43b2843f4c12"),
        ),
        (
            "HomePod mini Medianoche",
            2499, None, 4.6, 167, "SmartTV",
            ["Apple", "HomePod mini", "Siri", "360 audio", "smart home", "HomeKit", "Thread"],
            "Altavoz inteligente con sonido 360° increíble. Centro de control del hogar con Siri.",
            img("1608043152269-423dbba4e7e1"),
        ),
    ],

    "Moda Urbana": [
        (
            "Levi's 501 Original Jeans",
            1299, None, 4.6, 312, "ClothingProduct",
            ["Unisex", "Masculino", "Algodón", "XL", "Azul", "denim", "clásico", "corte recto"],
            "El jean original desde 1873. Corte recto icónico y confeccionado en 100% algodón.",
            img("1542272604-787c3835535d"),
        ),
        (
            "Zara Pack 3 Camisetas Básicas",
            499, 699, 4.4, 234, "ClothingProduct",
            ["Unisex", "Blanco", "Algodón", "M", "cuello redondo", "básico", "pack"],
            "Pack de 3 camisetas de algodón orgánico certificado GOTS, ideales para el día a día.",
            img("1521572163474-6864f9cf17ab"),
        ),
        (
            "H&M Blazer Slim Fit",
            1899, None, 4.5, 89, "ClothingProduct",
            ["Hombre", "Negro", "Lana", "M", "formal", "slim fit", "office"],
            "Blazer de corte slim con mezcla de lana, hombreras suaves. Perfecto para business casual.",
            img("1594938298603-c8148c4a6f29"),
        ),
        (
            "Mango Vestido Midi Floral",
            1199, None, 4.7, 167, "ClothingProduct",
            ["Mujer", "Rosa", "Viscosa", "S", "floral", "midi", "verano", "elegante"],
            "Vestido midi con estampado floral, escote en V y cinturón incluido en viscosa.",
            img("1585487000160-6a2eff3d1580"),
        ),
        (
            "Pull&Bear Sudadera con Capucha",
            899, 1199, 4.3, 198, "ClothingProduct",
            ["Unisex", "Gris", "Algodón", "L", "oversized", "capucha", "casual"],
            "Sudadera oversize unisex con capucha, bolsillo canguro. 100% algodón de tacto suave.",
            img("1556821840-3a63f15732ce"),
        ),
        (
            "Stradivarius Minifalda Denim",
            599, None, 4.4, 145, "ClothingProduct",
            ["Mujer", "Azul", "denim", "S", "mini", "verano", "tiro alto", "tendencia"],
            "Minifalda de denim de tiro alto con cinturilla elástica y acabado desgastado.",
            img("1582897085656-c636d006a246"),
        ),
    ],
}


class Command(BaseCommand):
    help = "Crea tiendas y productos de prueba para SmartStore (con imágenes Unsplash)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Elimina todos los productos y tiendas antes de crear los fixtures",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            deleted_p, _ = Product.objects.all().delete()
            deleted_s, _ = Store.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(
                    f"  Eliminados {deleted_p} productos y {deleted_s} tiendas."
                )
            )

        stores_created = 0
        stores_updated = 0
        products_created = 0
        products_updated = 0

        for store_data in STORES:
            store, created = Store.objects.update_or_create(
                name=store_data["name"],
                defaults={
                    "description": store_data["description"],
                    "categories": store_data["categories"],
                    "website": store_data["website"],
                    "is_active": True,
                },
            )
            if created:
                stores_created += 1
                self.stdout.write(f"  + Tienda: {store.name} (slug={store.slug})")
            else:
                stores_updated += 1
                self.stdout.write(f"  ~ Tienda: {store.name} (actualizada)")

            for row in PRODUCTS.get(store_data["name"], []):
                name, price, compare_price, rating, rating_count, cls_local, tags, desc, image = row

                product, p_created = Product.objects.update_or_create(
                    store=store,
                    name=name,
                    defaults={
                        "description": desc,
                        "price": price,
                        "compare_price": compare_price,
                        "rating": rating,
                        "rating_count": rating_count,
                        "ontology_class": f"{SS}{cls_local}",
                        "semantic_tags": tags,
                        "image": image,
                        "is_active": True,
                    },
                )
                if p_created:
                    products_created += 1
                    self.stdout.write(f"      + {product.name}")
                else:
                    products_updated += 1
                    self.stdout.write(f"      ~ {product.name} (actualizado)")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nOK Tiendas: {stores_created} creadas, {stores_updated} actualizadas"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"OK Productos: {products_created} creados, {products_updated} actualizados"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Total en BD: {Store.objects.count()} tiendas, {Product.objects.count()} productos"
            )
        )
