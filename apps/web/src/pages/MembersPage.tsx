import { useState } from 'react'
import { useOrgMembers, useInviteMember, useUpdateMemberRole } from '../hooks/use-org'
import { useOrgContext } from '../contexts/org-context'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { AppLayout } from '../components/layout/AppLayout'
import { Users } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: 'Presidente',
  PASTOR_PRINCIPAL: 'Pastor Principal',
  PASTOR_REDE: 'Pastor de Rede',
  DISCIPULADOR: 'Discipulador',
  LIDER_CELULA: 'Líder de Célula',
  MEMBRO: 'Membro',
}

const INVITABLE_ROLES = [
  'PASTOR_PRINCIPAL',
  'PASTOR_REDE',
  'DISCIPULADOR',
  'LIDER_CELULA',
  'MEMBRO',
]

interface OrgMember {
  userId: string
  memberId: string
  name: string
  email: string
  role: string
}

export function MembersPage() {
  const { userRole } = useOrgContext()
  const { data: members, isLoading } = useOrgMembers()
  const inviteMember = useInviteMember()
  const updateRole = useUpdateMemberRole()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBRO')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const canManage = userRole === 'PRESIDENTE' || userRole === 'PASTOR_PRINCIPAL'

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError(null)
    try {
      await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole })
      setInviteEmail('')
      setInviteRole('MEMBRO')
    } catch (err: any) {
      setInviteError(err.message ?? 'Erro ao convidar')
    }
  }

  async function handleRoleChange(member: OrgMember, newRole: string) {
    try {
      await updateRole.mutateAsync({ userId: member.userId, role: newRole })
    } catch (err: any) {
      console.error('Failed to update role:', err)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Membros">
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="text-center text-text-secondary">Carregando membros...</div>
        </div>
      </AppLayout>
    )
  }

  const membersList = (members as OrgMember[]) ?? []

  return (
    <AppLayout title="Membros">
      <div className="mx-auto w-full max-w-3xl space-y-8 p-4 sm:p-6 lg:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-status-info-bg text-status-info">
            <Users size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Membros</h1>
            <p className="text-sm text-text-secondary">Gerencie membros da sua organização</p>
          </div>
        </div>

        {/* Invite form */}
        {canManage && (
          <form
            onSubmit={handleInvite}
            className="space-y-4 rounded-[10px] border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <h2 className="font-semibold text-foreground">Convidar novo membro</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={inviteMember.isPending}
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Papel</label>
                <select
                  className="flex h-[38px] w-full items-center rounded-control border border-input bg-surface px-3 text-sm text-foreground transition-colors hover:border-warm-border-strong focus:border-warm-gold-muted focus:outline-none focus:ring-[3px] focus:ring-warm-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={inviteMember.isPending}
                >
                  {INVITABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={inviteMember.isPending} size="default">
                {inviteMember.isPending ? 'Convidando...' : 'Convidar'}
              </Button>
            </div>
            {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
            {inviteMember.isSuccess && (
              <p className="text-sm text-status-success">Convite enviado com sucesso!</p>
            )}
          </form>
        )}

        {/* Members list */}
        <div className="space-y-2">
          {membersList.length === 0 ? (
            <div className="rounded-[10px] border border-border bg-surface p-8 text-center">
              <p className="text-text-secondary">Nenhum membro ainda</p>
            </div>
          ) : (
            membersList.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between rounded-[10px] border border-border bg-surface px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{member.name}</p>
                  <p className="text-xs text-text-secondary">{member.email}</p>
                </div>

                <div className="ml-4 flex items-center gap-3">
                  {canManage && member.role !== 'PRESIDENTE' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value)}
                      disabled={updateRole.isPending}
                      className="flex h-[36px] items-center rounded-control border border-input bg-surface px-2.5 text-xs text-foreground transition-colors hover:border-warm-border-strong focus:border-warm-gold-muted focus:outline-none focus:ring-[3px] focus:ring-warm-gold-light disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {INVITABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
