"use client";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginAction(email, password);
    if ("error" in res) {
      setError(res.error);
      setLoading(false);
      return;
    }

    toast.success(res.message);
    setLoading(false);
    route.push("/admin");
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-primary/10">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-primary text-center mb-2">
          Connexion
        </h1>
        <div>
          <label className="block mb-2 font-semibold text-primary">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Votre email"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-primary">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 pr-10"
              placeholder="Votre mot de passe"
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-primary"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-center font-semibold text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/80 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
