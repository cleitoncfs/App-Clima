const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "93caf00f25314a248fc111000242609"; // Chave API

// Códigos de clima para mapear para ícones personalizados
const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

// Exibir a previsão horária para as próximas 24 horas
const exibirPrevisaoHoraria = (dadosHorarios) => {
  const horaAtual = new Date();
  horaAtual.setMinutes(0, 0, 0);
  const proximo24Horas = horaAtual.getTime() + 24 * 60 * 60 * 1000;

  // Filtrar os dados horários para incluir apenas as próximas 24 horas
  const dadosProximas24Horas = dadosHorarios.filter(({ time }) => {
    const horaPrevisao = new Date(time).getTime();
    return horaPrevisao >= horaAtual.getTime() && horaPrevisao <= proximo24Horas;
  });

  // Gerar HTML para cada previsão horária e exibi-la
  hourlyWeather.innerHTML = dadosProximas24Horas.map((item) => {
    const temperatura = Math.floor(item.temp_c);
    const tempo = item.time.split(' ')[1].substring(0, 5);
    const iconeClima = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(item.condition.code));

    return `<li class="weather-item">
            <p class="time">${tempo}</p>
            <img src="icons/${iconeClima}.svg" class="weather-icon">
            <p class="temperature">${temperatura}°</p>
          </li>`;
  }).join('');
};

// Buscar e exibir detalhes do clima
const obterDetalhesDoClima = async (API_URL) => {
  window.innerWidth <= 768 && searchInput.blur();
  document.body.classList.remove("show-no-results");

  try {
    // Buscar dados climáticos da API e analisar a resposta como JSON
    const response = await fetch(API_URL);
    const data = await response.json();

    // Extrair detalhes do clima atual
    const temperatura = Math.floor(data.current.temp_c);
    const descricao = data.current.condition.text;
    const iconeClima = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(data.current.condition.code));

    // Atualizar a exibição do clima atual
    currentWeatherDiv.querySelector(".weather-icon").src = `icons/${iconeClima}.svg`;
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperatura}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = descricao;

    // Combinar dados horários de hoje e amanhã
    const dadosHorariosCombinados = [
      ...(data.forecast?.forecastday[0]?.hour || []), 
      ...(data.forecast?.forecastday[1]?.hour || [])
    ];

    searchInput.value = data.location.name;
    exibirPrevisaoHoraria(dadosHorariosCombinados);
  } catch (error) {
    document.body.classList.add("show-no-results");
  }
};

// Configurar a solicitação climática para uma cidade específica
const configurarSolicitacaoClima = (nomeCidade) => {
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${nomeCidade}&days=2&lang=pt`;
  obterDetalhesDoClima(API_URL);
};

// Manipular a entrada do usuário na caixa de pesquisa
searchInput.addEventListener("keyup", (e) => {
  const nomeCidade = searchInput.value.trim();

  if (e.key === "Enter" && nomeCidade) {
    configurarSolicitacaoClima(nomeCidade);
  }
});

// Obter coordenadas do usuário e buscar dados climáticos para a localização atual
locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2&lang=pt`;
      obterDetalhesDoClima(API_URL);
      window.innerWidth >= 768 && searchInput.focus();
    },
    () => {
      alert("Permissão de localização negada. Por favor, habilite para usar esta funcionalidade.");
    }
  );
});

// Solicitação inicial de clima para Londres como a cidade padrão
configurarSolicitacaoClima("Lisboa");
