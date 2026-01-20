"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "iconsax-react";
import { useResult } from "@/hooks/use-results";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = parseInt(params.id as string);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: result, isLoading } = useResult(resultId);

  const calculateGradeAndRemarks = (totalScore: number) => {
    let grade = "";
    let remarks = "";
    if (totalScore >= 80) {
      grade = "A";
      remarks = "EXCELLENT";
    } else if (totalScore >= 70) {
      grade = "B";
      remarks = "VERY GOOD";
    } else if (totalScore >= 60) {
      grade = "C";
      remarks = "GOOD";
    } else if (totalScore >= 50) {
      grade = "D";
      remarks = "AVERAGE";
    } else {
      grade = "E";
      remarks = "POOR";
    }
    return { grade, remarks };
  };

  const calculateResultStats = () => {
    if (!result)
      return {
        totalSubjects: 0,
        totalScore: 0,
        performance: 0,
        performanceGrade: "",
      };
    const totalSubjects = result.subject_scores?.length || 0;
    const totalScore =
      result.subject_scores?.reduce(
        (sum, score) => sum + (score.total || 0),
        0
      ) || 0;
    const performance =
      totalSubjects > 0 ? (totalScore / (totalSubjects * 100)) * 100 : 0;
    const performanceGrade =
      performance >= 80
        ? "A"
        : performance >= 70
        ? "B"
        : performance >= 60
        ? "C"
        : performance >= 50
        ? "D"
        : "E";
    return { totalSubjects, totalScore, performance, performanceGrade };
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups for printing.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Result - ${
            result?.student?.user?.name || "N/A"
          }</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              direction: ltr;
            }
            .header-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .header-section .relative {
              position: relative;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              margin-bottom: 20px;
            }
            .header-section .absolute {
              position: absolute;
            }
            .header-section img {
              max-width: 100px;
              height: auto;
              display: block;
            }
            .header-section h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
              direction: rtl;
            }
            .header-section p {
              margin: 5px 0;
            }
            .logo-container {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 20px;
              border-radius: 50%;
              min-width: 120px;
              min-height: 120px;
              text-align: center;
            }
            .pupil-info-section {
              background-color: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .pupil-info-section .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px 32px;
            }
            .pupil-info-section p {
              margin: 8px 0;
              line-height: 1.6;
            }
            @media print {
              .pupil-info-section .grid {
                grid-template-columns: 1fr 1fr;
                gap: 12px 24px;
              }
            }
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              margin: 5px 0;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              min-width: 120px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .subject-name {
              text-align: left;
              font-weight: 500;
            }
            .general-evaluation {
              margin-top: 30px;
            }
            .general-evaluation h3 {
              margin-bottom: 15px;
              font-size: 16px;
            }
            .general-evaluation table {
              margin-top: 10px;
            }
            .remarks-section {
              margin-top: 30px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            .remark-box {
              border: 1px solid #000;
              padding: 15px;
              min-height: 80px;
            }
            .remark-label {
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .stat-item {
              text-align: center;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 20px;
              font-weight: bold;
            }
            .grade-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .grade-A { background-color: #4CAF50; color: white; }
            .grade-B { background-color: #2196F3; color: white; }
            .grade-C { background-color: #FF9800; color: white; }
            .grade-D { background-color: #FF5722; color: white; }
            .grade-E { background-color: #F44336; color: white; }
            .logo-container {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 20px;
              border-radius: 50%;
              min-width: 120px;
              min-height: 120px;
              text-align: center;
              page-break-inside: avoid;
            }
            .pupil-info-section {
              background-color: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .header-section {
              page-break-inside: avoid;
              page-break-after: avoid;
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <TopNav />
            <main className="flex-1 overflow-auto">
              <div className="p-4 md:p-8">
                <Skeleton className="h-96 w-full" />
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!result) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <TopNav />
            <main className="flex-1 overflow-auto">
              <div className="p-4 md:p-8">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Result not found</p>
                  <Button
                    onClick={() => router.push("/results")}
                    className="mt-4"
                  >
                    Back to Results
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const stats = calculateResultStats();
  const generalEvaluationFields = [
    { key: "verbal_skills", label: "Verbal Skills", arabic: "المساهمة" },
    { key: "self_control", label: "Self Control", arabic: "ضبط النفس" },
    { key: "obedience", label: "Obedience", arabic: "الانضباط" },
    { key: "punctuality", label: "Punctuality", arabic: "الالتزام" },
    { key: "honesty", label: "Honesty", arabic: "الأمانة" },
    { key: "assignment", label: "Assignment", arabic: "الواجبات" },
    { key: "neatness", label: "Neatness", arabic: "النظافة" },
    { key: "attitude_to_learn", label: "Attitude to Learn", arabic: "السلوك" },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/results")}
                  className="gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </Button>
                <Button onClick={handlePrint} className="gap-2">
                  <Printer size={18} />
                  Print Result
                </Button>
              </div>

              <div ref={printRef} className="bg-white p-8 border rounded-lg">
                {/* Header Section */}
                <div className="header-section mb-6">
                  {/* Header with Logo and Title */}
                  <div className="relative flex items-start justify-center mb-4">
                    {/* Logo - Right Side */}
                    <div style={{ position: "absolute", right: 0, top: 0 }}>
                      <img
                        src="/school_logo.png"
                        alt="School Logo"
                        width={100}
                        height={100}
                        style={{ display: "block" }}
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Main Title - Centered */}
                    <div className="text-center flex-1">
                      <h1
                        className="text-4xl font-bold mb-2"
                        style={{
                          fontFamily: "Arial, sans-serif",
                          direction: "rtl",
                        }}
                      >
                        رياض الأطفال
                      </h1>
                      <p className="text-lg mb-1" style={{ direction: "rtl" }}>
                        نتيجة كشف دراجات التلاميذ
                      </p>
                      <p className="text-lg font-semibold">
                        PUPIL'S REPORT SHEET
                      </p>
                    </div>

                    {/* Spacer for balance */}
                    <div
                      className="absolute left-0 top-0"
                      style={{ width: "120px" }}
                    ></div>
                  </div>

                  {/* Term - Centered */}
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      {result.term.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Pupil and Academic Information Section */}
                <div className="pupil-info-section bg-gray-100 p-4 mb-6 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">
                            Name of Pupil{" "}
                            <span
                              style={{
                                direction: "rtl",
                                display: "inline-block",
                              }}
                            >
                              الاسم
                            </span>
                            :
                          </span>{" "}
                          <span className="underline font-medium">
                            {result.student?.user?.name || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">Performance (%):</span>{" "}
                          <span className="font-semibold">
                            {stats.performance.toFixed(2)}
                          </span>{" "}
                          <span
                            className="text-xs"
                            style={{
                              direction: "rtl",
                              display: "inline-block",
                            }}
                          >
                            إنجاز
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">
                            Class{" "}
                            <span
                              style={{
                                direction: "rtl",
                                display: "inline-block",
                              }}
                            >
                              الفصل
                            </span>
                            :
                          </span>{" "}
                          <span className="font-medium">
                            {result.class?.name || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">Next Term Begins:</span>{" "}
                          <span className="font-semibold">
                            08TH NOVEMBER, 2025
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">
                            Pupil's No.{" "}
                            <span
                              style={{
                                direction: "rtl",
                                display: "inline-block",
                              }}
                            >
                              رقم القبول
                            </span>
                            :
                          </span>{" "}
                          <span className="font-medium">
                            {result.student?.student_id || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">No. in class</span>{" "}
                          <span
                            className="text-xs"
                            style={{
                              direction: "rtl",
                              display: "inline-block",
                            }}
                          >
                            عدد التلاميذ في الفصل
                          </span>
                          : <span className="font-semibold">24</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">Session</span>{" "}
                          <span
                            className="text-xs"
                            style={{
                              direction: "rtl",
                              display: "inline-block",
                            }}
                          >
                            العام الدراسي
                          </span>
                          :{" "}
                          <span className="font-semibold">
                            {result.academic_year}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold">Performance Grade:</span>{" "}
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-base grade-${stats.performanceGrade}`}
                          >
                            {stats.performanceGrade}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Scores Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">
                          SUBJECTS | المواد
                        </th>
                        <th className="border border-black p-2">
                          ASSIGNMENT| الواجبات المنزلية
                        </th>
                        <th className="border border-black p-2">
                          1ST Test | إختبارالأول
                        </th>
                        <th className="border border-black p-2">
                          2ND Test | إختبارالثانى
                        </th>
                        <th className="border border-black p-2">
                          EXAM | الإمتحان
                        </th>
                        <th className="border border-black p-2">
                          TOTAL | المجموع
                        </th>
                        <th className="border border-black p-2">
                          POSITION | الترتيب
                        </th>
                        <th className="border border-black p-2">
                          GRADE | لدرجة
                        </th>
                        <th className="border border-black p-2">
                          REMARKS | ملاحظات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subject_scores?.map((score, index) => {
                        const total = score.total || 0;
                        const { grade, remarks } =
                          calculateGradeAndRemarks(total);
                        return (
                          <tr key={index}>
                            <td className="border border-black p-2 text-left font-medium">
                              {score.subject?.name || "N/A"}
                            </td>
                            <td className="border border-black p-2">
                              {score.assignment || "-"}
                            </td>
                            <td className="border border-black p-2">
                              {score.first_test || "-"}
                            </td>
                            <td className="border border-black p-2">
                              {score.second_test || "-"}
                            </td>
                            <td className="border border-black p-2">
                              {score.exam || "-"}
                            </td>
                            <td className="border border-black p-2 font-medium">
                              {total}
                            </td>
                            <td className="border border-black p-2">
                              {score.position ? (
                                <span>
                                  {score.position}
                                  {score.position === 1
                                    ? "ST"
                                    : score.position === 2
                                    ? "ND"
                                    : score.position === 3
                                    ? "RD"
                                    : "TH"}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="border border-black p-2">
                              <span
                                className={`grade-badge grade-${grade} px-2 py-1 rounded text-black text-xs font-bold`}
                              >
                                {score.grade}
                              </span>
                            </td>
                            <td className="border border-black p-2 text-xs">
                              {score.remarks}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 font-bold">
                        <td className="border border-black p-2 text-left">
                          GRAND TOTAL
                        </td>
                        <td
                          colSpan={4}
                          className="border border-black p-2"
                        ></td>
                        <td className="border border-black p-2">
                          {stats.totalScore}
                        </td>
                        <td
                          colSpan={4}
                          className="border border-black p-2"
                        ></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* General Evaluation */}
                <div className="general-evaluation mb-6">
                  <h3 className="text-lg font-bold mb-4">GENERAL EVALUATION</h3>
                  <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">
                          CRITERIA
                        </th>
                        <th className="border border-black p-2">A</th>
                        <th className="border border-black p-2">B</th>
                        <th className="border border-black p-2">C</th>
                        <th className="border border-black p-2">D</th>
                        <th className="border border-black p-2">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generalEvaluationFields.map((field) => {
                        const value = result[
                          field.key as keyof typeof result
                        ] as string;
                        return (
                          <tr key={field.key}>
                            <td className="border border-black p-2 text-left">
                              {field.label} ({field.arabic})
                            </td>
                            <td className="border border-black p-2 text-center">
                              {value === "A" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {value === "B" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {value === "C" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {value === "D" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {value === "E" ? "✓" : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Statistics */}
                <div className="stats grid grid-cols-2 gap-4 mb-6 pt-4 border-t-2 border-black">
                  <div className="stat-item">
                    <p className="stat-label text-sm text-muted-foreground">
                      Total Subjects
                    </p>
                    <p className="stat-value text-2xl font-bold">
                      {stats.totalSubjects}
                    </p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-label text-sm text-muted-foreground">
                      Total Score
                    </p>
                    <p className="stat-value text-2xl font-bold">
                      {stats.totalScore}
                    </p>
                  </div>
                </div>

                {/* Remarks */}
                <div className="remarks-section grid grid-cols-2 gap-6">
                  <div className="remark-box border border-black p-4">
                    <div className="remark-label font-bold mb-2 pb-2 border-b border-black">
                      Teacher's Comment | ملاحظة المعلم
                    </div>
                    <p className="text-sm min-h-[60px]">
                      {result.form_master_remark || "N/A"}
                    </p>
                    <div className="mt-4 pt-2 border-t border-gray-300">
                      <p className="text-xs">
                        <span className="font-bold">Signature: التوقيع</span>{" "}
                        _________________
                      </p>
                    </div>
                  </div>
                  <div className="remark-box border border-black p-4">
                    <div className="remark-label font-bold mb-2 pb-2 border-b border-black">
                      Principal's Comment | ملاحظات المدير
                    </div>
                    <p className="text-sm min-h-[60px]">
                      {result.principal_remark || "N/A"}
                    </p>
                    <div className="mt-4 pt-2 border-t border-gray-300">
                      <p className="text-xs">
                        <span className="font-bold">Signature: التوقيع</span>{" "}
                        _________________
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
