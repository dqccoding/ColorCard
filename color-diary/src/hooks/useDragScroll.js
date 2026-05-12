import { useRef, useCallback } from 'react';

export default function useDragScroll() {
  const ref = useRef(null);
  const state = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false });

  const onMouseDown = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    state.current = { isDragging: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!state.current.isDragging) return;
    const dx = e.pageX - state.current.startX;
    if (Math.abs(dx) > 3) state.current.moved = true;
    const el = ref.current;
    if (el) el.scrollLeft = state.current.scrollLeft - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!state.current.isDragging) return;
    state.current.isDragging = false;
    const el = ref.current;
    if (el) {
      el.style.cursor = '';
      el.style.userSelect = '';
    }
  }, []);

  const didDrag = useCallback(() => state.current.moved, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, didDrag };
}
