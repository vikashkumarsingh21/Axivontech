"use client";

import React, { useState } from "react";
import { FacultyMember } from "./types";
import { Atom, Calculator, BookOpen, Trophy, Cpu, Landmark, Sparkles } from "lucide-react";

export default function OakfieldFaculty() {
  const facultyList: FacultyMember[] = [
    {
      id: "fac-1",
      name: "Dr. Ananya Mukherjee",
      designation: "Head of Department — Physics & Sciences",
      qualifications: "Ph.D. in Applied Physics (IIT Kharagpur) · M.Sc. · B.Ed.",
      department: "Senior Sciences",
      experience: "18 Years in Senior Secondary Education",
      bio: "Former visiting researcher at TIFR, Dr. Mukherjee oversees our high-school physics research labs and has mentored 14 National Science Olympiad medalists.",
      iconType: "science",
    },
    {
      id: "fac-2",
      name: "Mr. Vikramaditya Sen",
      designation: "Head of Mathematics & Olympiad Cell",
      qualifications: "M.Sc. in Pure Mathematics (St. Stephen's College) · B.Ed.",
      department: "Senior Mathematics",
      experience: "16 Years in Advanced Pedagogies",
      bio: "Mr. Sen specializes in translating abstract calculus and algebra into visual problem-solving, training Oakfield students for prestigious mathematics competitions.",
      iconType: "math",
    },
    {
      id: "fac-3",
      name: "Mrs. Rebecca Thomas",
      designation: "Head of English & Global Literature",
      qualifications: "M.A. in English Literature · Cambridge CELTA / DELTA Certified",
      department: "Languages & Humanities",
      experience: "14 Years International Curricula",
      bio: "Guiding the Literary Society and Model UN delegation, Mrs. Thomas champions persuasive rhetoric, analytical essay writing, and contemporary poetry appreciation.",
      iconType: "humanities",
    },
    {
      id: "fac-4",
      name: "Mrs. Meenakshi Iyer",
      designation: "Lead Coordinator — Robotics, AI & Computational Thinking",
      qualifications: "M.Tech in Computer Science & Robotics (NIT) · B.Ed.",
      department: "STEM & Innovation",
      experience: "12 Years Ed-Tech & Robotics",
      bio: "Directing the 3D Prototyping and Robotics Lab, Mrs. Iyer trains students from Grade IV upwards in Python, algorithmic logic, Arduino, and micro-electronics.",
      iconType: "arts",
    },
    {
      id: "fac-5",
      name: "Mr. Arjun Rathore",
      designation: "Director of Physical Education & Sports Academy",
      qualifications: "M.P.Ed. · NIS Certified Coach · Former National Athlete",
      department: "Athletics & Physical Wellness",
      experience: "15 Years Athletic Training",
      bio: "Heading the 15-acre sports complex, Coach Rathore designs conditioning, track, basketball, and swimming programs that have won regional CBSE tournaments.",
      iconType: "sports",
    },
    {
      id: "fac-6",
      name: "Dr. S. K. Nambiar",
      designation: "Dean of Humanities & Civics Council",
      qualifications: "Ph.D. in Modern History (JNU) · M.A. Political Science",
      department: "Social Sciences",
      experience: "21 Years Senior Mentorship",
      bio: "Dr. Nambiar fosters critical civic engagement and historical empathy, guiding Senior Secondary Humanities students to top ranks in political science and economics.",
      iconType: "science",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "science":
        return Atom;
      case "math":
        return Calculator;
      case "humanities":
        return BookOpen;
      case "arts":
        return Cpu;
      case "sports":
        return Trophy;
      default:
        return Landmark;
    }
  };

  return (
    <section id="faculty" className="py-20 bg-[#faf8f4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Academic Leadership &amp; Mentorship
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Educators Who Inspire, Guide, and Mentor
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Our faculty members bring distinguished university credentials, passionate pedagogical craft, and empathetic mentorship to every classroom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyList.map((faculty) => {
            const Icon = getIcon(faculty.iconType);
            return (
              <div
                key={faculty.id}
                className="rounded-2xl border border-[#dfd4c0] bg-[#f4efe4] p-6 sm:p-7 shadow-sm transition-all hover:shadow-md hover:border-[#143d30]/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-[#faf8f4] border border-[#dfd4c0] px-3 py-1 text-[10px] font-bold text-[#143d30]">
                      {faculty.department}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#143d30]">
                    {faculty.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#c8a24d] mt-0.5">
                    {faculty.designation}
                  </p>
                  <p className="text-[11px] text-[#718278] mt-1 font-mono">
                    {faculty.qualifications}
                  </p>

                  <p className="mt-4 text-xs leading-relaxed text-[#4f5e55] border-t border-[#dfd4c0] pt-3">
                    {faculty.bio}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#dfd4c0] flex items-center justify-between text-[11px] text-[#143d30] font-semibold">
                  <span>{faculty.experience}</span>
                  <span className="text-[#c8a24d]">● Full-time Faculty</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
