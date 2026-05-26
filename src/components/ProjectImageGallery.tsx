import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProjectImage } from "../types/cv";
import { publicAsset } from "../utils/assets";

type ProjectImageGalleryProps = {
  images?: ProjectImage[];
  projectTitle: string;
};

export function ProjectImageGallery({ images, projectTitle }: ProjectImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasImages = Boolean(images?.length);

  const selectedImage =
    selectedIndex !== null && images?.[selectedIndex] ? images[selectedIndex] : null;
  const selectedDisplayIndex = selectedIndex === null ? 0 : selectedIndex + 1;

  function close() {
    setSelectedIndex(null);
  }

  function showPrevious() {
    if (!images?.length) {
      return;
    }

    setSelectedIndex((current) =>
      current === null ? 0 : (current - 1 + images.length) % images.length,
    );
  }

  function showNext() {
    if (!images?.length) {
      return;
    }

    setSelectedIndex((current) => (current === null ? 0 : (current + 1) % images.length));
  }

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIndex, images?.length]);

  if (!hasImages || !images) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" aria-label={`${projectTitle} screenshots`}>
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="group relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/60 transition hover:-translate-y-0.5 hover:border-teal-300/45 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-teal-300/20 sm:h-32 sm:w-48"
              aria-label={`Открыть ${image.alt}`}
            >
              <img
                src={publicAsset(image.thumbSrc)}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent opacity-70" />
            </button>
          ))}
        </div>
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} image viewer`}
          onClick={close}
        >
          <div
            className="relative flex max-h-full w-full max-w-6xl flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                  {projectTitle}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedDisplayIndex} / {images.length}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
                aria-label="Закрыть галерею"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
              <img
                src={publicAsset(selectedImage.src)}
                alt={selectedImage.alt}
                className="max-h-[72vh] w-full object-contain"
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-slate-100 shadow-soft backdrop-blur transition hover:border-teal-300/40 hover:bg-teal-300/15 hover:text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-slate-100 shadow-soft backdrop-blur transition hover:border-teal-300/40 hover:bg-teal-300/15 hover:text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
