"use client";

import { useState } from "react";
import { Building, CreditCard, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { PaymentModal } from "@/components/payment";
import { usePayment } from "@/hooks/usePayment";

interface PropertyBookingCardProps {
  propertyId: string;
  title: string;
  price: number;
  depositAmount?: number;
}

export function PropertyBookingCard({
  propertyId,
  title,
  price,
  depositAmount = 10000,
}: PropertyBookingCardProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [isBookingMode, setIsBookingMode] = useState(false);

  const { modalProps, openPayment } = usePayment({
    onSuccess: () => {
      toast.success("จองอสังหาริมทรัพย์สำเร็จ!");
      setIsBookingMode(false);
    },
    onError: (err) => {
      toast.error(err);
    },
  });

  const handleBooking = () => {
    if (!bookingDate) {
      toast.error("กรุณาเลือกวันที่ต้องการเข้าชมหรือเข้าอยู่");
      return;
    }

    openPayment({
      type: "booking_deposit",
      amount: depositAmount > 200 ? 200 : depositAmount, // Using 200 as demo amount from original code
      propertyId: propertyId,
      description: `มัดจำจอง ${title} สำหรับวันที่ ${new Date(bookingDate).toLocaleDateString("th-TH")}`,
    });
  };

  return (
    <>
      <div className="sticky top-24 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">ติดต่อเจ้าของประกาศ</h3>

            {/* Agent Info Placeholder */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold">เจ้าของประกาศ</p>
                <p className="text-sm text-muted-foreground">
                  สมาชิกตั้งแต่ 2024
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {!isBookingMode ? (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                  onClick={() => setIsBookingMode(true)}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  จองอสังหานี้ (มัดจำ)
                </Button>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      ระบุวันที่ต้องการจอง:
                    </label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="bg-white text-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBookingMode(false)}
                      className="text-black"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={handleBooking}
                    >
                      ไปหน้าชำระเงิน
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    * ค่ามัดจำ{" "}
                    {new Intl.NumberFormat("th-TH").format(depositAmount)} บาท
                    เพื่อล็อคคิวและยืนยันความสนใจ
                  </p>
                </div>
              )}
              <Button variant="outline" className="w-full" size="lg">
                <Phone className="mr-2 h-5 w-5" />
                โทรติดต่อ
              </Button>
              <Button variant="ghost" className="w-full" size="sm">
                <MessageCircle className="mr-2 h-5 w-5" />
                ส่งข้อความ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Passed as children or handled separately? 
            Since this component is "BookingCard", stats might be separate. 
            But in original design they were stacked. I'll leave stats out of this component
            and render them in the parent Server Component as a separate Card if possible,
            or create a wrapper. 
        */}
      </div>

      <PaymentModal {...modalProps} />
    </>
  );
}
