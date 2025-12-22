# Omise Payment Integration

ระบบชำระเงินผ่าน Omise สำหรับ Micro Estate Frontend

## 🚀 การตั้งค่า

### 1. Environment Variables

เพิ่มใน `.env.local` ของ frontend:

```env
# Omise Payment (Development/Test)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_xxxxxxxxxxxxxxxxx
```

> ⚠️ ใช้เฉพาะ **Public Key** ใน frontend เท่านั้น (ขึ้นต้นด้วย `pkey_`)
>
> Secret Key (`skey_`) จะอยู่ใน backend เท่านั้น

### 2. Omise Dashboard

1. ไปที่ [Omise Dashboard](https://dashboard.omise.co)
2. สมัครบัญชีหรือเข้าสู่ระบบ
3. ไปที่ **Keys** เพื่อดู API Keys
4. ใช้ **Test Keys** สำหรับ development

## 📦 Components

### PaymentModal

Modal สำหรับชำระเงินที่รองรับทั้ง Credit Card และ PromptPay

```tsx
import { PaymentModal } from "@/components/payment";

<PaymentModal
  isOpen={true}
  onClose={() => {}}
  type="booking_deposit"
  amount={10000}
  propertyId="property-123"
  description="ค่ามัดจำ"
  onSuccess={(transaction) => console.log("Success:", transaction)}
  onError={(error) => console.log("Error:", error)}
/>;
```

### usePayment Hook

Hook สำหรับจัดการ Payment Modal ได้ง่าย

```tsx
import { usePayment } from "@/hooks/usePayment";
import { PaymentModal } from "@/components/payment";

function MyComponent() {
  const { modalProps, openPayment } = usePayment({
    onSuccess: (transaction) => {
      console.log("Payment successful:", transaction);
    },
    onError: (error) => {
      console.error("Payment failed:", error);
    },
  });

  return (
    <>
      <button
        onClick={() =>
          openPayment({
            type: "booking_deposit",
            amount: 10000,
            propertyId: "property-123",
            description: "ค่ามัดจำ",
          })
        }
      >
        ชำระเงิน
      </button>
      <PaymentModal {...modalProps} />
    </>
  );
}
```

## 💳 บัตรทดสอบ (Test Cards)

| Card Number         | Result             |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Successful payment |
| 4111 1111 1111 1111 | 3D Secure required |
| 4000 0000 0000 0002 | Declined payment   |

> ใช้ MM/YY อะไรก็ได้ในอนาคต และ CVV 3 หลักใดๆ

## 🔧 Transaction Types

| Type               | Description        | Required Fields                  |
| ------------------ | ------------------ | -------------------------------- |
| `booking_deposit`  | มัดจำจองอสังหา     | propertyId, amount               |
| `agent_fee`        | ค่าธรรมเนียม Agent | amount                           |
| `featured_listing` | โปรโมทประกาศ       | propertyId, amount, featuredDays |

## 📁 File Structure

```
frontend/
├── components/
│   └── payment/
│       ├── index.ts
│       ├── CreditCardForm.tsx
│       ├── PaymentModal.tsx
│       └── PromptPayQR.tsx
├── hooks/
│   └── usePayment.ts
├── lib/
│   └── omise.ts
├── stores/
│   └── features/
│       └── payment/
│           └── payment.service.ts
└── types/
    └── payment.ts
```

## 🧪 Demo Page

เข้าถึง Demo Page ได้ที่:

```
/payment-demo
```

## 📝 Notes

1. **Development Mode**: QR Code จาก PromptPay ในโหมดทดสอบจะไม่สามารถสแกนจ่ายจริงได้
2. **3D Secure**: บัตรบางใบจะถูก redirect ไปยังหน้า 3D Secure ก่อนกลับมา
3. **Polling**: ระบบจะ poll สถานะ transaction อัตโนมัติทุก 5 วินาทีสำหรับ PromptPay
4. **Timeout**: QR Code จะหมดอายุใน 15 นาที

## 🔐 Security

- ข้อมูลบัตรถูกส่งตรงไป Omise โดยไม่ผ่าน backend ของเรา
- Token ที่ได้รับสามารถใช้ได้ครั้งเดียว
- PCI DSS compliant
