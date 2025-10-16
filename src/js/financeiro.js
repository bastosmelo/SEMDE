const form = document.getElementById("financeForm");
const tableBody = document.querySelector("#financeTable tbody");
const exportBtn = document.getElementById("exportBtn");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = document.getElementById("data").value;
  const locacao = parseFloat(document.getElementById("locacao").value) || 0;
  const assessoria = parseFloat(document.getElementById("assessoria").value) || 0;
  const combustivel = parseFloat(document.getElementById("combustivel").value) || 0;
  const debito = parseFloat(document.getElementById("debito").value) || 0;
  const credito = parseFloat(document.getElementById("credito").value) || 0;
  const outros = parseFloat(document.getElementById("outros").value) || 0;

  const total = locacao + assessoria + combustivel + debito + credito + outros;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data}</td>
    <td>R$ ${locacao.toLocaleString("pt-BR")}</td>
    <td>R$ ${assessoria.toLocaleString("pt-BR")}</td>
    <td>R$ ${combustivel.toLocaleString("pt-BR")}</td>
    <td>R$ ${debito.toLocaleString("pt-BR")}</td>
    <td>R$ ${credito.toLocaleString("pt-BR")}</td>
    <td>R$ ${outros.toLocaleString("pt-BR")}</td>
    <td><b>R$ ${total.toLocaleString("pt-BR")}</b></td>
  `;

  tableBody.appendChild(row);
  form.reset();
});

exportBtn.addEventListener("click", function () {
  let csv = "Data,Locação,Ass. Comunicação,Combustível,Débito,Crédito,Outros,Total\n";
  document.querySelectorAll("#financeTable tbody tr").forEach(row => {
    const cols = row.querySelectorAll("td");
    let dataRow = [];
    cols.forEach(td => dataRow.push(td.innerText));
    csv += dataRow.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registros-financeiros.csv";
  a.click();
  window.URL.revokeObjectURL(url);
});