/* Galois Legacy · 10 mundos, 50 aventuras detalladas y 61 cartas culturales.
   El mundo 1 (Fuentes de Andalucía) reparte sus siete cartas por hitos: cada
   carta declara el hito que la concede ('m1-a1'...'m1-a5' para las aventuras y
   'm1-lardero' / 'm1-romeria' para los dos encargos opcionales) y lleva la
   fotografía real con su crédito y su enlace a la fuente. */
window.GALOIS_CAMPINA={
  "version": 2,
  "fuente": "Diseño original educativo; referencias culturales contrastadas",
  "mundos": [
    {
      "id": 1,
      "nombre": "La Forja de los Alarifes",
      "lugar": "Fuentes de Andalucía",
      "tema": "Naturales, potencias y raíces",
      "enemigos": [
        "potenciator",
        "radicosmico"
      ],
      "x": 12,
      "y": 28,
      "sinopsis": "La Fuente de la Reina se ha quedado seca: faltan una medida, un contrapeso y un plano de su conducción.",
      "paralelas": [3, 4],
      "sinEnemigo": [4],
      "nombres": { "radicosmico": "La Compuerta del Revés" },
      "aventuras": [
        {
          "id": "1-1",
          "etapa": 1,
          "nombre": "El patio de los azulejos",
          "objetivo": "Naturales, potencias y raíces",
          "tipo": "Exploración",
          "historia": "Inés te enseña la maqueta de Fuentes en el patio del instituto: la Fuente de la Reina está seca y faltan tres piezas de su conducción.",
          "reto": "Recoge los tres azulejos sueltos y ordena las piezas de la maqueta por su número.",
          "mecanica": "Recoger azulejos y colocar una pieza en la maqueta",
          "carta": "campina-1-1"
        },
        {
          "id": "1-2",
          "etapa": 2,
          "nombre": "La Forja de los Alarifes",
          "objetivo": "Naturales, potencias y raíces",
          "tipo": "Combate matemático",
          "historia": "En el taller, Alonso Ruiz Florindo necesita un paño cuadrado de 49 azulejos. Potenciator desplaza una hilera para que no cuadre.",
          "reto": "Completa el paño: 7 filas de 7, porque √49 = 7. Consigues el Marco de medida.",
          "mecanica": "Ajustar filas y columnas hasta obtener 7 por lado",
          "carta": "campina-1-2"
        },
        {
          "id": "1-3",
          "etapa": 3,
          "nombre": "La báscula del Silo",
          "objetivo": "Naturales, potencias y raíces",
          "tipo": "Construcción",
          "historia": "Lola del Silo apunta las pesadas una a una. Hasta que la báscula marque lo que debe, el contrapeso no sale del almacén.",
          "reto": "5 vagonetas de 12 sacos más las 8 entregas del patio: la báscula debe marcar 68. Consigues el Contrapeso.",
          "mecanica": "Contar por grupos y comprobar el subtotal antes de enviar",
          "carta": "campina-1-3"
        },
        {
          "id": "1-4",
          "etapa": 4,
          "nombre": "La Máscara del Reverso",
          "objetivo": "Naturales, potencias y raíces",
          "tipo": "Encuentro de Carnaval",
          "historia": "En la calle Carrera, una máscara de ropa vieja lleva el plano de la conducción cosido al forro. De su voz no te puedes fiar: hay que mirar cómo anda.",
          "reto": "Acompaña la copla con 3 grupos de 4 pulsos y reconoce a la máscara. Consigues el Plano de conducción.",
          "mecanica": "Identificar con dos pistas observables y seguir el ritmo",
          "carta": "campina-1-4"
        },
        {
          "id": "1-5",
          "etapa": 5,
          "nombre": "La Compuerta del Revés",
          "objetivo": "Naturales, potencias y raíces",
          "tipo": "Jefe",
          "historia": "Con las tres piezas colocadas, la compuerta de la Fuente de la Reina pide una medida, un peso y un camino.",
          "reto": "Entrada: 36 + 18 − 24 = 30. Tramo central: 4² = 16. Salida: √81 = 9.",
          "mecanica": "Tres ruedas: entrada, canal y salida, repetibles tras fallar",
          "carta": "campina-1-5"
        }
      ],
      "opcionales": [
        {
          "hito": "m1-lardero",
          "retoEtapa": 4,
          "nombre": "Las bandejas del horno",
          "historia": "Rosario, del horno, prepara los entornaos para la comida del Jueves Lardero.",
          "reto": "Reparte 24 entornaos en bandejas de 4.",
          "carta": "campina-1-6"
        },
        {
          "hito": "m1-romeria",
          "retoEtapa": 1,
          "nombre": "El camino de la ermita",
          "historia": "La comitiva acompaña a María Auxiliadora hasta su ermita, por el camino de la Campiña.",
          "reto": "Calcula los pasos del camino con potencias y raíces.",
          "carta": "campina-1-7"
        }
      ],
      "jefe": "radicosmico",
      "cartaLegendaria": "campina-1-5",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 2,
      "nombre": "Las Murallas de los Primos",
      "lugar": "Carmona",
      "tema": "Divisibilidad",
      "enemigos": [
        "multiplax",
        "primox"
      ],
      "x": 31,
      "y": 19,
      "sinopsis": "Cada puerta de las murallas se abre con múltiplos y números primos.",
      "aventuras": [
        {
          "id": "2-1",
          "etapa": 1,
          "nombre": "Los cuatro portones",
          "objetivo": "Divisibilidad",
          "tipo": "Exploración",
          "historia": "La Puerta de Sevilla solo permite entrar a grupos de tamaños divisibles.",
          "reto": "Decide si 135 es divisible entre 3, 5 y 9.",
          "mecanica": "Seleccionar portones correctos",
          "carta": "campina-2-1"
        },
        {
          "id": "2-2",
          "etapa": 2,
          "nombre": "El número intruso",
          "objetivo": "Divisibilidad",
          "tipo": "Combate matemático",
          "historia": "Múltiplax envía números intrusos por las murallas.",
          "reto": "Distingue 29 primo de 49 compuesto.",
          "mecanica": "Clasificar números bajo presión moderada",
          "carta": "campina-2-2"
        },
        {
          "id": "2-3",
          "etapa": 3,
          "nombre": "La llave de los primos",
          "objetivo": "Divisibilidad",
          "tipo": "Construcción",
          "historia": "Recompón las piedras de la muralla mediante factores primos.",
          "reto": "Descompón 84=2²·3·7.",
          "mecanica": "Colocar piedras-factores",
          "carta": "campina-2-3"
        },
        {
          "id": "2-4",
          "etapa": 4,
          "nombre": "La sala de factores",
          "objetivo": "Divisibilidad",
          "tipo": "Minijefe",
          "historia": "Dos guardias necesitan turnos compartidos para abrir la reja.",
          "reto": "Calcula MCD(18,24)=6.",
          "mecanica": "Sincronizar engranajes",
          "carta": "campina-2-4"
        },
        {
          "id": "2-5",
          "etapa": 5,
          "nombre": "El sello del mcm",
          "objetivo": "Divisibilidad",
          "tipo": "Jefe",
          "historia": "Prímox custodia el último sello del castillo.",
          "reto": "Calcula mcm(12,18)=36 y distingue máximo común divisor de mínimo común múltiplo.",
          "mecanica": "Combate con dos elecciones justificadas",
          "carta": "campina-2-5"
        }
      ],
      "jefe": "primox",
      "cartaLegendaria": "campina-2-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 3,
      "nombre": "Las Torres de los Signos",
      "lugar": "Écija",
      "tema": "Números enteros",
      "enemigos": [
        "negatron",
        "parentesis_maldito"
      ],
      "x": 51,
      "y": 30,
      "sinopsis": "Las torres ocultan un ascensor de números positivos y negativos.",
      "aventuras": [
        {
          "id": "3-1",
          "etapa": 1,
          "nombre": "Bajo cero en la torre",
          "objetivo": "Números enteros",
          "tipo": "Exploración",
          "historia": "Un ascensor mágico sube y baja por las torres ecijanas.",
          "reto": "Compara −7 y −3 en la recta numérica.",
          "mecanica": "Mover la ficha por plantas positivas y negativas",
          "carta": "campina-3-1"
        },
        {
          "id": "3-2",
          "etapa": 2,
          "nombre": "El ascensor de signos",
          "objetivo": "Números enteros",
          "tipo": "Combate matemático",
          "historia": "Negatrón cambia los signos de los pedidos del mercado.",
          "reto": "Resuelve +4−9=−5.",
          "mecanica": "Desactivar signos falsos",
          "carta": "campina-3-2"
        },
        {
          "id": "3-3",
          "etapa": 3,
          "nombre": "Deudas del mercado",
          "objetivo": "Números enteros",
          "tipo": "Construcción",
          "historia": "Recupera materiales sumando desplazamientos verticales.",
          "reto": "Calcula −8+13=5.",
          "mecanica": "Construir la escalera hasta la planta correcta",
          "carta": "campina-3-3"
        },
        {
          "id": "3-4",
          "etapa": 4,
          "nombre": "Los paréntesis del campanario",
          "objetivo": "Números enteros",
          "tipo": "Minijefe",
          "historia": "Los paréntesis del campanario alteran las operaciones.",
          "reto": "Calcula −2·(3−6)=6.",
          "mecanica": "Ordenar operaciones con signos",
          "carta": "campina-3-4"
        },
        {
          "id": "3-5",
          "etapa": 5,
          "nombre": "El combate del signo",
          "objetivo": "Números enteros",
          "tipo": "Jefe",
          "historia": "Paréntesis Maldito transforma el reloj de la torre en una trampa.",
          "reto": "Resuelve −(3−7)+(−2)²=8 explicando el orden.",
          "mecanica": "Batalla de tres movimientos: signos, paréntesis y potencias",
          "carta": "campina-3-5"
        }
      ],
      "jefe": "parentesis_maldito",
      "cartaLegendaria": "campina-3-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 4,
      "nombre": "El Olivar Fraccionado",
      "lugar": "Marchena",
      "tema": "Fracciones",
      "enemigos": [
        "denominadoron",
        "simplifract"
      ],
      "x": 72,
      "y": 20,
      "sinopsis": "Las cosechas y los mosaicos exigen repartir el todo en partes.",
      "aventuras": [
        {
          "id": "4-1",
          "etapa": 1,
          "nombre": "Cosecha por partes",
          "objetivo": "Fracciones",
          "tipo": "Exploración",
          "historia": "El olivar se ha dividido en parcelas desiguales.",
          "reto": "Representa 3/4 coloreando tres de cuatro partes equivalentes.",
          "mecanica": "Pintar el huerto fraccionado",
          "carta": "campina-4-1"
        },
        {
          "id": "4-2",
          "etapa": 2,
          "nombre": "Mosaicos equivalentes",
          "objetivo": "Fracciones",
          "tipo": "Combate matemático",
          "historia": "Denominadorón duplica las parcelas para despistar.",
          "reto": "Reconoce 6/8 = 3/4.",
          "mecanica": "Encontrar piezas equivalentes",
          "carta": "campina-4-2"
        },
        {
          "id": "4-3",
          "etapa": 3,
          "nombre": "El almacén compartido",
          "objetivo": "Fracciones",
          "tipo": "Construcción",
          "historia": "Reparte recipientes de aceite entre los vecinos de Marchena.",
          "reto": "Compara 2/3 y 3/5.",
          "mecanica": "Mover recipientes hasta ordenarlos",
          "carta": "campina-4-3"
        },
        {
          "id": "4-4",
          "etapa": 4,
          "nombre": "El aceite del olivar",
          "objetivo": "Fracciones",
          "tipo": "Minijefe",
          "historia": "Una almazara exige combinar cantidades exactas.",
          "reto": "Resuelve 1/3+1/6=1/2.",
          "mecanica": "Mezclar fracciones de aceite",
          "carta": "campina-4-4"
        },
        {
          "id": "4-5",
          "etapa": 5,
          "nombre": "El laberinto de fracciones",
          "objetivo": "Fracciones",
          "tipo": "Jefe",
          "historia": "Simplifract roba el libro de las cosechas.",
          "reto": "Calcula (3/4)·(8/9)=2/3 y simplifica.",
          "mecanica": "Combate de fracciones y explicación de equivalencias",
          "carta": "campina-4-5"
        }
      ],
      "jefe": "simplifract",
      "cartaLegendaria": "campina-4-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 5,
      "nombre": "El Balcón de las Escalas",
      "lugar": "Estepa",
      "tema": "Proporcionalidad",
      "enemigos": [
        "senor_escala",
        "porcentajin"
      ],
      "x": 88,
      "y": 34,
      "sinopsis": "Desde el castillo se reconstruyen planos y rutas a escala.",
      "aventuras": [
        {
          "id": "5-1",
          "etapa": 1,
          "nombre": "Los caminos de escala",
          "objetivo": "Proporcionalidad",
          "tipo": "Exploración",
          "historia": "Dibuja las rutas desde el Cerro de San Cristóbal.",
          "reto": "Si 3 cuadernos cuestan 6 €, ¿cuánto cuestan 5?",
          "mecanica": "Completar tabla de proporcionalidad",
          "carta": "campina-5-1"
        },
        {
          "id": "5-2",
          "etapa": 2,
          "nombre": "El plano del castillo",
          "objetivo": "Proporcionalidad",
          "tipo": "Combate matemático",
          "historia": "Señor Escala modifica el tamaño de los senderos.",
          "reto": "Calcula x en 4/6=x/18.",
          "mecanica": "Reconstruir un plano a escala",
          "carta": "campina-5-2"
        },
        {
          "id": "5-3",
          "etapa": 3,
          "nombre": "El mercado proporcional",
          "objetivo": "Proporcionalidad",
          "tipo": "Construcción",
          "historia": "La torre necesita un plano proporcional.",
          "reto": "En escala 1 cm : 5 km, interpreta 4 cm.",
          "mecanica": "Tender puentes en el mapa",
          "carta": "campina-5-3"
        },
        {
          "id": "5-4",
          "etapa": 4,
          "nombre": "La rebaja del mantecado",
          "objetivo": "Proporcionalidad",
          "tipo": "Minijefe",
          "historia": "Distribuye los mantecados entre dos grupos según su encargo.",
          "reto": "Reparte 30 unidades en proporción 2:3.",
          "mecanica": "Distribuir cajas y justificar",
          "carta": "campina-5-4"
        },
        {
          "id": "5-5",
          "etapa": 5,
          "nombre": "El arco del porcentaje",
          "objetivo": "Proporcionalidad",
          "tipo": "Jefe",
          "historia": "Porcentajín confunde las rebajas del mercado.",
          "reto": "Calcula el 25 % de 80 y el precio tras descontarlo.",
          "mecanica": "Detectar oferta engañosa y recuperar el sello",
          "carta": "campina-5-5"
        }
      ],
      "jefe": "porcentajin",
      "cartaLegendaria": "campina-5-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 6,
      "nombre": "Los Secretos de la Universidad",
      "lugar": "Osuna",
      "tema": "Álgebra",
      "enemigos": [
        "incognita_x",
        "polinomio_mutante"
      ],
      "x": 12,
      "y": 69,
      "sinopsis": "Inscripciones antiguas esconden expresiones algebraicas.",
      "aventuras": [
        {
          "id": "6-1",
          "etapa": 1,
          "nombre": "La x escondida",
          "objetivo": "Álgebra",
          "tipo": "Exploración",
          "historia": "La antigua Universidad de Osuna guarda pergaminos codificados.",
          "reto": "Traduce 'el doble de un número más tres' a 2n+3.",
          "mecanica": "Descifrar inscripciones",
          "carta": "campina-6-1"
        },
        {
          "id": "6-2",
          "etapa": 2,
          "nombre": "Los versos cifrados",
          "objetivo": "Álgebra",
          "tipo": "Combate matemático",
          "historia": "Incógnita X esconde el valor de un símbolo.",
          "reto": "Evalúa 2x+5 para x=4.",
          "mecanica": "Activar columnas con sustituciones",
          "carta": "campina-6-2"
        },
        {
          "id": "6-3",
          "etapa": 3,
          "nombre": "Términos semejantes",
          "objetivo": "Álgebra",
          "tipo": "Construcción",
          "historia": "Reordena las piedras de la cantera por familias de términos.",
          "reto": "Simplifica 3x+5x−2x=6x.",
          "mecanica": "Agrupar piezas semejantes",
          "carta": "campina-6-3"
        },
        {
          "id": "6-4",
          "etapa": 4,
          "nombre": "La cantera algebraica",
          "objetivo": "Álgebra",
          "tipo": "Minijefe",
          "historia": "Una puerta antigua se abre expandiendo expresiones.",
          "reto": "Desarrolla 2(x+4)=2x+8.",
          "mecanica": "Desplegar una estructura por duplicación",
          "carta": "campina-6-4"
        },
        {
          "id": "6-5",
          "etapa": 5,
          "nombre": "El sello polinómico",
          "objetivo": "Álgebra",
          "tipo": "Jefe",
          "historia": "Polinomio Mutante transforma los manuscritos.",
          "reto": "Simplifica 2x+3x−(x−4)=4x+4.",
          "mecanica": "Resolver una expresión y comprobarla",
          "carta": "campina-6-5"
        }
      ],
      "jefe": "polinomio_mutante",
      "cartaLegendaria": "campina-6-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 7,
      "nombre": "El Puente del Equilibrio",
      "lugar": "Triana (Sevilla)",
      "tema": "Ecuaciones",
      "enemigos": [
        "equilibrius",
        "despejador_oscuro"
      ],
      "x": 33,
      "y": 58,
      "sinopsis": "La balanza del viejo puente solo responde a ecuaciones equilibradas.",
      "aventuras": [
        {
          "id": "7-1",
          "etapa": 1,
          "nombre": "Las dos orillas",
          "objetivo": "Ecuaciones",
          "tipo": "Exploración",
          "historia": "Cruza Triana comprobando las igualdades de los accesos.",
          "reto": "Encuentra x en x+3=7.",
          "mecanica": "Equilibrar dos platillos",
          "carta": "campina-7-1"
        },
        {
          "id": "7-2",
          "etapa": 2,
          "nombre": "Balanza alfarera",
          "objetivo": "Ecuaciones",
          "tipo": "Combate matemático",
          "historia": "Equilibrius descompensa las pesas de una alfarería.",
          "reto": "Resuelve x−5=9.",
          "mecanica": "Aplicar la misma operación a ambos lados",
          "carta": "campina-7-2"
        },
        {
          "id": "7-3",
          "etapa": 3,
          "nombre": "El peso incógnito",
          "objetivo": "Ecuaciones",
          "tipo": "Construcción",
          "historia": "El puente necesita ajustar dos cables opuestos.",
          "reto": "Resuelve 3x+2=x+10.",
          "mecanica": "Mantener iguales ambos lados del puente",
          "carta": "campina-7-3"
        },
        {
          "id": "7-4",
          "etapa": 4,
          "nombre": "La ecuación del puente",
          "objetivo": "Ecuaciones",
          "tipo": "Minijefe",
          "historia": "Los maestros ceramistas plantean un encargo enigmático.",
          "reto": "Si el triple de una cantidad es 21, encuentra la cantidad.",
          "mecanica": "Traducir una historia en ecuación",
          "carta": "campina-7-4"
        },
        {
          "id": "7-5",
          "etapa": 5,
          "nombre": "El guardián del despeje",
          "objetivo": "Ecuaciones",
          "tipo": "Jefe",
          "historia": "Despejador Oscuro protege el último torno.",
          "reto": "Resuelve 2(x+3)=18 y comprueba x=6.",
          "mecanica": "Despeje, sustitución y revisión final",
          "carta": "campina-7-5"
        }
      ],
      "jefe": "despejador_oscuro",
      "cartaLegendaria": "campina-7-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 8,
      "nombre": "Los Molinos de las Funciones",
      "lugar": "Alcalá de Guadaíra",
      "tema": "Funciones",
      "enemigos": [
        "pendientor",
        "parabola_vortice"
      ],
      "x": 53,
      "y": 72,
      "sinopsis": "Las ruedas hidráulicas siguen el ritmo de las gráficas.",
      "aventuras": [
        {
          "id": "8-1",
          "etapa": 1,
          "nombre": "La rueda del molino",
          "objetivo": "Funciones",
          "tipo": "Exploración",
          "historia": "Señala los molinos en un plano de ejes cartesianos.",
          "reto": "Sitúa A(−2,3) en el cuadrante II.",
          "mecanica": "Caminar por una cuadrícula de coordenadas",
          "carta": "campina-8-1"
        },
        {
          "id": "8-2",
          "etapa": 2,
          "nombre": "Puntos del río",
          "objetivo": "Funciones",
          "tipo": "Combate matemático",
          "historia": "Pendientor altera las tablas de la corriente.",
          "reto": "Si y=2x+1, calcula y para x=3.",
          "mecanica": "Completar la tabla de caudales",
          "carta": "campina-8-2"
        },
        {
          "id": "8-3",
          "etapa": 3,
          "nombre": "La subida de la corriente",
          "objetivo": "Funciones",
          "tipo": "Construcción",
          "historia": "Reconstituye la gráfica del movimiento de una rueda.",
          "reto": "Comprueba que (0,1), (1,3) y (2,5) siguen y=2x+1.",
          "mecanica": "Trazar puntos sobre el río",
          "carta": "campina-8-3"
        },
        {
          "id": "8-4",
          "etapa": 4,
          "nombre": "La gráfica secreta",
          "objetivo": "Funciones",
          "tipo": "Minijefe",
          "historia": "La pendiente cambia el sentido del agua.",
          "reto": "Distingue crecimiento, decrecimiento y constancia en tres gráficas.",
          "mecanica": "Girar compuertas al leer gráficas",
          "carta": "campina-8-4"
        },
        {
          "id": "8-5",
          "etapa": 5,
          "nombre": "El desafío del cauce",
          "objetivo": "Funciones",
          "tipo": "Jefe",
          "historia": "Parábola Vórtice retuerce el cauce.",
          "reto": "Determina si (2,4) pertenece a y=x² y compara dos tablas.",
          "mecanica": "Batalla de puntos, tablas y representación",
          "carta": "campina-8-5"
        }
      ],
      "jefe": "parabola_vortice",
      "cartaLegendaria": "campina-8-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 9,
      "nombre": "El Anfiteatro de los Datos",
      "lugar": "Itálica (Santiponce)",
      "tema": "Estadística",
      "enemigos": [
        "mediana_traviesa",
        "grafico_tramposo"
      ],
      "x": 73,
      "y": 60,
      "sinopsis": "En el anfiteatro se investigan datos y gráficos engañosos.",
      "aventuras": [
        {
          "id": "9-1",
          "etapa": 1,
          "nombre": "El censo de Itálica",
          "objetivo": "Estadística",
          "tipo": "Exploración",
          "historia": "Los organizadores de Itálica necesitan ordenar datos de asistencia.",
          "reto": "Ordena 2,3,3,4,8 y reconoce el conjunto de datos.",
          "mecanica": "Recoger fichas de espectadores",
          "carta": "campina-9-1"
        },
        {
          "id": "9-2",
          "etapa": 2,
          "nombre": "La media de la arena",
          "objetivo": "Estadística",
          "tipo": "Combate matemático",
          "historia": "Mediana Traviesa cambia los datos para confundir.",
          "reto": "Calcula la media de 2,3,3,4,8: 4.",
          "mecanica": "Ajustar el marcador de la media",
          "carta": "campina-9-2"
        },
        {
          "id": "9-3",
          "etapa": 3,
          "nombre": "Los mosaicos de barras",
          "objetivo": "Estadística",
          "tipo": "Construcción",
          "historia": "Monta un mosaico que represente frecuencias.",
          "reto": "Representa [1,1,2,3,3,3] en un gráfico de barras.",
          "mecanica": "Completar una gráfica en el anfiteatro",
          "carta": "campina-9-3"
        },
        {
          "id": "9-4",
          "etapa": 4,
          "nombre": "El gráfico manipulado",
          "objetivo": "Estadística",
          "tipo": "Minijefe",
          "historia": "Un mensajero presenta un gráfico de escala truncada.",
          "reto": "Detecta cómo una escala que empieza en 95 exagera diferencias.",
          "mecanica": "Investigar ejes manipulados",
          "carta": "campina-9-4"
        },
        {
          "id": "9-5",
          "etapa": 5,
          "nombre": "El debate del anfiteatro",
          "objetivo": "Estadística",
          "tipo": "Jefe",
          "historia": "Gráfico Tramposo controla la votación del anfiteatro.",
          "reto": "Para [2,2,3,3,10], calcula media=4 y mediana=3.",
          "mecanica": "Argumentar con medidas y gráficos",
          "carta": "campina-9-5"
        }
      ],
      "jefe": "grafico_tramposo",
      "cartaLegendaria": "campina-9-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    },
    {
      "id": 10,
      "nombre": "Los Jardines de lo Posible",
      "lugar": "Sevilla",
      "tema": "Probabilidad",
      "enemigos": [
        "dado_caotico",
        "ruleta_imposible"
      ],
      "x": 87,
      "y": 79,
      "sinopsis": "El laberinto final se resuelve calculando posibilidades.",
      "aventuras": [
        {
          "id": "10-1",
          "etapa": 1,
          "nombre": "Dados de la muralla",
          "objetivo": "Probabilidad",
          "tipo": "Exploración",
          "historia": "En el Real Alcázar aparecen dados con rutas alternativas.",
          "reto": "Enumera el espacio muestral de un dado de seis caras.",
          "mecanica": "Elegir puertas del jardín",
          "carta": "campina-10-1"
        },
        {
          "id": "10-2",
          "etapa": 2,
          "nombre": "La urna de los sucesos",
          "objetivo": "Probabilidad",
          "tipo": "Combate matemático",
          "historia": "Dado Caótico inventa resultados imposibles.",
          "reto": "Clasifica obtener un 7 en un dado normal como imposible.",
          "mecanica": "Separar seguro, posible e imposible",
          "carta": "campina-10-2"
        },
        {
          "id": "10-3",
          "etapa": 3,
          "nombre": "Las rutas posibles",
          "objetivo": "Probabilidad",
          "tipo": "Construcción",
          "historia": "Los azulejos del patio deben dividirse por posibilidades.",
          "reto": "Calcula P(par)=3/6=1/2 en un dado equilibrado.",
          "mecanica": "Distribuir azulejos por casos favorables",
          "carta": "campina-10-3"
        },
        {
          "id": "10-4",
          "etapa": 4,
          "nombre": "El cálculo de casos",
          "objetivo": "Probabilidad",
          "tipo": "Minijefe",
          "historia": "Dos monedas marcan el itinerario del laberinto.",
          "reto": "Enumera los cuatro resultados de dos lanzamientos de moneda.",
          "mecanica": "Dibujar árbol de posibilidades",
          "carta": "campina-10-4"
        },
        {
          "id": "10-5",
          "etapa": 5,
          "nombre": "El laberinto del azar",
          "objetivo": "Probabilidad",
          "tipo": "Jefe",
          "historia": "Ruleta Imposible guarda el Compás de los Alarifes.",
          "reto": "En una bolsa con 3 rojas y 2 azules, calcula P(roja)=3/5.",
          "mecanica": "Combate final de sucesos y explicación",
          "carta": "campina-10-5"
        }
      ],
      "jefe": "ruleta_imposible",
      "cartaLegendaria": "campina-10-6",
      "jefeFases": [
        "Descubrir la regla matemática",
        "Resolver el desafío",
        "Explicar y transferir a otro problema"
      ]
    }
  ],
  "cartas": [
    {
      "id": "campina-1-1",
      "mundo": 1,
      "etapa": 1,
      "nombre": "Altaritos de San Juan",
      "categoria": "tradicion",
      "descripcion": "En la mañana de San Juan, los vecinos de Fuentes preparan pequeños altares con mantones, flores y agua.",
      "rareza": "comun",
      "color": "#c05c40",
      "hito": "m1-a1",
      "fotoPendiente": true,
      "fotoPrevista": "https://www.fiestasdeandalucia.com/provincia/sevilla/altaritos1%20002.jpg",
      "alt": "Altar fontaniego fotografiado durante la celebración de San Juan",
      "notaFoto": "El servidor de fiestasdeandalucia.com no responde: falta sustituir esta fotografía.",
      "credito": "Fiestas de Andalucía · Galería de los Altaritos",
      "enlace": "https://www.fiestasdeandalucia.com/provincia/sevilla/fuentes_altaritos_san_juan.htm",
      "familia": "Tradición",
      "sello": "✿",
      "crop": "50% 48%"
    },
    {
      "id": "campina-1-2",
      "mundo": 1,
      "etapa": 2,
      "nombre": "Virgen del Rosario",
      "categoria": "devocion",
      "descripcion": "Fuentes celebra sus fiestas patronales en honor a San Sebastián y la Virgen del Rosario. La imagen de la patrona salió en procesión desde la parroquia de Santa María la Blanca.",
      "rareza": "comun",
      "color": "#a54a6a",
      "hito": "m1-a2",
      "foto": "https://www.artesacro.org/imagenes/Virgen_del_Rosario._2023._Fuentes_de_Andalucia__12___Copiar_.JPG",
      "alt": "Talla de Nuestra Señora del Rosario de Fuentes de Andalucía durante la procesión de 2023",
      "credito": "Manuel Pinto Montero · ArteSacro, 2023",
      "enlace": "https://www.artesacro.org/Noticia/Ver/152719/provincia-nuestra-senora-rosario-procesiono-fuentes-andalucia",
      "familia": "Estampa",
      "sello": "✧",
      "crop": "50% 45%"
    },
    {
      "id": "campina-1-3",
      "mundo": 1,
      "etapa": 3,
      "nombre": "Castillo de la Monclova",
      "categoria": "patrimonio",
      "descripcion": "Uno de los castillos del municipio, levantado en la campiña, fuera del casco urbano de Fuentes de Andalucía. Desde la azotea del Silo se distingue en el horizonte.",
      "rareza": "rara",
      "color": "#326bbc",
      "hito": "m1-a3",
      "foto": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Castillo_de_la_Monclova.jpg",
      "alt": "Castillo de la Monclova en el término municipal de Fuentes de Andalucía",
      "credito": "MONTAIGNE1961 · Wikimedia Commons · CC BY-SA 4.0",
      "enlace": "https://commons.wikimedia.org/wiki/File:Castillo_de_la_Monclova.jpg",
      "licencia": "https://creativecommons.org/licenses/by-sa/4.0/",
      "nota": "Encuadre adaptado al formato de carta.",
      "familia": "Patrimonio",
      "sello": "▦",
      "crop": "50% 52%"
    },
    {
      "id": "campina-1-4",
      "mundo": 1,
      "etapa": 4,
      "nombre": "La Carrera en Carnaval",
      "categoria": "tradicion",
      "descripcion": "La calle Carrera es el escenario del mascareo. Los disfraces de ropa vieja, las voces en falsete y las coplas llenan la calle.",
      "rareza": "rara",
      "color": "#b75c42",
      "hito": "m1-a4",
      "foto": "https://static.grupojoly.com/clip/51c72f29-0b00-4976-8004-65d6ed85599b_source-aspect-ratio_1600w_0.jpg",
      "alt": "Participantes disfrazados en el Carnaval de Fuentes de Andalucía",
      "credito": "Diario de Sevilla · Historia del Carnaval de Fuentes de Andalucía",
      "enlace": "https://www.diariodesevilla.es/vivirensevilla/historia-carnaval-fuentes-andalucia-entornao-mascaras_0_1877213559.html",
      "familia": "Carnaval",
      "sello": "✦",
      "crop": "50% 52%"
    },
    {
      "id": "campina-1-5",
      "mundo": 1,
      "etapa": 5,
      "nombre": "Fuente de la Reina",
      "categoria": "patrimonio",
      "descripcion": "Las conducciones de la fuente recoían agua del cerro. El abrevadero forma parte del conjunto que se conserva a las afueras del pueblo.",
      "rareza": "legendaria",
      "color": "#326bbc",
      "hito": "m1-a5",
      "foto": "https://saposyprincesas.elmundo.es/assets/2016/01/fveramarquez02.jpg",
      "alt": "Fotografía de la Fuente de la Reina a las afueras de Fuentes de Andalucía",
      "credito": "Sapos y Princesas · Ruta de la Fuente de la Reina",
      "enlace": "https://saposyprincesas.elmundo.es/actividades-ninos/sevilla/aire-libre/rutas-y-excursiones/ruta-hasta-la-fuente-de-la-reina",
      "familia": "Patrimonio",
      "sello": "♦",
      "crop": "50% 52%"
    },
    {
      "id": "campina-1-6",
      "mundo": 1,
      "etapa": 6,
      "nombre": "Jueves Lardero",
      "categoria": "tradicion",
      "descripcion": "La comida en el campo abre el Carnaval fontaniego. Esta fotografía recoge la celebración en el parque del Molino de Viento.",
      "rareza": "epica",
      "color": "#a06c32",
      "hito": "m1-lardero",
      "opcional": true,
      "foto": "https://cdn.prod.website-files.com/5fe8e2ec808b3e9668f79c63/67c08b83dddf36c7beb88886_IMG_9208.JPG",
      "alt": "Comida compartida al aire libre durante el Jueves Lardero fontaniego",
      "credito": "Fuentes de Información · «Lardero en su esplendor»",
      "enlace": "https://www.fuentesdeinformacion.es/articulos/lardero-en-su-esplendor",
      "familia": "Tradición",
      "sello": "☀",
      "crop": "57% 60%"
    },
    {
      "id": "campina-1-7",
      "mundo": 1,
      "etapa": 7,
      "nombre": "Romería de María Auxiliadora",
      "categoria": "devocion",
      "descripcion": "La comitiva acompaña a María Auxiliadora hasta su ermita. Su talla sedente es obra de Juan Abascal Fuentes.",
      "rareza": "epica",
      "color": "#596ca4",
      "hito": "m1-romeria",
      "opcional": true,
      "foto": "https://www.artesacro.org/imagenes/Maria_Auxiliadora._2022._Fuentes_de_Andalucia__11___Copiar_.JPG",
      "alt": "Imagen de María Auxiliadora en su carreta durante la romería de Fuentes de Andalucía",
      "credito": "Manuel Pinto Montero · ArteSacro, 2022",
      "enlace": "https://www.artesacro.org/Noticia/Ver/145573/provincia-fuentes-andalucia-se-rinde-ante-maria-auxiliadora",
      "familia": "Romería",
      "sello": "✵",
      "crop": "50% 48%"
    },
    {
      "id": "campina-2-1",
      "mundo": 2,
      "etapa": 1,
      "nombre": "Puerta de Sevilla",
      "categoria": "patrimonio",
      "descripcion": "Puerta fortificada de origen romano, reformada en época islámica y cristiana. Es uno de los símbolos de Carmona y la entrada histórica desde el camino de Sevilla.",
      "rareza": "comun",
      "color": "#c485d8"
    },
    {
      "id": "campina-2-2",
      "mundo": 2,
      "etapa": 2,
      "nombre": "Murallas de Carmona",
      "categoria": "patrimonio",
      "descripcion": "Recinto defensivo que protegió la ciudad desde la Antigüedad. Se conservan tramos de muralla y varias puertas monumentales.",
      "rareza": "comun",
      "color": "#c485d8"
    },
    {
      "id": "campina-2-3",
      "mundo": 2,
      "etapa": 3,
      "nombre": "Puerta de Córdoba",
      "categoria": "patrimonio",
      "descripcion": "Puerta de origen romano, reformada en la Edad Moderna con aspecto clásico. Se abría al camino que llevaba hacia Córdoba.",
      "rareza": "rara",
      "color": "#c485d8"
    },
    {
      "id": "campina-2-4",
      "mundo": 2,
      "etapa": 4,
      "nombre": "Necrópolis romana",
      "categoria": "historia",
      "descripcion": "Cementerio de época romana con tumbas excavadas en la roca, como la Tumba de Servilia o la del Elefante. Es uno de los conjuntos arqueológicos más importantes de Andalucía.",
      "rareza": "rara",
      "color": "#c485d8"
    },
    {
      "id": "campina-2-5",
      "mundo": 2,
      "etapa": 5,
      "nombre": "Sergio Ramos",
      "categoria": "futbol",
      "descripcion": "Futbolista nacido en Camas en 1986 que debutó en el Sevilla FC. Fue campeón del mundo con la selección española en 2010.",
      "rareza": "epica",
      "color": "#c485d8"
    },
    {
      "id": "campina-2-6",
      "mundo": 2,
      "etapa": 6,
      "nombre": "Alcázar de la Puerta de Sevilla",
      "categoria": "patrimonio",
      "descripcion": "Fortaleza levantada sobre la Puerta de Sevilla de Carmona. Desde su torre se domina la vega y los caminos que llegaban a la ciudad.",
      "rareza": "legendaria",
      "color": "#c485d8"
    },
    {
      "id": "campina-3-1",
      "mundo": 3,
      "etapa": 1,
      "nombre": "Torre de San Juan",
      "categoria": "patrimonio",
      "descripcion": "Campanario barroco del siglo XVIII, decorado con azulejos de colores. Es una de las torres más admiradas del horizonte de Écija.",
      "rareza": "comun",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-3-2",
      "mundo": 3,
      "etapa": 2,
      "nombre": "Torre de Santa Cruz",
      "categoria": "patrimonio",
      "descripcion": "Torre de la iglesia de Santa Cruz, parte de la ruta de las torres ecijanas. Sus campanas y remates forman parte del perfil barroco de la ciudad.",
      "rareza": "comun",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-3-3",
      "mundo": 3,
      "etapa": 3,
      "nombre": "Plaza de España de Écija",
      "categoria": "patrimonio",
      "descripcion": "Plaza mayor de Écija, conocida popularmente como «el Salón». Es el centro de la vida de la ciudad y bajo ella se han hallado restos de su pasado.",
      "rareza": "rara",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-3-4",
      "mundo": 3,
      "etapa": 4,
      "nombre": "Mosaicos de Astigi",
      "categoria": "historia",
      "descripcion": "En época romana Écija se llamaba Astigi y fue una ciudad muy importante de la Bética. Muchos de sus mosaicos se exponen en el museo histórico de la ciudad.",
      "rareza": "rara",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-3-5",
      "mundo": 3,
      "etapa": 5,
      "nombre": "José Antonio Reyes",
      "categoria": "futbol",
      "descripcion": "Futbolista nacido en Utrera en 1983 que debutó muy joven en el Sevilla FC y jugó en clubes como el Arsenal. Ganó varias competiciones europeas con el Sevilla; falleció en 2019.",
      "rareza": "epica",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-3-6",
      "mundo": 3,
      "etapa": 6,
      "nombre": "Ruta de las once torres",
      "categoria": "tradicion",
      "descripcion": "Itinerario por los campanarios barrocos que dan a Écija el nombre de «ciudad de las torres». Recorrerlo es mirar la ciudad hacia arriba.",
      "rareza": "legendaria",
      "color": "#4ba6b5"
    },
    {
      "id": "campina-4-1",
      "mundo": 4,
      "etapa": 1,
      "nombre": "Puerta de Sevilla de Marchena",
      "categoria": "patrimonio",
      "descripcion": "Puerta de la antigua muralla de Marchena, también conocida como Arco de la Rosa. Da paso al casco histórico de la villa.",
      "rareza": "comun",
      "color": "#89a75b"
    },
    {
      "id": "campina-4-2",
      "mundo": 4,
      "etapa": 2,
      "nombre": "Murallas de Marchena",
      "categoria": "patrimonio",
      "descripcion": "Restos del recinto amurallado medieval que protegía Marchena. Sus tramos y puertas recuerdan la importancia de la villa en la campiña.",
      "rareza": "comun",
      "color": "#89a75b"
    },
    {
      "id": "campina-4-3",
      "mundo": 4,
      "etapa": 3,
      "nombre": "Olivos de la Campiña",
      "categoria": "campina",
      "descripcion": "El olivar ocupa buena parte de la campiña sevillana. De la aceituna se obtienen aceite y aceituna de mesa, de la que la provincia de Sevilla es gran productora.",
      "rareza": "rara",
      "color": "#89a75b"
    },
    {
      "id": "campina-4-4",
      "mundo": 4,
      "etapa": 4,
      "nombre": "Almazara tradicional",
      "categoria": "tradicion",
      "descripcion": "En la almazara se lava, muele y prensa la aceituna para obtener el aceite de oliva. Antes se usaban molinos de piedra y prensas de viga; hoy, máquinas modernas.",
      "rareza": "rara",
      "color": "#89a75b"
    },
    {
      "id": "campina-4-5",
      "mundo": 4,
      "etapa": 5,
      "nombre": "Azulejo de la cosecha",
      "categoria": "tradicion",
      "descripcion": "Pieza inventada para el juego, inspirada en los azulejos andaluces. Representa la cosecha repartida en partes iguales, como una fracción.",
      "rareza": "epica",
      "color": "#89a75b"
    },
    {
      "id": "campina-4-6",
      "mundo": 4,
      "etapa": 6,
      "nombre": "Trigal compartido",
      "categoria": "campina",
      "descripcion": "Carta legendaria inventada para el juego. Simboliza el trabajo compartido en el campo: un todo que se reparte en partes.",
      "rareza": "legendaria",
      "color": "#89a75b"
    },
    {
      "id": "campina-5-1",
      "mundo": 5,
      "etapa": 1,
      "nombre": "Torre del Homenaje",
      "categoria": "patrimonio",
      "descripcion": "Torre del castillo medieval de Estepa, en lo alto del Cerro de San Cristóbal. Desde allí se domina un amplio paisaje de campiña y sierra.",
      "rareza": "comun",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-5-2",
      "mundo": 5,
      "etapa": 2,
      "nombre": "Cerro de San Cristóbal",
      "categoria": "patrimonio",
      "descripcion": "Cerro sobre el que se asentó la Estepa histórica, con su castillo y su iglesia. Por sus vistas, a Estepa la llaman «el Balcón de Andalucía».",
      "rareza": "comun",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-5-3",
      "mundo": 5,
      "etapa": 3,
      "nombre": "Mantecados de Estepa",
      "categoria": "tradicion",
      "descripcion": "Dulce navideño de manteca, harina y azúcar, famoso en toda España. Su elaboración es una tradición artesanal e industrial muy importante en Estepa.",
      "rareza": "rara",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-5-4",
      "mundo": 5,
      "etapa": 4,
      "nombre": "Polvorones",
      "categoria": "tradicion",
      "descripcion": "Dulce de la misma familia que el mantecado, con almendra y forma ovalada, que se deshace al morderlo. Se envuelve tradicionalmente en papel de seda.",
      "rareza": "rara",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-5-5",
      "mundo": 5,
      "etapa": 5,
      "nombre": "Olivares de Estepa",
      "categoria": "campina",
      "descripcion": "Los olivares rodean Estepa y forman terrazas en sus lomas. El aceite de la comarca tiene fama por su calidad.",
      "rareza": "epica",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-5-6",
      "mundo": 5,
      "etapa": 6,
      "nombre": "Plano del castillo",
      "categoria": "historia",
      "descripcion": "Plano inventado para el juego. Sirve para practicar escalas: cada centímetro del papel representa una distancia real.",
      "rareza": "legendaria",
      "color": "#bf8b5c"
    },
    {
      "id": "campina-6-1",
      "mundo": 6,
      "etapa": 1,
      "nombre": "Antigua Universidad de Osuna",
      "categoria": "patrimonio",
      "descripcion": "Universidad fundada en el siglo XVI por el conde de Ureña. Su edificio, con torres en las esquinas y patio central, domina Osuna desde lo alto.",
      "rareza": "comun",
      "color": "#779ad6"
    },
    {
      "id": "campina-6-2",
      "mundo": 6,
      "etapa": 2,
      "nombre": "Colegiata de Osuna",
      "categoria": "patrimonio",
      "descripcion": "Gran templo renacentista del siglo XVI, junto a la antigua universidad. Guarda obras de arte y el panteón de los duques de Osuna.",
      "rareza": "comun",
      "color": "#779ad6"
    },
    {
      "id": "campina-6-3",
      "mundo": 6,
      "etapa": 3,
      "nombre": "Calle San Pedro",
      "categoria": "patrimonio",
      "descripcion": "Calle de Osuna famosa por sus palacios y portadas barrocas. Pasear por ella es recorrer la arquitectura señorial de la villa.",
      "rareza": "rara",
      "color": "#779ad6"
    },
    {
      "id": "campina-6-4",
      "mundo": 6,
      "etapa": 4,
      "nombre": "Canteras de Osuna",
      "categoria": "patrimonio",
      "descripcion": "Antiguas canteras de piedra explotadas desde época romana. Sus paredes talladas forman hoy un paisaje singular junto a la localidad.",
      "rareza": "rara",
      "color": "#779ad6"
    },
    {
      "id": "campina-6-5",
      "mundo": 6,
      "etapa": 5,
      "nombre": "Villa ducal",
      "categoria": "historia",
      "descripcion": "Osuna fue sede del ducado del mismo nombre, uno de los más poderosos de España. Sus palacios e iglesias recuerdan aquella época.",
      "rareza": "epica",
      "color": "#779ad6"
    },
    {
      "id": "campina-6-6",
      "mundo": 6,
      "etapa": 6,
      "nombre": "Pergamino de la incógnita",
      "categoria": "historia",
      "descripcion": "Objeto inventado para el juego. Esconde expresiones algebraicas: letras que guardan números desconocidos.",
      "rareza": "legendaria",
      "color": "#779ad6"
    },
    {
      "id": "campina-7-1",
      "mundo": 7,
      "etapa": 1,
      "nombre": "Puente de Isabel II",
      "categoria": "patrimonio",
      "descripcion": "Inaugurado en 1852, fue el primer puente fijo de hierro sobre el Guadalquivir en Sevilla. Une el barrio de Triana con el centro de la ciudad.",
      "rareza": "comun",
      "color": "#b787ce"
    },
    {
      "id": "campina-7-2",
      "mundo": 7,
      "etapa": 2,
      "nombre": "Esperanza de Triana",
      "categoria": "devocion",
      "descripcion": "Advocación mariana de la Hermandad de la Esperanza de Triana, muy vinculada a los marineros del barrio. Procesiona en la Madrugada del Viernes Santo.",
      "rareza": "comun",
      "color": "#b787ce"
    },
    {
      "id": "campina-7-3",
      "mundo": 7,
      "etapa": 3,
      "nombre": "Virgen de la Estrella",
      "categoria": "devocion",
      "descripcion": "Advocación de la Hermandad de la Estrella, del barrio de Triana. Procesiona el Domingo de Ramos y es muy querida en el barrio.",
      "rareza": "rara",
      "color": "#b787ce"
    },
    {
      "id": "campina-7-4",
      "mundo": 7,
      "etapa": 4,
      "nombre": "Cerámica de Triana",
      "categoria": "tradicion",
      "descripcion": "Triana es desde hace siglos un gran centro alfarero. Sus talleres han dado azulejos, platos y piezas de cerámica que decoran toda Sevilla.",
      "rareza": "rara",
      "color": "#b787ce"
    },
    {
      "id": "campina-7-5",
      "mundo": 7,
      "etapa": 5,
      "nombre": "Joaquín Sánchez",
      "categoria": "futbol",
      "descripcion": "Futbolista nacido en El Puerto de Santa María en 1981, símbolo del Real Betis Balompié. Se retiró en 2023, con más de 40 años.",
      "rareza": "epica",
      "color": "#b787ce"
    },
    {
      "id": "campina-7-6",
      "mundo": 7,
      "etapa": 6,
      "nombre": "Rafael Gordillo",
      "categoria": "futbol",
      "descripcion": "Futbolista nacido en Almendralejo en 1957, referente histórico del Real Betis Balompié. También jugó en el Real Madrid y en la selección española.",
      "rareza": "legendaria",
      "color": "#b787ce"
    },
    {
      "id": "campina-8-1",
      "mundo": 8,
      "etapa": 1,
      "nombre": "Castillo de Alcalá",
      "categoria": "patrimonio",
      "descripcion": "Castillo de origen almohade, uno de los mayores recintos fortificados de la provincia. Se alza sobre el río Guadaíra.",
      "rareza": "comun",
      "color": "#70b9b1"
    },
    {
      "id": "campina-8-2",
      "mundo": 8,
      "etapa": 2,
      "nombre": "Molinos del Guadaíra",
      "categoria": "patrimonio",
      "descripcion": "Durante siglos, decenas de molinos harineros aprovecharon la corriente del Guadaíra. Molían el trigo con el que se hacía el famoso pan de Alcalá.",
      "rareza": "comun",
      "color": "#70b9b1"
    },
    {
      "id": "campina-8-3",
      "mundo": 8,
      "etapa": 3,
      "nombre": "Río Guadaíra",
      "categoria": "campina",
      "descripcion": "Afluente del Guadalquivir que atraviesa Alcalá de Guadaíra. Sus orillas, con pinares y molinos, forman un paisaje muy valioso.",
      "rareza": "rara",
      "color": "#70b9b1"
    },
    {
      "id": "campina-8-4",
      "mundo": 8,
      "etapa": 4,
      "nombre": "Puente del Dragón",
      "categoria": "patrimonio",
      "descripcion": "Puente moderno de Alcalá de Guadaíra cuya estructura, recubierta de cerámica, recuerda a un dragón. Es uno de los iconos contemporáneos de la ciudad.",
      "rareza": "rara",
      "color": "#70b9b1"
    },
    {
      "id": "campina-8-5",
      "mundo": 8,
      "etapa": 5,
      "nombre": "Pan de Alcalá",
      "categoria": "tradicion",
      "descripcion": "A Alcalá se la conoció como «Alcalá de los Panaderos» porque abastecía de pan a Sevilla. La tradición panadera sigue viva en el pueblo.",
      "rareza": "epica",
      "color": "#70b9b1"
    },
    {
      "id": "campina-8-6",
      "mundo": 8,
      "etapa": 6,
      "nombre": "Rueda del molino",
      "categoria": "historia",
      "descripcion": "Rueda inspirada en los molinos hidráulicos. El agua mueve la rueda y la rueda mueve la piedra que muele el grano.",
      "rareza": "legendaria",
      "color": "#70b9b1"
    },
    {
      "id": "campina-9-1",
      "mundo": 9,
      "etapa": 1,
      "nombre": "Anfiteatro de Itálica",
      "categoria": "patrimonio",
      "descripcion": "Uno de los mayores anfiteatros del Imperio romano, con capacidad para unos 25 000 espectadores. Se usaba para espectáculos de gladiadores.",
      "rareza": "comun",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-9-2",
      "mundo": 9,
      "etapa": 2,
      "nombre": "Mosaico romano",
      "categoria": "historia",
      "descripcion": "Los suelos de las casas de Itálica se decoraban con mosaicos de teselas: figuras geométricas, aves y escenas mitológicas.",
      "rareza": "comun",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-9-3",
      "mundo": 9,
      "etapa": 3,
      "nombre": "Teatro de Itálica",
      "categoria": "patrimonio",
      "descripcion": "Teatro romano de Itálica, donde se representaban obras para el público de la ciudad. Sus gradas siguen en pie en el actual Santiponce.",
      "rareza": "rara",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-9-4",
      "mundo": 9,
      "etapa": 4,
      "nombre": "Trajano",
      "categoria": "historia",
      "descripcion": "Marco Ulpio Trajano nació en Itálica en el año 53 y fue el primer emperador romano nacido fuera de Italia. Bajo su gobierno el Imperio alcanzó su mayor extensión.",
      "rareza": "rara",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-9-5",
      "mundo": 9,
      "etapa": 5,
      "nombre": "Adriano",
      "categoria": "historia",
      "descripcion": "Emperador romano muy ligado a Itálica, de donde procedía su familia. Embelleció la ciudad con nuevos barrios y edificios.",
      "rareza": "epica",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-9-6",
      "mundo": 9,
      "etapa": 6,
      "nombre": "Santiponce histórico",
      "categoria": "patrimonio",
      "descripcion": "Localidad sevillana junto a la que se conservan las ruinas de Itálica. También alberga el monasterio de San Isidoro del Campo.",
      "rareza": "legendaria",
      "color": "#cb9b6b"
    },
    {
      "id": "campina-10-1",
      "mundo": 10,
      "etapa": 1,
      "nombre": "Esperanza Macarena",
      "categoria": "devocion",
      "descripcion": "Advocación mariana de la Hermandad de la Macarena, cuya basílica está junto a las murallas de Sevilla. Procesiona en la Madrugada del Viernes Santo.",
      "rareza": "comun",
      "color": "#b8779b"
    },
    {
      "id": "campina-10-2",
      "mundo": 10,
      "etapa": 2,
      "nombre": "Virgen de los Reyes",
      "categoria": "devocion",
      "descripcion": "Patrona de Sevilla y de su archidiócesis, venerada en la Catedral. Su procesión del 15 de agosto es una de las tradiciones más antiguas de la ciudad.",
      "rareza": "comun",
      "color": "#b8779b"
    },
    {
      "id": "campina-10-3",
      "mundo": 10,
      "etapa": 3,
      "nombre": "La Giralda",
      "categoria": "patrimonio",
      "descripcion": "Antiguo alminar almohade del siglo XII, al que en el siglo XVI se añadió el campanario renacentista. Mide unos 100 metros y la corona el Giraldillo.",
      "rareza": "rara",
      "color": "#b8779b"
    },
    {
      "id": "campina-10-4",
      "mundo": 10,
      "etapa": 4,
      "nombre": "Real Alcázar",
      "categoria": "patrimonio",
      "descripcion": "Conjunto de palacios y jardines usado por los reyes durante siglos, con arte mudéjar. Es Patrimonio de la Humanidad junto con la Catedral y el Archivo de Indias.",
      "rareza": "rara",
      "color": "#b8779b"
    },
    {
      "id": "campina-10-5",
      "mundo": 10,
      "etapa": 5,
      "nombre": "Jesús Navas",
      "categoria": "futbol",
      "descripcion": "Futbolista nacido en Los Palacios y Villafranca en 1985, capitán y leyenda del Sevilla FC. Fue campeón del mundo con la selección española en 2010.",
      "rareza": "epica",
      "color": "#b8779b"
    },
    {
      "id": "campina-10-6",
      "mundo": 10,
      "etapa": 6,
      "nombre": "Plaza de España",
      "categoria": "patrimonio",
      "descripcion": "Obra del arquitecto Aníbal González para la Exposición Iberoamericana de 1929. Sus bancos de azulejos representan las provincias de España.",
      "rareza": "legendaria",
      "color": "#b8779b"
    }
  ],
  "categorias": {
    "patrimonio": "Monumentos",
    "devocion": "Devociones populares",
    "futbol": "Fútbol sevillano",
    "historia": "Historia",
    "tradicion": "Tradiciones",
    "campina": "La Campiña"
  },
  "rarezas": {
    "comun": "Común",
    "rara": "Rara",
    "epica": "Épica",
    "legendaria": "Legendaria"
  },
  "historiaCentral": "Los planos de los alarifes de Fuentes se han fragmentado en diez piezas del Compás de la Campiña. Cada reino conserva una pieza y seis cartas culturales (siete en Fuentes de Andalucía). Al recuperar las diez piezas y dominar los desafíos, se restaura el archivo de Galois."
};
