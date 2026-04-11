import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CreditCard, Smartphone } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export function PaymentModal({ isOpen, onClose, amount, onSuccess }) {
  const [method, setMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const handlePay = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    onSuccess({ method, amount, status: "success", transactionId: "TXN_" + Date.now() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <div className="text-center mb-6">
        <p className={`text-sm mb-1 ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>Total Amount Due</p>
        <p className={`text-4xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>₹{amount}</p>
      </div>

      <div className="space-y-4 mb-8">
        <label className={`text-sm font-medium mb-2 block ${isLight ? "text-slate-700" : "text-emerald-100/80"}`}>Select Payment Method</label>
        
        <div 
          onClick={() => setMethod("upi")}
          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
            method === "upi" 
              ? (isLight ? "bg-yellow-500/15 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]" : "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]") 
              : (isLight ? "bg-slate-50 border-slate-200 hover:bg-yellow-50" : "bg-white/5 border-white/10 hover:bg-white/10")
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? "bg-yellow-500/20 text-yellow-600" : "bg-white/10 text-emerald-400"}`}>
            <Smartphone size={20} />
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>UPI (GPay, PhonePe, Paytm)</h4>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>Pay instantly via UPI apps</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "upi" ? (isLight ? "border-yellow-600" : "border-emerald-400") : (isLight ? "border-slate-300" : "border-white/30")}`}>
            {method === "upi" && <div className={`w-2.5 h-2.5 rounded-full ${isLight ? "bg-yellow-600" : "bg-emerald-400"}`} />}
          </div>
        </div>

        <div 
          onClick={() => setMethod("card")}
          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
            method === "card" 
              ? (isLight ? "bg-yellow-500/15 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]" : "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]") 
              : (isLight ? "bg-slate-50 border-slate-200 hover:bg-yellow-50" : "bg-white/5 border-white/10 hover:bg-white/10")
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? "bg-yellow-500/20 text-yellow-600" : "bg-white/10 text-emerald-400"}`}>
            <CreditCard size={20} />
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>Credit / Debit Card</h4>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>Visa, Mastercard, RuPay</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "card" ? (isLight ? "border-yellow-600" : "border-emerald-400") : (isLight ? "border-slate-300" : "border-white/30")}`}>
            {method === "card" && <div className={`w-2.5 h-2.5 rounded-full ${isLight ? "bg-yellow-600" : "bg-emerald-400"}`} />}
          </div>
        </div>
      </div>

      {method === "card" && (
        <div className={`space-y-4 mb-8 p-4 rounded-xl border animate-in slide-in-from-top-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/5"}`}>
           <Input placeholder="Card Number (0000 0000 0000 0000)" />
           <div className="grid grid-cols-2 gap-4">
              <Input placeholder="MM/YY" />
              <Input type="password" placeholder="CVV" maxLength={3} />
           </div>
        </div>
      )}

      {method === "upi" && (
        <div className={`space-y-4 mb-8 p-4 rounded-xl border text-center animate-in slide-in-from-top-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/5"}`}>
           <div className={`w-40 h-40 bg-white p-2 rounded-lg mx-auto mb-4 border-4 flex items-center justify-center ${isLight ? "border-yellow-500/30" : "border-emerald-500/30"}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                <rect width="100" height="100" fill="white"/>
                <g fill="#000">
                  <rect x="5" y="5" width="25" height="25"/>
                  <rect x="70" y="5" width="25" height="25"/>
                  <rect x="5" y="70" width="25" height="25"/>
                  <rect x="10" y="10" width="15" height="15" fill="white"/>
                  <rect x="75" y="10" width="15" height="15" fill="white"/>
                  <rect x="10" y="75" width="15" height="15" fill="white"/>
                  <rect x="13" y="13" width="9" height="9"/>
                  <rect x="78" y="13" width="9" height="9"/>
                  <rect x="13" y="78" width="9" height="9"/>
                  <rect x="35" y="5" width="5" height="5"/>
                  <rect x="45" y="5" width="5" height="5"/>
                  <rect x="55" y="5" width="5" height="5"/>
                  <rect x="35" y="15" width="5" height="5"/>
                  <rect x="50" y="15" width="5" height="5"/>
                  <rect x="35" y="35" width="5" height="5"/>
                  <rect x="45" y="40" width="5" height="5"/>
                  <rect x="55" y="35" width="5" height="5"/>
                  <rect x="40" y="50" width="5" height="5"/>
                  <rect x="55" y="55" width="5" height="5"/>
                  <rect x="70" y="40" width="5" height="5"/>
                  <rect x="80" y="50" width="5" height="5"/>
                  <rect x="70" y="55" width="5" height="5"/>
                  <rect x="85" y="70" width="5" height="5"/>
                  <rect x="75" y="80" width="5" height="5"/>
                  <rect x="40" y="70" width="5" height="5"/>
                  <rect x="55" y="75" width="5" height="5"/>
                  <rect x="50" y="85" width="5" height="5"/>
                </g>
              </svg>
           </div>
           <p className={`text-sm ${isLight ? "text-slate-600" : "text-emerald-100/70"}`}>Scan QR or enter UPI ID</p>
           <Input placeholder="username@upi" />
        </div>
      )}

      <Button className="w-full" size="lg" onClick={handlePay} isLoading={isProcessing}>
        Pay ₹{amount} Securely
      </Button>
    </Modal>
  );
}
