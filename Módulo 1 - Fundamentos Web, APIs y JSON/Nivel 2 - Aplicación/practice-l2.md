# Nivel 2 - Aplicación - Práctica

## 1. 1º GET con `limit`, `skip` y `select`

- **Limit:** Instrucción o parámetro que establece la cantidad de registros a recuperar de una tabla de base de datos.
  	En este caso, `limit=5` restringe la búsqueda a solo cinco registros.
- **Skip:** Indica la cantidad de primeros registros que debe omitir o saltarse.
  	En este caso, `skip=10` ordena ignorar los primeros diez registros.
- **Select:** Determina los campos que debe inspeccionar y extraer de la tabla.
  	En este caso, `select=firstName,age` precisa dos campos: `firstName` (primer nombre) y `age` (edad).

## 2. 2º GET con `q`

El parámetro de consulta es `q`: define que debe obtener todos aquellos registros que posean una combinación de carácteres específica (letras, números, símbolos, etc) en cualquier campo o en los que se precisen.
	Por lo tanto, parámetro `q=phone` instruye buscar todos los registros que posean la palabra "phone" en cualquiera de sus campos.

## 3. Script de Node.js

### 3.2 Error `500`

### 3.1 Consulta de productos

- **Línea 1:** `try {`

  Inicializamos `try...catch` para poder principalmente capturar errores.
  	Dentro de `try` se escribe la lógica principal que nos interesa ejecutar. Luego en `catch`, escribimos lógica para manejo de errores del bloque `try`.
- **Línea 3:** `const response = await fetch("https://dummyjson.com/products?limit=10&skip=0");`

  Declaramos la variable `response` en forma de constante (`const`) para mantener valores o datos inmutables (solo para el dato principal, como un número, cadena de texto, objeto o arreglo, teniendo estos dos últimos pequeñas "excepciones", donde las propiedades o elementos, respectivamente, pueden modificarse. Es decir, solo mantiene intacto el valor inicial en ambos casos) para poder almacenar los datos de la consulta, la cual se realiza mediante la función `fetch()` para solicitudes vía URL.
  	Cabe aclarar que debe adherise la expresión `await` previo al `fetch()` para indicarle al programa que debe esperar a que éste último retorne una respuesta.
- **Línea 6:**

```tsx
if (!response.ok) throw new Error(
        `Response's OK: ${response.ok}, code status: ${response.status}.`
    );
```

Se realiza una comprobación negativa mediante un `if` al estado general de la respuesta recibida por el `fetch()` en `response.ok`.
	Si la condición se cumple, esto es, que el estado sea `false`, determina que no se han recibido los datos de la solicitud, por lo cual lanzará un error de excepción que detendrá el programa o script e imprimirá en consola el estado general y su código de estado `(response.status)`.

***NOTA:** La validación o comprobación negativa refiere a verificar de manera indirecta el valor o tipo de una variable en vez de consultar directamente por el de nuestro interés. Todas las validaciones de este script son de esta forma para poder manejar errores específicos más fácilmente y de manera eficiente.*

- **Línea 10:**  `console.log(Response's OK: ${response.ok});`

  En este momento la condición de la validación previa debió no cumplirse por lo que la siguiente instrucción a ejecutar es la impresión del estado general de la respuesta en consola.
- **Línea 12:** `const data: unknown = await response.json();`

  Los datos de la respuesta son convertidos a formato JSON mediante el método `response.json()`. Acá también debe declararse la expresión `await` previamente para aplicar la misma lógica detallada anteriormente.
  	Posteriormente, estos datos en formato `JSON` son al almacenados en la constante `data`, que a su vez ésta posee un tipado estático de TypeScript especificando que los datos que recibe o va a guardar son de tipo `unknown` (desconocido). Esto se debe a que la información extraída por `fetch()` incluye diferentes tipos de datos que, si bien podríamos deducir uno por uno para crear una interfaz de tipos general para todos ellos, se considera recomendable crearlos solo para aquellos datos que se utilizan durante la ejecución, evitando generación de tipados que no terminen utilizándose (en consecuencia mejorando la legibilidad y claridad del código).
- **Línea 14:**

```tsx
if (typeof data !== "object" || data === null) throw new Error(
        `Data is not an object.`
    );
```

A partir de esta línea se empiezan a realizar validaciones para ir definiendo paso a paso el tipo de dato de `data`.

- En esta línea, se comprueba si `data` es tipo `object` mediante dos condiciones.
  En la primer condición, se utiliza la expresión `typeof` para generar un valor en cadena de texto en base al tipo de dato de una variable (la respuesta de esta expresión siempre será un `string`). Luego, mediante el operador `!==` verificamos que `data` sea distinto a un `"object"` (mismo valor que devuelve `typeof`, por eso se encuentra encomillado).
- Ahora se prosigue con el operador `||` para concatenar la siguiente condición: se valida que `data` sea igual a `null`. Se establece de esta manera ya que si `data` fuera `null` y no lo validamos, `if()` interpretará `data` o `null` como si fuera un `object` a pesar de no cumplirse o validarse la primer condición.
  	Si ninguna de las dos condiciones se cumplen, el script proseguirá a la siguiente validación, caso contrario, lanzará una excepción.
- **Línea 17:**

```tsx
if (!("products" in data)) throw new Error(
        `Property "products" not exist.`
    );
```

Al pasar la comprobación de tipo `object` anterior, TypeScript entiende automáticamente que justamente `data` es un `object`, infiriéndole inmediatamente este tipo a `data` para reemplazar al anterior, `unknown`.
	En este `if()`, se busca detectar si la propiedad `"products"` existe dentro de `data`, para que TypeScript detecte que pertenece a un objeto real. Si no existe, lanzará error.

***NOTA:** La inferencia es la capacidad de TypeScript de deducir el tipo de dato de una variable cuando no se declara de manera explícita (type narrowing o estrechamiento de tipos). Esto lo hace mediante el valor que se asigna a dicha variable. Y como pudimos ver, también aplica para validaciones `if()` al analizar la lógica de todo el archivo.*

- **Línea 20:**

```tsx
if (!Array.isArray(data.products)) throw new Error(
        `"products" is not an array.`
    );
```

Analiza si `data.products` es un arreglo. Entonces además de considerar `"products"` como propiedad de un objeto, a la vez define su tipo de dato.

- **Línea 24:**

```tsx
data.products.forEach((p, index) => {

        if (typeof p.id !== "number") throw new Error(
            `Product at index [${index}]: property "id" is not a number: ${p.id}.`
        )
        if (typeof p.title !== "string") throw new Error(
            `Product at index [${index}]: property "title" is not a string: ${p.title}.`
        )
        if (typeof p.price !== "number") throw new Error(
            `Product at index [${index}]: property "price" is not a number: ${p.price}.`
        )
    });
```

En esta sección se busca verificar que los elementos dentro de `products` posean los campos `id`, `title` y `price` y a su vez asegurar sus tipos. Si bien existen más campos, como mencioné anteriormente, solo nos interesa validar aquellos que se tratarán.
Se declara el parámetro `p` para representar cada elemento del arreglo y acceder a sus propiedades, y también el parámetro `index` para indicar la posición en donde el campo o dato no existe, o el tipo es inválido.

- **Línea 37:** `console.table(data.products, ["id", "title", "price"]);`

  Una vez validado `response` en su totalidad (o parcialmente, de acuerdo a nuestro objetivo), se instruye imprimir los diez registros de `products` mediante `console.table()` para que organice y presente los datos automáticamente en una tabla, permitiendo una mayor claridad de observación o lectura sobre la información recibida.
- **Línea 39:**

```tsx
} catch(e) {
    console.log(
        `Query error.\n${e}`
    );
}
```

Bloque `catch`. Utilizado para manejar todos los errores que puedan surgir durante el `try`. Este `catch` posee como parámetro la abreviación `e` (errores) donde recibirá toda la información lanzada por las excepciones. Adicionalmente, posee un `console.log()` para mostrar un mensaje de error genérico en caso de que haya algún tipo de error no contemplado durante la ejecución del código.

Para el manejo de este error (consulta `fetch()`comentada en la línea 4) se utiliza simplemente la validación de la línea 6.

Un detalle a aclarar es que decidí universalizar en este `if()` el manejo de errores o códigos de estado para que no cubra solamente el error `500` sino también al resto de su especie *5xx* como también errores *4xx*.

### 3.3 Decisiones técnicas

Quiero también explicar otras decisiones técnicas (como la del error `500`) en base a la investigación que efectué, utilizando herramientas como ChatGPT, Codex y Gemini, de las diferentes formas que existen de resolver las siguientes cuestiones:

- **TypeScript antes que JavaScript:** Sencillamente es una razón de gusto personal, ya que prefiero que mi código sea seguro y lo más robusto, ordenado y estricto posible en cuanto a manejo de datos, que bien esto también puede considerarse como una decisión técnica.
  	Entonces, gracias a este lenguaje o extensión de tipos JS, pude aprender más sobre estos temas que si hubiera usado JS.
- **Extensión `.mts` del script:** Esto es debido a que la expresión `await` no funciona en un script sin una `async function()` o si el script no es detectado como un módulo `ES Modules`, siendo estas dos formas válidas en una extensión `.ts` o `.js` normal. Por lo tanto, al utilizar `.mts`, le decimos a Node que interprete este archivo como un módulo, para poder utilizar `await`en`top-level`(o sea, cuando no está asocido a un bloque de`async function()`, sino en un bloque general o que está "suelto", como en este caso en un `try...catch`).
  	Otra forma de convertir el script en un módulo es inicializando un `export {}` al inicio del archivo.
- `console.table()`**:** En un principio esta no fué la primer forma que utilicé para imprimir los resultados, y tiene que ver con lo siguiente:

  1. La primera manera fué utilizando un `map()` para iterar sobre todos los elementos del arreglo e imprimirlos mediante un simple `console.log()`.
     	El motivo de haber descartado esta opción fué que, según lo aprendido, genera un nuevo arreglo en memoria con elementos `undefined` (de acuerdo a los campos seleccionados). Si bien la impresión ocurre de manera correcta y sin errores, la generación de este nuevo arreglo produce una carga innecesaria e indeseable sobre los recursos del dispositivo, **haciendo que el script pierda su propósito de simplicidad y eficiencia**.
     	En conclusión, esta función suele utilizarse para generar un nuevo arreglo que **será almacenado para posteriormente ser tratado** y mantener el arreglo original intacto.
  2. La segunda opción, fué utilizar un `forEach()`, que itera sobre el arreglo actual y no genera ninguno nuevo, e imprime los resultados.
     	La decisión de no haber dejado esta función fué al momento de querer presentar la información de manera organizada mediante `console.log()`:

     `console.log(`ID: ${p.id}, Title: ${p.title}, Price: ${p.price}`);`

     Durante ese momento, recordé que existía un método de presentar la información en formato de tabla, y aquí es donde averigüo cuál era y ahora sabemos que es `console.table()`.
     	Entonces, el motivo de haber elegido este método de `console` es su ventaja de llevar a cabo dos procesos en uno: itera automáticamente sobre el arreglo los campos que especifiquemos y los imprime de manera ordenada en columnas con sus respectivos nombres de campo. Y tampoco sobrecarga la memoria.
- **Tipado:** En un inicio pensé en tipar los datos de `response` mediante `types` e `interfaces` para validar estáticamente, pero luego las reemplaze por las validaciones en tiempo de ejecución.
  	La razón de este cambio es que si bien el tipado estático asegura una correcta escritura de código sin contradicciones de tipos de datos y genera predicciones de código durante el desarrollo, **no asegura que los datos recibidos cumplan con la estructura establecida**.
  	Ahora bien, según el estándar, se recomienda utilizar ambos enfoques, ya que ninguno tiene porque ser excluyente del otro. Esto duplicaría la efectividad y seguridad del código en general, en cualquier script o API.
  	Entonces, aunque toda la validación en este script es en tiempo de ejecución, hay una línea de código en donde se produce este híbrido, la línea 12:

  `const data: unknown = await response.json();`

  En esta línea, se hace uso del tipado estático `unknown` para indicarle a TypeScript que los tipos de los datos recibidos de la API externa son desconocidos, agregando más claridad al código sobre la información que se está tratando. Acá entonces es donde sabemos que comienza el proceso de deducción de tipos.
