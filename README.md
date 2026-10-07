# API Cometocino

API REST inicial construida con Express 5 y MongoDB mediante Mongoose.

## Inicio

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env`. Define un `JWT_SECRET` aleatorio de al menos 32 caracteres, y un `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 12 caracteres).
3. Asegúrate de tener MongoDB disponible y ejecuta `npm run dev`. En el primer inicio se crea la cuenta administradora si no existe.

La API queda disponible en `http://localhost:3000`.
Los archivos ubicados en `src/public` se sirven bajo `/public` (por ejemplo, `src/public/images/logo.png` queda disponible en `/public/images/logo.png`).
En desarrollo se permiten orígenes locales (`localhost`, `127.0.0.1` y `::1`) en cualquier puerto. Configura `CORS_ORIGINS` con una lista separada por comas para orígenes adicionales. El frontend debe enviar `credentials: "include"` si utiliza la cookie de sesión.

## Rutas

- `GET /api/v1/health`: estado de la API.
- `GET /admin/products/new`: formulario web para registrar pizzas y ver las registradas.
- `POST /admin/products`: guarda una pizza enviada desde el formulario.
- `GET /admin/login`: panel de acceso de administrador.
- `POST /admin/logout`: cierra la sesión de administrador.
- `POST /api/v1/auth/login`: inicia sesión con JSON `{ "email", "password" }` y devuelve un JWT.
- `GET /api/v1/auth/me`: devuelve el administrador autenticado.
- `GET /api/v1/products`: lista las pizzas.
- `POST /api/v1/products`: crea una pizza usando JSON (`name`, `salePrice`, `productionCost`, `description`, `imageUrl`).
- `GET /api/v1/products/:id`: obtiene una pizza.
- `PUT /api/v1/products/:id`: actualiza una pizza.
- `DELETE /api/v1/products/:id`: elimina una pizza.
- `POST /api/v1/order`: crea un pedido (`clientName`, `phoneNumber`, `products: [{ productId, quantity }]` y, opcionalmente, `address` y `notes`). El servidor calcula y guarda `total` usando los precios vigentes de los productos.
- `GET /api/v1/order`: lista pedidos y sus productos; requiere JWT de administrador. `/api/v1/orders` se mantiene como alias.
- `GET /api/v1/items`: lista elementos.
- `POST /api/v1/items`: crea un elemento (`name` obligatorio; `description` y `active` opcionales).
- `GET /api/v1/items/:id`: obtiene un elemento.
- `PUT /api/v1/items/:id`: actualiza un elemento.
- `DELETE /api/v1/items/:id`: elimina un elemento.

## Capas

- `src/routes`: definición y montaje de rutas HTTP.
- `src/controllers`: traducción de requests/responses.
- `src/services`: lógica de acceso y operaciones de negocio.
- `src/models`: esquemas y modelos de Mongoose.
- `src/config`: configuración de la conexión a MongoDB.
- `src/middlewares`: manejo centralizado de errores.

Las operaciones `POST /api/v1/products`, `PUT /api/v1/products/:id` y `DELETE /api/v1/products/:id` requieren un JWT válido de administrador. Envíalo como `Authorization: Bearer <token>`. El formulario web usa una cookie HttpOnly.
