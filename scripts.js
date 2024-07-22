let employees = [];

// Load employee data from localStorage on page load
window.onload = function () {
  const storedEmployees = localStorage.getItem("employees");
  if (storedEmployees) {
    employees = JSON.parse(storedEmployees);
  }
};

// Function to generate payslip
function generatePayslip() {
  const name = document.getElementById("name").value;

  // Check if employee exists
  const employee = employees.find((emp) => emp.name === name);
  if (!employee) {
    alert("Employee not found. Please add the employee first.");
    return;
  }

  // Get form values
  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const overtime = parseFloat(document.getElementById("overtime").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const taxRate = parseFloat(document.getElementById("tax").value);

  // Calculations
  const hourlyRate = salary / 160; // Assuming 160 working hours per month
  const overtimePay = overtime * hourlyRate;
  const grossPay = salary + overtimePay;
  const tax = (grossPay * taxRate) / 100;
  const netPay = grossPay - deductions - tax;

  // Display payslip details
  displayPayslip({
    name,
    position,
    salary,
    overtimePay,
    deductions,
    tax,
    netPay,
  });

  // Update YTD values for the employee
  updateYTD(employee, grossPay, deductions, netPay);

  // Clear form inputs
  document.getElementById("payslipForm").reset();
}

// Function to display payslip details
function displayPayslip({
  name,
  position,
  salary,
  overtimePay,
  deductions,
  tax,
  netPay,
}) {
  document.getElementById("payslipName").innerText = name;
  document.getElementById("payslipPosition").innerText = position;
  document.getElementById("payslipSalary").innerText = salary.toFixed(2);
  document.getElementById("payslipOvertime").innerText = overtimePay.toFixed(2);
  document.getElementById("payslipDeductions").innerText =
    deductions.toFixed(2);
  document.getElementById("payslipTax").innerText = tax.toFixed(2);
  document.getElementById("payslipNetPay").innerText = netPay.toFixed(2);

  // Show the payslip
  document.getElementById("payslip").classList.remove("hidden");
}

// Function to add employee
function addEmployee() {
  const name = document.getElementById("name").value;
  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const overtime = parseFloat(document.getElementById("overtime").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const taxRate = parseFloat(document.getElementById("tax").value);

  if (
    !name ||
    !position ||
    isNaN(salary) ||
    isNaN(overtime) ||
    isNaN(deductions) ||
    isNaN(taxRate)
  ) {
    alert("Please fill all the fields correctly.");
    return;
  }

  const employeeId = employees.length + 1; // Simple incremental ID
  const employee = {
    employeeId,
    name,
    position,
    salary,
    overtime,
    deductions,
    taxRate,
    ytdEarnings: 0,
    ytdDeductions: 0,
    ytdNetPay: 0,
  };

  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees)); // Save to localStorage
  alert("Employee added successfully!");
  document.getElementById("payslipForm").reset();
}

// Function to update YTD values for an employee
function updateYTD(employee, grossPay, deductions, netPay) {
  employee.ytdEarnings += grossPay;
  employee.ytdDeductions += deductions;
  employee.ytdNetPay += netPay;

  localStorage.setItem("employees", JSON.stringify(employees)); // Update localStorage

  document.getElementById("ytdEarnings").innerText =
    employee.ytdEarnings.toFixed(2);
  document.getElementById("ytdDeductions").innerText =
    employee.ytdDeductions.toFixed(2);
  document.getElementById("ytdNetPay").innerText =
    employee.ytdNetPay.toFixed(2);
}

// Function to download payslip as PDF
function downloadPayslipAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  html2canvas(document.getElementById("payslip")).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 10, 10);
    doc.save("payslip.pdf");
  });
}

// Function to print payslip
function printPayslip() {
  const payslipContent = document.getElementById("payslip").innerHTML;
  const newWindow = window.open("", "_blank", "height=500,width=600");

  newWindow.document.write("<html><head><title>Payslip</title>");
  newWindow.document.write("</head><body>");
  newWindow.document.write(payslipContent);
  newWindow.document.write("</body></html>");

  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
  newWindow.close();

  location.reload(); // Reload the page to restore the original content
}

// Function to autofill form with employee data
function autoFillForm() {
  const name = document.getElementById("name").value;
  const employee = employees.find((emp) => emp.name === name);

  if (employee) {
    document.getElementById("position").value = employee.position;
    document.getElementById("salary").value = employee.salary;
    document.getElementById("overtime").value = employee.overtime;
    document.getElementById("deductions").value = employee.deductions;
    document.getElementById("tax").value = employee.taxRate;
  } else {
    document.getElementById("position").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("overtime").value = "";
    document.getElementById("deductions").value = "";
    document.getElementById("tax").value = "";
  }
}

// Add event listener to name input for autofill
document.getElementById("name").addEventListener("blur", autoFillForm);

// Function to clear input fields
function clearInputs() {
  document.getElementById("name").value = "";
  document.getElementById("position").value = "";
  document.getElementById("salary").value = "";
  document.getElementById("overtime").value = "";
  document.getElementById("deductions").value = "";
  document.getElementById("tax").value = "";
}
