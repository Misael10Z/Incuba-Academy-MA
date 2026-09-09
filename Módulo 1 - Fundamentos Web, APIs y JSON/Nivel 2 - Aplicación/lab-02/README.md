# Nivel 2 — Laboratorio: DummyJSON → Node.js → información útil

## 1. Explicación de `index.js`

Para la creación de este script, se reutilizó el archivo de práctica `fetchWithLimitAndSkip.mts` copiando y pegándolo en el subdirectorio `lab-02/src/`.

Entonces, básicamente, solo se expandió la lógica de validaciónes de campos para `category` y `stock` como también la aplicación de los métodos `filter()` y `sort()` a `data.products` dentro del `console.table()` para el acatamiento de los objetivos.

Se modificó el nombre y extensión del archivo a `index.js` de acuerdo al enunciado, como también la creación del `package.json` para definir contexto y configuraciones del script (útil para definir este último como un `ES Modules`, evitando utilizar la extensión `.mjs` como en el script de práctica).

## 2. Guía de reproducción del script

### 2.1 Prerequisitos

- Node.js 24 (en este caso utilicé Node.js v26.4.0).
- Terminal o IDE.
- Clonar o descargar en una carpeta de su preferencia el repositorio: `https://github.com/Misael10Z/Incuba-Academy-MA.git`.
  - En caso de clonar abra la termina de su sistema operativo o IDE y utilice el siguiente comando: `git clone https://github.com/Misael10Z/Incuba-Academy-MA.git`.
  - En caso de descarga, visite [github.com/Misael10Z/Incuba-Academy-MA](https://github.com/Misael10Z/Incuba-Academy-MA), busque el botón `<> Code` y descargue el ZIP.

### 2.2 Orden de ejecución

1. Abrir la terminal de tu sistema operativo o de tu IDE.
2. Navegar hasta la ruta `Incuba-Academy-MA\Módulo 1 - Fundamentos Web, APIs y JSON\Nivel 2 - Aplicación\lab-02`:

   1. **Terminal del OS:**

      1. Navega primero al disco donde hayas clonado el repositorio escribiendo solamente la letra de su identificación y dos puntos.
         Ejemplo: `d:`.
      2. Dirígete a la ruta principal del script con el comando `cd`.
         Ejemplo:
         `D:\>cd carpeta_preferenciada\Incuba-Academy-MA\Módulo 1 - Fundamentos Web, APIs y JSON\Nivel 2 - Aplicación\lab-02` .
      3. Ejecutar el comando de inicializador de paquetes de su preferencia con la sentencia `start`.
         Ejemplos: `npm run start`, `pnpm run start`.
   2. **Terminal del IDE:**

      1. Abrir la carpeta `lab-02` que contiene el script mediante el explorador de su IDE para que actualice automáticamente la ruta de la terminal o en su defecto a través de la misma terminal como en lo redactado en el punto 2.a..
      2. Ejecutar el comando de inicializador de paquetes de su preferencia con la sentencia `start`.
         Ejemplos: `npm run start`, `pnpm run start`.
3. Como resultado deberá imprimirse en su consola la tabla que contiene los registros de los productos de acuerdo al enunciado.
