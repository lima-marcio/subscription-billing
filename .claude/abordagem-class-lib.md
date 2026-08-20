# Abordagem C — Núcleo de negócio como pacote NuGet privado

Detalhamento da opção "empacotar as regras de negócio como uma classlib compilada,
publicada num feed NuGet privado" cogitada para separar o "core" (regras de negócio)
da "casca" (controllers, infraestrutura, frontend) publicável.

## O que é

Em vez de `services/` viver como código-fonte dentro do repositório da API, ele vira
um projeto `.csproj` do tipo `Class Library` (`Microsoft.NET.Sdk`), compilado e
publicado como um pacote `.nupkg` num feed NuGet **privado**. O repositório da API
(a "casca", potencialmente pública) não contém mais o código-fonte das regras — só
uma `PackageReference` apontando para a versão do pacote, resolvida em tempo de
build via `dotnet restore`.

```
SubscriptionBilling.Core/              <- repositório PRIVADO separado
  SubscriptionBilling.Core.csproj      <- classlib com as regras de negócio
  Plans/PlanService.cs
  Subscriptions/SubscriptionService.cs
  ...
  -> dotnet pack -> SubscriptionBilling.Core.1.4.0.nupkg -> publicado no feed privado

SubscriptionBilling.Api/               <- repositório PÚBLICO (casca)
  SubscriptionBilling.Api.csproj
    <PackageReference Include="SubscriptionBilling.Core" Version="1.4.0" />
  Features/Subscriptions/SubscriptionsController.cs   <- só consome via DI
  nuget.config                          <- aponta para o feed privado (credenciais via env/secret)
```

## Como funcionaria neste projeto

1. **Novo repositório privado** `subscription-billing-core` com os projetos de
   domínio + regras de negócio hoje em `Domain/` e nos `*Service.cs` de cada
   feature (`PlanService`, `SubscriberService`, `SubscriptionService`, etc.).
   Continua registrando os serviços no container via um `IServiceCollection`
   extension method exposto publicamente pelo pacote (ex.:
   `services.AddSubscriptionBillingCore(configuration)`), para o `Program.cs`
   da API continuar enxuto e a injeção de dependência continuar funcionando
   normalmente — só que o *tipo* concreto do serviço vem de um assembly externo.
2. **Feed NuGet privado.** Opções:
   - **GitHub Packages** (mais simples se o código já está no GitHub — feed por
     organização/repositório, autenticação via PAT).
   - **Azure Artifacts** (bom se já usam Azure DevOps).
   - **BaGet/NuGet self-hosted** (mais controle, mais operação própria).
3. **Pipeline de build/publish do core.** CI do repositório privado roda
   `dotnet pack` + `dotnet nuget push` a cada release (tag/versão), publicando
   uma nova versão semver do pacote no feed.
4. **Consumo na API.** `nuget.config` no repositório público aponta para o feed
   privado; a autenticação (PAT/token) é injetada via variável de ambiente ou
   secret do CI — **nunca** commitada. `dotnet restore` baixa o `.dll`, não o
   código-fonte.
5. **Docker.** A imagem da API precisa do token do feed privado disponível
   *apenas* durante o estágio de build (`dotnet restore`), como build secret
   (`--secret` do BuildKit) — não deve ficar em nenhuma camada final da imagem.

## Nível real de proteção

Importante calibrar expectativa: isso **não é criptografia nem proteção forte**.
Um `.dll` .NET é trivialmente decompilável com ferramentas como ILSpy, dotPeek
ou JetBrains Rider — sem ofuscação, alguém com o pacote em mãos reconstrói o
código-fonte quase original em minutos. O que essa abordagem realmente compra:

- Quem só tem acesso ao repositório **público** (a casca) não vê o código-fonte
  das regras de negócio nem o histórico de commits delas.
- Cópia acidental ou raspagem automatizada de repositórios públicos (bots que
  vasculham GitHub) não pega o core.
- Não impede alguém com acesso legítimo ao pacote (qualquer consumidor autorizado
  do feed privado) de decompilar e extrair a lógica, caso essa pessoa seja
  mal-intencionada.

Se o objetivo for proteção forte contra decompilação, seria necessário adicionar
ofuscação de IL (ex.: ferramentas comerciais tipo Dotfuscator/ConfuserEx) — camada
adicional de custo e fragilidade (dificulta debugging e pode quebrar reflection).

Uma alternativa que dá proteção genuinamente mais forte é **não distribuir o
core como biblioteca nenhuma**: rodá-lo como um serviço HTTP/gRPC interno
separado (um "core service" com sua própria API), consumido pela casca só via
rede. Nesse modelo o código nunca sai da infraestrutura que você controla — mas
isso é uma mudança de arquitetura bem maior (latência de rede entre casca e
core, versionamento de contrato de API interna, deploy de dois serviços).

## Custo operacional recorrente

| Item | Custo |
|---|---|
| Dois repositórios | Coordenar mudanças que cruzam a fronteira (ex.: uma nova regra de negócio que precisa de um novo campo em DTO da API) exige PR em dois lugares e sincronizar versões. |
| Versionamento semver | Toda mudança no core vira uma versão de pacote; a casca precisa atualizar a `PackageReference` e testar a integração — não é mais "só um commit". |
| Feed privado | Custo de infraestrutura (mesmo GitHub Packages tem limites/custo em contas privadas) + gestão de credenciais (PAT expira, precisa rotacionar). |
| CI/CD duplicado | Dois pipelines (pack+push do core; restore+build da casca) em vez de um. |
| Debugging entre repositórios | Debugar um bug que atravessa a fronteira exige rodar/clonar os dois repositórios, ou usar `dotnet pack` local + `nuget.config` apontando para uma pasta local durante o desenvolvimento. |
| Onboarding de novos devs | Precisa de acesso a dois repositórios + credenciais do feed privado antes de conseguir rodar a aplicação localmente — complica o "Clean Installation" que o `definition-of-done.md` pede. |
| Testes de integração | Testes que hoje rodam contra o service diretamente (mesma solução) passam a rodar contra um pacote versionado — mais um lugar onde a versão pode estar desatualizada silenciosamente. |

## Custo para reaplicar em projetos futuros

A ideia é replicável (é essencialmente um template: repo-core privado + feed +
repo-casca público), mas cada novo projeto herda o mesmo overhead:

- Precisa criar/configurar o feed privado por organização (ou reusar um feed
  multi-projeto, o que acopla os projetos ao mesmo espaço de nomes/permissões).
- Precisa de um pipeline de CI de publish por core (ou um template de pipeline
  reusável, que ainda assim precisa ser mantido).
- Cada novo projeto precisa decidir a granularidade certa da fronteira
  público/privado — nem sempre óbvio, e errar a fronteira cedo demais gera
  refatoração cara depois.
- Não fica "mais barato" com a repetição do ponto de vista de manutenção diária
  (cada projeto que adota isso carrega o custo de dois repositórios para sempre);
  o que fica mais barato é só o *setup inicial*, se houver um template pronto.

## Alternativas mais baratas para o mesmo objetivo

1. **Repositório inteiro privado** (Opção A da conversa anterior) — zero custo
   de engenharia, zero risco de quebrar build/Docker/clone. Só não permite
   publicar a casca separadamente no futuro.
2. **Dois repositórios com código-fonte** (Opção B, sem empacotamento) — core
   como git submodule privado dentro do repo público, sem virar pacote NuGet.
   Mais simples que empacotar (sem feed, sem versionamento semver, sem pipeline
   de publish), mas ainda expõe o código-fonte para quem tem acesso ao
   submodule — proteção equivalente à do pacote (alguém com acesso decompila
   ou lê o fonte), só que sem o overhead de empacotamento.

## Recomendação

Se a motivação principal é **impedir cópia casual/raspagem de um repositório
público**, a Opção A (repo inteiro privado) resolve com custo zero — e pode
sempre evoluir para B ou C mais tarde, quando (e se) a casca realmente
precisar ser pública. Vale adiar o investimento em empacotamento até essa
necessidade ser concreta (YAGNI): o custo operacional de dois repositórios e
um feed privado só se paga quando há de fato uma casca pública sendo mantida
em paralelo ao core privado.
