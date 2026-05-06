import { Ticket } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function TicketView({ code, title }: { code: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, code, {
      width: 192,
      margin: 1,
      color: { dark: "#1f2937", light: "#00000000" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
  }, [code, title]);

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary-soft/40 p-4 text-center space-y-3">
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
        <Ticket className="h-3 w-3" /> Your Ticket
      </div>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-md bg-background p-2" />
      </div>
      <div className="font-mono text-lg font-bold tracking-widest">{code}</div>
      <div className="text-xs text-muted-foreground">Show this QR at the door for fast check-in</div>
    </div>
  );
}