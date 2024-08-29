let debounceTimer;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Use debounce for fetchEmployeeData
document
  .getElementById("name")
  .addEventListener("input", debounce(fetchEmployeeData, 300));

let employees = [];
const firebaseConfig = {
  apiKey: "AIzaSyB3MTQ1TAlv5XybVV2DZDI7v7sCzkVO8yw",
  authDomain: "pay-slip-generator-37980.firebaseapp.com",
  projectId: "pay-slip-generator-37980",
  storageBucket: "pay-slip-generator-37980.appspot.com",
  messagingSenderId: "174710674762",
  appId: "1:174710674762:web:f8755cc8e51ed2ecb29db3",
};
function fetchEmployeeData() {
  const enteredName = document
    .getElementById("name")
    .value.trim()
    .toLowerCase();
  console.log("Entered Name:", enteredName); // Debug line
  // Rest of the code...
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let conversionRate = parseFloat(localStorage.getItem("conversionRate")) || 1;

window.onload = async function () {
  try {
    const snapshot = await db.collection("employees").get();
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    document.getElementById("conversionRate").value = conversionRate;
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

function generatePayslip() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const tax = parseFloat(document.getElementById("tax").value);

  // Calculate Net Pay in USD
  const netPayUSD = salary - deductions - tax;

  // Calculate USD and LRD components
  const netPayUSD80 = netPayUSD * 0.8;
  const netPayUSD20 = netPayUSD * 0.2;
  const netPayLD = netPayUSD20 * conversionRate;

  // Update the payslip display
  document.getElementById("payslipName").innerText = name;
  document.getElementById("payslipEmail").innerText = email;
  document.getElementById("payslipPosition").innerText = position;
  document.getElementById("payslipSalary").innerText = salary.toFixed(2);
  document.getElementById("payslipDeductions").innerText =
    deductions.toFixed(2);
  document.getElementById("payslipTax").innerText = tax.toFixed(2);
  document.getElementById("payslipNetPayUSD").innerText =
    netPayUSD80.toFixed(2);
  document.getElementById("payslipNetPayLD").innerText = netPayLD.toFixed(2);
  document.getElementById("payslipRate").innerText = conversionRate.toFixed(2);
  document.getElementById("payslipDate").innerText =
    new Date().toLocaleDateString();

  // Remove "hidden" class to display the payslip
  document.getElementById("payslip").classList.remove("d-none");

  document.getElementById("sendEmailBtn").addEventListener("click", () =>
    sendPayslipEmail(email, {
      name,
      position,
      salary,
      deductions,
      tax,
      netPayUSD: netPayUSD80,
      netPayLD,
      rate: conversionRate,
      date: new Date().toLocaleDateString(),
    })
  );

  // Clear the form after generating the payslip
  clearForm();
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

function addEmployee() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const position = document.getElementById("position").value;
  const salary = parseFloat(document.getElementById("salary").value);
  const deductions = parseFloat(document.getElementById("deductions").value);
  const tax = parseFloat(document.getElementById("tax").value);

  db.collection("employees")
    .add({
      name,
      email,
      position,
      salary,
      deductions,
      tax,
    })
    .then((docRef) => {
      console.log("Employee added with ID:", docRef.id);
      employees.push({
        id: docRef.id,
        name,
        email,
        position,
        salary,
        deductions,
        tax,
      });
    })
    .catch((error) => {
      console.error("Error adding employee:", error);
    });
}

function fetchEmployeeData() {
  const enteredName = document
    .getElementById("name")
    .value.trim()
    .toLowerCase();

  if (enteredName.length === 0) return;

  const employee = employees.find(
    (emp) => emp.name.toLowerCase() === enteredName
  );

  if (employee) {
    document.getElementById("email").value = employee.email;
    document.getElementById("position").value = employee.position;
    document.getElementById("salary").value = employee.salary;
    document.getElementById("deductions").value = employee.deductions;
    document.getElementById("tax").value = employee.tax;
  } else {
    clearForm();
  }
}
function updateConversionRate() {
  conversionRate = parseFloat(document.getElementById("conversionRate").value);
  localStorage.setItem("conversionRate", conversionRate);
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("position").value = "";
  document.getElementById("salary").value = "";
  document.getElementById("deductions").value = "";
  document.getElementById("tax").value = "";
  document.getElementById("conversionRate").value = "160"; // Default value
}

function autofillForm(employeeId) {
  const docRef = firebase.firestore().collection("employees").doc(employeeId);
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("name").value = data.name;
        document.getElementById("position").value = data.position;
        document.getElementById("salary").value = data.salary;
        // Fill other fields as needed
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function printPayslip() {
  const payslipContent = document.getElementById("payslip").innerHTML;

  // Open a new window for printing
  const printWindow = window.open("", "", "height=800,width=600");

  printWindow.document.open();
  printWindow.document.write("<html><head><title>Payslip</title>");

  // Add Bootstrap and custom styles for printing
  printWindow.document.write(
    '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />'
  );
  printWindow.document.write(
    "<style> \
      body { font-family: Arial, sans-serif; } \
      @media print { \
        body { margin: 0; } \
        .container { max-width: 100%; } \
        .hidden { display: none; } \
        .payslip { \
          border: 1px solid #ddd; \
          padding: 20px; \
          margin: 20px; \
          background: #fff; \
          page-break-after: auto; \
          font-size: 18px; \
          line-height: 1.6; \
        } \
        .payslip .header { \
          display: flex; \
          justify-content: space-between; \
          align-items: center; \
          padding-bottom: 10px; \
          margin-bottom: 20px; \
        } \
        .payslip .header img { \
          width: 80px; \
          height: auto; \
        } \
        .payslip .title { \
          text-align: center; \
          font-size: 26px; \
          font-weight: bold; \
          margin-bottom: 20px; \
        } \
        .payslip .content h4 { \
          margin: 12px 0; \
          font-weight: bold; \
          font-size: 20px; \
        } \
        .payslip .footer { \
          text-align: center; \
          border-top: 2px solid #000; \
          padding-top: 10px; \
          margin-top: 30px; \
          font-size: 16px; \
          font-weight: bold; \
        } \
        img { max-width: 100px; height: auto; } \
        @page { size: A4; margin: 10mm; } \
      } \
    </style>"
  );

  printWindow.document.write("</head><body>");

  // Insert the payslip content
  printWindow.document.write(payslipContent);

  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.focus();

  // Wait for the content to load before printing
  printWindow.onload = function () {
    printWindow.print();
  };
}
