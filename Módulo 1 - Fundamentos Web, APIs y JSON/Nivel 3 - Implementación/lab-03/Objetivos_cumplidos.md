# Cumplimiento de objetivos

- [x] **Detectar `total`:** se valida que la respuesta incluya `total` numérico y se informa en el resumen final.
- [x] **Recorrer las páginas:** se repiten las solicitudes con `skip` incremental hasta procesar una página incompleta, señal de que no hay más productos.
- [x] **Usar `fetch` nativo:** las peticiones iniciales y las de completado usan `fetch`.
- [x] **Agregar timeout:** cada petición usa `AbortSignal.timeout`.
- [x] **Validar la respuesta:** se comprueba la estructura general y el tipo de los campos requeridos de cada producto.
- [x] **Evitar duplicados:** se comparan los productos por `id`.
- [x] **Transformar los productos:** se conservan únicamente `{id, title, category, price}`.
- [x] **Registrar el procesamiento:** el log incluye páginas, cantidades, duplicados y duración; también registra el resumen final.
- [x] **Guardar el resultado:** cada página se escribe en un archivo JSON.
- [x] **Probar demora:** existe una variante de petición con `delay=5000` y un timeout menor para provocar un timeout. Está comentada para poder activarla durante la prueba.
- [x] **Probar error de servidor:** existe una variante separada para `https://dummyjson.com/http/503`; el caso de respuesta HTTP no exitosa queda registrado como error en el log.
- [x] **Definir una política de retry:** se propone _exponential backoff with jitter_ para reintentos transitorios; la política se describe abajo, pero no está implementada en el programa.

## Ejemplo de finalización

En la ejecución registrada, las primeras nueve páginas produjeron 20 productos cada una y la última produjo 14. El programa intentó completar ese último lote mediante una solicitud adicional; al no encontrar más productos, guardó la página incompleta y finalizó porque su cantidad era menor que el límite de 20.

## Política de retry propuesta (Misael, no IA)

Utilizaría _Exponential Backoff_ con _Jitter_, ya que, hipotetizando un caso donde varios clientes realizan solicitudes de paginación (donde puede manejarse grandes volúmenes de información), puede darse el caso que el sistema destino no pueda gestionar todas las peticiones a la vez y colapse durante un breve período. Por lo cual a partir de la primer falla, aplicaría la estrategia de reintento mencionada, junto con un máximo de intentos y timeout, para no peticionar a la vez con otros clientes ni reintentar indeterminadamente.
