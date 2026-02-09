import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Using Sonner as seen in your App.tsx

const AuthPage = () => {
  const [passcode, setPasscode] = useState("");
  const navigate = useNavigate();

  // CHANGE THIS TO WHATEVER PIN YOU WANT
  const SECRET_PIN = "1234";

  useEffect(() => {
    // If already logged in, go straight to admin
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (isAuthenticated === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (passcode === SECRET_PIN) {
      // 1. Set the "logged in" flag in local storage
      localStorage.setItem("admin_authenticated", "true");

      // 2. Success message
      toast.success("Welcome back! Access granted.");

      // 3. Redirect to Admin Dashboard
      navigate("/admin");
    } else {
      toast.error("Incorrect Passcode");
      setPasscode(""); // Clear the input
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Portfolio Admin</CardTitle>
          <p className="text-center text-gray-500 text-sm">Enter your secret passcode to manage projects</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Enter Dashboard
            </Button>
            <div className="text-center mt-4">
              <Button variant="link" className="text-gray-400 text-xs" onClick={() => navigate("/")}>
                ← Back to Home
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
