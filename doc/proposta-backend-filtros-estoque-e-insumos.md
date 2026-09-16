# Proposta de Arquitetura: Filtros de Banco de Dados para Estoque e Insumos

**Documento:** RFC / Especificação de Melhoria de Backend (Versão Consolidada)  
**Repositório Alvo:** `confectionery` (Backend Spring Boot / Java)  
**Módulos Impactados:** `Insumo`, `EstoqueInsumo`, `EntradaInsumo`  
**Data:** 15/09/2026  
**Status:** Alinhado e Aprovado para Implementação  

---

## 1. Contexto e Justificativa de Negócio

Nas telas de listagem do frontend (`confectionery-web-dashboard`), os dados são carregados via **paginação de servidor** (`page=0, size=20`).

O projeto segue a diretriz explícita de **evitar truncamento ou filtragem silenciosa no cliente** (conforme já estabelecido no item 33 do `PROJECT_CONTEXT.md`). Filtros aplicados apenas no frontend sobre listas paginadas causam falsos negativos críticos — por exemplo, itens relevantes que caem na página 2 ou 3 simplesmente não aparecem quando o usuário clica em um filtro rápido na página 1.

Portanto, os filtros de negócio devem ser resolvidos diretamente no banco de dados via query params na API REST.

---

## 2. Deliberação Arquitetural: Validade em `EntradaInsumo` vs. `AlertaInsumo`

Durante a revisão técnica da proposta inicial, avaliou-se a criação de um filtro `statusValidade=PROXIMO_VENCIMENTO` na rota `GET /entrada-insumo`. 

**Decisão de Consenso:** Esse parâmetro foi **descartado** pelos seguintes motivos:
1. **Problema de Regra de Negócio (Alarme Falso de Insumo Já Consumido):** Uma `EntradaInsumo` é um registro fiscal/histórico de recebimento. Se uma entrada de 5kg de creme de leite foi recebida há 2 semanas com validade para amanhã, mas esse lote já foi 100% consumido na produção (saldo atual = 0), filtrar validade na tabela de entradas traria essa nota, dando a falsa impressão ao operador de que há produto vencendo no estoque físico.
2. **Evita JOIN e DISTINCT Complexos no Backend:** Economiza a necessidade de joins entre `EntradaInsumo` e `ItemEntradaInsumo` com `DISTINCT` para paginação de notas com múltiplos itens.
3. **Módulo Especializado Já Existente (`AlertaInsumo`):** O sistema já possui a entidade `AlertaInsumo` (`tipoId = 1 - VALIDADE`), que:
   - Cruza a validade diretamente com o saldo de estoque real;
   - Respeita a regra personalizada de dias de antecedência de cada insumo (`quantidadeDiasVencimento` em `ParametrizacaoAlerta`);
   - Possui fluxo operacional com status Ativo/Resolvido e contadores em tempo real.

**Integração no Frontend:** Na tela de Estoque/Entradas, haverá um atalho direto e contextual direcionando o operador para `/estoque-insumos/alertas?tipoId=1&ativo=true` para ação imediata sobre insumos a vencer.

---

## 3. Especificação dos Parâmetros Aprovados para o Backend

### 3.1. `GET /insumo`

* **Situação Atual:** Aceita `id`, `categoriaId`, `nome`, `page`, `size`.
* **Novo Parâmetro Aprovado:**

| Parâmetro | Tipo | Exemplo | Descrição / Regra JPA |
| :--- | :--- | :--- | :--- |
| `perecivel` | `Boolean` | `true` ou `false` | Filtra pela coluna booleana `insumo.perecivel` |

#### Exemplo de Regra Specification:
```java
if (filter.getPerecivel() != null) {
    predicates.add(cb.equal(root.get("perecivel"), filter.getPerecivel()));
}
```

---

### 3.2. `GET /estoque-insumo`

* **Situação Atual:** Aceita `insumoId`, `categoriaId`, `page`, `size`.
* **Novo Parâmetro Aprovado:**

| Parâmetro | Tipo | Exemplo | Descrição / Regra JPA |
| :--- | :--- | :--- | :--- |
| `statusSaldo` | `enum` | `COM_SALDO`, `ZERADO` | `COM_SALDO`: `quantidade > 0`<br>`ZERADO`: `quantidade <= 0` |

#### Exemplo de Regra Specification:
```java
if (filter.getStatusSaldo() == StatusSaldoEnum.COM_SALDO) {
    predicates.add(cb.greaterThan(root.get("quantidade"), BigDecimal.ZERO));
} else if (filter.getStatusSaldo() == StatusSaldoEnum.ZERADO) {
    predicates.add(cb.lessThanOrEqualTo(root.get("quantidade"), BigDecimal.ZERO));
}
```

---

### 3.3. `GET /entrada-insumo`

* **Situação Atual:** Aceita `compraId`, `dataInicial`, `dataFinal`, `page`, `size`.
* **Novos Parâmetros Aprovados:**

| Parâmetro | Tipo | Exemplo | Descrição / Regra JPA |
| :--- | :--- | :--- | :--- |
| `origem` | `enum` | `COMPRA`, `MANUAL` | `COMPRA`: `compraId IS NOT NULL`<br>`MANUAL`: `compraId IS NULL` |
| `pendentePreenchimento` | `Boolean` | `true` | Retorna entradas originadas de compra (`compraId IS NOT NULL`) onde pelo menos um item possui `lote`, `dataFabricacao` ou `dataValidade` nulos |

#### Exemplo de Regra Specification:
```java
if (filter.getOrigem() == OrigemEntradaEnum.COMPRA) {
    predicates.add(cb.isNotNull(root.get("compraId")));
} else if (filter.getOrigem() == OrigemEntradaEnum.MANUAL) {
    predicates.add(cb.isNull(root.get("compraId")));
}

if (Boolean.TRUE.equals(filter.getPendentePreenchimento())) {
    Join<EntradaInsumo, ItemEntradaInsumo> itensJoin = root.join("itens", JoinType.INNER);
    predicates.add(cb.isNotNull(root.get("compraId")));
    predicates.add(cb.or(
        cb.isNull(itensJoin.get("lote")),
        cb.isNull(itensJoin.get("dataFabricacao")),
        cb.isNull(itensJoin.get("dataValidade"))
    ));
    query.distinct(true);
}
```

---

## 4. Status: Implementado no Backend (2026-09-15)

Os 4 parâmetros foram implementados no repositório `confectionery`, seguindo o padrão de query JPQL condicional (`:param IS NULL OR ...`) já usado em todos os outros endpoints paginados do projeto — **não** o estilo `Specification`/`CriteriaBuilder` do exemplo original da seção 3 (nenhum endpoint do backend usa esse padrão; a implementação segue o estilo já estabelecido, o resultado funcional é o mesmo). Suite 414/414 verde, container local reconstruído e saudável.

### 4.1. `GET /insumo`
Novo parâmetro: `perecivel` (`true`/`false`, opcional). Comportamento exatamente como especificado na seção 3.1 — sem surpresas.

### 4.2. `GET /estoque-insumo`
Novo parâmetro: `statusSaldo` (string, valores `COM_SALDO` ou `ZERADO`, opcional). Comportamento como especificado na seção 3.2.

### 4.3. `GET /entrada-insumo`
Dois novos parâmetros:
- `origem` (string, valores `COMPRA` ou `MANUAL`, opcional) — resolvido a partir de `compraId` (`COMPRA` = tem `compraId`; `MANUAL` = não tem), exatamente como especificado.
- `pendentePreenchimento` (`true`/`false`, opcional) — como especificado na seção 3.3, mas **um detalhe de implementação que não muda o contrato pro frontend**: a query interna usa `EXISTS` (subquery) em vez de `JOIN + DISTINCT` como o exemplo sugeria, porque o MySQL rejeita `SELECT DISTINCT id ... ORDER BY coluna_fora_do_select` (erro real encontrado testando: "this is incompatible with DISTINCT"). Resultado observável pro frontend é idêntico ao especificado — só um detalhe de implementação, registrado aqui caso seja útil pra vocês em queries parecidas no futuro.

### 4.4. Próximos passos no Frontend (`confectionery-web-dashboard`)
1. No service `insumoService.getAll`, mapear `perecivel?: boolean`.
2. No service `estoqueInsumoService.getAll`, mapear `statusSaldo?: 'COM_SALDO' | 'ZERADO'`.
3. No service `entradaInsumoService.getAll`, mapear `origem?: 'COMPRA' | 'MANUAL'` e `pendentePreenchimento?: boolean`.
4. As telas de listagem podem adicionar botões de filtro rápido que injetam diretamente esses parâmetros nas chamadas de API, garantindo 100% de integridade com a paginação do servidor.
5. Ambiente local (`http://localhost`) já está atualizado com os 4 filtros pra vocês testarem ao vivo assim que quiserem.
