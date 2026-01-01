import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/services/auth.service";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronLeft,
  Loader2,
} from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Invalid credentials");
        return;
      }

      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-6 selection:bg-blue-100 selection:text-blue-700">
      {/* Background Ornaments */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[150px] opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[1240px] bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[720px]"
      >
        {/* Left Side: Branding & Info */}
        <div className="relative w-full md:w-[45%] bg-slate-900 p-12 flex flex-col justify-between overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter">
                Micro Estate
              </span>
            </div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-8"
            >
              Streamline Your <br />
              <span className="text-blue-500">Real Estate</span> <br />
              Operations.
            </motion.h2>

            <div className="space-y-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Access",
                  desc: "Advanced role-based permissions",
                },
                {
                  icon: Zap,
                  title: "Real-time Data",
                  desc: "Get updates as they happen",
                },
              ].map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  key={i}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 bg-white/5 rounded-xl text-blue-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 text-xs font-medium mt-1">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mt-20">
            &copy; 2024 Micro Estate Admin Portal
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[55%] p-12 md:p-24 flex flex-col justify-center">
          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Welcome Back.
              </h1>
              <p className="text-slate-400 font-medium">
                Please enter your credentials to access the console.
              </p>
            </div>

            <div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold mb-8 overflow-hidden"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  Business Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative py-4 px-6 bg-slate-900 overflow-hidden text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 hover:scale-[1.02] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 w-1/2 h-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[250%] transition-all duration-1000 ease-in-out" />
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Console
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => navigate(-1)}
              className="mt-10 flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold tracking-wide transition-colors mx-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
