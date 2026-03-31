export function ParticipantsPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Participantes</h2>
      <div className="space-y-4">
        <p>Lista de participantes será implementada aqui.</p>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Funcionalidades planejadas:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Cadastro de participantes com dados pessoais e de saúde</li>
            <li>Busca por nome, telefone ou padrinho</li>
            <li>Histórico de eventos do participante</li>
            <li>Edição de dados de saúde com log de alterações</li>
            <li>Soft-delete de participantes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
