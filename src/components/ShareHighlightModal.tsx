"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Sparkles, X } from "lucide-react";
import { ProviderCatalogItem } from "@/types/database";
import { getThermometerLevel, THERMOMETER_LEVELS } from "./ReputationThermometer";
import { formatProviderTitle } from "@/utils/validators";

interface ShareHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderCatalogItem;
  categoryName: string;
  rank: 1 | 2 | 3;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      linesDrawn++;
      if (linesDrawn >= maxLines) {
        ctx.fillText(`${line}...`, x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function ShareHighlightModal({
  isOpen,
  onClose,
  provider,
  categoryName,
  rank,
}: ShareHighlightModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function";

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function generateBanner() {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const medalTheme =
        rank === 1
          ? {
              accentStart: "#FDE68A",
              accentEnd: "#FCD34D",
              ringColor: "#FCD34D",
              pillText: "#0F1A24",
              medalLabel: "1º LUGAR · OURO",
              shortMessage: `O Combinado agradece sua dedicação! Você é o nº 1 em ${categoryName} pela confiança dos clientes.`,
            }
          : rank === 2
          ? {
              accentStart: "#F1F5F9",
              accentEnd: "#CBD5E1",
              ringColor: "#94A3B8",
              pillText: "#0F1A24",
              medalLabel: "2º LUGAR · PRATA",
              shortMessage: `O Combinado agradece seu trabalho! Você está entre os melhores em ${categoryName} na plataforma.`,
            }
          : {
              accentStart: "#F5D0A9",
              accentEnd: "#D99B66",
              ringColor: "#C2783E",
              pillText: "#2B1707",
              medalLabel: "3º LUGAR · BRONZE",
              shortMessage: `Obrigado por fazer a diferença! Você está no Top 3 em ${categoryName} pelos elogios dos clientes.`,
            };

      // 1. Fundo moderno corporativo Nano Banana (1080x1350)
      const bgImg = await loadImageSafe("/brand/share-award-bg.png");
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, W, H);
      } else {
        ctx.fillStyle = "#F6F8FC";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#0F1A24";
        ctx.fillRect(0, 0, W, 485);
      }

      // 2. Cabeçalho no topo escuro: Logo Combinado + Tag Oficial
      const logoImg = await loadImageSafe("/brand/logo.png");
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, 76, 68, 310, 72, 36);
      ctx.fill();

      if (logoImg) {
        ctx.drawImage(logoImg, 98, 80, 48, 48);
      }
      const logoTextGrad = ctx.createLinearGradient(156, 85, 360, 125);
      logoTextGrad.addColorStop(0, "#006E2A");
      logoTextGrad.addColorStop(0.55, "#00B048");
      logoTextGrad.addColorStop(1, "#7ED957");
      ctx.fillStyle = logoTextGrad;
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Combinado", 156, 105);

      ctx.fillStyle = "rgba(255,255,255,0.14)";
      drawRoundedRect(ctx, W - 406, 76, 330, 56, 28);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 19px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DESTAQUE DA PLATAFORMA", W - 241, 105);

      // 3. Pílula do Ranking (Ouro / Prata / Bronze)
      const pillW = 600;
      const pillX = (W - pillW) / 2;
      const pillGrad = ctx.createLinearGradient(pillX, 200, pillX + pillW, 266);
      pillGrad.addColorStop(0, medalTheme.accentStart);
      pillGrad.addColorStop(1, medalTheme.accentEnd);
      ctx.fillStyle = pillGrad;
      drawRoundedRect(ctx, pillX, 200, pillW, 66, 33);
      ctx.fill();

      ctx.fillStyle = medalTheme.pillText;
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${medalTheme.medalLabel} · ${categoryName.toUpperCase()}`, W / 2, 234);

      // 4. Foto Circular sobrepondo a divisão escuro/claro (estilo Uber/Airbnb)
      const centerX = W / 2;
      const centerY = 480;
      const radius = 142;

      const avatarImg = provider.avatar_url
        ? await loadImageSafe(provider.avatar_url)
        : null;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 9, 0, Math.PI * 2);
      ctx.fillStyle = medalTheme.ringColor;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      if (avatarImg) {
        const aspect = avatarImg.width / avatarImg.height;
        let dw = radius * 2;
        let dh = radius * 2;
        if (aspect > 1) {
          dw = dh * aspect;
        } else {
          dh = dw / aspect;
        }
        ctx.drawImage(avatarImg, centerX - dw / 2, centerY - dh / 2, dw, dh);
      } else {
        ctx.fillStyle = "#EBF9EF";
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.fillStyle = "#006e2a";
        ctx.font = "bold 104px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(provider.display_name.charAt(0).toUpperCase(), centerX, centerY);
      }
      ctx.restore();

      // 5. Nome do Profissional no corpo claro
      ctx.fillStyle = "#0F1A24";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        formatProviderTitle(provider.display_name, categoryName),
        W / 2,
        712
      );

      // Selo de Reputação logo abaixo do nome
      const level = getThermometerLevel(
        provider.pro_rating_avg,
        provider.pro_reviews_count
      );
      const lvlInfo = THERMOMETER_LEVELS[level];
      ctx.fillStyle = "#EBF9EF";
      drawRoundedRect(ctx, 250, 746, W - 500, 54, 27);
      ctx.fill();
      ctx.fillStyle = "#006e2a";
      ctx.font = "bold 23px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${lvlInfo.shortLabel} • ${provider.pro_reviews_count} ${
          provider.pro_reviews_count === 1 ? "avaliação" : "avaliações"
        }`,
        W / 2,
        773
      );

      // 6. Mensagem curta de agradecimento (2 a 3 linhas no máximo)
      ctx.fillStyle = "#1E293B";
      ctx.font = "600 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      wrapText(ctx, medalTheme.shortMessage, W / 2, 890, 820, 46, 3);

      // 7. Assinatura + Rodapé limpo
      ctx.strokeStyle = "rgba(15, 26, 36, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(260, 1085);
      ctx.lineTo(W - 260, 1085);
      ctx.stroke();

      ctx.fillStyle = "#006e2a";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("Com gratidão, Equipe Combinado", W / 2, 1145);

      ctx.fillStyle = "#475569";
      ctx.font = "500 22px sans-serif";
      ctx.fillText("Encontre profissionais avaliados pela vizinhança", W / 2, 1210);

      if (!cancelled) {
        try {
          const url = canvas.toDataURL("image/png");
          setPreviewUrl(url);
        } catch {
          setPreviewUrl(null);
        }
        setIsGenerating(false);
      }
    }

    generateBanner();
    return () => {
      cancelled = true;
    };
  }, [isOpen, provider, categoryName, rank]);

  if (!isOpen) return null;

  const fileName = `combinado-agradecimento-${rank}-lugar.png`;

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = fileName;
    a.click();
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], fileName, { type: "image/png" });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Reconhecimento Combinado — ${rank}º Lugar em ${categoryName}`,
            text: `A plataforma Combinado agradece a ${provider.display_name} pelo destaque em ${categoryName}!`,
            files: [file],
          });
          return;
        }
      } catch {
        // fallback para download
      }
      handleDownload();
    }, "image/png");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[#050C16]/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[var(--shadow-level-3)] border border-[#0F1A24]/10 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#006e2a]" />
            <div>
              <h3 className="font-display font-bold text-base text-[#0F1A24]">
                Banner de Reconhecimento (1080×1350)
              </h3>
              <p className="text-[11px] text-[#3d4a3c]">
                Arte oficial do Combinado agradecendo o seu trabalho
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#3d4a3c] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="rounded-xl overflow-hidden bg-[#F6F8FC] border border-[#0F1A24]/10 flex items-center justify-center min-h-[300px]">
          {isGenerating ? (
            <p className="text-xs font-semibold text-[#3d4a3c]">
              Gerando sua arte de reconhecimento...
            </p>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview do banner de reconhecimento"
              className="w-full max-h-[430px] object-contain"
            />
          ) : (
            <p className="text-xs text-[#ba1a1a] p-4 text-center">
              Não foi possível gerar a prévia do banner.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!previewUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar Agora
            </button>
          )}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!previewUrl}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0F1A24] hover:bg-[#1e2d3b] text-white font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Baixar PNG (1080×1350)
          </button>
        </div>
      </div>
    </div>
  );
}
