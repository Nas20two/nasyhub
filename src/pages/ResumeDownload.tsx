import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Download, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type DownloadStatus = "loading" | "valid" | "pending" | "invalid";

export default function ResumeDownload() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<DownloadStatus>("loading");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState<string>("");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        // Validate the download token
        const { data: request, error: requestError } = await supabase
          .from("resume_requests")
          .select("*")
          .eq("download_token", token)
          .single();

        if (requestError || !request) {
          setStatus("invalid");
          return;
        }

        setRequesterName(request.requester_name);

        if (request.status === "pending") {
          setStatus("pending");
          return;
        }

        if (request.status !== "approved") {
          setStatus("invalid");
          return;
        }

        // Get the resume URL from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("resume_url")
          .limit(1)
          .single();

        if (profile?.resume_url) {
          setResumeUrl(profile.resume_url);
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h1 className="text-xl font-semibold mb-2">Validating your access...</h1>
              <p className="text-muted-foreground">Please wait while we verify your download link.</p>
            </div>
          )}

          {status === "valid" && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-xl font-semibold mb-2">Access Granted!</h1>
              <p className="text-muted-foreground mb-6">
                Hi {requesterName}, your resume download is ready.
              </p>
              <div className="space-y-3">
                <Button onClick={handleDownload} className="w-full gradient-accent gap-2">
                  <Download className="w-4 h-4" />
                  Download Resume
                </Button>
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link to="/">
                    <Home className="w-4 h-4" />
                    Visit Portfolio
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="text-center">
              <Clock className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h1 className="text-xl font-semibold mb-2">Request Pending</h1>
              <p className="text-muted-foreground mb-6">
                Hi {requesterName}, your request is still being reviewed. You'll receive an email once it's approved.
              </p>
              <Button variant="outline" asChild className="w-full gap-2">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Return to Portfolio
                </Link>
              </Button>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h1 className="text-xl font-semibold mb-2">Invalid or Expired Link</h1>
              <p className="text-muted-foreground mb-6">
                This download link is not valid. It may have been rejected or the link is incorrect.
              </p>
              <Button variant="outline" asChild className="w-full gap-2">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Return to Portfolio
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
