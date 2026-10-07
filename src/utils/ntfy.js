const { NTFY_URL } = process.env;

// Enviar la notificación vía HTTP POST
const sendNotification = async (data) => {
  try {
    const response = await fetch(NTFY_URL, {
      method: "POST",
      body: `${data.clientName} ha realizado un pedido\n
telefono: ${data.phoneNumber}\n
direccion: ${data.address}\n
comentarios: ${data.notes}\n
`,
      headers: {
        Title: "¡Nuevo Pedido",
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

module.exports = { sendNotification };
