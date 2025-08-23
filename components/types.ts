export interface ClassroomContent {
  id: number
  courseId: number
  no: number
  type: 'c' | 't' | 'e' // content, test, evaluation
  name: string
  content1?: string | null
  content2?: string | null
  minutes?: number | null
  testId1?: number | null
  testId2?: number | null
  testId3?: number | null
  evaluationId?: number | null
  completed: boolean
  completeDate?: string | null
  contentSeconds?: number | null
  testScore?: number | null
  testTries?: number | null
}

export interface CourseData {
  id: number
  code: string
  name: string
  courseCategoryId: number
  learningObjective: string
  instructor: string
  learningTopic: string
  targetGroup: string
  assessment: string
  thumbnail: string
  seqFlow: boolean
  contents: ClassroomContent[]
}

export interface ContentView {
  id: number
  courseRegistrationId: number
  courseContentId: number
  isCompleted: boolean
  completeDate?: string | null
  contentSeconds?: number | null
  testScore?: number | null
  testTries?: number | null
  no: number
}
