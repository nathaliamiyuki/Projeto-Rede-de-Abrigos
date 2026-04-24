const API_BASE_URL = "http://localhost:3001/api";

const sheltersList = document.getElementById("sheltersList");
const loadSheltersBtn = document.getElementById("loadShelters");
const cityFilter = document.getElementById("cityFilter");
const onlyAvailable = document.getElementById("onlyAvailable");
const helpForm = document.getElementById("helpForm");
const formFeedback = document.getElementById("formFeedback");
const volunteerPanel = document.getElementById("volunteerPanel");
const volunteerKeyInput = document.getElementById("volunteerKey");
const volunteerLoginBtn = document.getElementById("volunteerLoginBtn");
const volunteerLogoutBtn = document.getElementById("volunteerLogoutBtn");
const volunteerFeedback = document.getElementById("volunteerFeedback");
const priorityFilter = document.getElementById("priorityFilter");
const loadRequestsBtn = document.getElementById("loadRequests");
const requestsList = document.getElementById("requestsList");
let volunteerSessionKey = "";

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const rawText = await response.text();
  return { rawText };
}

async function loadShelters() {
  try {
    const params = new URLSearchParams();
    if (onlyAvailable.checked) params.append("onlyAvailable", "true");
    if (cityFilter.value.trim()) params.append("city", cityFilter.value.trim());

    const response = await fetch(`${API_BASE_URL}/shelters?${params.toString()}`);
    const data = await response.json();

    sheltersList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      sheltersList.innerHTML = "<p class='warn'>Nenhum abrigo encontrado com esse filtro.</p>";
      return;
    }

    data.forEach((shelter) => {
      const div = document.createElement("div");
      div.className = "shelter";
      div.innerHTML = `
        <h3>${shelter.name}</h3>
        <p><strong>Endereco:</strong> ${shelter.address} - ${shelter.neighborhood}, ${shelter.city}</p>
        <p><strong>Contato:</strong> ${shelter.contactPhone || "Nao informado"}</p>
        <p><strong>Vagas:</strong> ${shelter.available} de ${shelter.capacity}</p>
        <p><strong>Aceita pets:</strong> ${shelter.acceptsPets ? "Sim" : "Nao"}</p>
      `;
      sheltersList.appendChild(div);
    });
  } catch (error) {
    sheltersList.innerHTML = `<p class='warn'>Erro ao carregar abrigos: ${error.message}</p>`;
  }
}

function formatPriority(priority) {
  if (priority === "alta") return "Alta";
  if (priority === "media") return "Media";
  return "Baixa";
}

function formatStatus(status) {
  if (status === "em_andamento") return "Em andamento";
  if (status === "atendido") return "Atendido";
  return "Aberto";
}

async function updateRequestStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-volunteer-key": volunteerSessionKey,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await readResponseBody(response);
    if (errorData.rawText && errorData.rawText.includes("<!DOCTYPE")) {
      throw new Error("Resposta HTML recebida. Reinicie o back-end para aplicar as rotas novas.");
    }
    throw new Error(errorData.message || "Nao foi possivel atualizar o status.");
  }
}

async function loadRequests() {
  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      headers: {
        "x-volunteer-key": volunteerSessionKey,
      },
    });

    if (response.status === 403) {
      volunteerPanel.classList.add("hidden");
      volunteerSessionKey = "";
      requestsList.innerHTML = "";
      volunteerFeedback.className = "warn";
      volunteerFeedback.textContent = "Chave de voluntario invalida.";
      return false;
    }

    const data = await readResponseBody(response);
    if (!Array.isArray(data)) {
      throw new Error("Resposta inesperada da API ao listar pedidos.");
    }

    const selectedPriority = priorityFilter.value;
    const filtered = selectedPriority ? data.filter((item) => item.priority === selectedPriority) : data;

    requestsList.innerHTML = "";

    if (!Array.isArray(filtered) || filtered.length === 0) {
      requestsList.innerHTML = "<p class='warn'>Nenhum pedido encontrado para esse filtro.</p>";
      return true;
    }

    filtered.forEach((requestItem) => {
      const div = document.createElement("div");
      div.className = "request";
      div.innerHTML = `
        <h3>${requestItem.requesterName}</h3>
        <p><strong>Pessoas:</strong> ${requestItem.peopleCount}</p>
        <p><strong>Localizacao:</strong> ${requestItem.currentLocation}</p>
        <p><strong>Prioridade:</strong> ${formatPriority(requestItem.priority)}</p>
        <p><strong>Status:</strong> ${formatStatus(requestItem.status)}</p>
        <p><strong>Contato:</strong> ${requestItem.phone || "Nao informado"}</p>
        <p><strong>Observacoes:</strong> ${requestItem.notes || "Sem observacoes"}</p>
      `;

      const select = document.createElement("select");
      select.innerHTML = `
        <option value="aberto">Aberto</option>
        <option value="em_andamento">Em andamento</option>
        <option value="atendido">Atendido</option>
      `;
      select.value = requestItem.status;

      select.addEventListener("change", async () => {
        try {
          await updateRequestStatus(requestItem.id, select.value);
          loadRequests();
        } catch (error) {
          alert(error.message);
        }
      });

      div.appendChild(select);
      requestsList.appendChild(div);
    });
    return true;
  } catch (error) {
    volunteerPanel.classList.add("hidden");
    requestsList.innerHTML = `<p class='warn'>Erro ao carregar pedidos: ${error.message}</p>`;
    return false;
  }
}

async function refreshVolunteerPanelVisibility() {
  if (volunteerSessionKey) {
    const hasAccess = await loadRequests();
    if (hasAccess) {
      volunteerPanel.classList.remove("hidden");
      volunteerFeedback.className = "ok";
      volunteerFeedback.textContent = "Acesso de voluntario ativo.";
    }
  } else {
    volunteerPanel.classList.add("hidden");
    volunteerFeedback.className = "";
    volunteerFeedback.textContent = "Entre com a chave para visualizar o painel.";
    requestsList.innerHTML = "";
  }
}

helpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(helpForm);

  const payload = {
    requesterName: formData.get("requesterName"),
    phone: formData.get("phone"),
    peopleCount: Number(formData.get("peopleCount")),
    currentLocation: formData.get("currentLocation"),
    priority: formData.get("priority"),
    notes: formData.get("notes"),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha ao enviar pedido.");
    }

    formFeedback.className = "ok";
    formFeedback.textContent = "Pedido registrado com sucesso. Equipes de apoio poderao visualizar.";
    helpForm.reset();
    loadRequests();
  } catch (error) {
    formFeedback.className = "warn";
    formFeedback.textContent = error.message;
  }
});

loadSheltersBtn.addEventListener("click", loadShelters);
loadRequestsBtn.addEventListener("click", loadRequests);
priorityFilter.addEventListener("change", loadRequests);

volunteerLoginBtn.addEventListener("click", async () => {
  const key = volunteerKeyInput.value.trim();
  if (!key) {
    volunteerFeedback.className = "warn";
    volunteerFeedback.textContent = "Informe a chave de voluntario.";
    return;
  }

  volunteerSessionKey = key;
  const hasAccess = await loadRequests();
  if (hasAccess) {
    volunteerPanel.classList.remove("hidden");
    volunteerFeedback.className = "ok";
    volunteerFeedback.textContent = "Login de voluntario realizado com sucesso.";
    volunteerKeyInput.value = "";
  } else {
    volunteerPanel.classList.add("hidden");
  }
});

volunteerLogoutBtn.addEventListener("click", () => {
  volunteerSessionKey = "";
  refreshVolunteerPanelVisibility();
});

volunteerSessionKey = "";
loadShelters();
refreshVolunteerPanelVisibility();
