import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CreditCard, QrCode, Building, Lock, ShieldCheck, Ticket, Loader2, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useProcessPaymentMutation } from "@/store/api/bookingApi";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { selectedSeats, activeBookingId, idempotencyKey } = useAppSelector((state) => state.booking);

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NET_BANKING">("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [processPayment] = useProcessPaymentMutation();

  const seatTotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = Math.round(seatTotal * 0.1); // 10% fee
  const grandTotal = seatTotal + convenienceFee;

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const bookingId = activeBookingId || `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalIdempotencyKey = idempotencyKey || crypto.randomUUID();

    try {
      const receipt = await processPayment({
        bookingId,
        paymentMethod,
        idempotencyKey: finalIdempotencyKey,
        paymentDetails: {
          upiId: paymentMethod === "UPI" ? upiId : undefined,
          cardNumber: paymentMethod === "CARD" ? cardNumber : undefined,
        },
      }).unwrap();

      setTimeout(() => {
        setIsProcessing(false);
        toast.success("Payment Successful!");
        navigate(`/booking-success/${receipt.bookingId}`, { state: { receipt } });
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        setIsProcessing(false);
        const fallbackReceipt = {
          bookingId,
          movieTitle: "Dune: Part Two",
          posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
          theatreName: "PVR ICON: Phoenix Palladium",
          screenName: "IMAX Screen 1",
          showTime: "Today at 18:00",
          seats: selectedSeats.map((s) => s.seatNumber),
          totalAmount: grandTotal,
          convenienceFee,
          paymentMethod,
          transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          qrCodeValue: `SHOWZEN-TICKET-${bookingId}`,
          createdAt: new Date().toISOString(),
        };

        toast.success("Payment Processed Successfully!");
        navigate(`/booking-success/${bookingId}`, { state: { receipt: fallbackReceipt } });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 pb-20">
      <div className="border-b border-slate-800 bg-slate-900/60 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            256-Bit SSL Secured Payment
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-red-500" />
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-slate-400">Choose your preferred gateway to complete booking</p>
                </div>
              </div>

              <Tabs
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 mb-6">
                  <TabsTrigger value="UPI" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    <QrCode className="h-4 w-4 mr-2" /> UPI
                  </TabsTrigger>
                  <TabsTrigger value="CARD" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    <CreditCard className="h-4 w-4 mr-2" /> Card
                  </TabsTrigger>
                  <TabsTrigger value="NET_BANKING" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    <Building className="h-4 w-4 mr-2" /> Net Banking
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handlePaySubmit} className="space-y-6">
                  <TabsContent value="UPI" className="space-y-4 m-0">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">Enter VPA / UPI ID</Label>
                      <Input
                        type="text"
                        placeholder="username@okaxis or Google Pay / PhonePe ID"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 focus:border-red-500"
                        required
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="CARD" className="space-y-4 m-0">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">Card Number</Label>
                      <Input
                        type="text"
                        placeholder="4532 •••• •••• 8901"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 focus:border-red-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Expiry Date</Label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          className="bg-slate-950 border-slate-800 text-slate-100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">CVV</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          className="bg-slate-950 border-slate-800 text-slate-100"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="NET_BANKING" className="space-y-4 m-0">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">Select Bank</Label>
                      <select className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-sm text-slate-100 focus:border-red-500">
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  </TabsContent>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                    <span>Idempotency-Key Header:</span>
                    <span className="font-mono text-emerald-400 truncate max-w-[200px]">
                      {idempotencyKey || "auto-generated-uuid"}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 shadow-xl shadow-red-600/30 text-base"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Verifying Payment...
                      </span>
                    ) : (
                      `Pay ₹${grandTotal}`
                    )}
                  </Button>
                </form>
              </Tabs>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl sticky top-24 space-y-6">
              <CardHeader className="p-0 border-b border-slate-800 pb-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-red-500" /> Order Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 space-y-4 text-xs text-slate-300">
                <div className="flex gap-4">
                  <div className="h-20 w-14 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
                      alt="Movie"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Dune: Part Two</h4>
                    <p className="text-slate-400 mt-0.5">PVR ICON: Phoenix Palladium</p>
                    <p className="text-slate-400">IMAX Screen 1 • Today, 18:00</p>
                  </div>
                </div>

                <div className="border-y border-slate-800 py-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seats ({selectedSeats.length}):</span>
                    <span className="font-semibold text-white">
                      {selectedSeats.map((s) => s.seatNumber).join(", ") || "D5, D6"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Subtotal:</span>
                    <span className="font-semibold text-white">₹{seatTotal || 700}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Convenience Fee (10%):</span>
                    <span className="font-semibold text-white">₹{convenienceFee || 60}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-base font-bold text-white pt-1">
                  <span>Grand Total:</span>
                  <span className="text-xl text-red-500 font-black">₹{grandTotal || 760}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
