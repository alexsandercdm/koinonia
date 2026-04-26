import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, Users, User } from 'lucide-react'
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
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_500px]">
        <section className="hidden border-r border-border bg-card px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="size-5" />
            </div>
            <span className="text-lg font-bold">Koinonia</span>
          </div>

          <div className="max-w-md">
            <div className="mb-9 h-0.5 w-10 bg-warm-gold" />
            <h1 className="text-4xl font-light leading-tight text-foreground">
              Comece com uma base clara para servir melhor.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-text-secondary">
              Cadastre sua conta para acessar as ferramentas de participantes, inscrições,
              acomodações e financeiro do retiro.
            </p>
          </div>

          <p className="text-xs text-text-tertiary">Sistema open-source para igrejas e ministérios</p>
        </section>

        <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="size-5" />
                </div>
                <span className="text-lg font-bold">Koinonia</span>
              </div>
              <Link to="/login" className="text-sm font-semibold text-warm-gold">
                Entrar
              </Link>
            </div>

            <p className="text-xs font-semibold uppercase text-text-tertiary">Novo acesso</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Criar conta</h1>
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
                    className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary hover:bg-accent hover:text-foreground"
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
                    className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary hover:bg-accent hover:text-foreground"
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
