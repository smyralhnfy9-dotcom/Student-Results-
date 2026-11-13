// ========================================
// Student Results Management
// Final JavaScript Project
// ========================================

class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // Name validation
  set name(value) {
    const cleanName = String(value ?? "").trim();

    if (cleanName === "") {
      throw new Error("من فضلك أدخل اسم الطالب.");
    }

    this.#name = cleanName;
  }

  get name() {
    return this.#name;
  }

  // A shared validator protects all grades and attendance.
  validatePercentage(value, fieldName) {
    if (value === "" || value === null || value === undefined) {
      throw new Error(`حقل ${fieldName} مطلوب ولا يمكن تركه فارغًا.`);
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(`حقل ${fieldName} يجب أن يحتوي على رقم صحيح.`);
    }

    if (numberValue < 0 || numberValue > 100) {
      throw new Error(`قيمة ${fieldName} يجب أن تكون من 0 إلى 100.`);
    }

    return numberValue;
  }

  set grade1(value) {
    this.#grade1 = this.validatePercentage(value, "المادة الأولى");
  }

  get grade1() {
    return this.#grade1;
  }

  set grade2(value) {
    this.#grade2 = this.validatePercentage(value, "المادة الثانية");
  }

  get grade2() {
    return this.#grade2;
  }

  set grade3(value) {
    this.#grade3 = this.validatePercentage(value, "المادة الثالثة");
  }

  get grade3() {
    return this.#grade3;
  }

  set attendance(value) {
    this.#attendance = this.validatePercentage(value, "نسبة الحضور");
  }

  get attendance() {
    return this.#attendance;
  }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

// The main array that stores all students.
const studentsList = [];

// Get elements from the page.
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");
const studentsListBox = document.getElementById("studentsList");
const studentCount = document.getElementById("studentCount");
const mercyBtn = document.getElementById("mercyBtn");
const reportBox = document.getElementById("reportBox");

// Display the students saved in the array.
function renderStudents() {
  if (studentsList.length === 0) {
    studentsListBox.innerHTML = `
      <div class="empty-state">
        <span>📋</span>
        <p class="mb-0">لم تتم إضافة أي طالب حتى الآن.</p>
      </div>
    `;
    studentCount.textContent = "0 طالب";
    return;
  }

  studentsListBox.innerHTML = studentsList.map((student, index) => `
    <div class="student-item">
      <div>
        <div class="student-name">${index + 1}. ${escapeHTML(student.name)}</div>
        <div class="student-meta">الحضور: ${student.attendance}%</div>
      </div>
      <span class="average-badge">المتوسط: ${student.average.toFixed(2)}</span>
    </div>
  `).join("");

  studentCount.textContent = `${studentsList.length} طالب`;
}

// Prevent student names from being interpreted as HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

// Add a new student when the form is submitted.
studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  errorBox.textContent = "";
  errorBox.classList.add("d-none");
  successBox.textContent = "";
  successBox.classList.add("d-none");

  try {
    const student = new Student(
      studentNameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();

    successBox.textContent = `تمت إضافة الطالب ${student.name} بنجاح.`;
    successBox.classList.remove("d-none");

    studentForm.reset();
    studentNameInput.focus();

    // Clear an old report because the list has changed.
    reportBox.innerHTML = `
      <div class="empty-state">
        <span>📊</span>
        <p class="mb-0">تم تحديث قائمة الطلاب. اضغط على زر لجنة الرأفة لعرض التقرير الجديد.</p>
      </div>
    `;
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("d-none");
  }
});

// Mercy committee: Filter, Map and Reduce.
mercyBtn.addEventListener("click", function () {
  // 1. Filter students whose average is from 40 to less than 50.
  const strugglingStudents = studentsList.filter((student) => {
    return student.average >= 40 && student.average <= 49;
  });

  // 2. Map: add 5 mercy marks to each student's average.
  const studentsAfterMercy = strugglingStudents.map((student) => {
    return {
      name: student.name,
      oldAverage: student.average,
      newAverage: Math.min(student.average + 5, 100)
    };
  });

  // 3. Reduce: calculate the total of the new averages.
  const totalAfterMercy = studentsAfterMercy.reduce((total, student) => {
    return total + student.newAverage;
  }, 0);

  // Avoid division by zero when there are no struggling students.
  const generalAverage = studentsAfterMercy.length > 0
    ? totalAfterMercy / studentsAfterMercy.length
    : 0;

  // 4. Display the final report on the page.
  if (studentsAfterMercy.length === 0) {
    reportBox.innerHTML = `
      <div class="empty-state">
        <span>✅</span>
        <p class="mb-0">لا يوجد طلاب متوسط درجاتهم بين 40 و49 حاليًا.</p>
      </div>
      <div class="report-summary mt-3">
        <div class="summary-card">
          <small>عدد الطلاب المتعثرين</small>
          <strong>0</strong>
        </div>
        <div class="summary-card">
          <small>المتوسط العام بعد الرأفة</small>
          <strong>0.00</strong>
        </div>
      </div>
    `;
    return;
  }

  const studentsHTML = studentsAfterMercy.map((student, index) => `
    <div class="report-student">
      <span>${index + 1}. ${escapeHTML(student.name)}</span>
      <span>
        <small class="text-secondary">${student.oldAverage.toFixed(2)}</small>
        <strong> ← ${student.newAverage.toFixed(2)}</strong>
      </span>
    </div>
  `).join("");

  reportBox.innerHTML = `
    <div class="report-summary">
      <div class="summary-card">
        <small>عدد الطلاب المتعثرين</small>
        <strong>${studentsAfterMercy.length}</strong>
      </div>
      <div class="summary-card">
        <small>المتوسط العام بعد الرأفة</small>
        <strong>${generalAverage.toFixed(2)}</strong>
      </div>
    </div>
    <h3 class="h6 fw-bold mb-2">أسماء الطلاب ودرجاتهم بعد الرأفة</h3>
    <div class="report-students">${studentsHTML}</div>
  `;
});
