import { Demand } from "@/services/demands/demands.service";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { MapPin, Coins, Clock, Home } from "lucide-react";

interface DemandCardProps {
  demand: Demand;
}

export function DemandCard({ demand }: DemandCardProps) {
  const formatCurrency = (amount?: string | number | null) => {
    if (!amount) return "";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      case "normal":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "not_rush":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "ด่วนมาก";
      case "normal":
        return "ปกติ";
      case "not_rush":
        return "ไม่รีบ";
      default:
        return urgency;
    }
  };

  const formatBudget = () => {
    if (demand.budgetMin && demand.budgetMax) {
      return `${formatCurrency(demand.budgetMin)} - ${formatCurrency(demand.budgetMax)}`;
    }
    if (demand.budgetMin) return `ขั้นต่ำ ${formatCurrency(demand.budgetMin)}`;
    if (demand.budgetMax) return `ไม่เกิน ${formatCurrency(demand.budgetMax)}`;
    return "ไม่ระบุงบประมาณ";
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 border-l-primary/60">
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge
              variant={demand.intent === "buy" ? "default" : "secondary"}
              className="text-xs"
            >
              {demand.intent === "buy" ? "ซื้อ" : "เช่า"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {demand.propertyType}
            </Badge>
          </div>
          <Badge
            className={`text-xs border-none ${getUrgencyColor(demand.urgency)}`}
          >
            {getUrgencyLabel(demand.urgency)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Coins className="w-4 h-4" />
          {formatBudget()}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        {demand.province && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {demand.subDistrict} {demand.district} {demand.province}
            </span>
          </div>
        )}

        {(demand.bedroomsMin || demand.areaMin) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
            {demand.bedroomsMin && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <Home className="w-3 h-3" />
                {demand.bedroomsMin} ห้องนอน+
              </span>
            )}
            {demand.areaMin && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                {demand.areaMin} ตร.ม.+
              </span>
            )}
          </div>
        )}

        {demand.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {demand.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center border-t bg-muted/10 mt-auto">
        <div className="flex items-center gap-1 mt-3">
          <Clock className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(demand.createdAt), {
              addSuffix: true,
              locale: th,
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
