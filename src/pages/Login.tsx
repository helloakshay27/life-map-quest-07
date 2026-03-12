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

  const handleVerifyEmail = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Enter the full code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      toast({
        title: "Verification UI ready",
        description:
          "Connect your email verification endpoint here to complete the flow.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = () => {
    toast({
      title: "Resend requested",
      description:
        "Connect your resend-code endpoint here to send a new verification code.",
    });
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

      // Extract user data from the API response
      const userData = data.user || data;

      console.log("Login - Full API Response:", data);
      console.log("Login - userData:", userData);
      console.log("Login - All keys in userData:", Object.keys(userData));

      // Construct a proper user object with all required fields
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

      console.log("Login - Final userObject before login:", userObject);

      // Success! Pass the token and user data to your AuthContext
      const token = data.token || data.auth_token;
      login(token, userObject);

      console.log(
        "Login - After login, checking localStorage:",
        localStorage.getItem("user"),
      );

      // Also try to fetch complete user profile from API
      try {
        const profileRes = await fetch(
          "https://life-api.lockated.com/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("Login - Profile API Response:", profileData);

          // Update user with complete profile data
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

          console.log("Login - Complete user from profile:", completeUser);
          if (completeUser.name !== "User") {
            login(token, completeUser);
          }
        }
      } catch (profileError) {
        console.log("Profile fetch not available:", profileError);
      }

      toast({ title: "Login successful" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundImage: 'url(/loginBG.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="w-full max-w-md animate-fade-in">
        {isVerificationMode ? (
          <EmailVerificationCard
            email={verificationEmail || "your email"}
            otp={verificationCode}
            onOtpChange={setVerificationCode}
            onBackToSignIn={openSignIn}
            onVerify={handleVerifyEmail}
            onResend={handleResendCode}
            isSubmitting={verifying}
          />
        ) : (
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
              <Link
                to={"/resetPassword"}
                type="button"
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
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
        )}
      </div>
    </div>
  );
};

export default Login;
