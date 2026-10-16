# Lab 03: obtención y procesamiento paginado de productos

**Importante:** Si bien el enunciado del laboratorio Nº 3 no solicitaba documentación, consideré adherirla para que facilite la interpretación del programa y explicar de forma detallada cada paso. Reitero, como no se solicitaba documentación, consideré utilizar la IA para realizar y agilizar la misma. Cabe aclarar que toda la documentación (README.md y Objetivos_cumplidos.md) fue leída y corregida por mí (Misael).

Este laboratorio consiste en un programa de línea de comandos escrito en TypeScript que recupera productos desde una API paginada, valida la estructura de la respuesta, completa lotes incompletos, elimina duplicados, conserva únicamente los campos necesarios y guarda cada página procesada como un archivo JSON. También registra el progreso, las métricas y los errores en un log estructurado.

La versión final del proyecto se centra en un flujo claro de responsabilidades:

- `productsByPagination`: solicita la página actual.
- `validateProducts`: valida la respuesta y completa el lote si faltan productos válidos.
- `depurateProducts`: elimina duplicados y vuelve a reinspeccionar si se incorporan elementos nuevos.
- `transformProducts`: reduce cada producto a su forma final.
- `createJSON`: guarda la página en disco.
- `logger`: registra cada evento en JSON Lines.

## Requisitos

- Node.js con soporte para ejecutar archivos TypeScript directamente y con la opción `--env-file`.
- Archivo `src/.env` con las variables necesarias para la ejecución.
- Acceso a la API configurada a través de `URL`.

El proyecto no declara dependencias de ejecución ni scripts de test; el arranque se hace con `pnpm start`.

## Ejecución

Desde la carpeta del laboratorio:

```bash
pnpm start
```

Esto ejecuta equivalentes a:

```bash
node --env-file=src/.env src/index.ts
```

La ejecución es secuencial: cada página se procesa, se guarda y luego el programa continúa con la siguiente. Las métricas y los errores se registran en la carpeta de resultados.

## Configuración

La configuración del programa se lee desde `src/.env`. En este laboratorio, ese archivo se incluye en el repositorio como ejemplo de los parámetros necesarios para ejecutar el programa y comprender el uso de las variables de entorno. Sin embargo, un `.env` real es un archivo de configuración crítico: puede contener credenciales, tokens, direcciones privadas u otros datos sensibles, por lo que no debe publicarse en repositorios ni plataformas. Como práctica recomendada, se publica únicamente un `.env.example` con valores ficticios o vacíos y se mantiene el `.env` real fuera del control de versiones.

Las variables principales son:

| Variable            | Uso                                                                              |
| ------------------- | -------------------------------------------------------------------------------- |
| `URL`               | URL base de la API.                                                              |
| `QUERY`             | Símbolo que inicia la cadena de consulta (`?`).                                  |
| `QUERY_CONNECTOR`   | Separador entre parámetros (`&`).                                                |
| `QUERY_LIMIT`       | Nombre del parámetro de límite, por ejemplo `limit=`.                            |
| `QUERY_SKIP`        | Nombre del parámetro de desplazamiento, por ejemplo `skip=`.                     |
| `LIMIT_VALUE`       | Cantidad objetivo por página y límite mínimo para completar un lote.             |
| `SKIP_VALUE`        | Base de cálculo del desplazamiento en cada paginación.                           |
| `TIMEOUT_LIMIT`     | Tiempo máximo permitido por petición.                                            |
| `QUERY_DELAY`       | Variable preparada para pruebas de demora, pero no activa en el flujo principal. |
| `DELAY_VALUE`       | Valor asociado a la prueba de retardo, no usado en el flujo principal.           |
| `RESULTS_DIRECTORY` | Ruta base para `stored_products` y `logs`.                                       |

La petición inicial compone una URL con la forma:

```text
URL + QUERY + QUERY_LIMIT + LIMIT_VALUE + QUERY_CONNECTOR + QUERY_SKIP + skipValue
```

Esto hace que la primera consulta empiece siempre en la posición correcta, y luego el cursor adicional se usa para compensar los productos que se recuperan por validación o por depuración.

## Flujo final del programa

El punto de entrada es `src/index.ts`. Para cada página, el flujo es este:

1. **Solicita la página actual** con `productsByPagination`.
   - La función recibe `paginationNumber` y `currentSkipCursor`.
   - Calcula el salto de la consulta con la base de paginación más el cursor adicional.

2. **Valida la respuesta** con `validateProducts`.
   - Se comprueba que la respuesta sea un objeto con `products` como array y `total` como número.
   - Se filtrán los productos inválidos con `validProducts`.
   - Si queden menos que `LIMIT_VALUE`, se llama a `completeProductsBatch` para recuperar productos faltantes.

3. **Completa el lote** con `completeProductsBatch`.
   - Se intenta recuperar productos adicionales hasta llegar al límite o hasta detectar que la API ya no devuelve más resultados.
   - Cada producto recuperado vuelve a validarse antes de integrarse al lote.

4. **Depura duplicados** con `depurateProducts`.
   - Se elimina por `id` cualquier producto repetido.
   - Si la depuración elimina elementos, el lote vuelve a completarse para recuperar reemplazos nuevos.
   - Esta segunda etapa del punto anterior es importante porque los productos que llegan por completado también pueden entrar duplicados en el lote final.

5. **Transforma productos** con `transformProducts`.
   - Cada producto se reduce a `{ id, title, category, price }`.

6. **Guarda el archivo JSON** con `createJSON`.
   - Se escribe la página con el nombre `pagination_1.json`, `pagination_2.json`, etc.

7. **Registra estadísticas** del proceso.
   - Se incluyen: número de página, productos procesados, duplicados detectados y tiempo de ejecución.

8. **Finaliza cuando la última página ya no alcanza el límite**.
   - En ese momento el programa considera que ya no hay más productos válidos y únicos que aportar.

En la ejecución de ejemplo, `findNewProductByPagination` solo se ejecutó al procesar la paginación final (sin utilización del cursor; 1º escenario), que contenía 14 productos en lugar del límite de 20. La función intentó recuperar los 6 faltantes; como la API no devolvió más productos, el lote permaneció en 14 y el programa terminó. Es un ejemplo de finalización normal cuando ya no quedan resultados que recuperar.

## Cómo funciona el cursor

El cursor es el mecanismo que evita saltarse productos o repetirlos cuando se tienen que recuperar elementos faltantes por invalidación o duplicado.

La fórmula real del programa es:

```text
skipBase = SKIP_VALUE × paginationNumber
skipFinal = skipBase + currentSkipCursor
```

Si `currentSkipCursor` es `null`, el cálculo se comporta como si fuera `0`.

Cuando un lote necesita completarse, el cursor se incrementa con la cantidad de productos recuperados adicionales. Así, el siguiente `fetch` no vuelve a consultar un rango ya recorrido y, al mismo tiempo, no “pierde” posiciones relevantes.

En la práctica, esto significa que el programa mantiene la paginación general de 20 en 20 y, además, compensa los desplazamientos producidos por productos inválidos o repetidos.

## Escenarios posibles

### 1) Todas las paginaciones traen productos correctos

Este es el caso más limpio:

- No hay productos inválidos.
- No hay duplicados.
- La validación no exige recuperaciones adicionales.
- El lote alcanza el límite y se guarda tal cual.

En este caso el cursor no aumenta por corrección, por lo que la siguiente página parte del salto base de la paginación normal.

### 2) Algunas paginaciones tienen productos inválidos

Cuando un producto no cumple la estructura requerida (por ejemplo, falta un campo o tiene un tipo incorrecto):

- `validProducts` lo descarta.
- `completeProductsBatch` calcula cuántos faltan para llegar a `LIMIT_VALUE`.
- Hace una nueva petición con el cursor actualizado.
- Los nuevos productos se validan y se añaden al lote.

Ejemplo:

- La primera página trae 20 elementos.
- 4 son inválidos.
- Se piden 4 más.
- El cursor aumenta en 4.
- La siguiente recuperación (por página o faltantes) empieza desde esa posición compensada.

### 3) Algunas paginaciones tienen productos duplicados

Cuando un lote llega completo pero contiene elementos repetidos:

- `depurateProducts` elimina los duplicados usando `id`.
- El lote puede quedar por debajo del límite.
- Se llama a `completeProductsBatch` otra vez para recuperar reemplazos nuevos.
- El cursor se mueve según la cantidad de productos reemplazados.

Esto garantiza que el lote final no conserve innecesariamente productos repetidos y que siga teniendo la cantidad esperada.

### 4) Algunas paginaciones tienen productos inválidos y duplicados

Este es el caso más completo y el que mejor ilustra la lógica del cursor.

Ejemplo de escenario real:

- `paginationNumber = 0` significa que es la primera paginación.
- El cálculo inicial del `skip`(paginationNumber \* limitValue (que es 20)) es nulo o 0, para obtener los primeros 20 productos.
- De esos 20, 7 son inválidos.
- Se recuperan 7 más y se validan.
- De esos 7, 3 están repetidos.
- Se buscan 3 más, se validan, y se verifica que no estén repetidos.
- El cursor se incrementa por 10 en total: 7 por los inválidos + 3 por los duplicados.

Entonces, cuando la siguiente paginación se ejecuta:

- `paginationNumber` pasa a ser 1.
- La base de búsqueda ya no vuelve a 0.
- La consulta ya no intenta recuperar desde el comienzo del conjunto completo, sino desde la posición compensada.

En términos prácticos:

```text
paginación base = 20 × 1 = 20
cursor compensado = 10
skip final = 20 + 10 = 30
```

Esto hace que el programa siga buscando productos nuevos aunque la paginación haya avanzado y aunque el lote anterior se haya “desplazado” por corregir invalidez y duplicados.

Es decir, la lógica garantiza que el sistema no se atasca en un rango ya revisado y que, a la vez, no repite productos ni pierde posiciones clave durante la recuperación.

## Organización del código

```text
lab-03/
├── package.json
├── README.md
├── Objetivos cumplidos.md
├── src/
│   ├── .env
│   ├── index.ts
│   ├── asserts/
│   │   └── assertProductsResponse.ts
│   ├── functions/
│   │   ├── completeProductsBatch.ts
│   │   ├── createJSON.ts
│   │   ├── findNewProductByPagination.ts
│   │   └── logger.ts
│   ├── modules/
│   │   ├── depurateProducts.ts
│   │   ├── productsByPagination.ts
│   │   ├── transformProducts.ts
│   │   └── validateProducts.ts
│   ├── type_guard/
│   │   ├── isProduct.ts
│   │   └── isRecord.ts
│   └── types/
│       ├── logLevel.ts
│       └── productType.ts
├── results/
│   ├── logs/
│   └── stored_products/
└── .gitignore
```

## Responsabilidad de cada módulo

| Archivo                                       | Responsabilidad                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`                                | Orquesta la secuencia global del programa: paginación, validación, depuración, transformación, guardado y log. |
| `src/modules/productsByPagination.ts`         | Construye la petición inicial y devuelve la respuesta sin procesar para validarla más adelante.                |
| `src/modules/validateProducts.ts`             | Valida la estructura general, filtra productos inválidos y completa el lote cuando falta contenido válido.     |
| `src/modules/depurateProducts.ts`             | Elimina duplicados por `id` y vuelve a completar el lote si la depuración lo deja por debajo del límite.       |
| `src/functions/completeProductsBatch.ts`      | Recupera productos faltantes y mantiene el cursor actualizado.                                                 |
| `src/functions/findNewProductByPagination.ts` | Ejecuta las peticiones adicionales para completar el lote.                                                     |
| `src/modules/transformProducts.ts`            | Conserva solo los campos finales del producto: `id`, `title`, `category` y `price`.                            |
| `src/functions/createJSON.ts`                 | Escribe cada página como archivo JSON.                                                                         |
| `src/functions/logger.ts`                     | Guarda eventos de progreso, errores y métricas en JSON Lines.                                                  |
| `src/asserts/assertProductsResponse.ts`       | Verifica que la respuesta de la API tenga `products` y `total` con tipos correctos.                            |
| `src/type_guard/isRecord.ts`                  | Comprueba si un valor es un objeto no nulo y no un array.                                                      |
| `src/type_guard/isProduct.ts`                 | Comprueba que cada producto tenga la forma esperada.                                                           |
| `src/types/productType.ts`                    | Define los tipos compartidos del proyecto.                                                                     |

## Salidas

Con la configuración adecuada, el programa genera:

- `results/stored_products/pagination_1.json`, `pagination_2.json`, etc.: una página con productos ya transformados.
- `results/logs/paginationsProcess.log`: registros estructurados por línea con la marca temporal, nivel, mensaje y datos adicionales.

El log usa **JSON Lines (JSONL)**: cada línea contiene un objeto JSON independiente. Este formato separa los campos del evento y es una práctica común para analizar procesos y estados con herramientas que pueden filtrar o agrupar por propiedades.

La marca temporal se genera con `new Date().toISOString()`. El método produce una cadena conforme al formato de fecha y hora ISO 8601 en UTC, no en la zona horaria local del sistema. Se utiliza aquí como referencia consistente entre ejecuciones y como ejemplo de una práctica habitual de desarrollo.

### Niveles del logger y secuencia de ejecución

El logger admite cuatro niveles:

- `INFO`: registra el inicio del programa, el inicio de cada paginación, el resultado y las métricas de cada página, y el resumen final.
- `WARN`: registra productos inválidos durante la validación y duplicados durante la depuración.
- `ERROR`: registra el error capturado por el `catch` principal de `index.ts`; se usa cuando el flujo normal falla, en lugar del resumen final.
- `DEBUG`: está implementado en el logger, pero no se invoca actualmente en el programa (NOTA Misael: En un inicio consideré implementarlo, para crear un registro de logs detallado aparte para todas las fases y/o procesos del programa, pero luego descarté la idea; pero queda constancia de que es otro tipo de log que suele implementarse en la mayoría de sistemas reales para permitir una trazabilidad de saneamiento (resultados y errores) y análisis de comportamiento).

En el flujo normal, las llamadas se realizan en este orden: `INFO` de inicio; por cada página, `INFO` de inicio, posibles `WARN` de productos inválidos y luego duplicados, `INFO` de página procesada e `INFO` de métricas; al terminar, `INFO` del resumen final. Si ocurre un error, el flujo salta al `catch` y llama a `ERROR`. Como las advertencias no se esperan con `await`, este orden describe el orden de invocación, no garantiza el orden exacto en que quedan escritas en el archivo.

Cada producto final tiene esta forma:

```json
{
  "id": 1,
  "title": "Nombre del producto",
  "category": "categoría",
  "price": 10
}
```

## Validaciones, errores y comportamiento operativo

- Las respuestas HTTP no exitosas lanzan un error y se registran en el log.
- Cada petición usa `AbortSignal.timeout` para evitar bloqueos indefinidos.
- Los productos inválidos se eliminan y se intentan recuperar más por completado.
- Los duplicados se eliminan por `id` para evitar repeticiones en el mismo lote.
- El programa termina cuando la última página ya no alcanza el límite esperado (según valor establecido en la variable LIMIT_VALUE del .env) y, tras la validación y depuración, no hay más productos válidos y únicos para añadir.

### Centralización de errores y uso de `await`

El manejo de errores está centralizado en el `try/catch` principal de `src/index.ts`. Para este programa pequeño se decidió no añadir un `try/catch` específico a cada función: las funciones auxiliares propagan los errores que no pueden resolver localmente y el punto de entrada los registra. Las funciones que usan `fetch` sí comprueban `response.ok` y lanzan un error ante una respuesta HTTP no exitosa; los errores de red, timeout y lectura del cuerpo también se propagan.

Las solicitudes y recuperaciones de productos usan `await` porque son procesos críticos para el resultado: el programa debe esperar a que cada petición termine, validar su respuesta e incorporar los productos antes de calcular el siguiente cursor o continuar con otra paginación. También se espera a los loggers y a la escritura de los archivos para respetar el orden del procesamiento y permitir que sus rechazos lleguen al `catch` principal.

Hay una excepción deliberada para las advertencias de productos inválidos y duplicados: `validProducts` y `productsDepuration` usan `Array.filter`, cuyo callback síncrono no espera promesas. Se consideró innecesario reemplazarlo por `for...of` solo para esperar `logger.warn`. Estas advertencias son de mejor esfuerzo (_best effort_): si falla su escritura, el rechazo no llega al `try/catch` principal y, al quedar sin manejar, puede interrumpir el proceso (**Nota (Misael):** es decir, a todo o nada).

### Aviso sobre diagnósticos de TypeScript

El editor o el analizador estático puede marcar `process.env.VARIABLE` porque las variables de entorno pueden estar ausentes (`undefined`). También puede marcar el acceso a `e.name`, `e.message` o `e.stack` dentro del `catch` de `index.ts`, ya que `e` se declara como `unknown`. Estos son diagnósticos de tipos y no errores de sintaxis; con la configuración requerida, no impiden por sí solos la ejecución normal con Node. No equivalen a una verificación satisfactoria de tipos: en un programa de producción convendría validar las variables de entorno y estrechar el tipo de `e` antes de acceder a sus propiedades.

## Consideraciones finales

El proyecto final se diseñó con una estrategia de recuperación de datos muy robusta:

- Valida primero;
- completa luego;
- depura después;
- vuelve a completar si hace falta;
- guarda el lote final.

Esto permite tolerar los casos reales de API con productos defectuosos o repetidos sin romper la paginación ni duplicar registros en la salida final.

En el flujo activo del programa, las variantes con `delay` y con error HTTP `503` permanecen comentadas para poder ejecutarlas de forma selectiva durante pruebas. El fetch principal sigue siendo el que se usa en la ejecución normal del laboratorio.
