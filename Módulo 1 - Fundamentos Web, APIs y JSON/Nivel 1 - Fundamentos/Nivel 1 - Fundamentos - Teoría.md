# **Nivel 1 - Fundamentos - Teoría**

## 1. Caso completo:

* **GET:** realizado por el cliente.
* **Endpoint:** URL de clientes, especificando al cliente con el ID 123.
* **Content-Type:** no pertenece al body, por lo que no lo envió.
* **JSON:** Solicitó una respuesta en forma de objeto.
* **200:** con el mensaje "OK", recibio tanto el formato de la respuesta como el body.
* **Body:** Contiene el ID, nombre y estado de un cliente determiando.


## 2. Checklist

* **Cliente:** Usuario o sistema que realiza la petición.
* **Servidor:** Sistema que recibe la petición, la procesa, ejecuta lógica y retorna una respuesta.
* **Request:** Es la petición en sí misma, e incluye origen (cliente), metadatos (headers) y destino (url/endpoint).
* **Response:** Respuesta/resultado que recibe el cliente desde el servidor, sea número, string, objeto, JSON, array, etc.
* **HTTP:** Protocolo de red seguro para intercambio de información o datos.
* **URL/Endpoint:** Ruta de API o aplicación para recibir y/o retornar datos mediante protocolo HTTP.
* **Métodos:** Tipos de consulta o petición para un endpoint determinado. Permite diferenciar los tipos de acciones que se quieren realizar mediante una API:

  * **GET:** Lectura de datos.
  * **POST:** Inserción de datos.
  * **UPDATE:** Actualización de datos.
  * **DELETE:** Eliminación (ocultación, según lógica de negocio) de datos.
  * **PATCH:** Modificación parcial de datos (ej. un "status").
* **Status codes:** Especifica el tipo de respuesta recibida desde el endpoint/API:

  * **2xx, solicitudes satisfactorias:**
    * 200, OK: Solicitud completada (generalmente GET).
    * 201, Created: Nuevo recurso creado (POST).
    * 203, Modified: Recurso modificado (PUT/PATCH).
  * **4xx, solicitudes fallidas:**
    * 400, Error: Contrario a 200, indica solicitud fallida/interrumpida.
    * 401, Unauthentic: Cliente no posee una sesión (token) para el sistema/servidor.
    * 402, Unauthorized: Cliente posee sesión pero no está autorizado (rol) a realizar determinada petición.
    * 403, Forbidden: La petición en particular está prohibida (petición no prevista o bloqueada)
    * 404, Not Found: Recurso o URL no encontrados.
  * **5xx, error de servidor:**
    * 500, Internal Server Error: Error desde el lado del servidor.
* **Headers:** Metadatos, es decir, información adicional de la petición principal que necesita el servidor para tratar los datos.

  Incluyen:

  * Tipo de petición HTTP.
  * Destino (URL/Endpoint).
  * Token (rol, información del usaurio/cliente, origen).
  * Content-Type: Formato de presentación de los datos (ej.: "application/json", "image", etc).
  * Body: Cuerpo principal de la petición. Incluye los datos de consulta en el formato establecido (application/json, etc).

  Ejemplo:

  ```JSON
  request:
  {
    headers:
    {
      "method": "GET",
      "url": "http://api/users",
      "token": "oiasjdo54i6546546jopidf",
      "Content-Type": "application/json"
    },
    body:
    {
      "id": 1,
      "name": "Elon",
      "email": "address@email.com",
      "password": "ABC123XYZ789$@0456ENCRYPTION",
      "role": "administrator",
      "status": true
    }
  }
  ```
* **Body:** Cuerpo principal de la petición. Incluye los datos de consulta en el formato establecido (application/json, etc).

* **JSON:** Formato de organización de datos, en este caso un objeto, que presenta la información a modo de clave-valor entre llaves (ejemplo anterior).
* **API:** Programa intermediario entre cliente y servidor, a modo de contrato técnico (protocolo, lógica de negocio) para ambas partes, para enviar y recibir información.
* **REST:** Describe el tipo de API, en este caso hace referencia a la utilización de protocolos HTTP web.
