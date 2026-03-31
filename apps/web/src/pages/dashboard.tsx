import React from 'react'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function DashboardPage() {
  const { user, logout } = useAuthContext()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Koinonia</h1>
              <p className="text-gray-600">Gestão de Retiros Espirituais</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bem-vindo, {user?.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {user?.role}
              </span>
              <Button onClick={logout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Participantes</CardTitle>
                <CardDescription>
                  Gerenciar participantes dos retiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Participantes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos</CardTitle>
                <CardDescription>
                  Criar e gerenciar eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Eventos</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acomodações</CardTitle>
                <CardDescription>
                  Mapa de acomodações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Mapa</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financeiro</CardTitle>
                <CardDescription>
                  Dashboard financeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Financeiro</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inscrições</CardTitle>
                <CardDescription>
                  Gerenciar inscrições
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ver Inscrições</Button>
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
                <Button className="w-full">Ver Relatórios</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
