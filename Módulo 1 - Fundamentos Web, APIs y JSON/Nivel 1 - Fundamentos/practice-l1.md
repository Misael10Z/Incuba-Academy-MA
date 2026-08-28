# **Nivel 1 - Fundamentos - Práctica**



## 1. Primera request

* **Cliente:** Google Chrome, Postman.
* **Método:** GET.
* **Endpoint:** https://dummyjson.com/users/1.
* **Body:**

```JSON
{
  "id": 1,
  "firstName": "Emily",
  "lastName": "Johnson",
  "maidenName": "Smith",
  "age": 29,
  "gender": "female",
  "email": "emily.johnson@x.dummyjson.com",
  "phone": "+81 965-431-3024",
  "username": "emilys",
  "password": "emilyspass",
  "birthDate": "1996-5-30",
  "image": "https://dummyjson.com/icon/emilys/128",
  "bloodGroup": "O-",
  "height": 193.24,
  "weight": 63.16,
  "eyeColor": "Green",
  "hair": {
    "color": "Brown",
    "type": "Curly"
  },
  "ip": "42.48.100.32",
  "address": {
    "address": "626 Main Street",
    "city": "Phoenix",
    "state": "Mississippi",
    "stateCode": "MS",
    "postalCode": "29112",
    "coordinates": {
      "lat": -77.16213,
      "lng": -92.084824
    },
    "country": "United States"
  },
  "macAddress": "47:fa:41:18:ec:eb",
  "university": "University of Wisconsin--Madison",
  "bank": {
    "cardExpire": "05/28",
    "cardNumber": "3693233511855044",
    "cardType": "Diners Club International",
    "currency": "GBP",
    "iban": "GB74MH2UZLR9TRPHYNU8F8"
  },
  "company": {
    "department": "Engineering",
    "name": "Dooley, Kozey and Cronin",
    "title": "Sales Manager",
    "address": {
      "address": "263 Tenth Street",
      "city": "San Francisco",
      "state": "Wisconsin",
      "stateCode": "WI",
      "postalCode": "37657",
      "coordinates": {
        "lat": 71.814525,
        "lng": -161.150263
      },
      "country": "United States"
    }
  },
  "ein": "977-175",
  "ssn": "900-590-289",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36",
  "crypto": {
    "coin": "Bitcoin",
    "wallet": "0xb9fc2fe63b2a6c003f1c324c3bfa53259162181a",
    "network": "Ethereum (ERC20)"
  },
  "role": "admin"
}
```

* **Status:** 304 Not Modified (Google Chrome) / 200 OK (Postman).
* **Campos (5):**
  1. ```JSON
     "firstName": "Emily"
     ```

     Tipo string, el valor al ser variable (carácteres/longitud) es encomillado, lo que lo convierte en un valor adaptable o "comodín".
  2. ```JSON
     "age": 29
     ```

     Tipo number, no es necesario encomillarlo, ya que es un valor absoluto.
  3. ```JSON
     "image": "https://dummyjson.com/icon/emilys/128"
     ```

     Como en el primer campo, string, pero en este caso podemos almacenar una URL o endpoint.
  4. ```JSON
     "hair": {
       "color": "Brown",
       "type": "Curly"
     }
     ```

     Tipo objeto, permite almacenar un grupo de claves-valores de forma organizada.
  5. ```JSON
     "cardExpire": "05/28"
     ```

     Tipo string, utilizado para almacenar una fecha.

***NOTA:** No se encontraron booleanos ni arrays.*



## 2. Colección

* Explicación del endpoint:

  * **Método:** GET, indica solicitud de lectura.
  * **products:** Especifica que la lectura debe realizarse en la ruta de productos.
  * **total:** Representa la cantidad total de productos, en este caso 194.
  * **skip:** Es un Query Param en la URL, e indica la cantidad de primeros registros a saltarse, es decir, la posición desde donde comienza la lectura, dentro del rango total de registros. En este caso es 0, por lo que comienza desde el primer registro.
  * **limit:** Otro Query Param, establece el límite de registros a leer.
    Combinado con el "skip", puede indicarse que lea los primeros 5 registros desde la posición N.



## 3. Status codes reales

***NOTA:** Las investigaciones se basan en el status code obtenido y en los posibles mensajes que la API pueda devolver en el body.*

* **http/200:**

  * **Status code:**
    ```HTTP
    304 Not Modified
    ```
  * **Body:**
    ```JSON
    {
    "status": 200,
    "message": "OK"
    }
    ```
  * **Investigación:** Verificaría que realmente haya recibido los datos previstos en el body (objetos/arrays) ya que aunque haya sido satisfactoria (ciclo completado) puede haber un retorno "falso" o vacío dentro del mismo, lo que indicaría un error humano o que no existen registros.
* **http/404:**

  * **Status code:**

    ```HTTP
    404 Not Found
    ```
  * **Body:**

    ```JSON
    {
      "status": 404,
      "title": "Not Found",
      "type": "about:blank",
      "detail": "Not Found",
      "message": "Not Found"
    }
    ```
  * **Investigación:** Detectar a qué ruta el cliente quizo realizar la solicitud, verificar si existe una ruta similar y determinar si es un error de escritura en la URL por parte del cliente o de la propia API (URL de un botón o del endpoint).
    Solución si es error del cliente: predeciría la ruta a la que quizo acceder y sugerírsela, y a su vez una URL a la página anterior o "home" en caso de que no existiera.
    Si es de la API: se corrige el endpoint/URL.
* **http/500:**

  * **Status code:**

    ```HTTP
    500 Internal Server Error
    ```
  * **Body:**

    ```JSON
    {
    "status": 500,
    "title": "Internal Server Error",
    "type": "about:blank",
    "detail": "Internal Server Error",
    "message": "Internal Server Error"
    }
    ```
  * **Investigación:** Verificaría el estado de conexión de API → Servidor/Base de datos.



## 4. Inspección HTTP

* **"Accept":** Múltiples formatos aceptados para el envío de datos.
* **"Host":** Destino o dominio donde debe enviarse la petición.
* **"Accept-Language":** Lenguaje aceptado para el tratamiento de datos.



## 5. Negocio

Una API es un programa intermediario que le permite a un cliente, es decir un usuario o un sistema que usted utilice, interactuar con otro sistema, mediante el intercambio de información.
	Este intercambio de información generalmente se da por consultas, creación modificación o eliminación de datos, a través de URLs, que son las diferentes direcciones o puertas de la API. Como por ejemplo la puerta para consultar listas de usuarios, la de crear uno nuevo o borrarlo.
	Ahora, dependiendo de la necesidad de su negocio, este intercambio puede ser gestionado visualmente por un usuario, sea a través de un celular o pc, y en caso de que se utilice para automatizar un proceso en particular, no será necesario crear una pantalla de visualización.
