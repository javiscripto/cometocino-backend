# API Cometocino

API REST inicial construida con Express 5 y MongoDB mediante Mongoose.

## Inicio

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env`. Define un `JWT_SECRET` aleatorio de al menos 32 caracteres, y un `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 12 caracteres).
3. Asegúrate de tener MongoDB disponible y ejecuta `npm run dev`. En el primer inicio se crea la cuenta administradora si no existe.

La API queda disponible en `http://localhost:3000`.
Los estáticos se ubican en `public/` en la raíz. Por ejemplo, `public/images/5.svg` queda disponible en `/images/5.svg` en Vercel; localmente también se conserva el alias `/public/images/5.svg`.
En desarrollo se permiten orígenes locales (`localhost`, `127.0.0.1` y `::1`) en cualquier puerto. En producción, configura `CORS_ORIGINS` con los dominios exactos del frontend, separados por comas. El frontend debe enviar `credentials: "include"` si utiliza la cookie de sesión.

## Rutas

- `GET /api/v1/health`: estado de la API.
- `GET /api/v1/store/status`: informa si la pizzería recibe pedidos según el horario y la zona horaria configurados.
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
- `GET /api/v1/orders/:id/tracking`: consulta pública de seguimiento para el cliente (`id`, `status`, `statusLabel`, `clientName`, `address`, `notes`, `products`, `total`, `loyalty`, `createdAt`, `updatedAt`). `loyalty` contiene `completedPurchases`, `totalCompletedPurchases`, `purchasesUntilReward` y `nextPurchaseHasGift`. `/api/v1/orders/:id/status` disponible como alias.
- `GET /api/v1/orders/:id`: obtiene el detalle completo del pedido por su ID.
- `PATCH /api/v1/orders/:id/status`: actualiza el estado del pedido (`recibido`, `en_preparacion`, `en_camino`, `entregado`, `cancelado`) y opcionalmente `orderNotes`; requiere JWT de administrador. (`PATCH /api/v1/orders/:id` disponible como alias).

La fidelización acredita una compra cuando el administrador cambia por primera vez una orden de `recibido` a `en_preparacion` (confirmación de pago). Al llegar a cinco compras, el seguimiento indica `nextPurchaseHasGift: true`. Esta actualización usa una transacción MongoDB para guardar el cambio de estado y el conteo juntos; la base debe soportar transacciones (por ejemplo, MongoDB Atlas o un replica set).

## Capas

- `src/routes`: definición y montaje de rutas HTTP.
- `src/controllers`: traducción de requests/responses.
- `src/services`: lógica de acceso y operaciones de negocio.
- `src/models`: esquemas y modelos de Mongoose.
- `src/config`: configuración de la conexión a MongoDB.
- `src/middlewares`: manejo centralizado de errores.

Las operaciones `POST /api/v1/products`, `PUT /api/v1/products/:id` y `DELETE /api/v1/products/:id` requieren un JWT válido de administrador. Envíalo como `Authorization: Bearer <token>`. El formulario web usa una cookie HttpOnly.

El horario de atención se define en `src/config/store-hours.js` y la zona horaria en `STORE_TIME_ZONE`. El endpoint de creación de pedidos vuelve a validar el horario y responde `409 Conflict` cuando el local está cerrado.

## Despliegue en Vercel

El proyecto usa `src/server.js` como entrada de Express. `vercel.json` incluye las vistas EJS dentro de la función.

Configura en Vercel estas variables de entorno para Production, Preview y Development según corresponda:

- `MONGODB_URI`: URI de una base MongoDB remota accesible desde Vercel; no uses el valor local `mongodb://127.0.0.1:27017/...` del ejemplo.
- `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`: credenciales iniciales del administrador (contraseña de al menos 12 caracteres).
- `CORS_ORIGINS`: orígenes exactos del frontend desplegado, por ejemplo `https://mi-frontend.vercel.app`.
- `STORE_TIME_ZONE`: opcional; por defecto `America/Santiago`.
- `NTFY_URL`: opcional; sin ella se omiten las notificaciones.

El caché global de `lib/dbConnect.js` reutiliza la conexión y la promesa de conexión durante la vida de cada instancia de Vercel. La duración máxima para seleccionar el servidor MongoDB es de 10 segundos. El proveedor de MongoDB debe permitir conexiones desde la función de Vercel.
