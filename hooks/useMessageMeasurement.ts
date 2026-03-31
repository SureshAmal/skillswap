import { useState, useCallback, useRef, useEffect } from "react";
import { prepare, layout } from "@chenglou/pretext";

// A stable CSS font string that matches the exact font rendering in the chat bubble.
const CHAT_FONT =
  "14px Inter, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

export function useMessageMeasurement() {
  const [isReady, setIsReady] = useState(false);
  const prepareCache = useRef<Map<string, ReturnType<typeof prepare>>>(new Map());

  useEffect(() => {
    // pretext requires DOM context (Canvas) to pre-measure, 
    // so we set ready state to true after initial mount.
    setIsReady(true);
  }, []);

  const measure = useCallback((content: string, containerWidth: number) => {
    if (!content) return 0;
    
    // Determine max width. Our UI sets max-w-[75%].
    const maxBubbleWidth = Math.floor(containerWidth * 0.75);
    // px-4 horizontal padding means we subtract 32px for the text bounding box
    const maxTextWidth = maxBubbleWidth - 32;

    let prepared = prepareCache.current.get(content);
    if (!prepared) {
      prepared = prepare(content, CHAT_FONT);
      if (prepareCache.current.size > 2000) {
        prepareCache.current.clear();
      }
      prepareCache.current.set(content, prepared);
    }

    // layout takes (preparedObject, width, lineHeight)
    // text-sm usually implies 20px line height
    const { height } = layout(prepared, maxTextWidth, 20);

    // Add CSS padding and margins
    // py-2.5 -> 20px padding vertical
    // timestamp -> ~18px
    // container flex gap -> 12px
    const bubblePadding = 20;
    const timestampHeight = 18;
    const messageGap = 12;

    return height + bubblePadding + timestampHeight + messageGap;
  }, []);

  return { isReady, measure };
}
