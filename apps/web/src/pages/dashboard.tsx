import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function DashboardPage() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Koinonia</h1>
              <p className="text-sm text-gray-500">Gestão de retiros</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name ?? 'Usuário'}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Painel Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Participantes</CardTitle>
                <CardDescription>
                  Gerenciar participantes dos retiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/participantes')}>
                  Ver Participantes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inscrições</CardTitle>
                <CardDescription>
                  Gerenciar inscrições e pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/inscricoes')}>
                  Ver Inscrições
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acomodações</CardTitle>
                <CardDescription>
                  Mapa de acomodações e gestão de camas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/acomodacoes')}>Ver Mapa</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financeiro</CardTitle>
                <CardDescription>
                  Dashboard financeiro e relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled title="Em breve">Ver Financeiro</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Relatórios e exportações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled title="Em breve">Ver Relatórios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Configurações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled title="Em breve">Configurações</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
