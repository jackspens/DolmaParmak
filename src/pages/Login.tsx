import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Keyboard } from 'lucide-react';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') setError('Bu e-posta zaten kullanımda.');
            else if (err.code === 'auth/invalid-credential') setError('E-posta veya şifre hatalı.');
            else if (err.code === 'auth/weak-password') setError('Şifre en az 6 karakter olmalıdır.');
            else setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
            <div className="glass w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse-slow" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-400 to-emerald-600 flex items-center justify-center text-dark-950 mb-4 shadow-lg shadow-neon-500/30">
                        <Keyboard size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight text-center">
                        Dolma<span className="text-neon-400">Parmak</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium text-sm text-center">
                        Profesyonel Türkçe Klavye Hızı Eğitimi
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-posta</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="ornek@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Şifre</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-6 py-3 text-lg"
                    >
                        {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-sm text-slate-400">
                        {isRegister ? 'Zaten hesabınız var mı?' : 'Henüz hesabınız yok mu?'}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="ml-2 font-bold text-neon-400 hover:text-neon-300 transition-colors"
                        >
                            {isRegister ? 'Giriş Yapın' : 'Ücretsiz Kayıt Olun'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
