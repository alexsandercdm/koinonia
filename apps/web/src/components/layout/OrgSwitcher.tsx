import { useOrgContext } from '../../contexts/org-context'
import { authClient } from '../../lib/auth'

export function OrgSwitcher() {
  const { activeOrgId, setActiveOrg } = useOrgContext()
  const { data: orgs = [] } = authClient.useListOrganizations?.() ?? { data: [] }

  if (!orgs || orgs.length <= 1) return null

  return (
    <select
      className="rounded border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors hover:border-border-hover focus:ring-2 focus:ring-warm-gold-light"
      value={activeOrgId ?? ''}
      onChange={(e) => {
        if (e.target.value) setActiveOrg(e.target.value)
      }}
      aria-label="Selecionar organização"
    >
      {!activeOrgId && <option value="">Selecione uma organização</option>}
      {orgs.map((org: any) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
