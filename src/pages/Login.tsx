import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GophygitalLogo } from "@/components/AppHeader";
import EmailVerificationCard from "@/components/EmailVerificationCard";

const Login = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const isVerificationMode = searchParams.get("mode") === "verify";
  const verificationEmail = searchParams.get("email") || emailOrMobile;

  const openSignIn = () => {
    setVerificationCode("");
    setSearchParams({});
  };

  const handleVerifyEmail = async (): Promise<boolean> => {
    if (verificationCode.length !== 6) return false;
    setVerifying(true);
    try {
      const res = await fetch("https://life-api.lockated.com/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          otp: verificationCode,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (res.ok) {
        toast({
          title: "Email verified!",
          description: "Your email has been verified. Please sign in.",
        });
        openSignIn();
        return true;
      }

      throw new Error(data.message || data.error || "Verification failed");
    } catch (error) {
      toast({
        title: "Verification failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
      return false;
    } finally {
      setVerifying(false);
    }
  };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: emailOrMobile, password },
        }),
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText || "Invalid credentials" };
      }

      if (!response.ok) {
        let errorMessage = "Failed to sign in. Please try again.";

        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors[0];
          } else if (typeof data.errors === "object") {
            const messages = Object.entries(data.errors).map(([field, msgs]) => {
              const fieldName =
                field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ");
              const msg = Array.isArray(msgs) ? msgs[0] : msgs;
              return `${fieldName} ${msg}`;
            });
            errorMessage = messages.join(". ");
          }
        } else if (data.status?.errors) {
          const errs = data.status.errors;
          errorMessage = Array.isArray(errs) ? errs[0] : errs;
        } else if (data.status?.message) {
          errorMessage = data.status.message;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        const lowerError = String(errorMessage).toLowerCase();
        if (
          response.status === 401 ||
          response.status === 400 ||
          response.status === 404 ||
          lowerError.includes("invalid") ||
          lowerError.includes("not found") ||
          lowerError.includes("unauthorized") ||
          lowerError.includes("incorrect")
        ) {
          errorMessage = "Password or email does not match. Please try again.";
        } else if (
          lowerError.includes("unconfirmed") ||
          lowerError.includes("verify")
        ) {
          errorMessage = "Please verify your email address before logging in.";
        }

        throw new Error(errorMessage);
      }

      const userData = data.user || data;
      const bestName =
        [
          userData.name,
          userData.full_name,
          [userData.first_name, userData.last_name].filter(Boolean).join(" "),
          userData.username,
          userData.given_name,
        ].find((n) => n && typeof n === "string" && n.trim() !== "") || "User";

      const userObject = {
        id: userData.id || userData.user_id || "",
        name: bestName,
        email: userData.email || emailOrMobile || "",
        avatar: userData.avatar || userData.profile_photo || undefined,
      };

      const token = data.token || data.auth_token;
      login(token, userObject);

      try {
        const profileRes = await fetch("https://life-api.lockated.com/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const bestProfileName =
            [
              profileData.name,
              profileData.full_name,
              [profileData.first_name, profileData.last_name]
                .filter(Boolean)
                .join(" "),
              profileData.username,
              profileData.given_name,
            ].find((n) => n && typeof n === "string" && n.trim() !== "") ||
            userObject.name;

          const completeUser = {
            id: profileData.id || userObject.id,
            name: bestProfileName,
            email: profileData.email || userObject.email,
            avatar:
              profileData.avatar ||
              profileData.profile_photo ||
              userObject.avatar,
          };

          if (completeUser.name !== "User") {
            login(token, completeUser);
          }
        }
      } catch {
        // profile fetch optional
      }

      toast({ title: "Login successful" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: "url(/loginBG.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {isVerificationMode ? (
          <EmailVerificationCard
            email={verificationEmail || "your email"}
            otp={verificationCode}
            onOtpChange={setVerificationCode}
            onBackToSignIn={openSignIn}
            onVerify={handleVerifyEmail}
          />
        ) : (
          <div className="rounded-2xl border bg-card p-8 shadow-lg">
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
                <Link to="/resetPassword" className="text-primary hover:underline">
                  Forgot password?
                </Link>
                <span className="text-muted-foreground">
                  Need an account?{" "}
                  <Link
                    to="/signUp"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;