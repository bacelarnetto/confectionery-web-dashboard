import { Routes, Route } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import FornecedorListPage from './modules/compras/pages/FornecedorListPage'
import FornecedorFormPage from './modules/compras/pages/FornecedorFormPage'
import CompraListPage from './modules/compras/pages/CompraListPage'
import CompraFormPage from './modules/compras/pages/CompraFormPage'
import CategoriaInsumoListPage from './modules/estoqueInsumos/pages/CategoriaInsumoListPage'
import CategoriaInsumoFormPage from './modules/estoqueInsumos/pages/CategoriaInsumoFormPage'
import InsumoListPage from './modules/estoqueInsumos/pages/InsumoListPage'
import InsumoFormPage from './modules/estoqueInsumos/pages/InsumoFormPage'
import EntradaInsumoListPage from './modules/estoqueInsumos/pages/EntradaInsumoListPage'
import EntradaInsumoFormPage from './modules/estoqueInsumos/pages/EntradaInsumoFormPage'
import SaidaInsumoListPage from './modules/estoqueInsumos/pages/SaidaInsumoListPage'
import SaidaInsumoFormPage from './modules/estoqueInsumos/pages/SaidaInsumoFormPage'
import EstoqueInsumoListPage from './modules/estoqueInsumos/pages/EstoqueInsumoListPage'
import MovimentacaoListPage from './modules/estoqueInsumos/pages/MovimentacaoListPage'
import UsuarioListPage from './modules/shared/pages/UsuarioListPage'
import UsuarioFormPage from './modules/shared/pages/UsuarioFormPage'
import AlertaListPage from './modules/estoqueInsumos/pages/AlertaListPage'
import ParametrizacaoAlertaListPage from './modules/estoqueInsumos/pages/ParametrizacaoAlertaListPage'
import ParametrizacaoAlertaFormPage from './modules/estoqueInsumos/pages/ParametrizacaoAlertaFormPage'
import CategoriaProdutoListPage from './modules/estoqueProdutos/pages/CategoriaProdutoListPage'
import CategoriaProdutoFormPage from './modules/estoqueProdutos/pages/CategoriaProdutoFormPage'
import ProdutoListPage from './modules/estoqueProdutos/pages/ProdutoListPage'
import ProdutoFormPage from './modules/estoqueProdutos/pages/ProdutoFormPage'
import ReceitaListPage from './modules/estoqueProdutos/pages/ReceitaListPage'
import ReceitaFormPage from './modules/estoqueProdutos/pages/ReceitaFormPage'
import EstoqueProdutoListPage from './modules/estoqueProdutos/pages/EstoqueProdutoListPage'
import FabricacaoListPage from './modules/estoqueProdutos/pages/FabricacaoListPage'
import FabricacaoFormPage from './modules/estoqueProdutos/pages/FabricacaoFormPage'
import AlertaProdutoListPage from './modules/estoqueProdutos/pages/AlertaProdutoListPage'
import ParametrizacaoAlertaProdutoListPage from './modules/estoqueProdutos/pages/ParametrizacaoAlertaProdutoListPage'
import ParametrizacaoAlertaProdutoFormPage from './modules/estoqueProdutos/pages/ParametrizacaoAlertaProdutoFormPage'
import ClienteListPage from './modules/vendas/pages/ClienteListPage'
import ClienteFormPage from './modules/vendas/pages/ClienteFormPage'
import ComplementoListPage from './modules/vendas/pages/ComplementoListPage'
import ComplementoFormPage from './modules/vendas/pages/ComplementoFormPage'
import PedidoListPage from './modules/vendas/pages/PedidoListPage'
import PedidoFormPage from './modules/vendas/pages/PedidoFormPage'
import AlertaPedidoListPage from './modules/vendas/pages/AlertaPedidoListPage'
import PedidoMuralPage from './modules/vendas/pages/PedidoMuralPage'
import GuiaPage from './modules/guia/pages/GuiaPage'
import FaturamentoMensalPage from './modules/relatorios/pages/FaturamentoMensalPage'
import CustoProducaoPage from './modules/relatorios/pages/CustoProducaoPage'
import MovimentacaoEstoquePage from './modules/relatorios/pages/MovimentacaoEstoquePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        
        {/* Compras */}
        <Route path="/compras/fornecedores" element={<FornecedorListPage />} />
        <Route path="/compras/fornecedores/novo" element={<FornecedorFormPage />} />
        <Route path="/compras/fornecedores/:id/editar" element={<FornecedorFormPage />} />
        <Route path="/compras/compras" element={<CompraListPage />} />
        <Route path="/compras/compras/nova" element={<CompraFormPage />} />
        <Route path="/compras/compras/:id/editar" element={<CompraFormPage />} />
        
        {/* Estoque de Insumos */}
        <Route path="/estoque-insumos/categorias" element={<CategoriaInsumoListPage />} />
        <Route path="/estoque-insumos/categorias/novo" element={<CategoriaInsumoFormPage />} />
        <Route path="/estoque-insumos/categorias/:id/editar" element={<CategoriaInsumoFormPage />} />
        <Route path="/estoque-insumos/insumos" element={<InsumoListPage />} />
        <Route path="/estoque-insumos/insumos/novo" element={<InsumoFormPage />} />
        <Route path="/estoque-insumos/insumos/:id/editar" element={<InsumoFormPage />} />
        <Route path="/estoque-insumos/entradas" element={<EntradaInsumoListPage />} />
        <Route path="/estoque-insumos/entradas/nova" element={<EntradaInsumoFormPage />} />
        <Route path="/estoque-insumos/entradas/:id/editar" element={<EntradaInsumoFormPage />} />
        <Route path="/estoque-insumos/saidas" element={<SaidaInsumoListPage />} />
        <Route path="/estoque-insumos/saidas/nova" element={<SaidaInsumoFormPage />} />
        <Route path="/estoque-insumos/estoque" element={<EstoqueInsumoListPage />} />
        <Route path="/estoque-insumos/movimentacoes" element={<MovimentacaoListPage />} />
        
        {/* Alertas */}
        <Route path="/estoque-insumos/alertas" element={<AlertaListPage />} />
        <Route path="/estoque-insumos/parametrizacao-alertas" element={<ParametrizacaoAlertaListPage />} />
        <Route path="/estoque-insumos/parametrizacao-alertas/nova" element={<ParametrizacaoAlertaFormPage />} />
        <Route path="/estoque-insumos/parametrizacao-alertas/:id/editar" element={<ParametrizacaoAlertaFormPage />} />

        {/* Estoque de Produtos */}
        <Route path="/estoque-produtos/categorias" element={<CategoriaProdutoListPage />} />
        <Route path="/estoque-produtos/categorias/novo" element={<CategoriaProdutoFormPage />} />
        <Route path="/estoque-produtos/categorias/:id/editar" element={<CategoriaProdutoFormPage />} />
        <Route path="/estoque-produtos/produtos" element={<ProdutoListPage />} />
        <Route path="/estoque-produtos/produtos/novo" element={<ProdutoFormPage />} />
        <Route path="/estoque-produtos/produtos/:id/editar" element={<ProdutoFormPage />} />
        <Route path="/estoque-produtos/receitas" element={<ReceitaListPage />} />
        <Route path="/estoque-produtos/receitas/nova" element={<ReceitaFormPage />} />
        <Route path="/estoque-produtos/receitas/:id/editar" element={<ReceitaFormPage />} />
        <Route path="/estoque-produtos/estoque" element={<EstoqueProdutoListPage />} />
        <Route path="/estoque-produtos/fabricacoes" element={<FabricacaoListPage />} />
        <Route path="/estoque-produtos/fabricacoes/nova" element={<FabricacaoFormPage />} />
        <Route path="/estoque-produtos/alertas" element={<AlertaProdutoListPage />} />
        <Route path="/estoque-produtos/parametrizacao-alertas" element={<ParametrizacaoAlertaProdutoListPage />} />
        <Route path="/estoque-produtos/parametrizacao-alertas/nova" element={<ParametrizacaoAlertaProdutoFormPage />} />
        <Route path="/estoque-produtos/parametrizacao-alertas/:id/editar" element={<ParametrizacaoAlertaProdutoFormPage />} />

        {/* Vendas */}
        <Route path="/vendas/clientes" element={<ClienteListPage />} />
        <Route path="/vendas/clientes/novo" element={<ClienteFormPage />} />
        <Route path="/vendas/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/vendas/complementos" element={<ComplementoListPage />} />
        <Route path="/vendas/complementos/novo" element={<ComplementoFormPage />} />
        <Route path="/vendas/complementos/:id/editar" element={<ComplementoFormPage />} />
        <Route path="/vendas/pedidos" element={<PedidoListPage />} />
        <Route path="/vendas/pedidos/novo" element={<PedidoFormPage />} />
        <Route path="/vendas/pedidos/:id/editar" element={<PedidoFormPage />} />
        <Route path="/vendas/mural" element={<PedidoMuralPage />} />
        <Route path="/alertas-pedido" element={<AlertaPedidoListPage />} />

        {/* Usuários */}
        <Route path="/usuarios" element={<UsuarioListPage />} />
        <Route path="/usuarios/novo" element={<UsuarioFormPage />} />
        <Route path="/usuarios/:id/editar" element={<UsuarioFormPage />} />

        {/* Relatórios */}
        <Route path="/relatorios/faturamento-mensal" element={<FaturamentoMensalPage />} />
        <Route path="/relatorios/custo-producao" element={<CustoProducaoPage />} />
        <Route path="/relatorios/movimentacao-estoque" element={<MovimentacaoEstoquePage />} />

        {/* Guia do Usuário */}
        <Route path="/guia" element={<GuiaPage />} />
        <Route path="/guia/:secao" element={<GuiaPage />} />
      </Route>
    </Routes>
  )
}
