import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, Users, User } from 'lucide-react'
import { useAuthContext } from '../contexts/auth-context'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2d1345] to-[#1b0f23] overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4d0085]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4d0085]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col w-full max-w-[1200px] min-h-screen p-6 md:p-12">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-12">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#4d0085] rounded-xl text-white">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Koinonia</h2>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-amber-accent font-semibold hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-16 items-center">
            {/* Left side: welcome text */}
            <div className="hidden lg:flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
                  Junte-se à{' '}
                  <br />
                  <span className="text-[#4d0085] bg-amber-accent px-2 rounded-md italic">
                    comunidade Koinonia
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                  Crie sua conta e comece a organizar retiros espirituais com excelência. Simples,
                  poderoso e feito para comunidades.
                </p>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#4d0085]/20 shadow-2xl bg-[#4d0085]/20 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm opacity-50">Comunidade em retiro espiritual</p>
                </div>
              </div>
            </div>

            {/* Right side: form */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Criar conta</h3>
                  <p className="text-slate-400">Preencha os dados para começar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Nome completo</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        {...register('name')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-400 ml-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">
                      Endereço de E-mail
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 ml-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Senha</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400 ml-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Confirmar Senha</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400 ml-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-amber-accent hover:bg-yellow-400 text-[#4d0085] font-black py-4 rounded-xl shadow-lg shadow-amber-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'CRIAR MINHA CONTA'
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-sm text-slate-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-amber-accent font-semibold hover:underline">
                      Faça login
                    </Link>
                  </p>
                </div>
              </div>

              <footer className="mt-8 text-center text-slate-500 text-xs">
                © 2024 Koinonia Sistemas. Todos os direitos reservados.
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
