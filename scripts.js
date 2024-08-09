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
  document.getElementById("payslipName").textContent = name;
  document.getElementById("payslipEmail").textContent = email;
  document.getElementById("payslipPosition").textContent = position;
  document.getElementById("payslipSalary").textContent = salary.toFixed(2);
  document.getElementById("payslipDeductions").textContent =
    deductions.toFixed(2);
  document.getElementById("payslipTax").textContent = tax.toFixed(2);
  document.getElementById("payslipNetPay").textContent = netPay.toFixed(2);

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
    Gross Salary: $${salary.toFixed(2)}
    Income Tax: $${deductions.toFixed(2)}
    Nascorp Tax: $${tax.toFixed(2)}
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

  doc.text("Payslip", 10, 10);
  doc.text(
    "Name: " + document.getElementById("payslipName").textContent,
    10,
    20
  );
  doc.text(
    "Email: " + document.getElementById("payslipEmail").textContent,
    10,
    30
  );
  doc.text(
    "Position: " + document.getElementById("payslipPosition").textContent,
    10,
    40
  );
  doc.text(
    "Gross Salary: $" + document.getElementById("payslipSalary").textContent,
    10,
    50
  );
  doc.text(
    "Income Tax: $" + document.getElementById("payslipDeductions").textContent,
    10,
    60
  );
  doc.text(
    "Nascorp Tax: $" + document.getElementById("payslipTax").textContent,
    10,
    70
  );
  doc.text(
    "Net Pay: $" + document.getElementById("payslipNetPay").textContent,
    10,
    80
  );

  doc.save("payslip.pdf");
}

function generateWordPayslip() {
  const { Document, Packer, Paragraph, TextRun } = docx;

  const doc = new Document();

  const name = document.getElementById("payslipName").textContent;
  const email = document.getElementById("payslipEmail").textContent;
  const position = document.getElementById("payslipPosition").textContent;
  const salary = document.getElementById("payslipSalary").textContent;
  const deductions = document.getElementById("payslipDeductions").textContent;
  const tax = document.getElementById("payslipTax").textContent;
  const netPay = document.getElementById("payslipNetPay").textContent;

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
