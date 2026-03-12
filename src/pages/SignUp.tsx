import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GophygitalLogo } from "@/components/AppHeader";

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_no: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic Validation
    if (Object.values(formData).some((field) => !field)) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual signup API endpoint
      const response = await fetch("https://life-api.lockated.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create account",
        );
      }

      toast({ title: "Account created successfully! Please verify your email." });
      navigate(
        `/login?mode=verify&email=${encodeURIComponent(formData.email)}`,
      );
    } catch (error) {
      toast({
        title: "Sign up failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ backgroundImage: 'url(/loginBG.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {/* Logo & Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex items-center justify-center">
              <GophygitalLogo className="h-12 w-auto text-primary" />
            </div>
            <h1 className="text-heading text-foreground">Create an Account</h1>
            <p className="mt-1 text-body-4 text-muted-foreground">
              Join CBX Life Compass today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-body-5 font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-body-5 font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-5 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="mobile_no" className="text-body-5 font-medium">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobile_no"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-5 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password_confirmation"
                className="text-body-5 font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>

            <div className="flex items-center justify-center text-body-6 pt-2">
              <span className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
