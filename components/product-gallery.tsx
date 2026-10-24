"use client";

import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length > 0 ? images : ["/images/placeholder.svg"];
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-stone-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[active]} alt={alt} className="aspect-[4/3] w-full object-cover" />
      </div>
      {list.length > 1 ? (
        <div className="mt-3 flex gap-3">
          {list.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-xl border bg-white transition ${
                index === active ? "border-brass-deep ring-1 ring-brass-deep" : "border-line hover:border-brass"
              }`}
              aria-label={`${alt} ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-20 w-24 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
