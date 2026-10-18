const { NTFY_URL } = process.env;

const formatCurrency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function formatOrderNotification(order) {
  const productLines = (order.products || []).map((item) => {
    const productName = item.productId?.name || "Producto";
    return `• ${productName} x ${item.quantity}`;
  });

  const lines = [
    `${order.clientName || "Cliente"} ha realizado un pedido`,
    `Teléfono: ${order.phoneNumber || "No indicado"}`,
    `Dirección: ${order.address || "No indicada"}`,
    "",
    "Productos:",
    ...(productLines.length ? productLines : ["• Sin productos"]),
    "",
    `Total: ${formatCurrency.format(Number(order.total) || 0)}`,
  ];

  if (order.notes) lines.push("", `Comentarios: ${order.notes}`);
  return lines.join("\n");
}

const sendNotification = async (order) => {
  if (!NTFY_URL) {
    console.warn("NTFY_URL no está configurada; se omite la notificación.");
    return;
  }

  try {
    const response = await fetch(NTFY_URL, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
      body: formatOrderNotification(order),
      headers: {
        Title: `Nuevo pedido${order._id ? ` #${String(order._id).slice(-6).toUpperCase()}` : ""
          }`,
        Priority: 5,
        Tags: "pizzeria",
      },
    });

    if (!response.ok) {
      throw new Error("Error al enviar la notificación");
    }

    console.log("Notificación enviada correctamente");
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
  }
};

module.exports = { sendNotification, formatOrderNotification };
