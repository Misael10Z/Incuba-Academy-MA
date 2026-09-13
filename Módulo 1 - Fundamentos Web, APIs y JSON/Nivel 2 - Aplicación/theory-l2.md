# Nivel 2 - Aplicación - Teoría

## 1. Paginación

- **Page:** Conjunto de datos en base a un total de ellos.

- **PageSize:** Tamaño de datos o cantidad de datos que posee `page`.

- **Cursores:** Función de bucle en SQL.
  
  Para utilizarse deben definirse cinco sentencias más de manipulación de datos (DML):
  
  1. **DECLARE:** Definir las variables que el CURSOR recorrerá para almacenarlas los datos de las filas temporalmente y tratarlas:
     
     ```sql
     DECLARE @id INT, @name VARCHAR(30);
     ```
     
     Luego, se declara la lógica del bucle del cursor:
     
     ```sql
     DECLARE cursor_users CURSOR FOR
     SELECT id, name
     FROM users
     WHERE id > 30;
     ```
  
  2. **OPEN:** Se inicializa el cursor en memoria:
     
     ```sql
     OPEN cursor_users
     ```
  
  3. **FETCH:** Se comienza el recorrido de datos desde la fila actual (siguiendo el ejemplo, id 31) y avanza el contador en 1, pero antes, debe leerse la primer fila:
     
     ```sql
     FETCH NEXT FROM cursor_users INTO @id, @name;
     ```
     
     Esto se hace para verificar que existe la tabla, haya datos en ella y coincidan sus tipos con los de las variables.
     
     Es como intentar abrir una puerta antes de siquiera verificar si está cerrada bajo llave o no. Si está abierta, entra la primer persona (primer FETCH) y por consecuente las demás (bucle). Caso contrario lanzará error y no seguirá al bucle, evitando el procesamiento de datos posiblemente erróneos.
     
     Antes de proseguir al bucle, debemos aclarar lo siguiente:
     
     - **@@FETCH_STATUS:** Variable global que almacena tres tipos de estados según el resultado del último FETCH (en nuestro caso, el primer FETCH).
       
       Sus estados son: 0 (éxito), -1 (fin del bucle/error) y -2 (fila faltante, eliminada por un usuario u otro proceso mientras CURSOR se ejecutaba).
     
     Entonces:
     
     ```sql
     WHILE @@FETCH_STATUS = 0 (comparación)
     BEGIN
        PRINT @id, @name;
        FETCH NEXT FROM cursor_users INTO @id, @name;
     END;
     ```
4. **CLOSE:** Cerramos el bucle una vez haya terminado (si no declaramos esta sentencia, el programa o SQL se quedará esperando en WHILE):
   
   ```sql
   CLOSE cursor_users;
   ```

5. **DEALLOCATE:** Eliminamos los datos restantes del CURSOR en memoria:
   
   ```sql
   DEALLOCATE cursor_users;
   ```
   
   **Ejemplo integrado:**

```sql
DECLARE @id INT, @name VARCHAR(30);

DECLARE cursor_users CURSOR FOR
SELECT id, name
FROM users
WHERE id > 30;

OPEN cursor_users;

FETCH NEXT FROM cursor_users INTO @id, @name;

WHILE @@FETCH_STATUS = 0 (comparación)
BEGIN
    PRINT @id, @name;
    FETCH NEXT FROM cursor_users INTO @id, @name;
END;

CLOSE cursor_users;
DEALLOCATE cursor_users;
```

  Se aplica cuando se debe ejercer lógica más compleja que con una consulta simple (UPDATE, DELETE, etc), ya que cada fila puede tratarse o ejecutarse en una lógica diferente según su condición (actualizar algunas, excluir a otras, por ejemplo).

- **Tokens o paginación basada en tokens:**
  
  A diferencia de las cargas de `page` manuales (vía botón o link), las cargas basadas en tokens son dinámicas, es decir, en tiempo real. Es utilizado generalmente para contenido dinámico como redes sociales.
  
  **Cómo funciona:** El servidor envía un page inicial con su respectiva cantidad de registros (por ej., publicaciones), pero a su vez junto a un token oculto que almacena el ID del último registro.
  
  A medida que el usuario desliza y esté cerca o ya en el final, es detectado por la API y automáticamente avisa al servidor, utilizando el token con el ID para cargar un nuevo `page` con nuevos registros a partir del último ID cargado.
  
  Esto permite al usuario visualizar muchas publicaciones o contenido en tiempo real sin tener que generar manualmente otro `page`.

## 2. Rate limits

- **Límite:** Cantidad de peticiones que puede aceptar un servidor, sean provenientes de usuarios (manuales) o sistemas (automáticos, clientes en ambos casos).

- **Ventana temporal:** Se combina con el límite. Define en qué rango de tiempo se pueden realizar las peticiones. Terminado el límite, el cliente tendrá que esperar que el tiempo se reinicie para reenviar la solicitud (aunque puede seguir reintentando, pero el servidor las rechazará con el código de estado 429 mientras tanto).
  
  Ejemplos: 5 peticiones por segundo, 80 por minuto o 5000 por hora.

- **Retry-After:** Campo clave-valor opcional dentro del `header` que define el tiempo de espera al cliente para realizar una petición.
  
  Generalmente está integrado a la respuesta de estado `429 Too Many Requests` (servidor).
  
  El valor puede expresarse en segundos o en fecha/hora HTTP.
  
  Ejemplo:
  
  Si la combinamos con la ventana temporal, al acabarse el tiempo, podrías esperar 10 minutos antes de realizar otras 80 peticiones en un minuto:
  
  `Retry-After: 600`.
  
  O si la petición fué a las 15:40:03:
  
  `Retry-After: Tues, 16 Jan 2027 15:50:03 GMT`.
  
  
  
  <u>***NOTA:***</u> Hasta este punto, todo lo explayado (de Rate limits) es aplicado del lado del servidor. A continuación se mencionan estrategias que son aplicables del lado del cliente (software).
  
  </aside>

- **Estrategia de reintento:** Refiere a sugerencias para volver a enviar peticiones luego de haber pasado el tiempo límite o número de intentos.
  
  Se aconseja:
  
  - Indicar el tiempo de espera añadido por el header Retry-After al usuario o sistema para para evitar nuevos intentos fallidos y la posibilidad de recibir algún tipo de bloqueo por insistencia.
  
  - No reintentar inmediatamente luego de acabada la posibilidad de intentos, ya que podría dificultar esta acción más adelante con el servidor como mencionamos, por lo que se sugiere definir las siguientes funciones en el cliente:
    
    - **Función Backoff exponencial:** Aumenta exponencialmente el tiempo de espera tras cada intento fallido: un intento, 2 segundos de espera; 2º intento, 4 segundos de espera; 3º intento, 8 segundos de espera. No es acumulable, se reinicia el tiempo tras cada intento.
      
      Se establece esta regla para no saturar al servidor en el caso de que existan más clientes intentando acceder a la vez.
    
    - **Función Jitter (aleatoriedad):** Puede añadirse también un tiempo de espera aleatorio al Backoff, generalmente entre 0.1 y 2 segundos (ejs.: 2.7, 4.1, 8.3, …).
      
      Esto se hace con el fin de diferir el tiempo de espera con el Backoff de otros clientes y asegurar aún más la no sobrecarga del servidor.
  
  He de aclarar que también existe otra estrategia, donde no exista el Backoff:

- **Estrategia con solamente Jitter en cliente:** Luego del primer Retry-After, y fallar un segundo intento, el servidor puede volver a enviar otro Retry-After con un Jitter aplicado en vez de activar un Backoff.
  
  Ejemplo:
  
  - Primer intento: Retry-After: 10 segundos.
  - Segundo intento: Retry-After, 11.4 segundos.
  
  Y así con cada intento siguiente, un Retry-After con Jitter.
  
  Por último, puede aplicarse una tercer estrategia:

- **Estrategia con Retry-After estático y dinámico:** Retry-After posee un valor fijo si el servidor detecta que hay pocos usuarios/peticiones, pero que pueda cambiar a un valor dinámico (aleatoriedad) en caso de detectar muchos usuarios.
  
  Ejemplo:
  
  - Pocos usuarios (ejemplo, 10): Retry-After: 3 segundos.
  - Muchos usuarios (ejemplo, 50): Un Retry-After para cada usuario, con segundos que pueden oscilar entre 3 segundos y 20 segundos.

## 3. Errores

### **3.1 Request inválido**

Generalmente refiere a una respuesta de código de estado 400 Bad Request, la cual puede haber sido provocada por enviar datos no coincidentes con los tipos del campo, omisión de uno o más campos, o error de sintaxis.

Ejemplos:

- Error de tipo:
  
  ```json
  {
    "name": "Melisse",
    "age": "Twenty four"
  }
  ```
  
  Se espera un valor numérico en `age`, no un string.

- Falta de campos:
  
  ```json
  {
    "age": "Twenty four"
  }
  ```
  
  Se omitió `name`.

- JSON roto o inválido:
  
  ```jsx
  {
    "name": "Melisse",
    "age: 24
  }
  ```
  
  `age` no está encomillado completamente.

Otro caso también puede ser la inserción de carácteres ocultos en el campo o intento de inyección XSS/SQL.

**Posibles soluciones:** Detectar y/o prohibir valores con tipo de dato distinto al campo vía Frontend.

Siendo que el Frontend no es infalible, desde el Backend deben aplicarse también middlewares o validaciones antes de utilizar los datos.

### 3.2 Problemas de autorización

Generalmente está asociado a dos códigos de estado: `401 Unauthorized` y `403 Forbidden`.

- **401:** El usuario o cliente no posee una sesión activa que almacena un determinado token que lo identifique como usuario perteneciente al sistema/API, necesario para tener acceso a secciones o funciones dentro de él.
  
  Solución: indicarle al usuario que debe registrarse e iniciar sesión desde de la web o API, siendo ésta última la que realiza el procedimiento de verificación de existencia de usuario/credenciales en la base de datos, otorgándole la identificación o no según el resultado.

- **403:** El usuario no posee autorización para interactuar con todas las funciones del sistema, por lo que posee autorización restringida.
  
  El token del usuario, además de darle una identificación válida, también lleva consigo información sobre el rol del usuario (usuario común o administrador, por ejemplo).
  
  Este rol define el alcance de acceso a determinadas características del sistema para mayor seguridad del mismo contra ataques o acceso ilegal externos como también para el propio usuario.
  
  No existen soluciones más allá de poseer un rol de mayor nivel jerárquico que otorgue los permisos necesarios.

### 3.3 Inexistencia

Relacionado al código de estado `404 Not Found`, ocurre cuando al recurso que se intentó acceder no se encontró en el servidor.

**Solución:** Retornar un *empty state*, es decir, una página que indique que el recurso no fué hallado y a su vez ofreciéndole un buscador y/o enlaces hacia otros recursos de interés o que se relacione a lo que el usuario está buscando.

### 3.4 Error del proveedor

Falta de respuesta por parte de un servicio externo al circuito principal Cliente-Request-Servidor-Response-Cliente:

`Cliente → Request → Servidor → **Proveedor** → Servidor → Response → Cliente`.

Siendo entonces el proceso detenido:

`Cliente → Request → Servidor → Proveedor → **Error**`.

Esta situación suele asociarse a dos códigos de estado: `502 Bad Gateway` y `504 Gateway Timeout`.

- **502:** El primero significa que la API no logró comunicarse con el servidor (en este caso no uno propio, sino del proveedor), retornando un mensaje de que el servidor está caído.

- **504:** Mientras que el segundo, el tiempo de espera de una respuesta del servidor (proveedor) a la API, finalizó.
  
  No indica que el servidor esté caído, sino que puede estar saturado y tarde en responder, pero si muchos clientes peticionan, el servidor puede ralentizarse o incluso caerse al acumular muchas de estas acciones a causa de no tener respuesta rápida (timeout).

Por ende, lo indispensable en este caso, es no permitir que la aplicación se detenga o falle por este inconveniente.

**Soluciones:**

1. **Circuit Breaker (Patrón de diseño del disyuntor):** Como el nombre lo indica, actúa como un "salvavidas" para el usuario o cliente como lo haría un disyuntor real en un cirucito eléctrico.
   
   Se desglosa de la siguiente manera:
   
   El "disyuntor" es una sección de código con un determinado patrón de tres estados que verifica la disponibilidad del servicio del proveedor:
   
   - **Estado cerrado:** El circuito de solicitud está cerrado, es decir, el proveedor retorna datos, existe transferencia de información.
     
     Aunque en este estado no haya inconvenientes, como parte del plan de contigencia del patrón de diseño, se almacena en caché datos necesarios que respalden la lógica de negocio.
   
   - **Estado abierto:** El proveedor no responde. Luego de una determinada cantidad de intentos (concepto de Rate limits), el "disyuntor" se abre e impide que haya transferencia de información (más peticiones). En cambio, se utiliza la información almacenada en caché para que el usaurio pueda completar un proceso (por ejemplo, almacenar la cotización del dólar para proseguir con la compra).
   
   - **Estado semi-abierto:** Pasado un lapso de tiempo (por ejemplo, 5 minutos), el "disyuntor" (sistema) intenta comunicarse nuevamente con el proveedor. En caso de recibir respuesta, pasa al estado cerrado nuevamente, caso contrario, continúa en estado abierto.

2. **Graceful Degradation (Degradación sutil del servicio):**
   
   - Propone desactivar temporalmente aquellos servicios del servidor que dependan del proveedor en cuestión (el que está presentando dificultades, de posibles varios) pero no sean imprescindibles para continuar con el normal funcionamiento del sistema.
   - Si determinado servico es vital para el funcionamiento de un determinado proceso o lógica de negocio, debe almacenarse (donde sea) períodicamente el valor o dato que se necesite en caso de no tener respuesta del proveedor, aunque ese dato esté desactualizado.

### 3.5 Timeout (Tiempo de espera finalizado)

La petición tardó en recibir respuesta y la conexión HTTP se cerró. Se cierra para que no haya un proceso de comunicación abierto de forma indefinida que pueda ocasionar consumo innecesario de recursos del servidor (en caso de muchas comunicaciones simultáneas).

Se recomienda entonces establecer una estrategia de espera cuando el servidor o proveedor no da respuesta.

**Soluciones:**

Establecer tiempos de espera en varias capas:

- **Timeouts estrictos y escalonados:**
  
  - **Para el usuario:** Si el frontend detecta que el backend tardó 5 segundos o más en responder, muestre automáticamente al usuario un estado amigable de timeout (similar a los casos mencionados anteriormente sobre este mismo tema).
  - **Para cliente y usuario (posterior al proceso frontend):** Si el backend detecta que la API externa tarda 3 segundos o más, se asume que el proveedor está caído y se cierra la conexión. Automáticamente se activa el protocolo de Circuit Breaker.

- **Operaciones asíncronas:** Utilizado para procesos pesados (que requieren tiempo de espera):
  
  - **Si es usuario:** Se recibe la petición y se retorna un código de estado `202 Accepted` cerrando la conexión HTTP (ahorrando recursos y evitando timeout).
    
    Mientras tanto, el backend realiza el proceso en segundo plano (cola de tareas) mientras que el usuario puede realizar otras acciones, y a su vez, el frontend consultará (GET) períodicamente (ejemplos: 10 segundos, 1 minuto, etc) para verificar que el proceso terminó.
    
    Finalizado el proceso, el frontend dará notificación al usuario (posible redirección al resultado).
  
  - **Si es cliente:** No posee un frontend para consultar cada cierto tiempo, por lo que al momento de realizar una petición, también envía con ella una URL (POST).
    
    La estrategia acá es diferente: patrón *WebHook*.
    
    El cliente en vez de consultar varias veces, solamente espera a que el servidor finalice el proceso y le envíe la respuesta a la URL específicada.
    
    Existe también otra estrategia: *Message Brokers* o *Broker de mensajería* (Arquitectura dirigida por Eventos).
    
    Esta es similar a la anterior, solo que no utiliza comunicaciones HTTP, ya que suele utilizarse para comunicación interna entre sistemas de una misma empresa.

### 3.6 Respuesta inesperada o malformación de datos

El servidor retorna un código de estado 200 al recibir una petición, pero los datos recibidos pueden no tener el esquema o formato esperado por lo que podría causar un error más adelante.

Puede suceder por mal inserción de datos por parte del usuario/cliente, que significa un mal diseño de API por no validar los datos que recibe; una API externa que actualizó la forma en la que envía los datos o una mala utilización del código de estado `200 OK` a forma de errores 400 o 500.

**Soluciones:**

- **Encadenamiento opcional junto a valores por defecto:** la más sencilla.
  
  Cada vez que se quiera acceder a un objeto o cuerpo de datos, debe hacerse con el método de campo opcional, es decir, que el código compruebe la existencia de un dato o caso contrario establecer uno por defecto: `const name = request?.body?.name ?? 'defaultUser'`.

- **Validación de esquema:** utilizar librerías de validación de objetos y/o datos antes de utilizarlos. Si algún campo o dato no coincide, debería establecerse un valor por defecto o retornar error 400.
  
  Si la petición vino de un proveedor, debe haber una función que notifique al desarrollador del cambio.

- También existen librerías que ayudan a monitorear estos errores en tiempo real, útil para prevenir estos cambios antes de que un cliente realice una petición.

## 4. Leer documentación

Cuando se trabaja con una API propia o ajena, se recomienda (debería) leer toda la documentación asociada a ella, para poder entender su comportamiento (funciones), interacciones externas, alcance y límites.

En API propia, tratar de entender las tecnologías que se utilizan, pero no al 100% (debido a que no es necesario saberlo todo porque siempre habrán características nuevas), sino sus principios (arquitectura/patrón de un framework/librería y/o sus comandos/funciones propias, por ejemplo) y propósitos (a qué está destinado, en qué situación es ideal aplicarlo) fundamentales.

En API ajena, relacionado a lo anterior pero para entender su arquitectura y lógica de negocio (contrato). Esto evita aplicar ideas propias a un proyecto (siempre y cuando no tengan que ver con su estructuración) y permite trabajar en sintonía con el resto de personas.

La documentación de una API suele incluir la siguiente información:

- **Base URL:** dirección URL raíz del servidor o API. Si es de tipo REST, incluirá el protocolo HTTP.
  
  Ejemplo: [`https://dominio.com`](https://dominio.com/).

- **Endpoints:** URLs ramificadas de la URL base, generalmente para interactuar con distintos tipos de recursos.
  
  Ejemplo: https://dominio.com/lista.

- **Métodos:** el protocolo HTTP que utiliza cada URL para determinadas funciones (GET, POST, PUT, PATCH y DELETE).

- **Autenticación:** lógica y librerías utilizadas para su implementación.

- **Parámetros:** en peticiones, esto incluye:
  
  - **Variables de path:** `/lista/{page}`.
  - **Query Params:** `/lista?month=jan`.
  - **Header Params:** Metadatos específicos para cada petición, como `Content-Type`, `token`, `Retry-After`, etc.
  - **Body:** datos en formato clave-valor (usualmente JSON).

- **Schemas:** define la forma en la que se manejan los datos, aplicable generalmente para objetos. Incluye sus tipos de dato de cada campo, si son requeridos u opcionales y sus propias reglas (límites o restricciones).
  
  Puede incluir ejemplos de solicitud y respuesta en formato JSON, como también archivos de código que simulen el comportamiento de la API (aunque generalmente utilizado para testing) o archivos .yml para pruebas de endpoint (postman, thunder, etc).

- **Status codes:** especifica los códigos de estado que cada endpoint puede retornar en cada respuesta.

- **Límites:** cantidad de intentos en determinados recursos (endpoints).

- **Versionado:** es una estrategia de estabilidad para los clientes que consuman el API para evitar que estos mismos rompan o fallen (como si fuéramos el proveedor). Esto se utiliza para las actualizaciones que reciba el API en cuestión, y permitir discernir a los clientes si descargar la nueva versión o no.
  
  Las versiones suelen estar conformadas de la siguiente forma: *MAYOR*.*MINOR*.*PATCH*.
  
  Explayados:
  
  - **MAYOR:** La versión principal. Asociada a cambios grandes o que pueden causar fallos a los consumidores.
  - **MINOR:** Características adheridas que no afectan al normal funcionamiento.
  - **PATCH:** Incluye arreglo de errores.
  
  Ejemplo: `4.2.7`.

Ahora, ampliando el tema del versionado, existen diferentes estrategias:

- **Path versioning:** Es el más sencillo de todos. Se escribe de forma explícita la versión mayor en la URL: [`https://app/v1/](<https://app/v1/>)...`.
  
  Permite identificar claramente la versión a la que pertenece un determinado recurso.
  
  Cuando se actualiza un recurso, suele haber URL paralelas, donde la URL nueva y antigua coexisten en distintos servidores, pero ésta última con el paso del tiempo dejará de existir para dar paso a una única versión.
  
  Es el estándar para APIs REST.
  
  - **Ventaja:** Fácil de probar vía URL, para comprobar su resultado.
  - **Desventaja:** "Ensucia" las URLs de dichos recursos, llenándola de números e incluso extraña para usuarios al aprender una URL.

- **Header Versioning (cabeceras personalizadas):** envía la versión mediante header, ejemplo: `X-API-Version: 3`.
  
  - **Ventajas:** URLs limpias y permite cambiar la versión de las mismas sin modificarlas.
  - **Desventajas:** Más difícil de comprobar ya que se necesita una herramienta para visualizar o que un cliente lea la cabecera, y por ende los desarrolladores tendrán que modificar el cliente para gestiónar del nuevo header en las rutas.

- **Accept Header (negociación de contenido):** igual que la anterior, utiliza metadatos, solo que en este caso se utiliza la cabecera HTTP Accept: `Accept: application/api.ejemplo.v3+json`.
  
  El "+json" al final indica al servidor que la respuesta que se está buscando de una determinada versión debe ser en formato JSON y no en otro por defecto (si no tuviera "+json") en caso de que el formato hubiera cambiado.
  
  - **Ventaja:** URLs limpias.
  
  - **Desventajas:**
    
    - Este tipo de cabeceras incluyen índices de prioridad (llamados valores `q`), ejemplo:
      
      `Accept: application/vnd.miapi.v2+json, application/json;q=0.9, */*;q=0.8`
      
      Lo que agregaría más complejidad a la lógica al tener que *parsear* y analizar dicha cabecera.
    
    - Crear un filtro de versiones (middleware) para redirigir la respuesta según versión, agregando más tiempo de espera.
    
    - Más difícil de documentar con herramientas como *Swagger* u *OpenAPI* que la primer estrategia.

- **Query String:** similar a la primer estrategia, solo que la versión es colocada como parámetro dinámico al final de la URL.
  
  - **Ventaja:** permite tener una misma URL para todas las versiones, envíando el parámetro para la versión requerida y ejecutando la lógica respectiva.
  - **Desventaja:** las URL suelen almacenarse en sistemas caché (servidores en la nube), pero algunos de estos sistemas pueden no incluir parámetros de consulta, haciendo que la consulta quede incompleta.

## 5. Logs y errores útiles

- **Logs:** Registran el historial de una petición, de principio a fin, haya tenido éxito o no.  
  Generan un gran volumen de líneas de información por minuto (usuarios activos, tiempos de respuesta, etc), obligando a registrar de manera inteligente cada uno de los procesos para no saturar el servidor.  
  Solo los desarrolladores y/o administradores de sistemas poseen acceso.  
  No suele recibir automatizaciones en búsqueda de información específica, por lo que se realizan manualmente.
- **Registro de errores:** Registra solamente los errores ocurridos durante una ejecución, como una caja negra. Poco volumen de información. Solamente acceden desarrolladores y equipos de soporte técnico.  
  Genera alertas inmediatamente (tickets) para que sean solucionados.

Es recomendable aplicar ambos métodos de registros, ya que en un caso real, a modo de ejemplo, el registro de errores indica la línea afectada, mientras que el log te permite seguir o construir el trayecto previo al error para un mejor análisis y aplicar una mejor solución.
