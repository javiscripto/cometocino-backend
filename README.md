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
- `GET /admin`: redirige a `/admin/orders`.
- `GET /admin/orders`: panel web de gestión de pedidos con filtro por estados y cambio de estado directo.
- `POST /admin/orders/:id/status`: actualiza el estado de un pedido desde el formulario del panel.
- `GET /admin/products`: panel web para registrar pizzas, ver márgenes de ganancia y administrar el catálogo. (`/admin/products/new` disponible como alias).
- `POST /admin/products`: guarda una pizza enviada desde el formulario web.
- `POST /admin/products/:id/delete`: elimina una pizza del catálogo desde el panel web.
- `GET /admin/login`: panel de acceso de administrador.
- `POST /admin/logout`: cierra la sesión de administrador.
- `POST /api/v1/auth/login`: inicia sesión con JSON `{ "email", "password" }` y devuelve un JWT.
- `GET /api/v1/auth/me`: devuelve el administrador autenticado.
- `GET /api/v1/products`: lista las pizzas.
- `POST /api/v1/products`: crea una pizza usando JSON (`name`, `salePrice`, `productionCost`, `description`, `imageUrl`).
- `GET /api/v1/products/:id`: obtiene una pizza.
- `PUT /api/v1/products/:id`: actualiza una pizza.
- `DELETE /api/v1/products/:id`: elimina una pizza.
- `POST /api/v1/orders`: crea un pedido (`clientName`, `phoneNumber`, `products: [{ productId, quantity }]` y, opcionalmente, `address` y `notes`). El pedido se inicializa con `status: "recibido"` y el total se calcula automáticamente. (`/api/v1/order` disponible como alias).
- `GET /api/v1/orders`: lista pedidos y sus productos; requiere JWT de administrador. Acepta query param `?status=` para filtrar.
- `GET /api/v1/orders/:id/tracking`: consulta pública de seguimiento para el cliente (`id`, `status`, `statusLabel`, `clientName`, `address`, `notes`, `products`, `total`, `createdAt`, `updatedAt`). `/api/v1/orders/:id/status` disponible como alias.
- `GET /api/v1/orders/:id`: obtiene el detalle completo del pedido por su ID.
- `PATCH /api/v1/orders/:id/status`: actualiza el estado del pedido (`recibido`, `en_preparacion`, `en_camino`, `entregado`, `cancelado`) y opcionalmente `orderNotes`; requiere JWT de administrador. (`PATCH /api/v1/orders/:id` disponible como alias).

## Capas

- `src/routes`: definición y montaje de rutas HTTP.
- `src/controllers`: traducción de requests/responses.
- `src/services`: lógica de acceso y operaciones de negocio.
- `src/models`: esquemas y modelos de Mongoose.
- `src/config`: configuración de la conexión a MongoDB.
- `src/middlewares`: manejo centralizado de errores.

Las operaciones `POST /api/v1/products`, `PUT /api/v1/products/:id` y `DELETE /api/v1/products/:id` requieren un JWT válido de administrador. Envíalo como `Authorization: Bearer <token>`. El formulario web usa una cookie HttpOnly.
