//funcion eliminar order
function deleteOrder(id) {
  const res = fetch(`/api/v1/order/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      window.location.href = "/admin/orders";
    });
}

//boton eliminar
const deleteButtons = document.querySelectorAll(".btn-delete");
deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-id");
    deleteOrder(id);
  });
});
