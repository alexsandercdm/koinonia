import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, loginLoading } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      await login(data.email, data.password)
      navigate('/setup/organization')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="hidden border-r border-border bg-surface px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
              <span className="material-symbols-rounded text-[18px]">diversity_3</span>
            </div>
            <span className="text-lg font-bold">Koinonia</span>
          </div>

          <div className="max-w-md">
            <div className="mb-9 h-0.5 w-10 bg-warm-gold" />
            <h1 className="text-[40px] font-light leading-[1.15] text-foreground">
              Gestão que libera <em className="font-normal italic">para o essencial.</em>
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-text-secondary">
              Organize inscrições, acomodações e finanças do seu retiro com uma interface clara,
              precisa e pronta para a rotina da equipe.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { icon: 'group', title: 'Participantes', text: 'Cadastros e fichas completas' },
              { icon: 'bed', title: 'Acomodações', text: 'Mapa visual de quartos e camas' },
              { icon: 'payments', title: 'Financeiro', text: 'Controle claro de valores' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 text-sm">
                <div className="flex size-9 items-center justify-center rounded-[8px] bg-warm-gold-light text-warm-gold">
                  <span className="material-symbols-rounded text-[18px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-text-secondary">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
                  <span className="material-symbols-rounded text-[18px]">diversity_3</span>
                </div>
                <span className="text-lg font-bold">Koinonia</span>
              </div>
              <Link to="/register" className="text-sm font-semibold text-warm-gold">
                Criar conta
              </Link>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-gold">Acesso ao painel</p>
            <h1 className="mt-2 text-[22px] font-semibold leading-tight text-foreground">Bem-vindo de volta</h1>
            <p className="mt-2 text-sm text-text-secondary">Entre para continuar a gestão do retiro.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField label="Endereço de E-mail" htmlFor="email" error={errors.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
              </FormField>

              <FormField label="Sua Senha" htmlFor="password" error={errors.password?.message}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-text-secondary hover:bg-neutral-soft hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormField>

              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no painel'
                )}
              </Button>
            </form>

            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-text-secondary">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-semibold text-warm-gold hover:underline">
                  Crie uma conta
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
