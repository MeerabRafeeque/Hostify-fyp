document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("roomApplicationForm");
  const roomType = document.getElementById("roomType");
  const paymentMethod = document.getElementById("paymentMethod");
  const transactionId = document.getElementById("transactionId");
  const screenshot = document.getElementById("screenshot");
  const confirmationMsg = document.getElementById("confirmationMsg");

  // New fields
  const fullName = document.getElementById("fullName");
  const contact = document.getElementById("contact");
  const dob = document.getElementById("dob");
  const regDate = document.getElementById("regDate");

  // Auto set registration date (today) & disable editing
  const today = new Date().toISOString().split("T")[0];
  regDate.value = today;
  regDate.readOnly = true;

  // Helper under paymentMethod
  const methodHelp = document.createElement("div");
  methodHelp.id = "methodHelp";
  methodHelp.style.fontSize = "12px";
  methodHelp.style.color = "#555";
  methodHelp.style.marginTop = "6px";
  paymentMethod.parentElement.appendChild(methodHelp);

  // Update hints
  paymentMethod.addEventListener("change", () => {
    transactionId.value = "";
    confirmationMsg.style.display = "none";
    const m = paymentMethod.value;

    if (m === "easypaisa") {
      methodHelp.textContent =
        "Accepted: Easypaisa Transaction ID (10–16 digits, optionally starts with EP). Cards are NOT accepted.";
      transactionId.placeholder = "e.g. EP1234567890 or 123456789012";
    } else if (m === "jazzcash") {
      methodHelp.textContent =
        "Accepted: JazzCash Transaction ID (10–16 digits, optionally starts with JC). Cards are NOT accepted.";
      transactionId.placeholder = "e.g. JC1234567890";
    } else if (m === "ubl") {
      methodHelp.textContent =
        "Accepted: UBL bank transfer reference (8–20 alphanumeric, may start with UBL). Cards are NOT accepted.";
      transactionId.placeholder = "e.g. UBL12345678";
    } else {
      methodHelp.textContent = "";
      transactionId.placeholder = "Enter Transaction ID from your receipt";
    }
  });

  // TID cleanup
  transactionId.addEventListener("input", () => {
    transactionId.value = transactionId.value.replace(/\s+/g, "").toUpperCase();
  });

  // Looks-like-card check
  function looksLikeCardNumber(s) {
    if (!/^\d{13,19}$/.test(s)) return false;
    let sum = 0,
      alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let n = parseInt(s[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  // Method-specific TID patterns
  function tidMatchesMethod(method, tid) {
    switch (method) {
      case "easypaisa":
        return /^(EP)?\d{10,16}$/i.test(tid);
      case "jazzcash":
        return /^(JC)?\d{10,16}$/i.test(tid);
      case "ubl":
        return /^((UBL|UB)[A-Z0-9]{6,18}|[A-Z0-9]{8,20})$/i.test(tid);
      default:
        return false;
    }
  }

  // Screenshot validation
  function validateScreenshot(input) {
    if (!input.files || input.files.length === 0) {
      return { ok: false, msg: "Please upload the payment screenshot." };
    }
    const f = input.files[0];
    if (!/^image\//.test(f.type)) {
      return {
        ok: false,
        msg: "Only image files are allowed (JPG, PNG, WEBP).",
      };
    }
    if (f.size > 5 * 1024 * 1024) {
      return {
        ok: false,
        msg: "Image is too large. Maximum allowed size is 5 MB.",
      };
    }
    if (!/\.(jpe?g|png|webp)$/i.test(f.name)) {
      return { ok: false, msg: "Allowed extensions: .jpg, .jpeg, .png, .webp" };
    }
    return { ok: true };
  }

  // Full name validation
  function validateName(name) {
    // must contain at least one letter + not only digits/symbols/spaces
    return /^(?=.*[A-Za-z])[A-Za-z0-9 .,'-]+$/.test(name);
  }

  // Contact validation
  function validateContact(c) {
    return /^[0-9+\-]{7,15}$/.test(c);
  }

  // DOB validation (must be >= 16 years)
  function validateDOB(dateStr) {
    const dob = new Date(dateStr);
    if (isNaN(dob)) return false;
    const today = new Date();
    const age =
      today.getFullYear() -
      dob.getFullYear() -
      (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
        ? 1
        : 0);
    return age >= 16;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    confirmationMsg.style.display = "none";

    // Name
    if (!validateName(fullName.value.trim())) {
      alert(
        "Please enter a valid full name (letters required, not only numbers/symbols)."
      );
      return;
    }

    // Contact
    if (!validateContact(contact.value.trim())) {
      alert("Please enter a valid contact number (digits, + or - allowed).");
      return;
    }

    // DOB
    if (!validateDOB(dob.value)) {
      alert("You must be at least 16 years old to register.");
      return;
    }

    // Room type
    const selectedRoom = roomType.value;
    if (!selectedRoom) {
      alert("Please select a room type.");
      return;
    }

    // Payment
    const method = paymentMethod.value;
    const tid = transactionId.value.trim();
    const fileCheck = validateScreenshot(screenshot);

    if (!method) {
      alert("Please select a payment method.");
      return;
    }
    if (!tid) {
      alert("Please enter the Transaction ID from your receipt.");
      return;
    }
    if (looksLikeCardNumber(tid)) {
      alert(
        "Card numbers are not accepted. Enter the official transaction/reference ID."
      );
      return;
    }
    if (!tidMatchesMethod(method, tid)) {
      alert(
        "Transaction ID format does not match the selected payment method."
      );
      return;
    }
    if (!fileCheck.ok) {
      alert(fileCheck.msg);
      return;
    }

    // ✅ All good
    const shortTid =
      tid.length > 6 ? tid.slice(0, 3) + "…" + tid.slice(-3) : tid;
    confirmationMsg.textContent = `Your application has been submitted. Payment (${method.toUpperCase()}) with reference ${shortTid} will be verified by admin.`;
    confirmationMsg.style.display = "block";

    // Reset form EXCEPT regDate
    form.reset();
    regDate.value = today;
    regDate.readOnly = true;
    methodHelp.textContent = "";
  });
});
