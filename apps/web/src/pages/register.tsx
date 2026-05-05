import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useAuthContext } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { register: registerUser, registerLoading } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('')
      await registerUser(data.email, data.password, data.name)
      // New users go to onboarding to create their first organization
      navigate('/onboarding')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
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
              Comece com uma base clara <em className="font-normal italic">para servir melhor.</em>
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-text-secondary">
              Cadastre sua conta para acessar as ferramentas de participantes, inscrições,
              acomodações e financeiro do retiro.
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            {[
              { icon: 'how_to_reg', title: 'Acesso seguro', text: 'Better Auth e permissoes por papel' },
              { icon: 'assignment', title: 'Operacao integrada', text: 'Participantes, inscricoes e estadias' },
              { icon: 'account_balance_wallet', title: 'Gestao financeira', text: 'Receitas e indicadores do retiro' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
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
              <Link to="/login" className="text-sm font-semibold text-warm-gold">
                Entrar
              </Link>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-gold">Novo acesso</p>
            <h1 className="mt-2 text-[22px] font-semibold leading-tight text-foreground">Criar conta</h1>
            <p className="mt-2 text-sm text-text-secondary">Preencha os dados para começar.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField label="Nome completo" htmlFor="name" error={errors.name?.message}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                  <Input id="name" type="text" placeholder="Seu nome" className="pl-10" {...register('name')} />
                </div>
              </FormField>

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

              <FormField label="Senha" htmlFor="password" error={errors.password?.message}>
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

              <FormField
                label="Confirmar Senha"
                htmlFor="confirmPassword"
                error={errors.confirmPassword?.message}
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita sua senha"
                    className="pl-10 pr-12"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-text-secondary hover:bg-neutral-soft hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormField>

              <Button type="submit" disabled={registerLoading} className="w-full">
                {registerLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar minha conta'
                )}
              </Button>
            </form>

            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-text-secondary">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-warm-gold hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
