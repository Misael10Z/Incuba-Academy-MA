# Nivel 3 - Implementación - Teoría

## 1. Análisis del problema

Su propósito es el entendimiento y definición del problema, como también la deducción de las herramientas necesarias para poder diseñar y brindar una solución a medida.

Por lo cual, para poder realizar este proceso de análisis, se deben tener en cuenta los siguientes siete puntos críticos o esenciales, que generalmente resultan en el empleo de soluciones:

- **integrales** para conectar sistemas de información heterogéneos (donde cada cual maneja sus propios campos o formatos de transmisión; ejemplo: uno JSON y XML otro, simplificarlo a un tipo de estos; y Headers; similar a un proceso ETL), como una API;
- y/o **automatizadas**, como _n8n_ o _Make_, para gestionar la integración, es decir, evitar lo más posible el factor humano para su ejecución o cumplimiento de misión (a veces es necesario pero por la propia naturaleza de la lógica del negocio, como una compra en un e-commerce),

para de esta manera, ofrecer no solamente una solución que satisfaga la necesidad en cuestión, sino que a su vez sea eficiente, segura y eficaz a largo plazo.

### 1.1 Evento de inicio (Trigger Mechanism)

Es lo que genera la activación de un proceso automatizado, sea por el click de un usuario, procesos de mantenimiento y/o chequeo cronometrados, entre otros.

En términos simples, define si el proceso debe ser síncrono (tiempo real) o asíncrono (exportación de un resumen a las 00:00).

Entonces, existen al menos tres formas para categorizar estos tipos de procesos:

- **Por Sondeo (Polling):** Un sistema consulta (proceso) una determinada fuente o estado cada cierto tiempo (minutos, etc). Se considera cronometrado, simple, pero genera latencia (tiempo de espera en lo que se efectúa la consulta nuevamente) y costo innecesario de recursos si no hay datos nuevos.
  Se puede considerar un sistema **proactivo** (busca trabajo).
- **Por Eventos (Event-Driven):** Cuando se genera un cambio en un origen, éste notifica (proceso) a uno o varios sistemas y ejecutan inmediatamente sus procesos correspondientes. Se utiliza más para sistemas **reactivos** en tiempo real.
  Entonces, detallando un poco más:
  - **Event-Driven (Conducido por eventos):** Paradigma o arquitectura donde el sistema notifica un cambio efectuado en su entorno a otros sistemas con la información pertinente. No indica cómo y quiénes deben actuar o procesarlo, solamente reciben el aviso de un hecho inmutable (completado) y ejecutan su propia lógica.

    Para sistemas con protocolos HTTP, se utilizan WebHooks, métodos donde el origen envía la información a un endpoint específico para ser procesada sin que el destinatario tenga que consultarla cada cierto tiempo (eficiencia de recursos).

- **Por Agenda (Scheduled / Cron):** Proceso que se ejecuta en un momento exacto del día, todos los días, semanalmente o según necesidad.
  Puede considerarse **cronológico**.

### 1.2 Información requerida

Debe determinarse la estructura de la información recibida, tanto la serialización como su semántica:

- **Serialización:** Método de transmisión de los datos recibidos, en formato binario o texto, como JSON, XML y CSV.
- **Semántica:** Significado, contexto e interpretación correcta de los datos.
  Es asegurar que el o los sistemas destinatarios entiendan la información del emisor, como metadatos o un campo y su contenido, siendo éste por ejemplo de tipo numérico, y que no lo interpreten como una cadena de texto.
  Entonces, estos sistemas al detectar el tipo de información, puedan extraerla y transformarla o procesarla a su necesidad.

En adhesión, los datos recibidos pueden ser estructurados o semi-estructurados:

- **Estructurados:** Tablas relacionales, CSV. Permiten validaciones automáticas simples pero son rígidos ante cambios.
- **Semi-estructurado:** JSON o XML. Mayor flexibilidad ante cambios pero requieren validaciones más complejas para asegurar la integridad de sus propiedades.

Por consecuente, es necesario definir si deben ser validados al inicio del proceso (Schema-on-Write, calidad y consistencia) o durante su consumo (Schema-on-Read, velocidad y flexibilidad).

### 1.3 Proveedor (Source & Sink)

Es el sistema origen de donde provienen los datos. En este punto deben analizarse los tipos de conectividad que brinda como por ejemplo WebHooks / HTTP / TLS (no todas las encriptaciones son iguales), entre otros; e incluso la velocidad permitida (Rate limit). Esto es para poder determinar si existe una herramienta que contenga compatibilidad con dichos nodos o se requiere un programa a medida.

Incluso la seguridad de la conectividad y sus protocolos de comunicación están condicionados por los tipos de dispositivos (sistemas locales y servidores) o red a la que están conectados, como _Cloud-to-Cloud_ (nube a nube), _On-Premise-to-Cloud_ (local a nube) y _On-Premise-to-On-Premise_ (local a local).

### 1.4 Volumen (Data velocity)

Se debe realizar una medición cuantitativa de datos a tratar aproximada para poder calcular el margen de operación de los mismos (relacionado al punto anterior, Rate limits). En otros términos, predecir la cantidad de consultas que realice o reciba el proceso autómata en un período promedio de tiempo.

Según el volumen de operación, se decide si el diseño del proceso debe orientarse a procesamiento por lotes (_Batch_) o de flujos (_Streaming_):

- **Batch:** Transmisión de grandes volúmenes de información por intervalos de tiempo. Requiere gran capacidad de almacenamiento temporal para el trabajo en segundo plano.
- **Streaming:** Transmisión de pequeños volúmenes de datos en alta frecuencia (por segundos o minutos). Es un enfoque a tiempo real.

### 1.5 Detección de novedades (Change Data Capture - CDC)

Este punto está relacionado a la sección 1.1, donde se utilizan estos métodos de comprobación para detectar novedades.

Estas validaciones se basan en registros nuevos, modificados o eliminados, para detectar el tipo de operación a ejecutar y eludir duplicidades redundantes de esas operaciones, haciendo un buen uso de los recursos cuando sea realmente factible.

Ahora bien, estas operaciones no deben ser redundantes pero sí **idempotentes** (repetir una acción y obtener el mismo resultado).

Este comportamiento se da para asegurar la correcta conclusión de una operación en situaciones donde un origen realiza un envío y el destino no lo recibe por algún error durante la transferencia. El origen detecta esto y reenvía el paquete hasta que se asegure de que se recibió, o en su defecto indicar que no fue posible.

Pero también hay situaciones donde el destino sí lo recibe, pero éste antes de darle la confirmación de que todo salió bien, falla la red y no es posible hacer la notificación. Pasado un tiempo, el origen detecta esto y hace el reenvío, ocasionando un doble procesamiento para un asunto que ya está resuelto.

Por tal motivo, el paquete origen contiene en sus metadatos un _Idempotency Key_, que sirve para identificar si el paquete actual ya fue recibido.

Siendo entonces la secuencia:

1. Envío de paquete con su clave idempotente.
2. El receptor antes de aceptar el paquete, busca la clave en memoria.
3. Si no existe, acepta el paquete y almacena la clave en memoria.
4. Suponiendo que la red falla, el origen hace un reenvío.
5. El receptor busca nuevamente en memoria y encuentra la misma clave, por lo cual rechaza el paquete.

Entonces, aclarado el motivo de evitar duplicidades, se emplean las siguientes técnicas de detección (métodos de la sección 1.1):

- **CDC basado en consultas:** Examina columnas clave como las de auditoría, sea su fecha de actualización o ID secuenciales: el último creado.

  Éste último método tiene una particularidad que conviene señalar: detecta solamente nuevos registros, pero no los modificados ni eliminados.

  Su funcionamiento es el siguiente:
  1. Cuando inicia lee todos los registros por primera vez y almacena el último ID.
  2. Pasado un determinado tiempo, examina si hay un nuevo ID mayor al almacenado, y si lo hay, lo guarda reemplazando el anterior.
  3. En base a este cálculo, se puede determinar la cantidad de registros nuevos desde el ID mayor antiguo hasta el ID mayor nuevo.

     Es por esto que debe analizarse bien cuándo amerita utilizarse.

- **CDC Basado en Logs:** La base de datos antes de realizar todas las operaciones solicitadas, registra en formato binario todos los cambios que va a aplicar en un archivo denominado _Transaction Log_. Posteriormente, se utilizan herramientas especializadas para leer estas transacciones.

  Esto permite detectar no solamente registros nuevos respecto a la técnica anterior, sino que también modificaciones (indicando valor anterior y nuevo) como eliminaciones sin tener que sobrecargar la base de datos con operaciones adicionales de detección.

  También permite una trazabilidad sobre todos los cambios efectuados en caso de que la base de datos falle, localizando la última operación ejecutada y permitiendo la posibilidad de recuperar datos o instrucciones que debían impactar en ella.

- **Carga total (Full Dump/Refresh):** No detecta novedades, sino que almacena todos los datos en un archivo y se utilizan desde ahí, por lo que la detección de novedades puede quedar relegada a otras herramientas si así se establece.
  Existen varias versiones de esta técnica, pero explicaré la que se utiliza como estándar:
  - **Full Dump Histórico:** Genera una carpeta y/o archivo con todos los registros vigentes de cada día.
    Posteriormente, se utilizan herramientas externas para realizar comparaciones y analizar cambios entre estos.

### 1.6 Fallas (Error Handling & Fault Tolerance)

Como parte de la decisión al momento de elegir una herramienta, debe tener en cuenta la resiliencia que esta pueda ofrecer ante determinadas situaciones de fallas, como caídas de red, caída parcial o total de una API, o datos erróneos o corruptos.

Por lo cual, se recomiendan las siguientes acciones:

- **Estrategias de reintento:** Como en lo explicado en el Nivel 2 del Módulo 1, tenemos diferentes métodos de reintentos/espera, como el _Exponential Backoff._
- **Aislamiento (Dead Letter Queue - DLQ):** Se destinan todos los mensajes de error a una carpeta o archivos secundarios para su posterior análisis, sin detener el procedimiento actual.
- **Garantías de entrega:** Establecer niveles de tolerancia sobre la integridad de la información del negocio:
  - **At-Most-Once:** El emisor envía los datos y continúa con la siguiente instrucción en vez de esperar una respuesta del receptor de que la información fue recibida.
    La opción más rápida, pero se recomienda para transmisión de datos no perjudiciales en caso de pérdida.
  - **At-Least-Once:** Aplica el concepto de idempotencia (_Idempotency Key_) para asegurar que ninguna información se pierda.
    Recomendable para información esencial, aunque genere duplicados.
  - **Exactly-Once:** A diferencia de los dos anteriores, no automatiza simplemente la transferencia de datos, sino **la coordinación de un contrato** entre dos o más sistemas.

    Utiliza idempotencia, pero combinado con un protocolo de compromiso: El proceso automatizado (coordinador, como un flujo de n8n, script, API o cualquier otra herramienta) le indica al origen que envíe los datos y que el destino los almacene de forma temporal antes de insertarlos definitivamente en una base de datos.

    El coordinador examina si ambos están listos: que el origen haya efectuado el envío (estado _OK_) y haya sido recibido por el destino (OK).

    En caso positivo, ejecuta una acción denominada _Commit_, que representa una **transacción definitiva**, retirando el bloqueo previo de la información. Caso contrario, en el que uno de los dos falle o no haya red, se realiza un _Rollback_, volviendo al punto anterior de la preparación.

    Si bien es similar al At-Least-Once cuando se trata de punto A a punto B, el verdadero fuerte está al momento de coordinar varios sistemas y/o bases de datos a la vez (sistemas distribuidos), donde todos deben estar en un estado válido (OK).

    Por lo cual, esta técnica no solamente asegura que los datos lleguen sí o sí (idempotencia) si no que permite la **atomicidad** de la transacción, es decir, protege tanto los estados y/o secuencias del proceso como la integridad de los datos de origen y destino ejecutando la operación una **única vez**, sin ocasionar duplicidades (por reintento de alguna de las partes orígenes) o pérdida de datos (reemplazo de datos incompletos). En resumen, es un proceso de "a todo o nada".

    Si bien posee un gran beneficio, su desventaja es la latencia y consumo de recursos durante la espera (por la coordinación conjunta, almacenamiento temporal de datos) respecto a las dos técnicas previas.

    Por lo dicho previamente, existen dos evoluciones de esta técnica:
    1. Los sistemas en espera pueden decidir entre todos si cesar la espera en caso de que no responda el coordinador, pero el costo de recursos es tan alto que sencillamente no se implementa.
    2. Los sistemas eligen un nuevo coordinador en milisegundos a partir de un comité de coordinadores, que son en realidad un clúster de servidores para prestar sus servicios.

### 1.7 Resultado esperado (Delivery & State Management)

Es el estado en el que deben quedar los datos finales, como también enviar una confirmación de que el proceso se ejecutó correctamente.

Además, se acoplan funciones de telemetría para indicar todas las fases y estados de los procesos automáticos, ya que sin ellas no sabríamos cómo rinde verdaderamente. Por lo cual, el proceso pasaría de ser una "caja negra" a una "caja blanca".

Por consiguiente, deben asegurarse los siguientes estados:

- **Estrategia de escritura:** Es la acción de escritura que ejecuta el proceso o _pipeline_ (conjunto de procesos donde un resultado de su salida es la entrada de otros) sobre archivos o base de datos finales.
  Existen generalmente tres estrategias:
  1. **Append-Only:** Registra todos los datos nuevos junto con los antiguos, independientemente si existían o no. Permite tener un historial de cambios, aunque se necesitan herramientas para saber qué cambió. Similar al CDC basado en Logs o Full Dump de la sección 1.5.
  2. **Upsert / Merge:** Es una acción de actualización combinada, formada entre las sentencias _Update_ e _Insert_, proporcionando este acrónimo.

     Es similar a la estrategia anterior, al ingresar todos los datos nuevos, con la excepción de que en caso de que ya existan (mediante ID), los sobreescribe, independientemente si contienen información actualizada o no.

     Se utiliza para tener una presentación vigente de los datos y sin duplicidades, donde interesa más la información del día a día que una histórica, facilitando las consultas al no tener que usar herramientas de comparación. Es el estándar para base de datos operacionales (dedicadas a transacciones en tiempo real), CRMs (software de gestión empresarial de ventas, clientes, soporte y análisis de datos) y otros sistemas transaccionales.

  3. **Overwrite:** Acomete una sobreescritura total en la tabla destino o elimina el archivo y crea uno nuevo (si es un log). No existe entonces necesidad de comparar cambios al tener siempre una versión única y reciente de la información, sin historiales.

     Se recomienda para pequeños lotes de datos, ya que a mayor volumen, mayor tiempo de escritura y por ende mayor consumo de recursos por tiempo prolongado.

  En general, ninguna estrategia es mejor que la otra, sino que se utilizan para resolver necesidades específicas.

  Entonces concluyendo: Append-Only para mantener un historial de inserción, modificación y eliminación; Upsert para presentar solamente la información vigente, pero sin limpiar o anotar e indicar registros que tendrían que ser eliminados; y Overwrite actúa igual que el Upsert pero elimina los datos que ya no necesarios, siendo un método más barato que agregar lógica de comparación al Upsert.

- **Idempotencia final:** Como parte del resultado esperado, debe existir idempotencia en el proceso, como se ha explicado anteriormente, para asegurar el envío y almacenamiento de datos.

  Por ejemplo, la estrategia de escritura Upsert implementa idempotencia de forma implícita o indirecta al directamente sobreescribir un dato en vez de rechazarlo. Mientras que al utilizar el método Append-Only, se necesita de herramientas que ayuden a detectar la unicidad de los datos. Y con Overwrite ya sabemos que podemos prescindir de análisis.

- **Mecanismos de observabilidad:** Luego de definir el estado esperado en el que se deben almacenar los datos, deben establecerse medidores clave de los subprocesos y estados del pipeline:
  - **Linaje de los datos:** Columnas o campos a forma de metadatos que registre tiempo de creación como también un identificador del pipeline de donde provino.
    Permite trazar tanto fecha como origen en caso de que un dato esté corrupto, por ejemplo.
  - **Notificación de estado:** Indicar a sistemas destinos o dedicados exclusivamente al análisis de automatizaciones: el volumen de datos, errores ocurridos, tiempo de ejecución y resultados obtenidos.
    Puede ser mediante webhooks para visualización de rendimiento en tiempo real.
  - **Mecanismo de desvío:** Aplicar DLQ (detallado en la sección 1.6) para desvíar datos corruptos y permitir que el resto de los datos sanos prosigan su trayectoria.
    Los datos corruptos serán analizados posteriormente manualmente.

## 2. Dependencias externas

Así como se deben analizar diferentes puntos de un problema al momento de afrontarlo, también deben analizarse las dependencias externas con las cuales trabaja un sistema o proceso automatizado.

Es fundamental ya que dependiendo de cómo estén programadas, el sistema o proceso debe diseñarse de tal manera para que pueda ofrecer la mayoría de sus funciones en caso de que la dependencia no responda a tiempo o esté caída.

### 2.1 Disponibilidad

Define la promesa de disponibilidad tanto de forma continua (24/7) como asíncrona (dentro de un determinado horario de trabajo, por ejemplo), así como también tiempo estimado de fuera de servicio durante el día, mes o año, detectando si puede ser perjudicial o no para la necesidad de un sistema.

### 2.2 Autenticación

El tipo de seguridad que ofrece al sistema, como otorgar credenciales e identificadores únicos (como tokens) o aplicar restricciones de red (lista blanca de IPs) para que reconozca el sistema que realiza la consulta y no un atacante que busque información almacenada de la organización en esa dependencia.

Asimismo, aplica de manera viceversa, ya que el sistema debe identificar si, por ejemplo, un evento, pertenece a la dependencia oficial o un impostor.

### 2.3 Versionado

Es importante también que el proveedor mantenga un historial de versiones sobre sus servicios con tal de no dejar deshabilitadas las funciones propias del sistema requirente, actualizando o agregando nuevos servicios o recursos mediante el avance secuencial del versionado y permitiendo aún el acceso a los antiguos servicios de forma temporal, para permitir al equipo de mantenimiento del sistema actualizarlo de acuerdo a las nuevas características.

Es el nivel de riesgo (seguridad y costo) de obsolescencia y mantenimiento que se admite.

### 2.4 Límites

Como hemos visto en ocasiones anteriores, es importante establecer estrategias de reintentos, en este caso para la comunicación del sistema hacia la dependencia, evitando bloquear o perjudicar los procesos del cliente por exceso de solicitudes. La dependencia no sabe diferenciar entre el sistema legítimo y un atacante en lo que a intentos se refiere.

También aplica de forma viceversa, donde el sistema debería tratar de no bloquear la dependencia. Tener en cuenta entonces los identificadores de la sección 2.2, para permitir el flujo de información pretendido entre ambos sin retrasos innecesarios.

### 2.5 Paginación

También examinar el volumen de información provista por el servicio, teniendo que analizar si resulta necesario paginar la información o si ya proviene paginada. Todo esto es para predecir el rendimiento estimado en la obtención de datos (en la memoria) o si se obtiene la suficiente información por paginación según lo que requiere el sistema.

El rendimiento puede ser esencial o no, dependiendo del propósito; suele priorizarse la completitud de los datos.

### 2.6 Formato

Referido al formato de datos a gestionar (si sigue algún estándar, como alguna ISO en particular) y transformar según lógica de negocio. Cómo maneja los valores por defecto (si son nulos en caso de dato no existente) o formato UTF-8 para texto, por mencionar algunos ejemplos.

### 2.7 Errores

Qué tipos de errores maneja la dependencia, qué estándar utiliza (si respeta los códigos HTTP, por ejemplo), si brindan la información suficiente para entenderlos (tanto para el sistema como para un humano, proporcionada por el propio manejo de errores o la documentación) y solucionarlos, y cuánto debe adaptarse el diseño del sistema al manejo de estos errores (tiempo y costos asociados a la adaptabilidad; mientras más integral o dinámica sea la dependencia, mejor).

Se relacionan también los métodos de idempotencia o estrategia de reintentos como parte de las soluciones.

### 2.8 SLA (Service Level Agreement)

Acuerdo del nivel del servicio en español, es un contrato formal documentado entre el proveedor y cliente, siendo personas humanas o jurídicas.

**\*NOTA:** Los servicios gratuitos no suelen incluirlo.\*

Generalmente establecen los siguientes puntos:

- **Definición de entrega:** El proveedor especifica qué servicios y/o resultados ofrece al cliente (cómo un 95% de efectividad o 99,9% de disponibilidad). Así también los roles y responsabilidades legales de ambos y medios de comunicación.
- **Medición de rendimiento:** Definir qué métricas objetivas se utilizan e indicadores que den el resumen de la información conjunta.
  Adheriendo definición de estos conceptos:
  1. **Métrica:** Medición de datos cuantitativa sobre un determinado proceso o estado.
  2. **Métrica objetiva:** Designada a datos absolutos que no den lugar a información o análisis subjetivos.
  3. **Indicadores:** También conocidos como KPI (_Key Performance Indicator_; Indicador Clave de Rendimiento), conforma un resumen de información sobre un determinado asunto en base a datos aislados.

     Mide el rendimiento del negocio, referido hasta qué punto cumplió el objetivo o resultados propuestos. Aunque un cumplimiento parcial no significa necesariamente una baja en la calidad del nivel del servicio, sino que puede ser un estado del progreso, según el período en que se revise el indicador.

     Ejemplo: Tres métricas que detectan: Compra de stock, venta de stock y semanas del mes. Un indicador podría revelar que solamente el 20% del stock adquirido fue vendido en la semana pasada (indicador estático) o porcentaje de venta vigente sin haber concluido el período semanal (indicador a tiempo real).

- **Evasión de conflictos:** Se establece también como una forma de guía neutral ante desacuerdos, no pudiendo objetar ninguna de las partes sobre lo que declara el contrato, reduciendo así también malentendidos y sorpresas.
- **Penalizaciones:** Se detallan pautas de consecuencias y/o compensaciones por incumplimiento de la calidad del nivel ofrecido por parte del proveedor.
  Pueden ser compensaciones económicas o soluciones a menor costo o gratuitas.

## 3. Idempotencia

Según el tipo de proceso que se aplique, podría obtener registros duplicados o una sobreescritura del mismo.

Para la evasión de duplicados, aplicaría una identificación para cada operación del proceso en sus metadatos, que utilizará el sistema destino, para verificar si una acción se cometió anteriormente o no. Aunque dependiendo del propósito de la operación, puede preferirse si se sobreescriben o no, para asegurar el recibo de los datos.

## 4. Retries

Si bien en el nivel anterior profundizamos sobre estrategias de reintento, vale la pena también agregar nuevos puntos o perspectivas de análisis al momento de definir qué reintentos son necesarios y cuándo realizarlos, su tiempo de espera y asegurar también que la petición u origen no sean bloqueados.

### 4.1 Errores reintentables

Cuando un servicio o funcionalidad de un sistema falla, no siempre debe aplicarse una estrategia de reintento prioritaria sobre el tal, sino que debe basarse en las prioridades del negocio.

Por ejemplo, reintentar sobre estados absolutos (que no poseen alternativas de resultados al repetir el proceso) como `400 Bad Request`, `401 Unauthorized` o `404 Not Found`, solo generaría consumo de recursos innecesarios. Por lo cual, solo conviene reintentar sobre errores de estado `5xx`.

### 4.2 Cantidad

No deben realizarse muchas solicitudes, sino las necesarias que permitan un tiempo de espera al destino para que retorne una respuesta y no sobresaturarlo, ocasionando alguna caída o bloqueo.

### 4.3 Tiempo de espera

Se define el lapso de tiempo que debe esperar un sistema o cliente para consultar entre peticiones (backoff), así como también el tiempo total de espera que se admite luego de varios reintentos para lanzar un error definitivo ante la incomunicación.

### 4.4 Seguridad de repetición

Relacionado a la cantidad de reintentos, también hay que considerar cuándo es seguro repetir la operación, ya que la falla de un servicio externo no es el único factor de no recibir respuesta, sino también factores como la estabilidad de red o propios, donde la petición realizada no posee los datos necesarios.

Además, teniendo en cuenta que un reintento es en sí mismo un comportamiento idempotente, hay que tener en cuenta si el reintento a ejecutar es de lectura (`GET`) o de insersión, modificación o eliminación (`POST`, `PUT`, `DELETE`), siendo estos últimos tres los métodos más críticos al momento de interactuar con registros, pudiendo ocasionar consecuencias no deseadas (como cobrarle tres veces a un usuario). Acá entonces es que se integra la Idempotency Key mencionada anteriormente.

## 5. Observabilidad mínima

La mayoría de sistemas, deben tener indicadores que informen sobre los procesos y estados del mismo.
Aunque este tema ya ha sido explayado anteriormente, deben aclararse las fases esenciales que deben ser observables para la trazabilidad y cumplimientos de objetivos:

1. **Inicio:** Debe medirse en qué momento se recibe la solicitud y cuánto tiempo tarda en ser procesada (tiempo en cola),validar que sean datos correctos y cuántas solicitudes puede manejar a la vez.
2. **Operación:** Qué endpoint fue solicitado, qué función se ejecuta, tiempo estimado e inyectar un ID a la solicitud para tener un seguimiento de ella a través de los diferentes microservicios que pudieran existir.
3. **Resultado:** Estado del resultado, efectos colaterales o en cadena producidos por el mismo.
4. **Duración:** Tiempo total transcurrido desde el inicio hasta el final. Permite medir promedio de rendimiento a largo plazo, detectando degradaciones o comparar mejoras de eficiencia.
5. **Cantidad procesada:** Elementos afectados durante el proceso, como modificación de registros, volumen de la información total. Se mide el rendimiento ante bajas y altas cargas en el sistema.
6. **Errores relevantes:** Conservar el error producido en alguna fase del proceso, como también frecuencia en dónde ocurre.

Un último punto a remarcar, es que las herramientas de observabilidad **no almacenen secretos**, es decir, datos sensibles de los usuarios, de la organización o credenciales propias del sistema, ya que todos estos datos corren el riesgo de ser filtrados en logs de trazabilidad. Solamente centrarse en términos de rendimiento y estado de saneamiento del sistema y de los datos.

## 6. Configuración de un proyecto

Durante el desarrollo de un proyecto, suelen utilizarse credenciales, URLs u otros datos sensibles, de desarrollo o pruebas. Estos datos no deben ser desplegados al momento de pasar a producción, y si así fuese, no deben estar a la vista.

Por esta razón, existe el archivo `.env`, utilizado para almacenar secretos del sistema en forma de **variables de entorno**, que pueden ser invocadas en cualquier nivel de jerarquía de carpetas o archivos, sin saber cualquier persona (malintencionada o no) el valor que debe poseer dicha variable.

Por lo tanto, la información más común a reservar son:

- **URLs:** Como la que se utiliza para comunicarse a un Backend o a un servicio externo. Además, pueden cambiar según si el proyecto está en desarrollo, pruebas o producción.
- **Timeout:** Si bien no es información sensible, es conveniente tenerlo en el `.env` al momento de desarrollar o tener pruebas, ya que cada uno puede manejar tiempos diferentes. Además, si en producción el sistema empieza a saturarse, puede cambiarse su valor en "caliente" para reducir el tiempo de espera de solicitudes o reintentos y liberar recursos.
- **Credenciales:** Como tokens de acceso especiales (nivel desarrollo o administrador), API keys o usuarios y contraseñas para una base de datos.
- **Paginación:** Establece valores por defecto si un usuario o cliente no especifica cantidad, como también límites de paginación según la carga que el sistema pueda manejar.

Por último, es importante que el `.env` sea declarado dentro del archivo `.gitignore`. Esto permite que al momento de subirlo a un repositorio, que puede utilizarse para luego subirse a producción, ignore todos los archivos o carpetas que no son imprescindibles, como librerías de desarrollo, pruebas, o el mismo `.env`, reduciendo así también el tamaño del proyecto para agilizar posteriores descargas o implementaciones.

## 7. Validación de supuestos

Es importante verificar que los datos recibidos posean la estructura y tipos esperados.
No es lo mismo recibir un número, un texto plano o un JSON.

Tomando el ejemplo de `items`, debería validarse si es un arreglo con valores simples, lista de objetos (compuestos), o si es en sí mismo una propiedad de un objeto.

Esta estrategia de validación se denomina **programación defensiva**.

En adhesión, no se trata solamente de validar estructuras de datos, sino cómo manejarlos si se recibe una solicitud o respuesta inesperada, retornando un error o transformar los datos y establecer valores por defecto si no existen, evitando la interrupción del sistema.

## 8. Definición de _Done_

Refiere a las condiciones de cumplimiento, ejecución y documentación de una tarea, en este caso, sobre una porción de software (sistema más documentación).

En general, es un acuerdo de calidad de un equipo sobre un entregable, donde debe indicarse:

- Los requisitos, comandos y secuencia a seguir para su reejecución por parte de otras personas o incluso a una IA (si debe activarlo en producción);
- funcionamiento y/o comportamiento esperado del código entregable;
- qué errores pueden esperarse y cómo se manejan (como el ejemplo del tratamiento de `items` mencionado);
- no detallar secretos como en comentado en la sección 6;
- cómo puede ser diagnosticado mediante herramientas de consultas como Postman, Thunder o Swagger (OpenAPI, formato de documentación de endpoints y códigos de estados. Swagger es la herramienta para facilitar su lectura y prueba);
- y contrastar los resultados obtenidos respecto del objetivo a alcanzar (requerimientos).
