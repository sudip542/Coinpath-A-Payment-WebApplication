import { useLocation, useNavigate, useParams } from "react-router";
import { CheckCircle2, Printer, Home, MapPin, Clock } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Badge } from "@/shadcn/ui/badge";
import type { BookingReceipt } from "@/types";

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { bookingId } = useParams<{ bookingId: string }>();

  const receipt: BookingReceipt = state?.receipt || {
    bookingId: bookingId || "BK-902100",
    movieTitle: "Dune: Part Two",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    theatreName: "PVR ICON: Phoenix Palladium",
    screenName: "IMAX Screen 1",
    showTime: "Today at 18:00",
    seats: ["D5", "D6"],
    totalAmount: 760,
    convenienceFee: 60,
    paymentMethod: "UPI",
    transactionId: "TXN-89021345",
    qrCodeValue: `SHOWZEN-TICKET-${bookingId || "BK-902100"}`,
    createdAt: new Date().toISOString(),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-slate-400 text-sm">
            Your seats have been successfully reserved. E-Ticket details sent to your registered email.
          </p>
        </div>

        {/* E-Ticket Printable Card */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden rounded-3xl shadow-2xl print:border-none print:shadow-none">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 p-6 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest opacity-80">E-TICKET RECEIPT</span>
              <h2 className="text-2xl font-black">{receipt.movieTitle}</h2>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white font-mono text-xs border-none">
                ID: {receipt.bookingId}
              </Badge>
            </div>
          </div>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Poster & Basic Details */}
              <div className="md:col-span-2 space-y-4 text-xs text-slate-300">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Cinema & Location</span>
                  <p className="text-base font-bold text-white flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500" />
                    {receipt.theatreName}
                  </p>
                  <p className="text-slate-400 pl-5.5">{receipt.screenName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Date & Time</span>
                    <p className="font-bold text-white flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-red-500" /> {receipt.showTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Reserved Seats</span>
                    <p className="font-bold text-emerald-400 text-sm">
                      {receipt.seats.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between text-[11px]">
                  <span className="text-slate-400">Transaction ID: <strong className="text-slate-200">{receipt.transactionId}</strong></span>
                  <span className="text-slate-400">Total Paid: <strong className="text-red-400 font-bold text-sm">₹{receipt.totalAmount}</strong></span>
                </div>
              </div>

              {/* QR Code Ticket Graphic */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="h-28 w-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                  {/* Visual QR Code Representation */}
                  <div className="h-full w-full bg-slate-900 p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="h-6 w-6 bg-slate-950 border-2 border-white" />
                      <div className="h-6 w-6 bg-slate-950 border-2 border-white" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-6 w-6 bg-slate-950 border-2 border-white" />
                      <div className="h-4 w-4 bg-white" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SCAN AT GATE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="border-slate-700 bg-slate-900 text-slate-200">
            <Printer className="mr-2 h-4 w-4" /> Print E-Ticket
          </Button>
          <Button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-700 text-white font-bold">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
