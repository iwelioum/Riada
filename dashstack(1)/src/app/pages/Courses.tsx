import { motion } from "motion/react";
import { BookOpen, Flame, Clock, Users } from "lucide-react";

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: "bg-[#E0F8EA] text-[#00B69B]",
  Intermediate: "bg-[#FFF3D6] text-[#FF9066]",
  Advanced: "bg-[#FFF0F0] text-[#FF4747]",
  AllLevels: "bg-[#EBEBFF] text-[#4880FF]",
};

const MOCK_COURSES = [
  { id: 1, courseName: "Power Yoga", activityType: "Flexibility", difficultyLevel: "Beginner", durationMinutes: 60, maxCapacity: 20, estimatedCalories: 250 },
  { id: 2, courseName: "HIIT Blast", activityType: "Cardio", difficultyLevel: "Advanced", durationMinutes: 45, maxCapacity: 15, estimatedCalories: 600 },
  { id: 3, courseName: "Pilates Core", activityType: "Flexibility", difficultyLevel: "Intermediate", durationMinutes: 50, maxCapacity: 12, estimatedCalories: 300 },
  { id: 4, courseName: "Aqua Fitness", activityType: "Cardio", difficultyLevel: "AllLevels", durationMinutes: 45, maxCapacity: 25, estimatedCalories: 350 },
  { id: 5, courseName: "Boxing Fundamentals", activityType: "Combat", difficultyLevel: "Intermediate", durationMinutes: 60, maxCapacity: 16, estimatedCalories: 520 },
  { id: 6, courseName: "Zen Flow", activityType: "Relaxation", difficultyLevel: "AllLevels", durationMinutes: 60, maxCapacity: 18, estimatedCalories: 150 },
  { id: 7, courseName: "Street Dance", activityType: "Dance", difficultyLevel: "Beginner", durationMinutes: 50, maxCapacity: 20, estimatedCalories: 380 },
  { id: 8, courseName: "Muscle Building", activityType: "Strength", difficultyLevel: "Intermediate", durationMinutes: 55, maxCapacity: 10, estimatedCalories: 450 },
];

export function Courses() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#4880FF]" /> Courses
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {MOCK_COURSES.length} courses in catalogue
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                {["Course", "Activity type", "Difficulty", "Duration", "Capacity", "Est. calories"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_COURSES.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-default"
                >
                  <td className="px-5 py-4 font-bold text-[#111827]">{course.courseName}</td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{course.activityType}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DIFFICULTY_CLASSES[course.difficultyLevel] ?? "bg-[#F5F6FA] text-[#6B7280]"}`}>
                      {course.difficultyLevel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#6B7280]" />
                      {course.durationMinutes} min
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      {course.maxCapacity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#111827]">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-[#FF9066]" />
                      ~{course.estimatedCalories} kcal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}