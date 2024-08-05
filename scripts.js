let employees = [];

window.onload = function () {
  const storedEmployees = localStorage.getItem("employees");
  if (storedEmployees) {
    employees = JSON.parse(storedEmployees);
  }
};

function generatePayslip() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  const employee = employees.find((emp) => emp.name === name);
  if (!employee) {
    alert("Employee not found. Please add the employee first.");
    return;
  }

  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const taxRate = parseFloat(document.getElementById("tax").value);

  const grossPay = salary;
  const tax = (grossPay * taxRate) / 100;
  const netPay = grossPay - deductions - tax;

  const payslipDetails = {
    name,
    email,
    position,
    salary,
    deductions,
    tax,
    netPay,
  };
  displayPayslip(payslipDetails);

  updateYTD(employee, grossPay, deductions, netPay);

  document.getElementById("payslipForm").reset();

  sendPayslipEmail(email, payslipDetails);
}

function displayPayslip({
  name,
  email,
  position,
  salary,
  deductions,
  tax,
  netPay,
}) {
  document.getElementById("payslipName").innerText = `Name: ${name}`;
  document.getElementById("payslipEmail").innerText = `Email: ${email}`;
  document.getElementById(
    "payslipPosition"
  ).innerText = `Position: ${position}`;
  document.getElementById(
    "payslipSalary"
  ).innerText = `Gross Income: $${salary.toFixed(2)}`;
  document.getElementById(
    "payslipDeductions"
  ).innerText = `Income Tax: $${deductions.toFixed(2)}`;
  document.getElementById("payslipTax").innerText = `Tax: $${tax.toFixed(2)}`;
  document.getElementById(
    "payslipNetPay"
  ).innerText = `Net Pay: $${netPay.toFixed(2)}`;

  document.getElementById("payslip").classList.remove("hidden");
}

function addEmployee() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const taxRate = parseFloat(document.getElementById("tax").value);

  if (
    !name ||
    !position ||
    !email ||
    isNaN(salary) ||
    isNaN(deductions) ||
    isNaN(taxRate)
  ) {
    alert("Please fill all the fields correctly.");
    return;
  }

  const existingEmployee = employees.find((emp) => emp.name === name);
  if (existingEmployee) {
    alert("An employee with this name already exists.");
    return;
  }

  const employeeId = employees.length + 1;
  const employee = {
    employeeId,
    email,
    name,
    position,
    salary,
    deductions,
    taxRate,
    ytdEarnings: 0,
    ytdDeductions: 0,
    ytdNetPay: 0,
  };

  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees));
  alert("Employee added successfully!");
}

function updateYTD(employee, grossPay, deductions, netPay) {
  employee.ytdEarnings += grossPay;
  employee.ytdDeductions += deductions;
  employee.ytdNetPay += netPay;

  const index = employees.findIndex((emp) => emp.name === employee.name);
  if (index !== -1) {
    employees[index] = employee;
    localStorage.setItem("employees", JSON.stringify(employees));
  }
}

document.getElementById("name").addEventListener("blur", autoFillForm);

function autoFillForm() {
  const name = document.getElementById("name").value;

  const employee = employees.find((emp) => emp.name === name);
  if (employee) {
    document.getElementById("email").value = employee.email;
    document.getElementById("position").value = employee.position;
    document.getElementById("salary").value = employee.salary;
    document.getElementById("deductions").value = employee.deductions;
    document.getElementById("tax").value = employee.taxRate;
  }
}

function clearInputs() {
  document.getElementById("payslipForm").reset();
  document.getElementById("payslip").classList.add("hidden");
}

function sendPayslipEmail(
  email,
  { name, position, salary, deductions, tax, netPay }
) {
  const subject = "Your Payslip";
  const body = `
    Dear ${name},

    Here is your payslip:

    Position: ${position}
    Basic Salary: $${salary.toFixed(2)}
    Deductions: $${deductions.toFixed(2)}
    Tax: $${tax.toFixed(2)}
    Net Pay: $${netPay.toFixed(2)}

    Thank you,
    NEC Liberia`;

  Email.send({
    SecureToken: "YOUR_SECURE_TOKEN",
    To: email,
    From: "your_email@example.com",
    Subject: subject,
    Body: body,
  })
    .then((message) => alert("Payslip sent successfully!"))
    .catch((error) => console.error("Error sending email:", error));
}

function printPayslip() {
  window.print();
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(20, 20, "Payslip");
  doc.text(20, 30, `Name: ${document.getElementById("payslipName").innerText}`);
  doc.text(
    20,
    40,
    `Email: ${document.getElementById("payslipEmail").innerText}`
  );
  doc.text(
    20,
    50,
    `Position: ${document.getElementById("payslipPosition").innerText}`
  );
  doc.text(
    20,
    60,
    `Basic Salary: ${document.getElementById("payslipSalary").innerText}`
  );
  doc.text(
    20,
    70,
    `Deductions: ${document.getElementById("payslipDeductions").innerText}`
  );
  doc.text(20, 80, `Tax: ${document.getElementById("payslipTax").innerText}`);
  doc.text(
    20,
    90,
    `Net Pay: ${document.getElementById("payslipNetPay").innerText}`
  );

  doc.save("payslip.pdf");
}

function generateWordPayslip() {
  const { Document, Packer, Paragraph, TextRun } = docx;

  const doc = new Document();

  const name = document.getElementById("payslipName").innerText;
  const email = document.getElementById("payslipEmail").innerText;
  const position = document.getElementById("payslipPosition").innerText;
  const salary = document.getElementById("payslipSalary").innerText;
  const deductions = document.getElementById("payslipDeductions").innerText;
  const tax = document.getElementById("payslipTax").innerText;
  const netPay = document.getElementById("payslipNetPay").innerText;

  doc.addSection({
    children: [
      new Paragraph({
        children: [new TextRun("Payslip").bold().size(24)],
      }),
      new Paragraph({
        children: [new TextRun(name)],
      }),
      new Paragraph({
        children: [new TextRun(email)],
      }),
      new Paragraph({
        children: [new TextRun(position)],
      }),
      new Paragraph({
        children: [new TextRun(salary)],
      }),
      new Paragraph({
        children: [new TextRun(deductions)],
      }),
      new Paragraph({
        children: [new TextRun(tax)],
      }),
      new Paragraph({
        children: [new TextRun(netPay)],
      }),
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payslip.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
