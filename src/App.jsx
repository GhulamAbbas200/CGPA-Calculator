import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Calculator, GraduationCap, ChevronDown, ChevronUp, Info } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50"
  };
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const GRADING_RULES = {
  undergraduate: [
    { grade: 'A',  min: 86, max: 100, point: 4.00, label: 'Excellent' },
    { grade: 'A-', min: 82, max: 85,  point: 3.67, label: '' },
    { grade: 'B+', min: 78, max: 81,  point: 3.33, label: '' },
    { grade: 'B',  min: 74, max: 77,  point: 3.00, label: 'Good' },
    { grade: 'B-', min: 70, max: 73,  point: 2.67, label: '' },
    { grade: 'C+', min: 66, max: 69,  point: 2.33, label: '' },
    { grade: 'C',  min: 62, max: 65,  point: 2.00, label: 'Satisfactory' },
    { grade: 'C-', min: 58, max: 61,  point: 1.67, label: '' },
    { grade: 'D+', min: 54, max: 57,  point: 1.33, label: '' },
    { grade: 'D',  min: 50, max: 53,  point: 1.00, label: 'Poor but passing' },
    { grade: 'F',  min: 0,  max: 49,  point: 0.00, label: 'Failure' },
  ],
  graduate: [
    { grade: 'A',  min: 86, max: 100, point: 4.00, label: 'Excellent' },
    { grade: 'A-', min: 82, max: 85,  point: 3.67, label: '' },
    { grade: 'B+', min: 78, max: 81,  point: 3.33, label: '' },
    { grade: 'B',  min: 74, max: 77,  point: 3.00, label: 'Good' },
    { grade: 'B-', min: 70, max: 73,  point: 2.67, label: '' },
    { grade: 'C+', min: 66, max: 69,  point: 2.33, label: '' },
    { grade: 'C',  min: 62, max: 65,  point: 2.00, label: 'Satisfactory' },
    { grade: 'C-', min: 58, max: 61,  point: 1.67, label: '' },
    { grade: 'F',  min: 0,  max: 57,  point: 0.00, label: 'Failure' }, // Covers D+, D ranges which are F in Grad
  ]
};

export default function App() {
  const [program, setProgram] = useState('undergraduate');
  const [courses, setCourses] = useState([
    { id: 1, name: 'Course 1', credits: 3, marks: '', grade: '', mode: 'marks' },
    { id: 2, name: 'Course 2', credits: 3, marks: '', grade: '', mode: 'marks' },
    { id: 3, name: 'Course 3', credits: 3, marks: '', grade: '', mode: 'marks' },
    { id: 4, name: 'Course 4', credits: 3, marks: '', grade: '', mode: 'marks' },
  ]);
  
  const [prevCGPA, setPrevCGPA] = useState('');
  const [prevCredits, setPrevCredits] = useState('');
  const [showRules, setShowRules] = useState(false);

  // Helper to determine grade/points from marks
  const getGradeDetails = (marks, prog) => {
    const rules = GRADING_RULES[prog];
    const score = parseFloat(marks);
    if (isNaN(score)) return { grade: '-', point: 0 };
    
    const rule = rules.find(r => score >= r.min && score <= r.max);
    return rule ? { grade: rule.grade, point: rule.point } : { grade: 'F', point: 0 };
  };

  const calculateResults = useMemo(() => {
    let currentPoints = 0;
    let currentCredits = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits) || 0;
      let points = 0;

      if (course.mode === 'marks' && course.marks !== '') {
        const details = getGradeDetails(course.marks, program);
        points = details.point;
      } else if (course.mode === 'grade' && course.grade !== '') {
        const rule = GRADING_RULES[program].find(r => r.grade === course.grade);
        points = rule ? rule.point : 0;
      }

      if (course.marks !== '' || course.grade !== '') {
        currentPoints += points * credits;
        currentCredits += credits;
      }
    });

    const sgpa = currentCredits > 0 ? (currentPoints / currentCredits).toFixed(2) : '0.00';
    
    // CGPA Calculation
    let cgpa = '0.00';
    const previousPoints = (parseFloat(prevCGPA) || 0) * (parseFloat(prevCredits) || 0);
    const totalCombinedCredits = currentCredits + (parseFloat(prevCredits) || 0);
    const totalCombinedPoints = currentPoints + previousPoints;
    
    if (totalCombinedCredits > 0) {
      cgpa = (totalCombinedPoints / totalCombinedCredits).toFixed(2);
    }

    return { sgpa, cgpa, currentCredits, currentPoints };
  }, [courses, program, prevCGPA, prevCredits]);

  const addCourse = () => {
    setCourses([...courses, { 
      id: Date.now(), 
      name: `Course ${courses.length + 1}`, 
      credits: 3, 
      marks: '', 
      grade: '',
      mode: 'marks'
    }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        // Reset the other input if switching modes or values
        if (field === 'mode') {
           // Keep values but switch active input mode
        }
        return updated;
      }
      return c;
    }));
  };

  const resetAll = () => {
    setCourses([
      { id: 1, name: 'Course 1', credits: 3, marks: '', grade: '', mode: 'marks' },
      { id: 2, name: 'Course 2', credits: 3, marks: '', grade: '', mode: 'marks' },
      { id: 3, name: 'Course 3', credits: 3, marks: '', grade: '', mode: 'marks' },
      { id: 4, name: 'Course 4', credits: 3, marks: '', grade: '', mode: 'marks' },
    ]);
    setPrevCGPA('');
    setPrevCredits('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <GraduationCap className="w-10 h-10 text-blue-600" />
              GPA Calculator
            </h1>
            <p className="text-slate-500 mt-1">Based on MAJU Grading Policy</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setProgram('undergraduate')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                program === 'undergraduate' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Undergraduate
            </button>
            <button
              onClick={() => setProgram('graduate')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                program === 'graduate' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Graduate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calculation Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Courses List */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Current Semester Courses</h3>
                <Button variant="ghost" onClick={resetAll} className="text-xs h-8">
                  <RotateCcw className="w-3 h-3" /> Reset
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Headers - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                  <div className="col-span-4">Course Name</div>
                  <div className="col-span-2 text-center">Credits</div>
                  <div className="col-span-5 text-center">Grade / Marks</div>
                  <div className="col-span-1"></div>
                </div>

                {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white md:hover:bg-slate-50 p-2 rounded-lg transition-colors border border-slate-100 md:border-transparent shadow-sm md:shadow-none">
                    
                    {/* Course Name */}
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-xs font-bold text-slate-500 md:hidden mb-1 block">Course Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Calculus"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                    </div>

                    {/* Credits */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 md:hidden mb-1 block">Credits</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          value={course.credits}
                          onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                          className="w-full p-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none md:hidden">Hrs</span>
                      </div>
                    </div>

                    {/* Input Mode Switcher & Inputs */}
                    <div className="col-span-1 md:col-span-5 flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 md:hidden mb-1 block">
                          {course.mode === 'marks' ? 'Marks (0-100)' : 'Letter Grade'}
                        </label>
                        
                        <div className="flex gap-2">
                          <select 
                            value={course.mode}
                            onChange={(e) => updateCourse(course.id, 'mode', e.target.value)}
                            className="w-20 text-xs p-2 bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="marks">Marks</option>
                            <option value="grade">Grade</option>
                          </select>

                          {course.mode === 'marks' ? (
                            <div className="relative flex-1">
                              <input
                                type="number"
                                placeholder="0-100"
                                min="0"
                                max="100"
                                value={course.marks}
                                onChange={(e) => updateCourse(course.id, 'marks', e.target.value)}
                                className={`w-full p-2 pl-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                                  course.marks && (course.marks < 50 || (program === 'graduate' && course.marks < 58)) 
                                    ? 'border-red-300 bg-red-50 text-red-700' 
                                    : 'border-slate-200'
                                }`}
                              />
                              {course.marks && (
                                <div className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                                  {getGradeDetails(course.marks, program).point.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <select
                              value={course.grade}
                              onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                              <option value="">Select</option>
                              {GRADING_RULES[program].map((rule) => (
                                <option key={rule.grade} value={rule.grade}>
                                  {rule.grade} ({rule.point.toFixed(2)})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                      <button 
                        onClick={() => removeCourse(course.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                ))}

                <Button onClick={addCourse} variant="outline" className="w-full border-dashed py-3 mt-4">
                  <Plus className="w-4 h-4" /> Add Course
                </Button>
              </div>
            </Card>

            {/* CGPA Section */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-slate-400" />
                Previous Semesters (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Previous CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={prevCGPA}
                    onChange={(e) => setPrevCGPA(e.target.value)}
                    placeholder="e.g. 3.45"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Previous Credit Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={prevCredits}
                    onChange={(e) => setPrevCredits(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Results */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              
              {/* Results Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="mb-6">
                  <p className="text-blue-100 text-sm font-medium mb-1">Semester GPA (SGPA)</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-bold">{calculateResults.sgpa}</h2>
                    <span className="text-blue-200 text-sm">/ 4.00</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <p className="text-blue-100 text-sm font-medium mb-1">Cumulative GPA (CGPA)</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-bold">{calculateResults.cgpa}</h2>
                    <span className="text-blue-200 text-sm">/ 4.00</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between text-xs text-blue-200 font-medium">
                  <span>Credits: {calculateResults.currentCredits}</span>
                  <span>Points: {calculateResults.currentPoints.toFixed(2)}</span>
                </div>
              </div>

              {/* Grading Policy Reference Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setShowRules(!showRules)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Info className="w-5 h-5 text-blue-500" />
                    Grading Policy ({program === 'undergraduate' ? 'Undergrad' : 'Grad'})
                  </div>
                  {showRules ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                
                {showRules && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 text-sm">
                    <div className="grid grid-cols-3 gap-2 mb-2 font-bold text-slate-500 text-xs uppercase">
                      <div>Grade</div>
                      <div>Points</div>
                      <div>Marks</div>
                    </div>
                    <div className="space-y-1">
                      {GRADING_RULES[program].map((rule) => (
                        <div key={rule.grade} className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 last:border-0 text-slate-700">
                          <div className="font-bold">{rule.grade}</div>
                          <div>{rule.point.toFixed(2)}</div>
                          <div className="text-slate-500">{rule.min} - {rule.max}</div>
                        </div>
                      ))}
                    </div>
                    {program === 'graduate' && (
                      <p className="mt-3 text-xs text-slate-500 italic">
                        * Note: Grades D and D+ are not applicable for Graduate programs. Scores below 58 are considered F (0.00).
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}