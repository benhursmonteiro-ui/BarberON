# BarberON — resumo do desenvolvimento

**Posição em 09/11/2026**

O BarberON é um sistema web de gestão para barbearias, com recursos para organizar agendamentos e apoiar a administração do estabelecimento, dos profissionais e dos clientes.

## O que já foi desenvolvido

- **Agendamento online:** fluxo para escolher serviço, barbeiro, data e horário disponível, informar os dados do cliente e confirmar o pedido.
- **Disponibilidade de horários:** consulta de horários a partir da agenda, da duração do serviço e dos horários já ocupados.
- **Fila de espera presencial:** cadastro de clientes sem agendamento, seleção de serviço e barbeiro, ordenação por chegada, mudança de status e estimativa de espera baseada na duração dos serviços. O painel administrativo e o painel público do salão atualizam os dados periodicamente.
- **Painel administrativo:** visão da agenda, filtros por data, profissional e situação, e atualização do status dos agendamentos.
- **Gestão da barbearia:** telas e operações para serviços, barbeiros, clientes e configurações do estabelecimento.
- **Cadastro e histórico de clientes:** pesquisa e consulta do histórico de atendimentos.
- **Financeiro:** recursos para acompanhar receitas, despesas e comissões dos barbeiros.
- **Lembretes e contato:** consulta de próximos lembretes e opção de preparar contato com o cliente pelo WhatsApp.
- **Áreas por perfil:** estrutura de páginas e APIs para administrador, barbeiro e cliente.
- **Planos FREE e PRO:** distinção entre planos e modos de demonstração nas telas administrativas.
- **API do sistema:** endpoints para autenticação e cadastro, agendamentos, disponibilidade, barbearias, serviços, barbeiros, clientes e operações administrativas.
- **Estrutura de dados:** modelos para usuários, barbearias, agenda, serviços, clientes, produtos, pedidos, avaliações, notificações e informações financeiras.

## Histórico por data

**Atividades previstas no cronograma (não confirmam, por si só, que foram concluídas):**

- **05/10/2026:** levantamento dos requisitos do agendamento, modelagem inicial dos dados, esboço das telas e observação do atendimento na barbearia.
- **07/10/2026:** definição da estrutura do projeto, planejamento das tabelas, revisão dos wireframes e levantamento de horários de funcionamento.
- **12/10/2026:** configuração do ambiente e do GitHub, preparação de dados de teste, definição visual e registro dos serviços e preços.
- **14/10/2026:** revisão do banco de dados, previsão do primeiro cadastro de clientes pela API, protótipo de agendamento e validação do fluxo.

**Marcos encontrados no histórico do código (Git):**

- **15/10/2026:** registro da implementação inicial do BarberON, com estrutura multi-barbearia e módulos de gestão.
- **20/10/2026:** alterações relacionadas a pagamento, webhook e estruturas de banco PostgreSQL/Supabase.
- **21/10/2026:** melhorias nos planos FREE e PRO, nas demonstrações dos perfis e nos links de checkout.
- **09/11/2026:** atualização deste resumo do estado do projeto.

O histórico disponível não descreve todas as atividades realizadas em cada dia; por isso, as datas do cronograma estão separadas dos marcos confirmados no Git.

## Acompanhamento do cronograma até 09/11/2026

O cronograma distribui as tarefas entre os integrantes, mas o código e o histórico Git não identificam com segurança a autoria individual de cada funcionalidade. Abaixo, “evidência no sistema” significa que o recurso está presente no projeto — não que seja possível atribuir sua implementação a uma pessoa específica.

### Etapas previstas e situação encontrada

- **Aulas 1 a 4 (05 a 14/10) — estruturação:** requisitos, modelo de dados, preparação do ambiente, protótipo e mapeamento do atendimento. Hoje existem modelos de dados e esquemas SQL/Prisma, dados de demonstração e módulos para clientes, serviços e agendamentos. O histórico registra a implementação inicial em 15/10, mas não confirma a conclusão de cada atividade ou protótipo.
- **Aulas 5 a 8 (19 a 28/10) — integração e agendamento:** o cronograma previa integrar telas e API, calcular horários, evitar conflitos e validar o fluxo. O sistema tem fluxo de agendamento, consulta de disponibilidade, verificação do horário antes de criar a reserva e telas administrativas. Não há registro suficiente para confirmar testes de campo, feedback do barbeiro ou as entregas em cada aula.
- **Aulas 9 a 11 (02 a 09/11) — fila de espera:** foram implementados cadastro de clientes presenciais, fila por barbeiro em ordem de chegada, estados de atendimento, estimativa de espera, painel administrativo e painel público em `/b/[slug]/fila`. Os painéis consultam a API a cada 8 segundos. Isso fornece atualização periódica, mas **não usa WebSocket nem push em tempo real**. A validação com clientes e barbeiros prevista para 09/11 ainda depende de teste em campo. As atividades de 11/11 ainda não ocorreram nesta data de referência.

### Participação prevista por integrante e evidências

- **Sávio Barros — coordenação e integração:** o cronograma lhe atribui requisitos e arquitetura, integração entre telas e API, navegação e coordenação do módulo de fila. O código contém agendamento conectado a APIs e telas de gestão; a fila foi adicionada com painel administrativo e página pública. O histórico Git não permite atribuir individualmente essas implementações.
- **Ben Hur — processos e dados:** o cronograma lhe atribui modelagem e manutenção de dados e APIs. O projeto contém esquemas SQL/Prisma, modelos TypeScript, persistência local em JSON e APIs de clientes, serviços, barbeiros, agendamentos e disponibilidade. A fila agora também possui modelo de dados e endpoints de consulta, cadastro e atualização de status. Não é possível confirmar autoria individual pelo histórico disponível.
- **Eric — UI/UX e interfaces:** o cronograma lhe atribui wireframes, protótipo e design das telas. O código contém interfaces de agendamento, painéis por perfil e, agora, painéis administrativo e público para a fila. Não foi localizado o protótipo Figma ou registro de testes de usabilidade; não se pode atribuir a autoria dessas telas individualmente.
- **João Henrique — validação e campo:** o cronograma lhe atribui mapeamento do atendimento, levantamento de horários e serviços, entrevistas e validações com barbeiro e clientes. Essas atividades de campo não podem ser comprovadas apenas pelo código ou pelo histórico Git consultado; precisam de registros da equipe, como entrevistas, feedbacks ou resultados de testes.

## Tecnologias e estrutura

- Next.js 16 e React 19
- TypeScript
- APIs construídas com Route Handlers do Next.js
- Supabase incluído entre as dependências e com configuração no projeto
- Persistência atualmente implementada principalmente em `data/database.json`
- Modelos relacionais documentados em `docs/schema.sql` e `docs/schema.prisma`

## Itens que precisam de implementação ou validação

- A integração e a persistência em um banco remoto, como Supabase, precisam ser configuradas e verificadas para o ambiente de produção; a presença da dependência, por si só, não confirma essa integração.
- Os lembretes disponíveis no sistema não comprovam, por si só, o envio automático e programado de mensagens.
- O login com Google e a redefinição de senha ainda não estão conectados a um fluxo real completo.
- A fila já atualiza por consulta periódica; ainda falta uma solução de atualização push/WebSocket se a exigência for tempo real estrito, além da validação presencial com a equipe e clientes.
- O portfólio de cortes “antes e depois” e o atalho de reagendamento estão previstos para fases posteriores do cronograma, ainda não realizadas na data deste resumo.
- O funcionamento em produção, incluindo implantação, segurança, pagamentos e testes com uma barbearia real, deve ser validado antes do lançamento.
- O projeto não possui, até esta posição, uma suíte de testes automatizados configurada nos scripts do aplicativo.

> **Observação:** este resumo descreve o que foi encontrado no código do projeto. Funcionalidades previstas no cronograma, mas ainda não verificadas no sistema, estão indicadas como pendentes ou a validar.

## Como executar localmente

Na pasta principal do repositório, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

O aplicativo Next.js está na pasta `barbearia-app`. O comando da pasta principal encaminha a execução para esse aplicativo. Para gerar uma compilação de produção:

```bash
npm run build
```
