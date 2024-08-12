let employees = [];
let conversionRate = parseFloat(localStorage.getItem("conversionRate")) || 1; // Default to 1 if not set

window.onload = function () {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
        employees = JSON.parse(storedEmployees);
    }
    document.getElementById("conversionRate").value = conversionRate;
};

function generatePayslip() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const position = document.getElementById("position").value;
    const salary = parseFloat(document.getElementById("salary").value);
    const deductions = parseFloat(document.getElementById("deductions").value);
    const taxRate = parseFloat(document.getElementById("tax").value);
    const rate = parseFloat(document.getElementById("conversionRate").value); // Get the conversion rate
    const date = new Date().toLocaleDateString(); // Get the current date

    const grossPay = salary;
    const tax = (grossPay * taxRate) / 100;
    const netPay = grossPay - deductions - tax;

    const netPayUSD = netPay * 0.8;
    const netPayLD = (netPay * 0.2) * rate;

    const payslipDetails = {
        name,
        email,
        position,
        salary,
        deductions,
        tax,
        netPayUSD,
        netPayLD,
        rate, // Include rate in payslip details
        date // Include date in payslip details
    };

    displayPayslip(payslipDetails);

    updateYTD(employee, grossPay, deductions, netPay, netPayUSD, netPayLD);

    document.getElementById("payslipForm").reset();

    sendPayslipEmail(email, payslipDetails);
}

function displayPayslip({ name, email, position, salary, deductions, tax, netPayUSD, netPayLD, rate, date }) {
    // Update payslip details
    document.getElementById("payslipName").textContent = name;
    document.getElementById("payslipEmail").textContent = email;
    document.getElementById("payslipPosition").textContent = position;
    document.getElementById("payslipSalary").textContent = salary.toFixed(2);
    document.getElementById("payslipDeductions").textContent = deductions.toFixed(2);
    document.getElementById("payslipTax").textContent = tax.toFixed(2);
    document.getElementById("payslipNetPayUSD").textContent = netPayUSD.toFixed(2);
    document.getElementById("payslipNetPayLD").textContent = netPayLD.toFixed(2);
    document.getElementById("payslipRate").textContent = rate.toFixed(2); // Display the conversion rate
    document.getElementById("payslipDate").textContent = date; // Display the date

    // Safely handle the visibility of the payslip
    const payslipElement = document.getElementById("payslip");
    if (payslipElement) {
        payslipElement.classList.remove("hidden");
    } else {
        console.error('Element with ID "payslip" not found');
    }
}



function addEmployee() {
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const position = document.getElementById("position").value;
    const salary = parseFloat(document.getElementById("salary").value);
    const deductions = parseFloat(document.getElementById("deductions").value);
    const taxRate = parseFloat(document.getElementById("tax").value);

    if (!name || !position || !email || isNaN(salary) || isNaN(deductions) || isNaN(taxRate)) {
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
        ytdNetPayUSD: 0,
        ytdNetPayLD: 0,
    };

    employees.push(employee);
    localStorage.setItem("employees", JSON.stringify(employees));
    alert("Employee added successfully!");
}

function updateYTD(employee, grossPay, deductions, netPay, netPayUSD, netPayLD) {
    employee.ytdEarnings += grossPay;
    employee.ytdDeductions += deductions;
    employee.ytdNetPayUSD += netPayUSD;
    employee.ytdNetPayLD += netPayLD;

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

function sendPayslipEmail(email, { name, position, salary, deductions, tax, netPayUSD, netPayLD }) {
    const subject = "Your Payslip";
    const body = `
        Dear ${name},

        Here is your payslip:

        Position: ${position}
        Gross Salary: $${salary.toFixed(2)}
        Income Tax: $${deductions.toFixed(2)}
        Nascorp Tax: $${tax.toFixed(2)}
        Net Pay in USD: $${netPayUSD.toFixed(2)}
        Net Pay in LD: LD${netPayLD.toFixed(2)}

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

  doc.setFontSize(12);
  doc.text("Payslip", 10, 10);
  doc.text("Name: " + document.getElementById("payslipName").textContent, 10, 20);
  doc.text("Email: " + document.getElementById("payslipEmail").textContent, 10, 30);
  doc.text("Position: " + document.getElementById("payslipPosition").textContent, 10, 40);
  doc.text("Gross Salary: $" + document.getElementById("payslipSalary").textContent, 10, 50);
  doc.text("Income Tax: $" + document.getElementById("payslipDeductions").textContent, 10, 60);
  doc.text("Nascorp Tax: $" + document.getElementById("payslipTax").textContent, 10, 70);
  doc.text("Net Pay in USD: $" + document.getElementById("payslipNetPayUSD").textContent, 10, 80);
  doc.text("Net Pay in LD: LD " + document.getElementById("payslipNetPayLD").textContent, 10, 90);

  doc.save("payslip.pdf");
}
function updateConversionRate() {
    const newRate = parseFloat(document.getElementById("conversionRate").value);

    if (isNaN(newRate) || newRate <= 0) {
        alert("Please enter a valid conversion rate.");
        return;
    }

    conversionRate = newRate;
    localStorage.setItem("conversionRate", conversionRate);
    updateAllPayslips();
    alert("Conversion rate updated successfully!");
}

function updateAllPayslips() {
    employees = employees.map(employee => {
        const netPay = employee.salary - employee.deductions - ((employee.salary * employee.taxRate) / 100);
        employee.netPayUSD = netPay * 0.8;
        employee.netPayLD = (netPay * 0.2) * conversionRate;
        return employee;
    });

    localStorage.setItem("employees", JSON.stringify(employees));
}
function numberToWords(num) {
  const a = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['Hundred', 'Thousand', 'Million', 'Billion', 'Trillion'];

  function words(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10) - 2] + (n % 10 === 0 ? '' : ' ' + a[n % 10]);
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 === 0 ? '' : ' and ' + words(n % 100));
      for (let i = 0; i < g.length; i++) {
          const divisor = Math.pow(1000, i + 1);
          if (n < divisor) {
              return words(Math.floor(n / (divisor / 1000))) + ' ' + g[i] + (n % (divisor / 1000) === 0 ? '' : ', ' + words(n % (divisor / 1000)));
          }
      }
  }

  return words(num);
}
function printPayslip() {
    // Replace these with Base64-encoded image data if needed
   const logoBase64 = 'data:image/png;base64,ACTUAL_BASE64_STRING_FOR_YOUR_LOGO';
const secondaryLogoBase64 = 'data:image/png;base64,ACTUAL_BASE64_STRING_FOR_SECONDARY_LOGO';


    // Get the payslip HTML
    const payslip = document.querySelector(".payslip-container").outerHTML;

    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');

    // Write the content to the new window
    printWindow.document.write('<html><head><title>Print Payslip</title>');
    
    // Include Bootstrap and custom styles
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body {
            font-family: Arial, sans-serif;
        }
        .payslip-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #002060;
            color: white;
            text-align: center;
            padding: 10px 0;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            position: relative;
        }
        .header img {
            width: 50px;
            position: absolute;
            top: 10px;
            left: 20px;
        }
        .header h2 {
            margin: 0;
            font-size: 24px;
        }
        .header h4 {
            margin: 0;
            font-size: 14px;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .payslip-section {
            margin-bottom: 10px;
        }
        .payslip-section p {
            margin: 5px 0;
        }
        .net-pay-section {
            background-color: #002060;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 20px;
        }
        hr {
            border: 0;
            height: 1px;
            background: #ddd;
        }
        .btn {
            display: none; /* Hide buttons in print view */
        }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Replace logo src with Base64 data if needed
   const modifiedPayslip = payslip.replace(/path_to_your_logo_image/g, logoBase64)
                               .replace(/path_to_your_secondary_logo_image/g, secondaryLogoBase64);

    printWindow.document.write(modifiedPayslip); // Write the payslip HTML
    printWindow.document.write('</body></html>');

    // Close the document and print
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}
