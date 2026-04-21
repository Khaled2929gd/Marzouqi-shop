import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <p className="text-[80px] font-black text-gray-100 leading-none mb-2" dir="ltr">404</p>
        <h1 className="text-xl font-black text-gray-900 mb-2">الصفحة غير موجودة</h1>
        <p className="text-sm text-gray-500 mb-6">هذه الصفحة غير موجودة. ارجع للرئيسية وحاول من جديد.</p>
        <Link href="/">
          <Button className="rounded-full px-8 bg-gray-900 hover:bg-black">ارجع للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
