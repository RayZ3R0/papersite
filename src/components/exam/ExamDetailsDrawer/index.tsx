"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Examination } from "@/types/exam";
import { UserSubjectConfig } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ExamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  exams: Examination[];
  userSubjects?: UserSubjectConfig[];
}

export function ExamDetailsDrawer({
  isOpen,
  onClose,
  date,
  exams,
  userSubjects,
}: ExamDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Filter exams that are relevant to user's subjects if provided
  const relevantExams = userSubjects
    ? exams.filter((exam) =>
        userSubjects.some((subject) => subject.subjectCode === exam.subject)
      )
    : exams;

  // Group exams by time
  const morningExams = relevantExams.filter((exam) => exam.time === "Morning");
  const afternoonExams = relevantExams.filter(
    (exam) => exam.time === "Afternoon"
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn("flex flex-col", isMobile ? "w-full" : "w-[540px]")}
      >
        <SheetHeader className="space-y-4 pb-4 border-b">
          <SheetTitle className="text-2xl font-bold">
            {format(date, "EEEE, MMMM d, yyyy")}
          </SheetTitle>
          <div className="flex flex-wrap gap-2">
            {relevantExams.length > 0 ? (
              <Badge variant="outline">
                {relevantExams.length}{" "}
                {relevantExams.length === 1 ? "Exam" : "Exams"}
              </Badge>
            ) : (
              <Badge variant="outline">No Exams</Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-8">
          {morningExams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Morning Session</h3>
              {morningExams.map((exam) => (
                <ExamDetailCard key={exam.code} exam={exam} />
              ))}
            </div>
          )}

          {afternoonExams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Afternoon Session</h3>
              {afternoonExams.map((exam) => (
                <ExamDetailCard key={exam.code} exam={exam} />
              ))}
            </div>
          )}

          {relevantExams.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No exams scheduled for this day
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ExamDetailCardProps {
  exam: Examination;
}

function ExamDetailCard({ exam }: ExamDetailCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{exam.title}</h4>
            <p className="text-sm text-muted-foreground">
              {exam.subject} ({exam.code})
            </p>
          </div>
          <Badge>{exam.duration}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Session</dt>
            <dd>{exam.time}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Day</dt>
            <dd>{exam.day}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
