import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">٤٠٤ — الصفحة غير موجودة</h1>
          <p className="text-sm text-gray-500 mb-6">
            هذه الصفحة غير موجودة. ارجع للرئيسية وحاول من جديد.
          </p>
          <Link href="/">
            <Button className="rounded-full px-8">ارجع للرئيسية</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
