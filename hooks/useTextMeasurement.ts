import { useState, useCallback, useRef, useEffect } from "react";
import { prepare, layout } from "@chenglou/pretext";

export function useTextMeasurement(font: string = "16px Inter, ui-sans-serif, system-ui, sans-serif") {
  const [isReady, setIsReady] = useState(false);
  const prepareCache = useRef<Map<string, ReturnType<typeof prepare>>>(new Map());

  useEffect(() => {
    setIsReady(true);
  }, []);

  const measureTextHeight = useCallback((content: string, width: number, lineHeight: number = 24) => {
    if (!content || width <= 0) return 0;
    
    let prepared = prepareCache.current.get(content);
    if (!prepared) {
      prepared = prepare(content, font);
      if (prepareCache.current.size > 2000) prepareCache.current.clear();
      prepareCache.current.set(content, prepared);
    }
    
    const { height } = layout(prepared, width, lineHeight);
    return height;
  }, [font]);

  return { isReady, measureTextHeight };
}
