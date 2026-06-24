// ─────────────────────────────────────────────────────────────────────────────
// HassenClass API Documentation Data
// Pristine, audited, and strictly limited to real features and SDK methods.
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeExample {
  lang: string;
  code: string;
}

export interface Param {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

export interface SdkMethodDoc {
  name: string;
  description: string;
  parameters: Param[];
  example: string;
  returnValue: string;
}

export interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  whenToUse: string;
  permissions: string;
  rateLimits: string;
  params?: Param[];
  requestBody?: object;
  responseBody: object;
  errorExamples: { status: number; body: object }[];
  examples: CodeExample[];
  realWorldUseCase: string;
}

export interface DocSection {
  id: string;
  title: string;
  description: string;
  badge?: string;
  endpoints: Endpoint[];
}

// ─── CLASSROOMS ──────────────────────────────────────────────────────────────
const classroomsSection: DocSection = {
  id: "classrooms",
  title: "Classrooms API",
  description: "Classrooms represent isolated virtual teaching environments on the HassenClass LMS. Use this API to manage classrooms and assign teachers and students.",
  badge: "Core API",
  endpoints: [
    {
      method: "POST",
      path: "/classrooms",
      description: "Create a new classroom room profile.",
      whenToUse: "Call this when an administrator or teacher initiates a new course, section, or virtual classroom space.",
      permissions: "Requires API Key (hc_live_xxxxx) in the Authorization header. Server-side only.",
      rateLimits: "120 requests per minute.",
      params: [
        { name: "name", type: "string", required: true, desc: "The name of the classroom." },
        { name: "description", type: "string", required: false, desc: "A detailed description or summary of the classroom course." }
      ],
      requestBody: {
        name: "Physics 101",
        description: "Grade 12 Physics Course"
      },
      responseBody: {
        classroomId: "cls_abc123",
        name: "Physics 101",
        description: "Grade 12 Physics Course",
        createdAt: "2026-06-24T10:30:00.000Z"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } },
        { status: 500, body: { statusCode: 500, error: "INTERNAL_ERROR", message: "Unexpected server error" } }
      ],
      realWorldUseCase: "A private tutoring agency triggers a classroom creation workflow automatically whenever a new batch of students signs up.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/classrooms \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Physics 101",
    "description": "Grade 12 Physics"
  }'`
        },
        {
          lang: "JavaScript",
          code: `const response = await fetch("https://api.hassenclass.in/classrooms", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hc_live_xxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Physics 101",
    description: "Grade 12 Physics"
  })
});

const data = await response.json();
console.log(data.classroomId); // "cls_abc123"`
        },
        {
          lang: "TypeScript",
          code: `import { HassenClass } from "@hassenclass/sdk";

const hc = new HassenClass({
  apiKey: process.env.HC_API_KEY!
});

const classroom = await hc.createClassroom({
  name: "Physics 101",
  description: "Grade 12 Physics"
});

console.log(classroom.classroomId); // "cls_abc123"`
        }
      ]
    },
    {
      method: "GET",
      path: "/classrooms",
      description: "List all classrooms registered under the current API Key.",
      whenToUse: "Use to populate admin dashboards or selection menus with a list of active virtual classrooms.",
      permissions: "Requires API Key.",
      rateLimits: "240 requests per minute.",
      responseBody: {
        classrooms: [
          {
            classroomId: "cls_abc123",
            name: "Physics 101",
            description: "Grade 12 Physics",
            createdAt: "2026-06-24T10:30:00.000Z"
          }
        ]
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Displaying all active classrooms in a manager dashboard to monitor active course directories.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/classrooms \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        },
        {
          lang: "JavaScript",
          code: `const response = await fetch("https://api.hassenclass.in/classrooms", {
  headers: {
    "Authorization": "Bearer hc_live_xxxxx"
  }
});
const data = await response.json();
console.log(data.classrooms);`
        },
        {
          lang: "TypeScript",
          code: `import { HassenClass } from "@hassenclass/sdk";

const hc = new HassenClass({
  apiKey: process.env.HC_API_KEY!
});

const classrooms = await hc.listClassrooms();
console.log(classrooms);`
        }
      ]
    },
    {
      method: "POST",
      path: "/classrooms/:classroomId/members",
      description: "Add a teacher or student to a specific classroom.",
      whenToUse: "Use on successful payment, subscription, enrollment, or admin-assigned staffing.",
      permissions: "Requires API Key.",
      rateLimits: "120 requests per minute.",
      params: [
        { name: "memberId", type: "string", required: true, desc: "The ID of the teacher (tch_...) or student (stu_...)" },
        { name: "memberType", type: "string", required: true, desc: "Either 'teacher' or 'student'" }
      ],
      requestBody: {
        memberId: "stu_xyz789",
        memberType: "student"
      },
      responseBody: {
        success: true,
        classroomId: "cls_abc123",
        memberId: "stu_xyz789",
        memberType: "student",
        joinedAt: "2026-06-24T11:00:00.000Z"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } },
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Classroom not found" } }
      ],
      realWorldUseCase: "Automatically enrolling students in their respective classroom groups as soon as they complete purchase checkout.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/classrooms/cls_abc123/members \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "memberId": "stu_xyz789",
    "memberType": "student"
  }'`
        },
        {
          lang: "JavaScript",
          code: `const response = await fetch("https://api.hassenclass.in/classrooms/cls_abc123/members", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hc_live_xxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    memberId: "stu_xyz789",
    memberType: "student"
  })
});
const data = await response.json();`
        }
      ]
    },
    {
      method: "GET",
      path: "/classrooms/:classroomId/members",
      description: "List all members assigned to a classroom.",
      whenToUse: "Fetch class rosters, active student lists, or check if a teacher has been assigned to a classroom.",
      permissions: "Requires API Key.",
      rateLimits: "240 requests per minute.",
      responseBody: {
        members: [
          {
            memberId: "stu_xyz789",
            memberType: "student",
            name: "John Doe",
            joinedAt: "2026-06-24T11:00:00.000Z"
          },
          {
            memberId: "tch_mno123",
            memberType: "teacher",
            name: "Jane Smith",
            joinedAt: "2026-06-24T10:45:00.000Z"
          }
        ]
      },
      errorExamples: [
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Classroom not found" } }
      ],
      realWorldUseCase: "Populating the 'Students Enrolled' list on a web page for teachers to review their class sizes.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/classrooms/cls_abc123/members \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    }
  ]
};

// ─── MEETINGS ────────────────────────────────────────────────────────────────
const meetingsSection: DocSection = {
  id: "meetings",
  title: "Meetings API",
  description: "Meetings are live conferencing sessions launched inside classrooms. Meetings are hosted on meet.hassenclass.in.",
  badge: "Core API",
  endpoints: [
    {
      method: "POST",
      path: "/meetings",
      description: "Create a live or scheduled meeting for a classroom.",
      whenToUse: "Call this when scheduling a lecture, office hours, or an on-demand tutorial session.",
      permissions: "Requires API Key.",
      rateLimits: "120 requests per minute.",
      params: [
        { name: "classroomId", type: "string", required: true, desc: "The ID of the parent classroom." },
        { name: "title", type: "string", required: true, desc: "The title of the meeting." }
      ],
      requestBody: {
        classroomId: "cls_abc123",
        title: "Thermodynamics Lecture"
      },
      responseBody: {
        meetingId: "mtg_789xyz",
        jitsiRoom: "room_thermo_lecture"
      },
      errorExamples: [
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Classroom not found" } }
      ],
      realWorldUseCase: "A calendar synchronization service schedules live HassenClass meetings corresponding to curriculum timelines.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "classroomId": "cls_abc123",
    "title": "Thermodynamics Lecture"
  }'`
        }
      ]
    },
    {
      method: "GET",
      path: "/meetings",
      description: "List all meetings under your organization.",
      whenToUse: "Use to review scheduled live calls, calendar agendas, or historical classes.",
      permissions: "Requires API Key.",
      rateLimits: "240 requests per minute.",
      responseBody: {
        meetings: [
          {
            meetingId: "mtg_789xyz",
            classroomId: "cls_abc123",
            title: "Thermodynamics Lecture",
            status: "scheduled",
            joinUrl: "https://meet.hassenclass.in/room_thermo_lecture"
          }
        ]
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Populating a list of upcoming live meetings on a student dashboard.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/meetings \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    },
    {
      method: "POST",
      path: "/meetings/:meetingId/start",
      description: "Transition a meeting status to 'live' and initialize the meet.hassenclass.in conferencing room.",
      whenToUse: "Call this immediately when the teacher clicks 'Start Class' on their dashboard.",
      permissions: "Requires API Key.",
      rateLimits: "60 requests per minute.",
      responseBody: {
        success: true,
        status: "live"
      },
      errorExamples: [
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Meeting not found" } }
      ],
      realWorldUseCase: "Enabling camera/microphone streams and unlocking room access for authorized students.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings/mtg_789xyz/start \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    },
    {
      method: "POST",
      path: "/meetings/:meetingId/end",
      description: "End a live meeting, disconnecting all participants.",
      whenToUse: "Trigger this when a teacher clicks 'End Class' or when your server ends a meeting automatically.",
      permissions: "Requires API Key.",
      rateLimits: "60 requests per minute.",
      responseBody: {
        success: true,
        status: "ended"
      },
      errorExamples: [
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Meeting not found" } }
      ],
      realWorldUseCase: "Tearing down video streaming servers and recording session durations in student profiles.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings/mtg_789xyz/end \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    },
    {
      method: "GET",
      path: "/meetings/:meetingId/join",
      description: "Retrieve authorization headers and the specific room join URL to embed or redirect to.",
      whenToUse: "Call this right before launching Jitsi/WebRTC meetings inside an iframe or browser tab.",
      permissions: "Requires Teacher or Student JWT token.",
      rateLimits: "300 requests per minute.",
      responseBody: {
        success: true,
        meetingId: "mtg_789xyz",
        room: "room_thermo_lecture",
        joinUrl: "https://meet.hassenclass.in/room_thermo_lecture",
        role: "student",
        moderator: false
      },
      errorExamples: [
        { status: 404, body: { statusCode: 404, error: "NOT_FOUND", message: "Meeting not found" } }
      ],
      realWorldUseCase: "Directly launching the immersive video classroom view when a user clicks 'Join Meeting'.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/meetings/mtg_789xyz/join \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."`
        }
      ]
    }
  ]
};

// ─── TEACHERS ────────────────────────────────────────────────────────────────
const teachersSection: DocSection = {
  id: "teachers",
  title: "Teachers API",
  description: "Manage teacher directory records. Assign teacher accounts to classrooms.",
  badge: "Core API",
  endpoints: [
    {
      method: "POST",
      path: "/teachers",
      description: "Register a new teacher profile in the platform database.",
      whenToUse: "Call when you onboard a new teacher or invite a guest lecturer.",
      permissions: "Requires API Key.",
      rateLimits: "120 requests per minute.",
      params: [
        { name: "name", type: "string", required: true, desc: "Full legal name of the teacher." },
        { name: "email", type: "string", required: true, desc: "Unique email address." }
      ],
      requestBody: {
        name: "Jane Smith",
        email: "janesmith@school.com"
      },
      responseBody: {
        teacherId: "tch_mno123",
        name: "Jane Smith",
        email: "janesmith@school.com",
        createdAt: "2026-06-24T09:00:00.000Z"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Building a faculty roster dashboard where managers can add and register new teaching staff.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/teachers \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "janesmith@school.com"
  }'`
        }
      ]
    },
    {
      method: "GET",
      path: "/teachers",
      description: "List all teachers registered on the platform.",
      whenToUse: "Use to show faculty directories or manage staff profiles.",
      permissions: "Requires API Key.",
      rateLimits: "240 requests per minute.",
      responseBody: {
        teachers: [
          {
            teacherId: "tch_mno123",
            name: "Jane Smith",
            email: "janesmith@school.com"
          }
        ]
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Rendering an educational faculty table with searchable items on administrative panels.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/teachers \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    }
  ]
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
const studentsSection: DocSection = {
  id: "students",
  title: "Students API",
  description: "Manage student profiles and keep track of student directories.",
  badge: "Core API",
  endpoints: [
    {
      method: "POST",
      path: "/students",
      description: "Register a new student profile.",
      whenToUse: "Call this during platform registration or when bulk enrolling a batch of students.",
      permissions: "Requires API Key.",
      rateLimits: "120 requests per minute.",
      params: [
        { name: "name", type: "string", required: true, desc: "Full name of the student." },
        { name: "email", type: "string", required: true, desc: "Unique email address for registration." }
      ],
      requestBody: {
        name: "John Doe",
        email: "johndoe@student.com"
      },
      responseBody: {
        studentId: "stu_xyz789",
        name: "John Doe",
        email: "johndoe@student.com",
        createdAt: "2026-06-24T10:00:00.000Z"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Adding a new registration flow where signups are saved on HassenClass server to authorize upcoming live classroom joins.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/students \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "johndoe@student.com"
  }'`
        }
      ]
    },
    {
      method: "GET",
      path: "/students",
      description: "List all students.",
      whenToUse: "Use to show student rosters, view registered cohorts, or manage profiles.",
      permissions: "Requires API Key.",
      rateLimits: "240 requests per minute.",
      responseBody: {
        students: [
          {
            studentId: "stu_xyz789",
            name: "John Doe",
            email: "johndoe@student.com"
          }
        ]
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Populating active user registers inside school management portals.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/students \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    }
  ]
};

// ─── AUTHENTICATION (TEACHER/STUDENT LOGIN) ──────────────────────────────────
const authSection: DocSection = {
  id: "auth",
  title: "Teacher & Student Auth",
  description: "Endpoints to authenticate teachers and students directly inside their localized login screens. Note that the HassenClass SDK itself authenticates using API Keys (hc_live_*), while client-side meeting joins require the JWT access tokens (accessToken) returned from these endpoints.",
  badge: "Authentication API",
  endpoints: [
    {
      method: "POST",
      path: "/teacher-auth/login",
      description: "Log in a registered teacher to issue their dashboard accessToken JWT.",
      whenToUse: "Call this when teachers fill in their credentials on your customized LMS web or mobile app login screen.",
      permissions: "Public endpoint.",
      rateLimits: "30 requests per minute.",
      params: [
        { name: "email", type: "string", required: true, desc: "Teacher email address." },
        { name: "password", type: "string", required: true, desc: "Teacher account password." }
      ],
      requestBody: {
        email: "janesmith@school.com",
        password: "secure_password_123"
      },
      responseBody: {
        accessToken: "eyJhbGciOiJIUzI1Ni...",
        teacherId: "tch_123",
        role: "teacher",
        email: "teacher@example.com"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid credentials" } }
      ],
      realWorldUseCase: "Allowing teachers to securely log into the virtual classroom panel to trigger live meetings.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/teacher-auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "janesmith@school.com",
    "password": "secure_password_123"
  }'`
        }
      ]
    },
    {
      method: "POST",
      path: "/student-auth/login",
      description: "Log in a registered student to authorize classroom room entry with an accessToken JWT.",
      whenToUse: "Call this when students sign in to attend their live sessions.",
      permissions: "Public endpoint.",
      rateLimits: "60 requests per minute.",
      params: [
        { name: "email", type: "string", required: true, desc: "Student email address." },
        { name: "password", type: "string", required: true, desc: "Student account password." }
      ],
      requestBody: {
        email: "johndoe@student.com",
        password: "student_secure_pass"
      },
      responseBody: {
        accessToken: "eyJhbGciOiJIUzI1Ni...",
        studentId: "stu_123",
        role: "student",
        email: "student@example.com"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid credentials" } }
      ],
      realWorldUseCase: "Authorizing students to access their live timetable rooms and launch Webrtc streams.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/student-auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "johndoe@student.com",
    "password": "student_secure_pass"
  }'`
        }
      ]
    }
  ]
};

// ─── API KEYS ────────────────────────────────────────────────────────────────
const apiKeysSection: DocSection = {
  id: "api-keys",
  title: "API Keys API",
  description: "Provision, rotate, and review organizational HassenClass API keys to communicate securely from your server.",
  badge: "Security API",
  endpoints: [
    {
      method: "POST",
      path: "/api-keys",
      description: "Create a new programmatic API Key.",
      whenToUse: "Use when spinning up a new service layer or needing an additional active server credential.",
      permissions: "Requires organizational root credentials.",
      rateLimits: "10 keys per hour.",
      responseBody: {
        apiKey: "hc_live_xxxxxxxxxxxx",
        active: true,
        createdAt: "2026-06-24T12:00:00.000Z"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Generating programmatic tokens to allow separate cloud microservices to securely communicate with HassenClass.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/api-keys \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    },
    {
      method: "GET",
      path: "/api-keys",
      description: "List all active programmatic API keys.",
      whenToUse: "Auditing active security keys under your organization structure.",
      permissions: "Requires organizational root credentials.",
      rateLimits: "60 requests per minute.",
      responseBody: [
        {
          apiKey: "hc_live_xxxxxxxxxxxx",
          active: true,
          createdAt: "2026-06-24T12:00:00.000Z"
        }
      ],
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Rendering active API tokens in your developer console interface.",
      examples: [
        {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/api-keys \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    },
    {
      method: "POST",
      path: "/api-keys/rotate",
      description: "Rotate your active API key to generate a brand new credential set. Security Callout: Secret keys are displayed only once during rotation. Store them securely.",
      whenToUse: "When credentials are compromised, or rotating security keys periodically under best-practice security baselines.",
      permissions: "Requires organizational root credentials.",
      rateLimits: "5 rotations per hour.",
      responseBody: {
        apiKey: "hc_live_xxxxxxxxxxxx",
        secretKey: "hc_secret_xxxxxxxxxxxx"
      },
      errorExamples: [
        { status: 401, body: { statusCode: 401, error: "UNAUTHORIZED", message: "Invalid API Key" } }
      ],
      realWorldUseCase: "Safely rotating the server key for the main LMS deployment while ensuring absolute key secrecy.",
      examples: [
        {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/api-keys/rotate \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        }
      ]
    }
  ]
};

export const ALL_SECTIONS: DocSection[] = [
  classroomsSection,
  meetingsSection,
  teachersSection,
  studentsSection,
  authSection,
  apiKeysSection
];

export const SDK_REFERENCE_CODE = `import { HassenClass } from "@hassenclass/sdk";

// ── Initialize HassenClass Client ──────────────────────────────────────────
const hc = new HassenClass({
  apiKey: process.env.HC_API_KEY!, // Key of form hc_live_xxxxx
  baseUrl: "https://api.hassenclass.in" // Optional
});

// ── 1. Classrooms ──────────────────────────────────────────────────────────
// Create Classroom
const classroom = await hc.createClassroom({
  name: "Physics 101",
  description: "Grade 12 Physics Course"
});
console.log(classroom.classroomId); // "cls_abc123"

// List All Classrooms
const classrooms = await hc.listClassrooms();
console.log(classrooms); // [ { classroomId: "cls_abc123", ... } ]

// ── 2. Members ─────────────────────────────────────────────────────────────
// Add Member to Classroom
const member = await hc.addMember("cls_abc123", {
  memberId: "stu_xyz789",
  memberType: "student"
});
console.log(member.success); // true

// List Classroom Members
const members = await hc.listMembers("cls_abc123");
console.log(members); // [ { memberId: "stu_xyz789", memberType: "student", ... } ]

// ── 3. Meetings ────────────────────────────────────────────────────────────
// Create Meeting
const meeting = await hc.createMeeting({
  classroomId: "cls_abc123",
  title: "Thermodynamics Lecture"
});
console.log(meeting.meetingId); // "mtg_789xyz"

// List Meetings
const meetings = await hc.listMeetings();
console.log(meetings); // [ { meetingId: "mtg_789xyz", ... } ]

// Start Meeting
const startRes = await hc.startMeeting("mtg_789xyz");
console.log(startRes.success); // true

// End Meeting
const endRes = await hc.endMeeting("mtg_789xyz");
console.log(endRes.success); // true

// Join Meeting
const joinRes = await hc.joinMeeting("mtg_789xyz", "eyJhbGciOiJIUzI1Ni...");
console.log(joinRes.joinUrl); // "https://meet.hassenclass.in/room_thermo_lecture"

// ── 4. Teachers ────────────────────────────────────────────────────────────
// Create Teacher
const teacher = await hc.createTeacher({
  name: "Jane Smith",
  email: "janesmith@school.com"
});
console.log(teacher.teacherId); // "tch_mno123"

// List Teachers
const teachers = await hc.listTeachers();
console.log(teachers); // [ { teacherId: "tch_mno123", ... } ]

// ── 5. Students ────────────────────────────────────────────────────────────
// Create Student
const student = await hc.createStudent({
  name: "John Doe",
  email: "johndoe@student.com"
});
console.log(student.studentId); // "stu_xyz789"

// List Students
const students = await hc.listStudents();
console.log(students); // [ { studentId: "stu_xyz789", ... } ]`;

export const TUTORIAL_WORKFLOW = [
  { step: "1", title: "Create API Key", actor: "Platform Owner", desc: "Execute POST /api-keys to generate your programmatic hc_live_xxxxx bearer key." },
  { step: "2", title: "Create Classroom", actor: "Server Side", desc: "Use the SDK or endpoint (POST /classrooms) to create a designated course space." },
  { step: "3", title: "Create Teacher Profile", actor: "Server Side", desc: "Register a teaching faculty member (POST /teachers) to issue their teacherId." },
  { step: "4", title: "Create Student Profile", actor: "Server Side", desc: "Register a learning student (POST /students) to issue their studentId." },
  { step: "5", title: "Assign Teacher", actor: "Server Side", desc: "Link the teacher to the classroom via POST /classrooms/:id/members with memberId = tch_mno123 and memberType = teacher." },
  { step: "6", title: "Enroll Student", actor: "Server Side", desc: "Link the student to the classroom via POST /classrooms/:id/members with memberId = stu_xyz789 and memberType = student." },
  { step: "7", title: "Schedule Meeting", actor: "Server Side", desc: "Create a live conference event profile in the classroom (POST /meetings) to get a unique meetingId." },
  { step: "8", title: "Teacher Login", actor: "Teacher", desc: "The teacher authenticates via your web/mobile form using POST /teacher-auth/login." },
  { step: "9", title: "Start Meeting", actor: "Teacher Action", desc: "The teacher starts the scheduled session (POST /meetings/:id/start) to launch the meet.hassenclass.in room." },
  { step: "10", title: "Student Login", actor: "Student", desc: "The student logs into their account using POST /student-auth/login." },
  { step: "11", title: "Join Meeting", actor: "Student Action", desc: "Teacher or Student authenticates using JWT accessToken. Then calls: GET /meetings/:meetingId/join" },
  { step: "12", title: "End Meeting", actor: "Teacher / Server", desc: "The session is completed, triggering POST /meetings/:id/end to safely tear down the active classroom streams." }
];

export const SDK_METHODS: SdkMethodDoc[] = [
  {
    name: "createClassroom(dto)",
    description: "Initialize and construct a designated virtual classroom profile within the organization workspace.",
    parameters: [
      { name: "dto.name", type: "string", required: true, desc: "Descriptive course name (e.g., 'Physics 101')" },
      { name: "dto.description", type: "string", required: false, desc: "A brief summary of classroom course content" }
    ],
    example: `const classroom = await hc.createClassroom({\n  name: "Physics 101",\n  description: "Grade 12 Physics Course"\n});`,
    returnValue: `{\n  "classroomId": "cls_abc123",\n  "name": "Physics 101",\n  "description": "Grade 12 Physics Course",\n  "createdAt": "2026-06-24T12:00:00.000Z"\n}`
  },
  {
    name: "listClassrooms()",
    description: "Fetch and list all active virtual classrooms associated with your organization.",
    parameters: [],
    example: `const classrooms = await hc.listClassrooms();`,
    returnValue: `[\n  {\n    "classroomId": "cls_abc123",\n    "name": "Physics 101",\n    "description": "Grade 12 Physics Course",\n    "createdAt": "2026-06-24T12:00:00.000Z"\n  }\n]`
  },
  {
    name: "addMember(classroomId, dto)",
    description: "Add or register a teacher or student as an active member inside a specific classroom workspace.",
    parameters: [
      { name: "classroomId", type: "string", required: true, desc: "The ID of the classroom workspace ('cls_...')" },
      { name: "dto.memberId", type: "string", required: true, desc: "The ID of the teacher ('tch_...') or student ('stu_...')" },
      { name: "dto.memberType", type: "string", required: true, desc: "Type of member to assign ('teacher' or 'student')" }
    ],
    example: `const member = await hc.addMember("cls_abc123", {\n  memberId: "stu_xyz789",\n  memberType: "student"\n});`,
    returnValue: `{\n  "success": true,\n  "memberId": "stu_xyz789",\n  "memberType": "student",\n  "joinedAt": "2026-06-24T11:00:00.000Z"\n}`
  },
  {
    name: "listMembers(classroomId)",
    description: "List all active teachers and students enrolled inside a specific classroom workspace.",
    parameters: [
      { name: "classroomId", type: "string", required: true, desc: "The ID of the classroom workspace ('cls_...')" }
    ],
    example: `const members = await hc.listMembers("cls_abc123");`,
    returnValue: `[\n  {\n    "memberId": "stu_xyz789",\n    "memberType": "student",\n    "name": "John Doe",\n    "joinedAt": "2026-06-24T11:00:00.000Z"\n  }\n]`
  },
  {
    name: "createMeeting(dto)",
    description: "Initialize and schedule a virtual Jitsi WebRTC video conference space within a classroom.",
    parameters: [
      { name: "dto.classroomId", type: "string", required: true, desc: "Target classroom workspace ID to schedule meeting in" },
      { name: "dto.title", type: "string", required: true, desc: "Title of the scheduled session (e.g., 'Thermodynamics Lecture')" }
    ],
    example: `const meeting = await hc.createMeeting({\n  classroomId: "cls_abc123",\n  title: "Thermodynamics Lecture"\n});`,
    returnValue: `{\n  "meetingId": "mtg_789xyz",\n  "jitsiRoom": "room_thermo_lecture"\n}`
  },
  {
    name: "listMeetings()",
    description: "Fetch and list all active and scheduled meetings inside your workspace.",
    parameters: [],
    example: `const meetings = await hc.listMeetings();`,
    returnValue: `[\n  {\n    "meetingId": "mtg_789xyz",\n    "classroomId": "cls_abc123",\n    "title": "Thermodynamics Lecture",\n    "status": "scheduled",\n    "createdAt": "2026-06-24T11:30:00.000Z"\n  }\n]`
  },
  {
    name: "startMeeting(meetingId)",
    description: "Launch a scheduled meeting session, changing its state to live so members can connect.",
    parameters: [
      { name: "meetingId", type: "string", required: true, desc: "The target meeting ID ('mtg_...')" }
    ],
    example: `const startRes = await hc.startMeeting("mtg_789xyz");`,
    returnValue: `{\n  "success": true,\n  "status": "live"\n}`
  },
  {
    name: "endMeeting(meetingId)",
    description: "End a live meeting session and safely tear down current WebRTC audio/video streams.",
    parameters: [
      { name: "meetingId", type: "string", required: true, desc: "The target meeting ID ('mtg_...')" }
    ],
    example: `const endRes = await hc.endMeeting("mtg_789xyz");`,
    returnValue: `{\n  "success": true,\n  "status": "ended"\n}`
  },
  {
    name: "joinMeeting(meetingId, jwtToken)",
    description: "Retrieve WebRTC credentials and room Jitsi configurations to embed or redirect a verified member.",
    parameters: [
      { name: "meetingId", type: "string", required: true, desc: "The target meeting ID ('mtg_...')" },
      { name: "jwtToken", type: "string", required: true, desc: "Teacher or Student JWT token authentication credentials" }
    ],
    example: `const joinRes = await hc.joinMeeting("mtg_789xyz", "eyJhbGciOiJIUzI1Ni...");`,
    returnValue: `{\n  "success": true,\n  "meetingId": "mtg_789xyz",\n  "room": "room_thermo_lecture",\n  "joinUrl": "https://meet.hassenclass.in/room_thermo_lecture",\n  "role": "student",\n  "moderator": false\n}`
  },
  {
    name: "createTeacher(dto)",
    description: "Create and register a new teacher account within the workspace.",
    parameters: [
      { name: "dto.name", type: "string", required: true, desc: "Full name of the faculty member" },
      { name: "dto.email", type: "string", required: true, desc: "Email address associated with the teacher account" }
    ],
    example: `const teacher = await hc.createTeacher({\n  name: "Jane Smith",\n  email: "janesmith@school.com"\n});`,
    returnValue: `{\n  "teacherId": "tch_mno123",\n  "name": "Jane Smith",\n  "email": "janesmith@school.com",\n  "createdAt": "2026-06-24T10:00:00.000Z"\n}`
  },
  {
    name: "listTeachers()",
    description: "Fetch and list all registered faculty teacher accounts within the workspace.",
    parameters: [],
    example: `const teachers = await hc.listTeachers();`,
    returnValue: `[\n  {\n    "teacherId": "tch_mno123",\n    "name": "Jane Smith",\n    "email": "janesmith@school.com",\n    "createdAt": "2026-06-24T10:00:00.000Z"\n  }\n]`
  },
  {
    name: "createStudent(dto)",
    description: "Create and register a new student account within the workspace.",
    parameters: [
      { name: "dto.name", type: "string", required: true, desc: "Full name of the learning student" },
      { name: "dto.email", type: "string", required: true, desc: "Email address associated with the student account" }
    ],
    example: `const student = await hc.createStudent({\n  name: "John Doe",\n  email: "johndoe@student.com"\n});`,
    returnValue: `{\n  "studentId": "stu_xyz789",\n  "name": "John Doe",\n  "email": "johndoe@student.com",\n  "createdAt": "2026-06-24T10:30:00.000Z"\n}`
  },
  {
    name: "listStudents()",
    description: "Fetch and list all registered student accounts within the workspace.",
    parameters: [],
    example: `const students = await hc.listStudents();`,
    returnValue: `[\n  {\n    "studentId": "stu_xyz789",\n    "name": "John Doe",\n    "email": "johndoe@student.com",\n    "createdAt": "2026-06-24T10:30:00.000Z"\n  }\n]`
  }
];
