// Minha ideia: guardar no máximo 20 buffers e ter só um temporizador, que posso cancelar.
// Buffer guarda bytes. Aqui cada buffer ocupa 512 KiB, ou meio MiB.
export class CacheLimitado {
  private cache = new Map<string, Buffer>();
  private temporizador: NodeJS.Timeout;

  constructor() {
    // Em vez de criar um intervalo por pedido, crio só um para esta instância.
    // A cada segundo descarto os dados: é uma expiração simples de todo o cache.
    this.temporizador = setInterval(() => this.cache.clear(), 1000);
  }

  handleRequest(id: string): void {
    // Map mantém a ordem de inserção. Se já tenho 20 entradas, retiro a mais antiga.
    if (!this.cache.has(id) && this.cache.size >= 20) {
      const primeira = this.cache.keys().next().value;
      if (primeira !== undefined) this.cache.delete(primeira);
    }
    this.cache.set(id, Buffer.alloc(1024 * 512));
    // Não guardo callbacks numa lista: o exercício não precisa reutilizá-los depois.
  }

  get tamanho(): number {
    return this.cache.size; // Posso consultar a quantidade sem expor os buffers.
  }

  encerrar(): void {
    // unref sozinho não liberaria o temporizador. Cancelo de verdade com clearInterval.
    clearInterval(this.temporizador);
    this.cache.clear();
  }
}

if (require.main === module) {
  const cache = new CacheLimitado();
  try {
    for (let i = 0; i < 2000; i++) cache.handleRequest(`req-${i}`);
    console.log("Entradas guardadas:", cache.tamanho); // Espero no máximo 20, não 2000.
  } finally {
    cache.encerrar(); // Mesmo se acontecer uma falha, não deixo o intervalo pendurado.
  }
}
