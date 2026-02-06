import { useState, useEffect } from "react";
import { Check, X, Mail, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResumeRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  notes: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  download_token: string;
}

export function ResumeRequestsPanel() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("resume_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: ResumeRequest) => {
    setProcessingId(request.id);

    try {
      // Update the request status in database
      const { error: updateError } = await supabase
        .from("resume_requests")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Send approval email with download link
      const { error: notifyError } = await supabase.functions.invoke("send-resume-notification", {
        body: {
          action: "approved",
          request_id: request.id,
          requester_name: request.requester_name,
          requester_email: request.requester_email,
          download_token: request.download_token,
        },
      });

      if (notifyError) {
        console.error("Failed to send approval email:", notifyError);
        toast({
          title: "Approved (email failed)",
          description: "Request approved but email notification failed. The requester can still use their link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request approved",
          description: `Email sent to ${request.requester_email} with download link.`,
        });
      }

      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;

    setProcessingId(rejectingId);

    try {
      const { error } = await supabase
        .from("resume_requests")
        .update({ status: "rejected" })
        .eq("id", rejectingId);

      if (error) throw error;

      toast({ title: "Request rejected" });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resume_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request deleted" });
      fetchRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case "approved":
        return <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading requests...</div>;
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Resume Requests</h1>
        <p className="text-muted-foreground">Manage access requests to your resume</p>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending requests
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{request.requester_name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {request.requester_email}
                      </p>
                      {request.notes && (
                        <p className="text-sm mt-2 p-2 bg-secondary rounded">
                          "{request.notes}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted: {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="gap-1"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectingId(request.id)}
                        disabled={processingId === request.id}
                        className="gap-1"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      <div>
        <h2 className="text-lg font-semibold mb-4">History ({processedRequests.length})</h2>
        {processedRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No processed requests yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.requester_name}</span>
                        <span className="text-muted-foreground text-sm">({request.requester_email})</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(request.created_at)}
                        {request.approved_at && ` • Approved: ${formatDate(request.approved_at)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(request.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the request as rejected. The requester won't receive a download link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
