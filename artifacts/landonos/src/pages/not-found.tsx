import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Card className="mx-4 w-full max-w-md border-destructive/30">
        <CardContent className="pt-6">
          <div className="mb-4 flex gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            That route is not part of LandonOS. Use the sidebar or return to the Performance Cockpit.
          </p>
          <Link href="/">
            <Button className="mt-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cockpit
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
