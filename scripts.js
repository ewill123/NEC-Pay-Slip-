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

  // Check if all fields are filled
  if (
    !name ||
    !email ||
    !position ||
    isNaN(salary) ||
    isNaN(deductions) ||
    isNaN(taxRate) ||
    isNaN(rate)
  ) {
    alert("Please fill all the fields correctly.");
    return;
  }

  // Check if the employee exists
  const employee = employees.find((emp) => emp.name === name);
  if (!employee) {
    alert("Employee not found. Please add the employee first.");
    return;
  }

  const grossPay = salary;
  const tax = (grossPay * taxRate) / 100;
  const netPay = grossPay - deductions - tax;

  const netPayUSD = netPay * 0.8;
  const netPayLD = netPay * 0.2 * rate;

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
    date: new Date().toLocaleDateString(), // Get the current date
  };

  displayPayslip(payslipDetails);

  updateYTD(employee, grossPay, deductions, netPay, netPayUSD, netPayLD);

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
  netPayUSD,
  netPayLD,
  rate,
  date,
}) {
  // Update payslip details
  document.getElementById("payslipName").textContent = name;
  document.getElementById("payslipEmail").textContent = email;
  document.getElementById("payslipPosition").textContent = position;
  document.getElementById("payslipSalary").textContent = salary.toFixed(2);
  document.getElementById("payslipDeductions").textContent =
    deductions.toFixed(2);
  document.getElementById("payslipTax").textContent = tax.toFixed(2);
  document.getElementById("payslipNetPayUSD").textContent =
    netPayUSD.toFixed(2);
  document.getElementById("payslipNetPayLD").textContent = netPayLD.toFixed(2);
  document.getElementById("payslipRate").textContent = rate.toFixed(2); // Display the conversion rate
  document.getElementById("payslipDate").textContent = date; // Display the date

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
    ytdNetPayUSD: 0,
    ytdNetPayLD: 0,
  };

  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees));
  alert("Employee added successfully!");
}

function updateYTD(
  employee,
  grossPay,
  deductions,
  netPay,
  netPayUSD,
  netPayLD
) {
  const existingEmployee = employees.find((emp) => emp.name === employee.name);

  if (existingEmployee) {
    existingEmployee.ytdEarnings += grossPay;
    existingEmployee.ytdDeductions += deductions;
    existingEmployee.ytdNetPayUSD += netPayUSD;
    existingEmployee.ytdNetPayLD += netPayLD;

    const index = employees.findIndex(
      (emp) => emp.name === existingEmployee.name
    );
    if (index !== -1) {
      employees[index] = existingEmployee;
      localStorage.setItem("employees", JSON.stringify(employees));
    }
  }
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
  employees = employees.map((employee) => {
    const netPay =
      employee.salary -
      employee.deductions -
      (employee.salary * employee.taxRate) / 100;
    employee.netPayUSD = netPay * 0.8;
    employee.netPayLD = netPay * 0.2 * conversionRate;
    return employee;
  });

  localStorage.setItem("employees", JSON.stringify(employees));
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
  { name, position, salary, deductions, tax, netPayUSD, netPayLD, rate, date }
) {
  if (email) {
    const subject = encodeURIComponent("Your Payslip");
    const body = encodeURIComponent(`
      Dear ${name},

      Here is your payslip:

      Position: ${position}
      Gross Salary: $${salary.toFixed(2)}
      Income Tax: $${deductions.toFixed(2)}
      Nascorp Tax: $${tax.toFixed(2)}
      Net Pay in USD: $${netPayUSD.toFixed(2)}
      Net Pay in LD: LD${netPayLD.toFixed(2)}
      Conversion Rate: ${rate.toFixed(2)}
      Date: ${date}

      Thank you,
      NEC Liberia
    `);

    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${subject}&body=${body}`;

    // Open Gmail in a new popup window
    window.open(
      mailtoLink,
      "_blank",
      "width=600,height=600,scrollbars=yes,resizable=yes"
    );
  } else {
    // If no email is provided, auto print the payslip
    printPayslip();
  }
}

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: "YOUR_API_KEY",
      clientId: "YOUR_CLIENT_ID",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      ],
      scope: "https://www.googleapis.com/auth/gmail.send",
    })
    .then(() => {
      // Sign in and send the email
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(() => {
          console.log("User signed in");
        });
    })
    .catch((error) => {
      console.error("Error initializing Gmail API", error);
    });
}

function sendEmail(to, subject, body) {
  const email = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const base64EncodedEmail = btoa(email)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  gapi.client.gmail.users.messages
    .send({
      userId: "me",
      resource: {
        raw: base64EncodedEmail,
      },
    })
    .then((response) => {
      console.log("Email sent successfully!", response);
    })
    .catch((error) => {
      console.error("Error sending email", error);
    });
}
document.getElementById("sendEmailBtn").addEventListener("click", function () {
  const recipient = "recipient@example.com";
  const subject = "Subject of Email";
  const body = "Body of the email content";

  sendEmail(recipient, subject, body);
});
function sendEmailAfterAuth(to, subject, body) {
  gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(() => {
      sendEmail(to, subject, body);
    })
    .catch((error) => {
      console.error("Error during sign-in", error);
    });
}
gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
  if (isSignedIn) {
    console.log("User is signed in");
  } else {
    console.log("User is signed out");
  }
});
