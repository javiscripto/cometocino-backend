const { NTFY_URL } = process.env;

// Enviar la notificación vía HTTP POST
const sendNotification = async () => {
  try {
    const response = await fetch(NTFY_URL, {
      method: "POST",
      body: "hola",
      headers: {
        Title: "¡Nuevo Pedido",
        Priority: 4,
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

module.exports = { sendNotification };
