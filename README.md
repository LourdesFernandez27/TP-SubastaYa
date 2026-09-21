# TP-SubastaYa
 SubastaYa - Plataforma de Subastas 

---

 **Integrantes del Equipo**

* Fernández, Lourdes
* Gnecco, Sandra

---

**Tecnologías Utilizadas**

 **Backend:** C# / .NET 8 Web API (Clean Architecture).
 **ORM & Persistencia:** Entity Framework Core (Code-First) con transacciones ACID.
 **Base de Datos:**  MySQL corriendo en contenedor **Docker**.
 **Frontend:** React + JavaScript (Node.js & npm).
 **Herramientas de Desarrollo:** Visual Studio 2022, Visual Studio Code, TablePlus.


**Guía de Instalación y Ejecución**

**Requisitos Previos**
* Tener instalado [.NET 8 SDK](https://dotnet.microsoft.com/download).
* Tener instalado [Node.js](https://nodejs.org/).
* Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/) y en ejecución.

 **Levantar la Base de Datos con Docker**
Desde la terminal, en la raíz del proyecto donde se encuentra el archivo `docker-compose.yml`, ejecutá:

Terminal
docker compose up -d

Esto iniciará el contenedor con la base de datos relacional lista para recibir conexiones.

**Aplicar Migraciones y Cargar Datos Semilla (Seed Data)**
Para crear las tablas y cargar automáticamente los usuarios, categorías y subastas de prueba:
Desde Visual Studio 2022
Abrí la Consola del Administrador de Paquetes (Package Manager Console).
En Proyecto predeterminado, seleccioná SubastaYa.Infrastructure.
Ejecutá el comando:
Update-Database

**Ejecutar el Backend (.NET Web API)**
Abrí la solución SubastaYa.sln (en la rama de github se ubica en Lourdes) en Visual Studio 2022.
Presioná F5 o hacé clic en Play.
La API iniciará y abrirá la documentación interactiva de Swagger en:
https://localhost:7009/swagger.

**Ejecutar el Frontend (React)**
Abrí la carpeta del proyecto frontend en la terminal.
Instalá las dependencias y ejecutá el servidor de desarrollo:
npm install
npm start
La aplicación web estará disponible en https://localhost:5174.

**Datos Semilla Precargados (Seed Data)**
El sistema se inicializa automáticamente con los siguientes datos de prueba:
Usuarios y Billeteras:
vendedor@test.com (ID: 1) - Creador de publicaciones.
comprador1@test.com (ID: 2) - Postor líder con $45.000 retenidos en garantía.
comprador2@test.com (ID: 3) - Postor activo con $200.000 disponibles.
sinfondos@test.com (ID: 4) - Usuario con $500 para probar rechazos por saldo insuficiente.
Categorías: Tecnología, Coleccionables, Indumentaria, Vehículos.
Subastas de Prueba:
ID 1: Activa estándar (cierra en 30 min, líder actual: $45.000).
ID 2: Activa crítica (cierra en menos de 1 min, para probar alerta visual y extensión Anti-Sniping).
ID 3: Próxima (programada a futuro, ofertas bloqueadas).
ID 4: Vencida con ganador (para probar cierre por Worker).
ID 5: Vencida desierta (sin ofertas).

