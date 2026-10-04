import { z } from "zod";

const Education10thSchema = z.object({
  school: z.string().min(2, "School/Institution is required"),
  board: z.string().min(2, "Board is required"),
  passingYear: z.string().min(4, "Passing year is required"),
  percentage: z.string().optional(),
});

const EducationOptionalSchema = z.object({
  school: z.string().optional(),
  board: z.string().optional(),
  passingYear: z.string().optional(),
  percentage: z.string().optional(),
}).optional().nullable();

const EducationUGSchema = z.object({
  degree: z.string().optional(),
  college: z.string().optional(),
  passingYear: z.string().optional(),
  branch: z.string().optional(),
}).optional().nullable();

const applicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  country: z.string().min(2, "Country is required").max(100),
  state: z.string().max(100).optional(),
  city: z.string().min(2, "City is required").max(100),
  occupation: z.string().min(2, "Occupation is required").max(100),
  currentWork: z.string().max(200).optional(),
  yearsOfExperience: z.number().int().nonnegative().max(60).optional().nullable(),
  relevantExperience: z.string().max(3000).optional(),
  clientNetwork: z.string().max(3000).optional(),
  education10th: Education10thSchema,
  education12th: EducationOptionalSchema,
  educationUndergrad: EducationUGSchema,
  motivation: z.string().max(2000).optional(),
  contribution: z.string().max(2000).optional(),
  additionalInfo: z.string().max(2000).optional(),
});

const payload = {
  fullName: "Vikash Kumar",
  email: "vk@example.com",
  phone: "1234567890",
  country: "India",
  state: "Bihar",
  city: "Muzaffarpur",
  occupation: "Developer",
  currentWork: "Axivon",
  yearsOfExperience: null,
  relevantExperience: "",
  clientNetwork: "",
  education10th: {
    school: "School",
    board: "Board",
    passingYear: "2015",
    percentage: ""
  },
  education12th: null,
  educationUndergrad: null,
  motivation: "Motivation",
  contribution: "",
  additionalInfo: ""
};

try {
  console.log("Parsing...");
  applicationSchema.parse(payload);
  console.log("Success");
} catch(e) {
  console.log("Failed", e.format());
}
