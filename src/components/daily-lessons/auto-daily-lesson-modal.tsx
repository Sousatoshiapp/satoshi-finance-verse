import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { DailyLessonModal } from "./daily-lesson-modal";

export function AutoDailyLessonModal() {
  const { shouldShowModal, markModalShown } = useDailyLessons();

  return (
    <DailyLessonModal
      isOpen={shouldShowModal}
      onClose={markModalShown}
    />
  );
}