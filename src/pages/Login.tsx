import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GophygitalLogo } from "@/components/AppHeader";

const Login = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile || !password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://life-api.lockated.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email: emailOrMobile,
            password: password,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error to be caught by the catch block below
        throw new Error(data.message || data.error || "Invalid credentials");
      }

      // Success! Pass the token and user data to your AuthContext
      // Note: Adjust 'data.token' or 'data.user' based on what your API actually returns
      login(data.token || data.auth_token, data.user || data);

      toast({ title: "Login successful" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex items-center justify-center">
              <GophygitalLogo className="h-12 w-auto text-primary" />
            </div>
            <h1 className="text-heading text-foreground">
              Welcome to CBX Life Compass
            </h1>
            <p className="mt-1 text-body-4 text-muted-foreground">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-5 font-medium">
                Email or Mobile
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email or mobile number"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-5 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex items-center justify-between text-body-6">
              <button type="button" className="text-primary hover:underline">
                Forgot password?
              </button>
              <span className="text-muted-foreground">
                Need an account?{" "}
                <Link
                  to={"/signUp"}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
