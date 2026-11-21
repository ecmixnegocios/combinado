"use client";

import { useRef, useState } from "react";
import { Camera, Check, Trash2, Upload, User, X, ZoomIn, ZoomOut } from "lucide-react";

const CROP_VIEW_SIZE = 240;
const EXPORT_SIZE = 300;

export function AvatarUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (newUrl: string) => void;
}) {
  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  // Estado do editor de recorte e zoom
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setImgDims({ w: img.width, h: img.height });
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setRawImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Escala base para que a imagem cubra o círculo de 240x240 no zoom 1x
  const baseScale = Math.max(
    CROP_VIEW_SIZE / imgDims.w,
    CROP_VIEW_SIZE / imgDims.h
  );
  const currentScale = baseScale * zoom;
  const renderedW = imgDims.w * currentScale;
  const renderedH = imgDims.h * currentScale;

  // Limita o arraste para a imagem nunca deixar borda vazia dentro do círculo
  const clampOffset = (nx: number, ny: number, rW: number, rH: number) => {
    const maxX = Math.max(0, (rW - CROP_VIEW_SIZE) / 2);
    const maxY = Math.max(0, (rH - CROP_VIEW_SIZE) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, nx)),
      y: Math.max(-maxY, Math.min(maxY, ny)),
    };
  };

  const handleZoomChange = (nextZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, Number(nextZoom.toFixed(2))));
    const nextScale = baseScale * clampedZoom;
    setZoom(clampedZoom);
    setOffset((prev) =>
      clampOffset(prev.x, prev.y, imgDims.w * nextScale, imgDims.h * nextScale)
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(
        dragRef.current.origX + dx,
        dragRef.current.origY + dy,
        renderedW,
        renderedH
      )
    );
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  const handleConfirmCrop = () => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const factor = EXPORT_SIZE / CROP_VIEW_SIZE;
      const drawW = renderedW * factor;
      const drawH = renderedH * factor;
      const drawX = (EXPORT_SIZE - drawW) / 2 + offset.x * factor;
      const drawY = (EXPORT_SIZE - drawH) / 2 + offset.y * factor;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      onChange(canvas.toDataURL("image/jpeg", 0.85));
      setRawImageSrc(null);
    };
    img.src = rawImageSrc;
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[#121d27]">
        Foto de Perfil (opcional)
      </label>

      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10">
        {value.trim() ? (
          <img
            src={value}
            alt="Prévia da foto"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00B048]/30 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-white border border-[#0F1A24]/15 text-slate-400 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 flex-1">
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#0F1A24]/15 hover:border-[#00B048] text-xs font-semibold text-[#121d27] transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#006e2a]" />
            <span>Enviar foto</span>
          </button>

          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#0F1A24]/15 hover:border-[#00B048] text-xs font-semibold text-[#121d27] transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Tirar foto</span>
          </button>

          {value.trim() && (
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remover foto"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* Modal de Ajuste: Arrastar e Zoom */}
      {rawImageSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050C16]/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[var(--shadow-level-3)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-[#0F1A24]">
                  Ajustar Foto de Perfil
                </h3>
                <p className="text-[11px] text-[#3d4a3c]">
                  Arraste a foto para centralizar e use o zoom abaixo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRawImageSrc(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#3d4a3c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Área circular interativa de recorte */}
            <div className="flex justify-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ width: CROP_VIEW_SIZE, height: CROP_VIEW_SIZE }}
                className="relative rounded-full overflow-hidden bg-slate-900 ring-4 ring-[#00B048]/30 cursor-grab active:cursor-grabbing touch-none select-none"
              >
                <img
                  src={rawImageSrc}
                  alt="Ajuste de foto"
                  draggable={false}
                  style={{
                    width: renderedW,
                    height: renderedH,
                    maxWidth: "none",
                    transform: `translate(${(CROP_VIEW_SIZE - renderedW) / 2 + offset.x}px, ${
                      (CROP_VIEW_SIZE - renderedH) / 2 + offset.y
                    }px)`,
                  }}
                  className="pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Controle de Zoom */}
            <div className="flex items-center gap-2.5 px-2">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.15)}
                className="p-1.5 rounded-lg bg-[#F6F8FC] border border-[#0F1A24]/10 text-[#121d27] hover:bg-slate-100 cursor-pointer"
                aria-label="Diminuir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-full accent-[#006e2a] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.15)}
                className="p-1.5 rounded-lg bg-[#F6F8FC] border border-[#0F1A24]/10 text-[#121d27] hover:bg-slate-100 cursor-pointer"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setRawImageSrc(null)}
                className="flex-1 py-2.5 rounded-full border border-[#0F1A24]/15 text-xs font-semibold text-[#121d27] hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="flex-1 py-2.5 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Aplicar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
