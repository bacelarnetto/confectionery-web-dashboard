# Guia do Usuário

Espelho em Markdown do guia web feito em React (`src/modules/guia`). O guia web é a fonte
oficial — sempre que conteúdo for alterado lá, atualize este arquivo para refletir o mesmo.

**Seções:**

1. [Acesso e Usuários](#1-acesso-e-usuarios)
2. [Dashboard](#2-dashboard)
3. [Primeiros Passos](#3-primeiros-passos)
4. [Compras](#4-compras)
5. [Alertas de Insumo](#5-alertas-de-insumo)
6. [Gestão de Custos](#6-gestao-de-custos)
7. [Precificação Inteligente](#7-precificacao-inteligente)
8. [Vendas](#8-vendas)
9. [Financeiro](#9-financeiro)
10. [Mural da Semana](#10-mural-da-semana)
11. [Alertas de Pedido](#11-alertas-de-pedido)
12. [Relatórios](#12-relatorios)
13. [Histórico e Segurança](#13-historico-e-seguranca)

---

## 1. Acesso e Usuários

**Acesso e Usuários: entrando no sistema**

> Antes de cadastrar qualquer coisa, você precisa entrar — e o que aparece pra você depois disso depende de quem você é dentro da confeitaria.

### 1. Fazer login

Ao abrir o sistema sem estar autenticado, você vê uma tela simples com um botão **“Entrar”**. Ele leva você pra tela de login da confeitaria, onde você usa o usuário e a senha que foram cadastrados pra você.

Depois do login, você volta direto pro Dashboard — pronto pra trabalhar.

### 2. Sua sessão fica sempre visível

No canto superior direito, seu nome aparece sempre que você estiver logado. Ao lado dele, o ícone `Sair` encerra sua sessão e leva de volta pra tela de login.

> **💡 Dica:** Se por algum motivo sua sessão expirar no meio do trabalho, o sistema avisa e leva você de volta pro login — é só entrar de novo, nada se perde do que já estava salvo.

### 3. O menu se adapta ao seu perfil

Cada pessoa tem um perfil de acesso, definido no cadastro do seu usuário:

- `Admin`
- `Estoque`
- `Vendas`
- `Produção`

O perfil não esconde os módulos hoje — ele só libera o menu **Administração**, visível apenas para quem é **Admin**. Os demais perfis existem para organizar quem é quem na equipe, e servem de base para o sistema restringir mais telas no futuro.

### 4. Gerenciando a equipe (só para Admin)

Em `Administração → Usuários`, um Admin cadastra novas contas (nome, email, senha e perfil) e edita as existentes — inclusive trocando o perfil de alguém quando a função da pessoa na equipe muda.

Se o perfil não for escolhido no cadastro, a conta nova entra como **Estoque** por padrão; na edição, deixar o campo em branco mantém o perfil que a pessoa já tinha.

Ainda não existe um "esqueci minha senha" que a própria pessoa aciona sozinha. Se alguém esquecer a senha, quem resolve é o Admin: abre a tela de Usuários, edita a pessoa, digita uma senha nova no campo de senha e salva — a pessoa já consegue logar com a senha nova na hora.

### 5. Dados da Empresa e o logo nos documentos (só para Admin)

Em `Administração → Dados da Empresa`, cadastre razão social (obrigatória), nome fantasia, CNPJ, endereço, telefone e e-mail. Esses dados aparecem no cabeçalho dos documentos gerados pelo sistema, como o recibo de pedido.

Depois de salvar os dados pela primeira vez, a mesma tela libera o envio do **logo da confeitaria** (PNG ou JPEG, até 2MB) — ele passa a aparecer ao lado do nome da empresa em todo documento novo gerado a partir daí. Dá pra trocar ou remover o logo a qualquer momento, sem afetar o resto do cadastro.

### 6. Navegando pelas listas

Toda tela de lista do sistema (Pedidos, Clientes, Insumos, Compras, Contas a Receber e por aí vai) mostra, no rodapé da tabela, quantos registros existem no total e um seletor **“Itens por página”**, com as opções 20, 50 e 100. Escolha um número maior pra ver mais linhas de uma vez, sem precisar clicar em “próxima página” toda hora.

> **✅ Por que isso importa?**
>
> Porque cada ação registrada no sistema — uma compra confirmada, um pedido criado, um preço atualizado — fica associada a quem fez. Saber quem tem acesso, e como, é a base da confiança em qualquer equipe.

---

## 2. Dashboard

**Dashboard: seu painel de controle organizado**

> A primeira tela que você vê ao entrar (/) — agrupada em blocos temáticos claros, reunindo métricas e gráficos de cada setor com atalhos diretos.

### 1. Barra de atalhos e destaques do topo

No topo da tela, a barra de navegação rápida (**Destaques**, **Vendas**, **Estoque** e **Financeiro**) permite rolar diretamente para o setor desejado, além de exibir alertas caso haja itens abaixo do mínimo ou pedidos em aberto.

Logo abaixo, os **Destaques Executivos** mostram a foto geral do mês: Receita, Lucro Real Estimado, Volume de Pedidos e Total do Inventário, junto a uma faixa de atenção operacional com links rápidos.

### 2. Bloco Vendas & Pedidos

Reúne tudo relacionado ao comercial em um só lugar: indicadores de **Pedidos no Mês**, **Receita de Vendas**, **Pedidos em Aberto** e **Ticket Médio**, posicionados junto aos gráficos de **Top 5 Produtos Mais Vendidos** e **Distribuição de Pedidos por Status**.

O cabeçalho traz botões para criar um **Novo Pedido**, abrir o **Mural de Pedidos** ou consultar a listagem completa.

### 3. Bloco Estoque & Insumos

Concentra o valor imobilizado em estoque, os **Itens em Baixa**, fornecedores cadastrados e compras de insumos.

Acompanhado pelos gráficos de **Movimentações dos Últimos 7 Dias** (entradas vs. saídas) e **Maiores Volumes em Estoque**, com atalho direto para lançar uma **Nova Entrada** de insumos.

### 4. Bloco Financeiro & Compras

Traz o resultado do mês: Receita Realizada, Gastos Totais, Custo dos Doces (COGS) e Lucro Real.

Exibe o gráfico de **Gastos por Categoria**, o cartão de destaque com o saldo **A Receber** e o gráfico histórico de despesas com compras de insumos ao longo dos meses.

> **✅ Painel interativo e acionável**
>
> O Dashboard funciona como o ponto de partida do seu dia: você pode bater o olho nos alertas, clicar nos cards com pendências ou usar os botões de ação rápida para agir imediatamente sem se perder no menu.

---

## 3. Primeiros Passos

**Primeiros passos: sua cozinha no sistema**

> Três passos simples para o sistema começar a trabalhar com você — e não contra você. Sem pressa, sem complicação.

### 1. Cadastre os seus insumos (os ingredientes da cozinha)

No menu lateral, vá em **Estoque de Insumos → Insumos** e clique em “Novo”. Informe o nome (ex: “Farinha de trigo”), a unidade de medida (gramas, mililitros ou unidade) e o valor da unidade.

O valor que você cadastra é a base de tudo que vem depois: custo das receitas, precificação e até o alerta de estoque baixo. Quanto mais atualizado, mais honesto fica o seu preço.

Sempre que fizer uma compra e lançar a entrada do produto, confira se o valor continua igual. Se mudou, atualize. *(Pense assim: se o preço do leite subir e o sistema continuar com o valor antigo, a conta final sai errada.)*

Este cadastro é só o ponto de partida — o passo a passo completo de comprar e repor o estoque tem uma seção só para ele, logo a seguir.

### 2. Monte a sua Ficha Técnica (a receita do produto)

Uma receita é o “DNA” de custo de um produto. Vá em **Estoque de Produtos → Receitas**, clique em “Nova receita”, escolha ou crie o produto e liste os ingredientes com as quantidades usadas.

Todo produto pertence a uma **Categoria** (ex: “bolos redondos”, “doces”, “sobremesas”) — é o que organiza o seu cardápio nas telas de venda. Se o produto for novo, você escolhe uma categoria já existente ou cria uma na hora, sem sair da tela de receita. Elas também podem ser geridas em **Estoque de Produtos → Categorias**.

Cada produto só pode ter uma receita — é por isso que o custo dele é confiável e não vira um chute.

Ao salvar, o sistema tira a “foto” do preço de cada ingrediente naquele dia. Se o preço mudar amanhã, essa foto continua provando quanto custava naquele momento.

### 3. Registre a produção (a fabricação)

Quando produzir, vá em **Estoque de Produtos → Fabricação** e registre a fornada do produto.

O sistema faz dois serviços de uma vez: atualiza a “foto” dos preços da receita e desconta os ingredientes do seu estoque automaticamente.

É o único momento em que o estoque de **insumo** da receita diminui — e, do outro lado, é um dos dois jeitos de o estoque de **produto** aumentar: a fornada que você acabou de registrar fica disponível pra entrar num pedido.

Assim você nunca “aposta” se tem farinha suficiente: os alertas e o mural trabalham com a realidade da sua despensa.

Nem todo produto passa pela Fabricação — se você compra pronto de terceiro ou terceiriza a produção, use **Estoque de Produtos → Entradas** em vez disso: informe o produto, a quantidade e o custo unitário, e o lote entra direto no estoque, sem precisar de Receita nenhuma. *(Cada lote de produto guarda a sua origem (Fabricação ou Terceirizado) — dá pra ver isso na coluna 'Origem' do Estoque Atual.)*

> **✅ E agora?**
>
> Com insumos e receitas no sistema, o próximo passo é ver como comprar e repor o estoque no dia a dia.

---

## 4. Compras

**Compras: da lista até o estoque atualizado**

> Comprar não é só anotar numa lista de papel: no sistema, a compra confirmada vira estoque de verdade, sem você lançar entrada duas vezes.

### 0. Cadastre o fornecedor, se ainda não tiver um

Em **Compras → Fornecedores → Novo Fornecedor**, o único campo obrigatório é o **Nome** — endereço, telefone, e-mail, CNPJ, inscrição estadual e site são opcionais, preencha o que tiver à mão.

Fornecedor é opcional numa compra, mas ter os principais cadastrados agrupa seu histórico de compras por quem te atende.

### 1. Monte a lista de compras

Vá em **Compras → Compras** e clique em “Nova Compra”. Escolha um fornecedor (opcional) e adicione os itens: o insumo, a quantidade e o valor unitário que você espera pagar.

Pense nela como a sua lista de compras de mercado — só que essa, o sistema lembra pra você depois.

Precisa enviar a lista pro fornecedor? O ícone `Baixar PDF` na listagem de Compras gera um PDF com os itens da compra, prontos pra imprimir ou mandar por WhatsApp/e-mail.

### 2. Marque o que você realmente comprou

De volta da feira ou depois que o fornecedor entregou, edite a compra e marque a caixinha **“OK”** em cada item que você efetivamente recebeu.

Item sem a caixinha marcada não entra no estoque quando você confirmar o recebimento — é assim que o sistema separa o que foi planejado do que realmente chegou na sua cozinha.

> **💡 Dica:** O valor e a quantidade que valem pro estoque são os que estiverem na tela no momento da confirmação — se o preço na loja foi diferente do planejado, é só ajustar o item antes de marcar a caixinha.

### 3. Confirme o recebimento e deixe o sistema lançar o estoque

Na lista de Compras, clique no ícone verde de confirmação. A partir daí o sistema toma conta de tudo:

- Se nenhum item estiver marcado como comprado, ele avisa e não deixa prosseguir — evita lançar uma entrada vazia por engano.
- Se algum item comprado for de um insumo **perecível**, você é levado direto pra tela de Nova Entrada, com a compra já vinculada — perecíveis exigem lote e data de validade, informações que não cabem na lista rápida de compra.
- Caso contrário, uma última confirmação aparece e, ao aceitar, o sistema lança a entrada de estoque de uma vez e marca a compra como **confirmada**.

Ah, e se o valor unitário recebido for **maior** que o custo de referência do insumo, ele é atualizado sozinho nessa hora — suas receitas e precificação passam a usar o preço real que você pagou.

> **✅ Da checklist pro estoque, de uma vez só**
>
> Assim que você confirma, os itens marcados na checklist somam à quantidade do seu estoque — sem lançar entrada duas vezes, sem deixar item esquecido pra trás. A compra sai da lista de pendências e passa a fazer parte do seu histórico de compras.

---

## 5. Alertas de Insumo

**Alertas de Insumo: o sistema de olho na despensa**

> Você não precisa lembrar de checar validade ou nível de estoque todo dia — o sistema faz essa ronda sozinho.

### 1. Configure os limites, uma vez por insumo

Em **Estoque de Insumos → Parametrização**, escolha um insumo e defina a quantidade mínima, a quantidade máxima e quantos dias de antecedência você quer ser avisado antes de um lote vencer.

Sem essa parametrização, o insumo simplesmente não entra na verificação — sem erro, sem trava, só não gera alerta.

### 2. Três tipos de alerta

- `Vencimento`
- `Estoque Mínimo`
- `Estoque Máximo`

**Vencimento**: um lote específico está chegando perto da data de validade que você configurou.

**Estoque Mínimo**: o saldo total do insumo caiu abaixo do limite — hora de repor.

**Estoque Máximo**: o saldo passou do limite de cima — é só um aviso, não impede nenhuma entrada.

### 3. A verificação roda sozinha, todo dia às 8h

O sino no cabeçalho do sistema mostra a contagem de alertas ativos e se atualiza sozinho a cada minuto — dá pra perceber um alerta novo sem nem estar na tela de Alertas.

> **💡 Dica:** Não precisa esperar o horário automático: o botão “Verificar Agora”, na tela de Alertas, dispara a checagem na hora.

### 4. Resolva quando agir — ou deixe que se resolve sozinho

Um alerta de estoque some sozinho quando o saldo volta pra faixa normal (depois de uma entrada ou saída). Se quiser encerrar antes disso, o botão ✔ na lista de Alertas resolve manualmente.

> **✅ Alertas não se duplicam**
>
> Se já existe um alerta ativo do mesmo tipo pra aquele insumo (ou lote), a próxima verificação não cria outro — você não vai ver a mesma farinha em falta repetida dez vezes na lista.

---

## 6. Gestão de Custos

**Gestão de custos: os dois bolsos do seu negócio**

> Na hora de definir o preço de venda, você lida com dois tipos de custo. Entender a diferença é o que separa o preço no chute do preço consciente.

### 1. O custo dos ingredientes — o que vai para dentro da massa

É a soma de tudo que entra na receita: farinha, açúcar, ovos, manteiga. Quanto custa, em ingredientes, produzir uma unidade do seu produto.

Cada insumo tem um **custo de referência**. Toda vez que você registra uma entrada de insumo — manual ou recebendo uma compra — com valor unitário **maior** que esse custo de referência, o sistema atualiza o custo do insumo automaticamente, para suas receitas e precificação seguirem o mercado. Se o valor da entrada for **menor**, o custo de referência é mantido como está — e qualquer ajuste é feito por você, manualmente, na edição do insumo.

### 2. O custo fixo/variável — o que envolve a produção

São os gastos que existem mesmo fora dos ingredientes: energia do forno, embalagem padrão, mão de obra, o brinde na entrega.

Esse valor é sempre informado por você na hora de precificar — o sistema não tem como adivinhar a conta de luz da sua cozinha.

### Exemplo na prática

| Item | Valor |
|---|---|
| Custo dos ingredientes (bolo de cenoura) | R$ 10,00 |
| Custo fixo/variável (energia + embalagem) | R$ 5,00 |
| **Custo total de cada bolo** | **R$ 15,00** |

> **✅ Por que separar os dois?**
>
> Porque cada um mudou de um jeito. O custo dos ingredientes varia com o mercado; o fixo, com a rotina da cozinha. Juntos, eles formam o custo real — e é em cima dele que a precificação inteligente trabalha.

---

## 7. Precificação Inteligente

**A mágica da precificação inteligente**

> Você define quanto quer ganhar. O sistema faz a conta. Simples assim — e sempre transparente, para você conferir.

### A conta que o sistema faz

```
(custo dos ingredientes + custo fixo) ÷ (1 − margem ÷ 100) = preço sugerido
```

A margem de lucro é calculada sobre o preço de venda. Ou seja: a porcentagem que você define é exatamente o que fica com você em cada venda. *(Exemplo: com margem de 50%, de cada R$ 100 vendidos, R$ 50 ficam para você depois de pagar os custos.)*

### O mesmo exemplo, com números

| Item | Valor |
|---|---|
| Custo dos ingredientes | R$ 10,00 |
| Custo fixo/variável | R$ 5,00 |
| Margem de lucro desejada | 50% |
| **Conta: R$ 15,00 ÷ (1 − 0,50)** | **R$ 30,00** |
| O que fica com você (lucro bruto) | R$ 15,00 |

R$ 15,00 é exatamente 50% do preço de venda. Nada de conta surpresa quando você rescindir o preço de um bolo.

### 1. Informe os custos e a margem

Vá em **Estoque de Produtos → Produtos**, abra a edição do produto que você quer precificar e role até a seção “Precificação”, logo abaixo dos dados do produto. *(A precificação só aparece depois que o produto já existe — por isso ela fica na tela de edição, não na de cadastro inicial.)*

Acabou de cadastrar o produto agora? Você nem precisa procurar essa tela: ao salvar um produto novo, o sistema já te leva direto pra edição dele — a seção de Precificação já aparece ali embaixo, pronta pra usar.

Ali, informe o custo fixo/variável e a margem de lucro que você deseja.

O custo dos ingredientes pode vir automaticamente da sua receita *(Quando o custo vem da receita, o sistema soma o valor fotografado de cada ingrediente — você não precisa digitar nada.)*, ou ser digitado manualmente quando não houver receita cadastrada.

### 2. Receba o preço sugerido na hora

Conforme você ajusta os valores, o sistema calcula o preço sugerido e mostra na tela — sem você apertar nenhum botão.

Quando aparecer “calculando...” no lugar do preço, aguarde um instante: a conta é feita no servidor, com o mesmo cuidado para todos os produtos.

É de propósito que o sistema faz a conta: assim a fórmula nunca erra, nem precisa ser redecorada no seu celular.

### 3. Faça o ajuste comercial final — você decide

O campo de preço final já vem preenchido com o valor sugerido. Você pode mantê-lo ou ajustar: arredondar para R$ 29,90, competir com um concorrente, cobrir uma data especial...

Esse é um ajuste comercial seu sobre o preço — e ele fica registrado, lado a lado com o valor sugerido.

> **✅ Quem decide o preço final é sempre você**
>
> A fórmula sugere um número justo com base no que você informou — mas a palavra final sobre quanto cobrar é sua. O sistema só garante que a conta esteja certa; a decisão comercial continua sendo sua.

---

## 8. Vendas

**Vendas: do cliente ao pedido pronto**

> Aqui é onde tudo que você organizou vira venda de verdade — cliente, produto, preço e prazo, tudo num só lugar.

### 1. Cadastre o cliente

Vá em **Vendas → Clientes** e clique em “Novo”. Nome é o único campo obrigatório — CPF, e-mail e telefone você preenche se quiser.

Um cliente pode ter vários endereços de entrega, cada um com uma descrição própria (“Casa”, “Trabalho”...) — na hora de montar o pedido, você escolhe entre eles num select, sem precisar redigitar nada.

### 2. Cadastre complementos, se usar

Em **Vendas → Complementos**, busque o insumo pelo nome — nome, categoria e custo vêm preenchidos automaticamente a partir dele, sem digitar nada solto.

Marque **"Complemento padrão"** quando o custo dele já estiver embutido no preço do produto (ex: a embalagem que todo bolo leva) — esse tipo nunca cobra separado. Deixe desmarcado pra um complemento que é vendido à parte (ex: um brilho especial) — aí você define o valor de venda.

Um complemento padrão é associado a um produto na própria tela de **Estoque de Produtos → Produtos** (edição) — a partir daí, ele entra sozinho sempre que esse produto aparece num orçamento ou pedido.

> **💡 Dica:** Complemento é opcional — só cadastre se sua confeitaria de fato vende extras separados do produto principal (recheio a mais, embalagem especial, cobertura...).

### 3. Negocie antes com um orçamento, se precisar

Em **Vendas → Orçamentos → Novo Orçamento**, monte uma proposta com os mesmos itens de um pedido, mais uma data de validade. Enquanto o orçamento estiver **Aberto**, os itens continuam editáveis — é ali que você ajusta a proposta junto com o cliente antes de fechar.

Quando o cliente decidir, registre a resposta: **Aprovar** gera um Pedido de verdade automaticamente, com exatamente os itens que sobraram na negociação; o que foi removido no caminho nunca chega no pedido. **Rejeitar** encerra o orçamento sem criar nada. As duas ações são definitivas — não dá pra reabrir um orçamento já decidido.

O campo **Observação** é seu bloco de notas da negociação — anote o que combinou com o cliente ali mesmo, sem precisar de outra ferramenta.

O botão **PDF** (na lista ou dentro do orçamento) gera um documento com os itens, complementos e o total — pronto pra imprimir ou enviar pro cliente.

O campo **Data do Evento** é o dia da festa em si — diferente de **Válido até**, que é só o prazo da proposta. Se o orçamento for aprovado, essa data vira a **Data de Entrega** do pedido gerado automaticamente.

Também dá pra propor um **Apoio de Festa** já no orçamento (mesma seção que existe no Pedido, veja o passo 7 mais abaixo, incluindo o atalho **"Carrinho (dia inteiro)"** baseado na Data do Evento) — mas é só uma proposta, sem reserva de verdade: não trava a frota nem entra no valor do orçamento. Só quando o cliente aprova é que a proposta vira um Apoio de Festa de verdade no Pedido gerado, com a disponibilidade sendo travada só nesse momento.

> **💡 Dica:** Orçamento é opcional — se o cliente já fechou o pedido, pode ir direto pro passo seguinte.

### 4. Monte o pedido

Em **Vendas → Pedidos → Novo Pedido**, escolha o cliente (definitivo depois de salvar — não dá pra trocar de cliente num pedido já criado), o endereço de entrega (ou marque “retira no local”) e a data de entrega.

Marcar “retira no local” some com o campo de frete — ele fica desabilitado e é limpo automaticamente, já que não existe frete pra buscar no balcão. Assim como no orçamento, o campo **Observação** fica disponível pra qualquer nota livre sobre o pedido.

Para cada item, escolha o produto e a quantidade. O valor unitário já vem preenchido com o preço vigente *(Assim que você escolhe o produto, o sistema busca a precificação vigente dele — você pode ajustar esse valor no próprio item, se quiser.)*, mas você pode ajustar — e ainda dá pra aplicar desconto por item.

Os complementos padrão do produto aparecem sozinhos, marcados **Incluso** (sem cobrar) — todo item desse produto sempre leva eles, sem exceção. Busque por nome pra adicionar complementos extra — o valor de cada um soma no total do item.

O valor total do pedido é sempre calculado pelo sistema, somando os itens, complementos, descontos e o frete.

### 5. Avance o status direto na lista

Na lista de **Pedidos**, o status aparece como um seletor colorido na própria linha — não precisa abrir o pedido pra avançar de uma etapa pra outra.

```
RASCUNHO → CONFIRMADO → EM PRODUÇÃO → PRONTO → A CAMINHO → ENTREGUE → CONCLUÍDO
```

`CANCELADO` pode acontecer a partir de qualquer etapa acima, a qualquer momento.

Marcar **EM PRODUÇÃO** é o segundo (e último) momento em que o sistema mexe em estoque sozinho: o produto vendido sai do estoque de produto — abastecido pela Fabricação ou por uma Entrada de Produto direta, no caso de terceirizado — e, se o pedido tiver algum complemento, o insumo dele também é descontado ali, na hora, já que complemento não passa pela Fabricação.

**A CAMINHO** é o intervalo entre sair pra entrega e o cliente confirmar o recebimento — separado de **PRONTO** (que só diz que a produção terminou) e de **ENTREGUE** (que confirma que o produto chegou).

**CONCLUÍDO** é o status final de sucesso do pedido — só pode ser marcado depois que o pedido estiver **100% pago**; se ainda tiver saldo em aberto, o sistema recusa e avisa. Diferente de ENTREGUE, que só confirma a entrega física, CONCLUÍDO fecha o pedido de vez, sem pendência nenhuma. CANCELADO continua sendo o único jeito de um pedido terminar sem sucesso, e pode acontecer a partir de qualquer etapa antes de CONCLUÍDO.

> **💡 Dica:** Pedido pode ser salvo (e ficar em RASCUNHO) mesmo com um item de produto sem estoque — é assim de propósito, pra dar pra registrar uma encomenda futura sem travar. O bloqueio só acontece na hora de avançar pra EM PRODUÇÃO: se faltar estoque de algum produto do pedido, o sistema recusa, avisa qual item é e destaca em vermelho a linha dele na tela de edição do pedido. Pra resolver, remova (ou ajuste) o item sem estoque — ou reponha o estoque desse produto — e tente avançar de novo.

### 6. Registre os pagamentos e emita o recibo

Dentro do pedido, o card **Pagamento** mostra o total do pedido, quanto já foi pago e o saldo. Clique em **Registrar Pagamento** pra lançar um valor recebido — informe o valor, a data e a **forma de pagamento** (Pix, dinheiro, cartão...). Um pedido pode ter vários pagamentos ao longo do tempo — por exemplo, metade na confirmação e o restante na entrega.

As formas de pagamento aceitas ficam em **Vendas → Formas de Pagamento** — o sistema já vem com Dinheiro, Pix, Cartão de Crédito, Cartão de Débito, Transferência e Outros cadastrados, mas você pode ajustar essa lista livremente.

O botão **Baixar Recibo**, no mesmo card, gera um PDF único do pedido — com os itens, todos os pagamentos já recebidos (com a forma de cada um) e o saldo restante, se houver. Ele só fica disponível depois do primeiro pagamento registrado, e serve tanto pra você guardar quanto pro cliente usar como comprovante (inclusive pra pedir reembolso ao empregador, se for o caso).

Pra ver todo saldo pendente de uma vez — de pedidos e de contas avulsas — sem abrir um por um, use **Financeiro → Contas a Receber**. A lista lá também é paginada de verdade agora, então dá pra navegar tranquilo mesmo com muitas pendências em aberto.

> **💡 Dica:** Um pedido ENTREGUE que ainda não foi pago (nem em parte) mostra um ícone de cifrão vermelho ao lado do status, na própria lista de Pedidos — dá pra ver quem está devendo sem abrir pedido por pedido.

### 7. Alugue equipamento de apoio, se o evento precisar

**Apoio de Festa** é o aluguel de um equipamento junto com o pedido — carrinho de doces, tacho, decoração, bandeja, toalha de mesa... O catálogo do que existe pra alugar fica em **Vendas → Itens de Apoio** (nome, tipo, valor por hora e a frota — quantas unidades daquele item você tem).

Ele só existe vinculado a um pedido: dentro da tela de editar um pedido já salvo, a seção **Apoio de Festa** deixa você adicionar um aluguel — escolha o item, a hora de início e a hora de fim (sempre no mesmo dia). O valor é calculado sozinho (valor por hora × horas contratadas) e soma automaticamente no total do pedido, sem precisar editar mais nada.

O botão **"Carrinho (dia inteiro)"** é um atalho pro caso mais comum — pré-preenche o horário como 08h às 22h (horário de Brasília) no mesmo dia da **Data de Entrega** do pedido, mas os dois horários continuam editáveis se precisar ajustar. Só fica disponível depois que a Data de Entrega do pedido é preenchida.

Alguns itens também oferecem um **atendente** que acompanha/entrega o equipamento durante o evento — quando o item tem essa opção cadastrada, aparece uma caixinha **"Incluir atendente"** no momento de adicionar o aluguel, com uma tarifa extra por hora somada junto.

Dá pra designar também um **Colaborador** específico pro aluguel (cadastrado em **Vendas → Colaboradores**: nome, telefone, e-mail e endereço) — é independente da caixinha de atendente acima, então dá pra designar um colaborador sem cobrar mão de obra, ou cobrar mão de obra sem designar ninguém ainda.

Pra cancelar, use o ícone de cancelamento na própria lista do pedido — o valor sai do total do pedido na hora, sem desfazer. Em **Vendas → Apoios de Festa** fica a lista geral de todos os aluguéis, de todos os pedidos, com filtro por item, pedido, status e dia — útil pra ver a agenda da frota sem abrir pedido por pedido.

> **💡 Dica:** A disponibilidade trava por dia inteiro, não por horário: se a frota daquele item já estiver toda ocupada num dia (mesmo em turnos diferentes, como manhã e noite), o sistema recusa qualquer novo horário nesse mesmo dia — só libera no dia seguinte. O modal já mostra quantas unidades sobram antes de você tentar salvar.

> **✅ Muitos pedidos abertos ao mesmo tempo?**
>
> A lista de Pedidos é ótima pra gestão, mas fica pesada quando você só quer saber “o que preciso fazer hoje”. Pra isso existe o Mural da Semana — a próxima seção.

---

## 9. Financeiro

**Financeiro: gastos e contas a receber**

> O lado do dinheiro que não é venda: o que sai (Gastos) e o que ainda está pendente de entrar (Contas a Receber), de Pedidos ou não.

### 1. Cadastre os Tipos de Gasto que fizerem sentido pra você

Em **Financeiro → Tipos de Gasto**, cadastre categorias livres — "Aluguel", "Energia", "Marketing", "Mão de obra"... o que fizer sentido pro seu negócio. É só um nome, sem formulário complicado.

São essas categorias que alimentam o gráfico **Gastos por Categoria** no Dashboard — quanto mais organizadas, mais útil o gráfico fica.

### 2. Lance um Gasto

Em **Financeiro → Gastos → Novo Gasto**, informe o **Tipo de gasto** e o **Valor** — únicos campos obrigatórios. Descrição, data de pagamento, data de competência e documento (número da nota, recibo...) são opcionais.

Marque **"Gasto recorrente"** pra sinalizar um gasto que se repete todo mês (aluguel, por exemplo) — é só uma marcação informativa, não gera lançamentos automáticos nos meses seguintes.

> **💡 Dica:** Produto terceirizado (ex.: um bolo feito por outra pessoa) e frete/Uber de busca também entram aqui como Gasto — não é só conta fixa de aluguel/energia.

### 3. Contas a Receber: Pedidos e Contas Avulsas, numa lista só

Em **Financeiro → Contas a Receber**, você vê todo saldo pendente de recebimento — sem precisar abrir pedido por pedido. A coluna **Origem** mostra se veio de um **Pedido** do sistema ou de uma **Conta Avulsa** *(Conta Avulsa é um recebimento que não veio de um Pedido cadastrado no sistema — por exemplo, uma venda combinada por fora ou um adiantamento avulso.)*. Desmarque **"Apenas pendentes"** pra ver também o que já foi totalmente recebido.

Clique em **"Nova Conta Avulsa"** pra cadastrar uma: descrição e valor são obrigatórios; data de vencimento e um motivo/observação livre são opcionais. Não tem vínculo com cliente — é um valor solto, identificado só pela descrição que você escrever.

### 4. Registre o recebimento

Clique no ícone de recebimento na linha da conta, informe o valor e a data. Pra Pedido, também é preciso escolher a **forma de pagamento**; Conta Avulsa não pede isso.

O status muda sozinho conforme o valor recebido se acumula: **Aberto** (nada recebido ainda), **Parcial** (recebeu uma parte) e **Pago** (saldo zerado).

> **💡 Dica:** O recebimento pode ser parcial — o sistema nunca deixa você registrar mais do que o saldo pendente daquela conta.

> **✅ Excluir uma Conta Avulsa**
>
> Uma Conta Avulsa que ainda não recebeu nada pode ser excluída da lista normalmente. Se ela já tiver algum valor recebido, o sistema bloqueia a exclusão e avisa — assim você não corre o risco de apagar sem querer uma receita que já entrou na sua contabilidade do mês.

---

## 10. Mural da Semana

**Mural da Semana: o post-it da sua cozinha**

> Uma visão pra olhar e saber na hora o que está pendente — o equivalente digital do mural de comandas de uma cozinha profissional.

### 1. Navegue pela semana

Em **Vendas → Mural da Semana**, os pedidos aparecem como cards soltos, em ordem de data de entrega — o mais próximo de vencer primeiro.

Use as setas ◀/▶ pra olhar a semana anterior ou seguinte, e o botão “Semana atual” pra voltar de onde saiu.

### 2. A cor do card avisa antes de você ler qualquer coisa

| Cor | Significado |
|---|---|
| `Vermelho` | atrasado ou hoje |
| `Laranja` | entrega amanhã |
| `Amarelo` | 2 a 3 dias |
| `Verde` | sem pressa |
| `Cinza (riscado)` | entregue ou cancelado |

A cor comunica **prazo**, não status — o status do pedido continua aparecendo como badge dentro do card, só que como detalhe secundário.

### 3. O aviso de ingrediente insuficiente aparece direto no card

Quando faltar insumo pra produzir um pedido, um aviso `⚠ Ingredientes insuficientes` some direto no card — sem precisar abrir nada pra descobrir que vai faltar farinha.

### 4. Clique no card pra ver tudo, ou vá direto editar

Ao clicar num card, abre um modal com todos os detalhes: endereço de entrega, itens, complementos, frete. Um atalho “Ir para o pedido” leva você direto pra edição, se precisar mudar algo.

O botão **"Imprimir Comanda"**, no mesmo modal (e também na lista de Pedidos), gera uma comanda pronta pra levar pra cozinha — cliente, itens, complementos, horário de entrega e observações, num formato pensado pra impressão. Fica desabilitado pra pedidos **cancelados**.

> **✅ Duas ferramentas, dois propósitos**
>
> O Mural não substitui a lista de Pedidos — ela continua existindo pra gestão (filtros, edição, exclusão). O Mural é pra operação: o que olho de relance na cozinha pra saber o que fazer agora.

---

## 11. Alertas de Pedido

**Alertas de Pedido: o prazo nunca pega de surpresa**

> Assim como os insumos, os prazos de entrega também têm um sistema de olho neles — sem você precisar ficar contando dias no calendário.

### 1. Gerados sozinhos, todo dia às 8h

Diferente dos alertas de insumo, aqui não existe parametrização pra configurar — todo pedido com status CONFIRMADO, EM_PRODUÇÃO ou PRONTO entra automaticamente na verificação diária.

### 2. Uma linha do tempo até a entrega

```
SEMANAL → 3 DIAS → 2 DIAS → 1 DIA → HOJE → ATRASADO
```

Toda segunda-feira sai um alerta **semanal** com tudo que tem entrega marcada pra aquela semana. Dali em diante, o mesmo pedido pode acumular um alerta novo a cada marco — 3 dias, 2 dias, 1 dia, no dia — até virar atrasado, se passar da data sem ser entregue.

### 3. O alerta de 3 dias já checa se dá pra produzir

Só no alerta de **3 dias**, o sistema cruza os ingredientes necessários pra esse pedido com o que tem no estoque agora. Se faltar algo, o alerta já chega marcado com `⚠ Ingredientes insuficientes` — tempo de sobra pra repor antes de virar problema.

### 4. Reconheça o alerta, não "resolva"

Em **Vendas → Alertas de Pedidos** fica a lista completa: os cards vêm **agrupados por urgência, atrasados primeiro**, e cada seção mostra a contagem — o card traz o cliente, a data de entrega e, quando houver, o aviso de `⚠ Ingredientes insuficientes`.

O botão aqui é **"Reconhecer"**, não "Resolver" — ele só tira o alerta da contagem. A pendência de verdade encerra quando o próprio pedido avança de status (é entregue, concluído ou cancelado) e deixa de entrar nas verificações diárias.

O atalho **"Ver pedido"** leva direto pra edição, sem procurar na lista completa.

### 5. Os seis lugares onde você vê o prazo na tela

O alerta não mora numa tela só — ele aparece nos seis pontos abaixo, sempre com a **mesma informação**, em graus diferentes de destaque:

- **Sino no topo**: mostra a contagem de alertas ativos num badge — vermelho se houver atrasado, laranja caso contrário. Passar o mouse abre um resumo com os 5 mais urgentes; clicar leva pra lista completa.
- **Faixa no topo**: em qualquer tela, quando existe pedido precisando de atenção: “N pedidos precisam de atenção” — vermelha se há atrasado, laranja se ainda dá tempo. Botão “Ver alertas” vai direto pra lista.
- **Menu lateral**: o item “Alertas de Pedidos” carrega o mesmo contador do sino.
- **Tela dedicada**: “Vendas → Alertas de Pedidos” — a lista completa com todos os cards e os botões Reconhecer / Ver pedido.
- **Mural da Semana**: o card do pedido assume a cor da urgência (vermelho atrasado/hoje, laranja 1 dia, amarelo 2–3 dias) e exibe o aviso de ingredientes — o prazo aparece sem você nem precisar abrir o alerta.
- **Lista de Pedidos**: a coluna “Entrega” ganha um selo de urgência junto à data: Atrasado (vermelho), Hoje (laranja) ou Em 1–3 dias (amarelo) — dá pra ver de relance quais pedidos precisam de atenção sem sair da lista.

> **✅ Uma cor, um significado, em qualquer lugar**
>
> Vermelho é atrasado, laranja é hoje/urgente, amarelo ainda dá tempo, azul é a visão da semana. Essa mesma lógica de cor vale na faixa do topo, no sino, na lista e nos cards do mural — você entende a urgência num relance.

---

## 12. Relatórios

**Relatórios: os números da sua confeitaria, prontos pra levar**

> Cada relatório aqui é uma leitura pronta do que já está registrado no sistema — nada é recalculado ou estimado, é o retrato exato do que você cadastrou em Vendas, Compras e Estoque.

### 1. Faturamento Mensal

Mostra, mês a mês, quantos pedidos você fechou, o faturamento total e o ticket médio. Ajuste quantos meses pra trás quer olhar — de um retrato do mês atual até um histórico mais longo pra enxergar sazonalidade.

### 2. Custo de Produção

Para cada produto, separa o que veio do custo de ingrediente do que veio do custo fixo, e mostra a margem, o valor de venda e o lucro bruto lado a lado. Pode filtrar por categoria de produto pra olhar só uma linha do seu catálogo.

É a mesma lógica de custo explicada em Gestão de Custos e Precificação — aqui ela vira uma tabela comparativa entre produtos, em vez do detalhe de um produto só.

### 3. Movimentação de Estoque

Lista entradas e saídas de insumo num período, com data, tipo e quantidade. Filtre por intervalo de datas e, se quiser, só entradas ou só saídas — útil pra conferir se o que saiu bate com o que sua produção deveria ter consumido.

### 4. Exporte pra fora do sistema

Todo relatório tem os mesmos dois botões no canto superior: `CSV` e `PDF` — CSV pra abrir numa planilha (Excel, Google Sheets) e continuar analisando por conta própria, PDF pra imprimir ou enviar como está, sem precisar printar a tela.

O arquivo exportado respeita os filtros que estiverem ativos na hora do clique — período, categoria, tipo.

> **✅ Não é aqui que se decide nada**
>
> Relatórios só leem o que já aconteceu — mudar um preço, negociar um orçamento ou registrar uma compra continua acontecendo nas telas de cada domínio. Pense nele como a prestação de contas, não como o lugar de trabalho.

---

## 13. Histórico e Segurança

**Histórico e segurança: a foto dos seus custos**

> Tudo o que você salva fica registrado. Quando o mundo muda e o preço do leite sobe, o seu histórico continua de pé — e é isso que dá autonomia ao seu negócio.

### 1. Cada preço salvo vira um capítulo do histórico

Cada vez que você salva uma precificação, o sistema cria um registro novo e arquiva o anterior — a validade do preço antigo é encerrada ali mesmo.

Nada é apagado nem sobrescrito: você pode revisitar, a qualquer momento, quanto cobrava em cada época.

### 2. O sugerido e o praticado ficam juntos

Para cada preço, o histórico guarda dois números: o que a fórmula sugeriu e o preço final que você praticou.

Isso permite revisar por que um preço mudou — e ter a segurança de que a decisão foi sua, consciente e documentada.

### 3. A foto da receita nunca é substituída, só renovada

Você já viu em Primeiros Passos que cada receita guarda a foto do preço dos ingredientes no dia em que foi salva.

Aqui é onde essa foto prova o seu valor: mesmo que o preço de um insumo suba amanhã, o custo registrado daquele dia continua exatamente como estava — nada é reescrito por trás, silenciosamente.

### 4. A venda que não muda depois

Ao registrar um pedido, o preço de cada item fica congelado ali — imutável, exatamente como foi vendido.

Mesmo que um ingrediente triple de preço depois, os pedidos antigos continuam com o valor da época. Você e o cliente ficam protegidos, sem surpresa na hora de fechar a conta.

> **✅ Por que isso importa?**
>
> Porque preço é memória. O sistema guarda a história para você não depender da memória — e poder confiar no forno e na próxima fornada.