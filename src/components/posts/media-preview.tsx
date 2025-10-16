import { cn } from "@/lib/utils";
import { Media } from "@prisma/client";
import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface MediaPreviewProps {
  attachment: Media[];
}

export const MediaPreview = ({ attachment }: MediaPreviewProps) => {
  const [[currentIndex, direction], setCurrentIndex] = useState<
    [number, number]
  >([0, 0]);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  if (!attachment || attachment.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No media available</p>
    );
  }

  const wrapIndex = (index: number) => {
    const length = attachment.length;
    return (index + length) % length; // loop around
  };

  const changeSlide = (newDirection: number) => {
    setCurrentIndex(([prev]) => {
      const next = wrapIndex(prev + newDirection);
      scrollToThumbnail(next);
      return [next, newDirection];
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(([prev]) => {
      scrollToThumbnail(index);
      return [wrapIndex(index), index > prev ? 1 : -1];
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      changeSlide(-1);
    } else if (info.offset.x < -100) {
      changeSlide(1);
    }
  };

  const scrollToThumbnail = (index: number) => {
    const container = thumbnailRef.current;
    if (!container) return;
    const thumbnailWidth = 88; // 80px + 8px gap
    const scrollLeft =
      thumbnailWidth * index - container.offsetWidth / 2 + thumbnailWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  const currentMedia = attachment[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
      {/* Fixed Height Container */}
      <div className="relative h-[20rem] flex justify-center items-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex justify-center items-center"
          >
            {currentMedia.type === "IMAGE" ? (
              <Image
                src={currentMedia.url}
                alt="Attachment"
                width={500}
                height={500}
                className="max-h-[30rem] rounded-2xl"
              />
            ) : currentMedia.type === "VIDEO" ? (
              <video
                src={currentMedia.url}
                controls
                className="max-h-[30rem] rounded-2xl"
              />
            ) : (
              <p className="text-destructive text-center">
                Unsupported media type
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Arrows */}
      {attachment.length > 1 && (
        <>
          <button
            onClick={() => changeSlide(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary bg-opacity-30 text-white rounded-full p-2 hover:bg-opacity-50 transition"
          >
            &#8592;
          </button>
          <button
            onClick={() => changeSlide(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary bg-opacity-30 text-white rounded-full p-2 hover:bg-opacity-50 transition"
          >
            &#8594;
          </button>
        </>
      )}
    </div>
  );
};
