// Representa somente os dados da API que serão usados na aplicação.
interface Pais {
  name: {
    common: string;
  };
  region: string;
  capital?: string[];
  flags: {
    svg: string;
  };
}

// Estes são os dois endereços que podem fornecer a lista de países.
// O segundo será usado somente se o primeiro não funcionar.
const URL_API =
  "https://restcountries.com/v3.1/all?fields=name,region,capital,flags";
const URL_ALTERNATIVA =
  "https://cdn.jsdelivr.net/gh/restcountries/restcountries@master/src/main/resources/countriesV3.1.json";

// Esta classe tem apenas uma responsabilidade: buscar os países.
// Uma classe é como uma caixa que reúne informações e ações relacionadas.
class ServicoPaises {
  // Este método tenta buscar a lista na API do exercício.
  async buscarPaises(): Promise<Pais[]> {
    try {
      const resposta = await fetch(URL_API);

      // Se a API não responder corretamente, vamos para o catch.
      if (!resposta.ok) {
        throw new Error("A API principal não respondeu.");
      }

      // Converte a resposta recebida para uma lista de países.
      const paises: Pais[] = await resposta.json();
      return paises;
    } catch {
      // Se a primeira tentativa falhar, usamos a fonte alternativa.
      const respostaAlternativa = await fetch(URL_ALTERNATIVA);

      // Se a segunda fonte também falhar, encerramos com um erro.
      if (!respostaAlternativa.ok) {
        throw new Error("Não foi possível carregar os países.");
      }

      // Converte a segunda resposta para uma lista de países.
      const paises: Pais[] = await respostaAlternativa.json();
      return paises;
    }
  }
}

// Aqui pegamos do HTML os elementos usados pelo TypeScript.
// O "as" informa ao TypeScript qual é o tipo de cada elemento.
const campoBusca = document.getElementById("busca") as HTMLInputElement;
const campoRegiao = document.getElementById("regiao") as HTMLSelectElement;
const listaPaises = document.getElementById("lista-paises") as HTMLElement;
const mensagem = document.getElementById("mensagem") as HTMLElement;

// Guarda em memória os países recebidos da API.
let todosOsPaises: Pais[] = [];

// Esta função recebe países e cria os cartões que aparecem na tela.
function mostrarPaises(paises: Pais[]): void {
  // Limpa a lista antes de mostrar os novos resultados.
  listaPaises.innerHTML = "";

  // Se a lista estiver vazia, mostra uma mensagem e encerra a função.
  if (paises.length === 0) {
    mensagem.textContent = "Nenhum país encontrado.";
    return;
  }

  // Mostra quantos países foram encontrados.
  mensagem.textContent = paises.length + " país(es) encontrado(s).";

  // Repete este bloco uma vez para cada país da lista.
  paises.forEach(function (pais: Pais) {
    // Alguns países não possuem uma capital cadastrada.
    let capital = "Não informada";

    if (pais.capital && pais.capital.length > 0) {
      capital = pais.capital[0];
    }

    // Cria um cartão usando as informações do país atual.
    const cartao = document.createElement("article");
    cartao.className = "pais";
    cartao.innerHTML = `
      <img src="${pais.flags.svg}" alt="Bandeira de ${pais.name.common}">
      <h2>${pais.name.common}</h2>
      <p>Região: ${pais.region}</p>
      <p>Capital: ${capital}</p>
    `;

    // Coloca o cartão pronto dentro da lista da página.
    listaPaises.appendChild(cartao);
  });
}

// Esta função pesquisa pelo nome e filtra pela região escolhida.
function filtrarPaises(): void {
  // Pega o texto digitado e o transforma em letras minúsculas.
  const nomeDigitado = campoBusca.value.toLowerCase();

  // Pega o valor escolhido no campo de região.
  const regiaoEscolhida = campoRegiao.value;

  // O filter cria uma nova lista apenas com os países correspondentes.
  const paisesFiltrados = todosOsPaises.filter(function (pais: Pais) {
    const nomeDoPais = pais.name.common.toLowerCase();

    // Verifica se o nome do país contém o texto digitado.
    const encontrouNome = nomeDoPais.includes(nomeDigitado);

    // Uma região vazia significa que todas as regiões são aceitas.
    const encontrouRegiao =
      regiaoEscolhida === "" || pais.region === regiaoEscolhida;

    // O país aparece somente se passar nos dois testes.
    return encontrouNome && encontrouRegiao;
  });

  // Mostra na tela somente os países que passaram pelo filtro.
  mostrarPaises(paisesFiltrados);
}

// Quando o usuário digitar, a função de filtro será executada.
campoBusca.addEventListener("input", filtrarPaises);

// Quando o usuário trocar a região, o mesmo filtro será executado.
campoRegiao.addEventListener("change", filtrarPaises);

// Esta função inicia a aplicação quando a página é aberta.
async function iniciarAplicacao(): Promise<void> {
  try {
    // Cria um objeto usando a classe ServicoPaises.
    const servico = new ServicoPaises();

    // Espera a busca terminar e guarda o resultado.
    todosOsPaises = await servico.buscarPaises();

    // Mostra a lista completa pela primeira vez.
    mostrarPaises(todosOsPaises);
  } catch {
    // Esta mensagem aparece se nenhuma fonte fornecer os dados.
    mensagem.textContent = "Ocorreu um erro ao carregar os países.";
  }
}

// Esta linha manda a aplicação começar.
iniciarAplicacao();
