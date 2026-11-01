/* =====================================================
   ONEVISIT
   Family Based Government Support Prototype
   ===================================================== */


/* ================= GLOBAL ================= */

const $ = (selector) => document.querySelector(selector);

const pages = {
    login: $("#loginPage"),
    family: $("#familyPage"),
    member: $("#memberPage"),
    results: $("#resultsPage"),
    details: $("#detailsPage")
};

let familyMembers =
    JSON.parse(localStorage.getItem("onevisit_family")) || [];

let currentSupportType = "scheme";


/* ================= DOCUMENT LIST ================= */

const commonDocuments = [

    "Aadhaar Card",

    "Address Proof",

    "Income Certificate",

    "Caste Certificate",

    "Category / EWS Certificate",

    "Bank Account / Passbook",

    "Passport-size Photograph",

    "Disability Certificate",

    "Educational Marks Card / Certificate",

    "Study / Bonafide Certificate",

    "Land / Agriculture Records",

    "Employment / Job-seeker Proof"

];


/* ================= SUPPORT DATA ================= */

const supportData = [

    {
        name: "Government Family / Income Support",
        type: "scheme",

        description: "Relevant government support for eligible families based on income and family circumstances.",

        match: function(member) {

            const income =
                Number(member.annualIncome || 0);

            return income <= 300000;
        }
    },


    {
        name: "Student Scholarship Support",
        type: "scholarship",

        description: "Scholarship opportunities can be explored for eligible students according to their education and personal circumstances.",

        match: function(member) {

            return member.occupation === "Student";
        }
    },


    {
        name: "Education Loan Support",
        type: "loan",

        description: "Education loan opportunities for eligible students. Loan rules, interest and repayment conditions must be checked before applying.",

        match: function(member) {

            return member.occupation === "Student";
        }
    },


    {
        name: "Competitive Examination Opportunities",
        type: "exam",

        description: "Competitive examination opportunities can be explored according to education, age and current notifications.",

        match: function(member) {

            return (
                member.occupation === "Student" ||
                member.occupation === "Job Seeker"
            );
        }
    },


    {
        name: "Jobs & Internship Opportunities",
        type: "job",

        description: "Jobs and internship opportunities can be matched according to occupation and educational details.",

        match: function(member) {

            return (
                member.occupation === "Job Seeker" ||
                member.occupation === "Student"
            );
        }
    },


    {
        name: "Agriculture / Farmer Support",
        type: "scheme",

        description: "Agriculture-related support for eligible farmers and agricultural workers.",

        match: function(member) {

            return (
                member.occupation ===
                "Farmer / Agriculture"
            );
        }
    },


    {
        name: "Disability-related Support",
        type: "scheme",

        description: "Support opportunities for persons with disabilities. Required disability certification may apply.",

        match: function(member) {

            return member.disability === "Yes";
        }
    },


    {
        name: "Senior Citizen Support",
        type: "scheme",

        description: "Senior-citizen support opportunities based on age and applicable government rules.",

        match: function(member) {

            return Number(member.age) >= 60;
        }
    }

];


/* ================= PAGE NAVIGATION ================= */

function showPage(pageName) {

    Object.values(pages).forEach(page => {

        page.classList.remove("active");

    });

    pages[pageName].classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    $("#logoutBtn")
        .classList
        .toggle(
            "hidden",
            pageName === "login"
        );
}


/* ================= TOAST ================= */

function showToast(message) {

    const toast = $("#toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* ================= LOCAL STORAGE ================= */

function saveFamily() {

    localStorage.setItem(
        "onevisit_family",
        JSON.stringify(familyMembers)
    );
}


/* ================= LOGIN ================= */

$("#loginForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const loginId =
            $("#loginId").value.trim();

        const otp =
            $("#otp").value.trim();


        if (!loginId || otp.length < 4) {

            showToast(
                "Enter valid login details and OTP."
            );

            return;
        }


        showPage("family");

        renderFamily();

        showToast(
            "Login successful."
        );
    }
);


/* ================= FAMILY DISPLAY ================= */

function renderFamily() {

    const container =
        $("#memberCards");

    container.innerHTML = "";


    if (familyMembers.length === 0) {

        container.innerHTML = `

            <div class="detail-card">

                <h3>No member added</h3>

                <p>
                    Add the first family member to begin
                    the family-based matching flow.
                </p>

            </div>

        `;

        return;
    }


    familyMembers.forEach(
        (member, index) => {

            container.innerHTML += `

                <div class="member-card">

                    <span class="tag">
                        ${member.occupation}
                    </span>

                    <h3>
                        ${member.firstName}
                        ${member.lastName || ""}
                    </h3>

                    <p>
                        ${member.relationship || "Member"}
                        ·
                        ${member.age || "-"} years
                        ·
                        ${member.state || "-"}
                    </p>

                    <button
                        class="secondary-btn"
                        onclick="editMember(${index})"
                    >
                        Edit Member
                    </button>

                </div>

            `;

        }
    );
}


/* ================= ADD MEMBER ================= */

$("#addMemberBtn").addEventListener(
    "click",
    function() {

        openMemberForm();

    }
);


/* ================= OPEN MEMBER FORM ================= */

function openMemberForm(index = null) {

    $("#memberForm").reset();

    $("#editingMemberIndex").value =
        index === null ? "" : index;


    if (index === null) {

        $("#memberPageTitle").textContent =
            "Add Family Member";

    } else {

        $("#memberPageTitle").textContent =
            "Edit Family Member";


        const member =
            familyMembers[index];


        Object.keys(member).forEach(
            key => {

                const element =
                    $("#" + key);

                if (element) {

                    element.value =
                        member[key] || "";

                }

            }
        );

    }


    updateConditionalQuestions();

    renderDocuments(
        index !== null ?
        familyMembers[index].documents || [] : []
    );


    showPage("member");
}


/* ================= EDIT MEMBER ================= */

window.editMember = function(index) {

    openMemberForm(index);

};


/* ================= DOCUMENTS ================= */

function renderDocuments(savedDocuments = []) {

    const container =
        $("#documentList");

    container.innerHTML = "";


    commonDocuments.forEach(
        documentName => {

            const saved =
                savedDocuments.find(
                    document =>
                    document.name ===
                    documentName
                );


            container.innerHTML += `

                <div class="document-item">

                    <label>

                        <input
                            type="checkbox"
                            data-document="${documentName}"
                            ${saved?.available ? "checked" : ""}
                        >

                        <span>
                            ${documentName}
                        </span>

                    </label>

                </div>

            `;

        }
    );
}


/* ================= CONDITIONAL QUESTIONS ================= */

function updateConditionalQuestions() {

    const occupation =
        $("#occupation").value;

    const age =
        Number($("#age").value || 0);

    const maritalStatus =
        $("#maritalStatus").value;

    const disability =
        $("#disability").value;


    const section =
        $("#conditionalSection");

    const container =
        $("#conditionalQuestions");

    let html = "";


    /* DISABILITY */

    if (disability === "Yes") {

        html += `

            <div class="full-width">

                <p>
                    <strong>
                        Disability support:
                    </strong>

                    The member may be matched with
                    disability-related support.
                    Keep the disability certificate ready
                    where required.

                </p>

            </div>

        `;

    }


    /* SENIOR CITIZEN */

    if (age >= 60) {

        html += `

            <label>

                Senior Citizen

                <select disabled>

                    <option>
                        Yes — Based on age
                    </option>

                </select>

            </label>

        `;

    }


    /* MARRIED */

    if (
        maritalStatus === "Married" &&
        age < 60
    ) {

        html += `

            <label>

                Single Parent?

                <select id="singleParent">

                    <option>No</option>
                    <option>Yes</option>

                </select>

            </label>


            <label>

                Divorced / Separated?

                <select id="divorcedSeparated">

                    <option>No</option>
                    <option>Yes</option>

                </select>

            </label>


            <label>

                Widow / Widower?

                <select id="widowWidower">

                    <option>No</option>
                    <option>Yes</option>

                </select>

            </label>

        `;

    }


    /* STUDENT OR UNMARRIED */

    if (
        occupation === "Student" ||
        maritalStatus === "Not Married"
    ) {

        html += `

            <label>

                Single Child?

                <select id="singleChild">

                    <option>No</option>
                    <option>Yes</option>

                </select>

            </label>


            <label>

                Parents Deceased?

                <select id="parentsDeceased">

                    <option>No</option>
                    <option>Yes</option>

                </select>

            </label>

        `;

    }


    if (html !== "") {

        section.classList.remove("hidden");

        container.innerHTML = html;

    } else {

        section.classList.add("hidden");

        container.innerHTML = "";

    }


    /* STUDENT */

    if (occupation === "Student") {

        $("#studentSection")
            .classList
            .remove("hidden");

    } else {

        $("#studentSection")
            .classList
            .add("hidden");

    }

}


/* ================= CONDITIONAL EVENTS ================= */

[
    "occupation",
    "age",
    "maritalStatus",
    "disability"
].forEach(id => {

    $("#" + id).addEventListener(
        "change",
        updateConditionalQuestions
    );

});


$("#age").addEventListener(
    "input",
    updateConditionalQuestions
);


/* ================= COLLECT MEMBER ================= */

function collectMemberData() {

    const member = {};


    const fields = [

        "firstName",
        "lastName",
        "age",
        "gender",
        "relationship",
        "occupation",
        "state",
        "phone",
        "maritalStatus",
        "annualIncome",
        "disability",
        "address",
        "residence",
        "caste",
        "religion",
        "category",

        "educationLevel",
        "course",
        "institution",
        "studyYear",
        "marks"

    ];


    fields.forEach(
        field => {

            const element =
                $("#" + field);

            if (element) {

                member[field] =
                    element.value;

            }

        }
    );


    /* CONDITIONAL QUESTIONS */

    const conditionalFields = [

        "singleParent",
        "divorcedSeparated",
        "widowWidower",
        "singleChild",
        "parentsDeceased"

    ];


    conditionalFields.forEach(
        field => {

            const element =
                $("#" + field);

            if (element) {

                member[field] =
                    element.value;

            }

        }
    );


    /* DOCUMENTS */

    member.documents =
        Array.from(
            document.querySelectorAll(
                "[data-document]"
            )
        ).map(
            checkbox => ({

                name: checkbox.dataset.document,

                available: checkbox.checked

            })
        );


    return member;
}


/* ================= SAVE MEMBER ================= */

$("#memberForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        saveMember(false);

    }
);


$("#saveDraftBtn").addEventListener(
    "click",
    function() {

        saveMember(true);

    }
);


function saveMember(isDraft) {

    const member =
        collectMemberData();


    if (
        !member.firstName ||
        !member.age ||
        !member.occupation
    ) {

        showToast(
            "Please enter name, age and occupation."
        );

        return;

    }


    const editingIndex =
        $("#editingMemberIndex").value;


    if (editingIndex === "") {

        familyMembers.push(member);

    } else {

        familyMembers[
            Number(editingIndex)
        ] = member;

    }


    saveFamily();

    renderFamily();


    if (isDraft) {

        showToast(
            "Member draft saved."
        );

        showPage("family");

    } else {

        showToast(
            "Member saved successfully."
        );

        renderResults();

        showPage("results");

    }

}


/* ================= BACK BUTTON ================= */

$("#backToFamilyBtn").addEventListener(
    "click",
    function() {

        renderFamily();

        showPage("family");

    }
);


$("#resultsFamilyBtn").addEventListener(
    "click",
    function() {

        renderFamily();

        showPage("family");

    }
);


$("#backResultsBtn").addEventListener(
    "click",
    function() {

        showPage("results");

    }
);


/* ================= VIEW SUPPORT ================= */

$("#viewSupportBtn").addEventListener(
    "click",
    function() {

        renderResults();

        showPage("results");

    }
);


/* ================= RESULTS ================= */

function renderResults() {

    renderNotifications();

    renderSupport(
        currentSupportType
    );

}


/* ================= NOTIFICATIONS ================= */

function renderNotifications() {

    const container =
        $("#notifications");

    let notifications = [];


    familyMembers.forEach(
        member => {

            const pendingDocuments =
                (member.documents || [])
                .filter(
                    document =>
                    !document.available
                );


            if (pendingDocuments.length > 0) {

                notifications.push(`

                    <div class="notification">

                        <strong>
                            📄 Pending Documents —
                            ${member.firstName}
                        </strong>

                        ${pendingDocuments.length}
                        document(s) still need to
                        be attached/marked available.

                    </div>

                `);

            }


            if (
                member.occupation ===
                "Student"
            ) {

                notifications.push(`

                    <div class="notification">

                        <strong>
                            🎓 Scholarship / Exam Alert —
                            ${member.firstName}
                        </strong>

                        New eligible scholarships
                        and competitive examination
                        opportunities should be checked
                        regularly.

                    </div>

                `);

            }


            if (
                member.occupation ===
                "Farmer / Agriculture"
            ) {

                notifications.push(`

                    <div class="notification">

                        <strong>
                            🌾 Agriculture Support —
                            ${member.firstName}
                        </strong>

                        Check newly announced
                        agriculture schemes and
                        market-price information.

                    </div>

                `);

            }


            if (
                member.disability === "Yes"
            ) {

                notifications.push(`

                    <div class="notification">

                        <strong>
                            ♿ Disability Support —
                            ${member.firstName}
                        </strong>

                        Check disability-related
                        support and keep the
                        required certificate ready.

                    </div>

                `);

            }

        }
    );


    notifications.push(`

        <div class="notification">

            <strong>
                ⏰ Deadline Reminder
            </strong>

            Always check the current official
            notification for application opening
            and closing dates.

        </div>

    `);


    notifications.push(`

        <div class="notification">

            <strong>
                📍 Application Help
            </strong>

            Nearby cyber/application-help centres
            can be used when assistance is required.

        </div>

    `);


    container.innerHTML =
        notifications.join("");

}


/* ================= SUPPORT TABS ================= */

document
    .querySelectorAll(".support-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".support-tab")
                    .forEach(
                        btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                this.classList.add("active");


                currentSupportType =
                    this.dataset.type;


                renderSupport(
                    currentSupportType
                );

            }
        );

    });


/* ================= MATCHING LOGIC ================= */

function renderSupport(type) {

    const container =
        $("#resultsList");

    let results = [];


    familyMembers.forEach(
        (member, memberIndex) => {

            supportData
                .filter(
                    support =>
                    support.type === type
                )
                .forEach(
                    support => {

                        if (
                            support.match(member)
                        ) {

                            results.push({

                                support,

                                member,

                                memberIndex

                            });

                        }

                    }
                );

        }
    );


    if (results.length === 0) {

        container.innerHTML = `

            <div class="detail-card">

                <h3>
                    No current matches
                </h3>

                <p>
                    Add or edit family member details
                    to improve the matching logic.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        results.map(
            result => `

                <article class="result-card">

                    <span class="tag">

                        ${result.support.type
                            .toUpperCase()}

                    </span>


                    <h3>

                        ${result.support.name}

                    </h3>


                    <p class="eligible-member">

                        Eligible / Relevant Member:

                        <br>

                        👤
                        ${result.member.firstName}
                        ${result.member.lastName || ""}

                        ·

                        ${result.member.relationship}

                    </p>


                    <p>

                        ${result.support.description}

                    </p>


                    <p>

                        <strong>
                            Next Action:
                        </strong>

                        Check eligibility,
                        required documents and
                        official application process.

                    </p>


                    <button
                        class="primary-btn"
                        onclick="openSupportDetails(
                            ${result.memberIndex},
                            '${result.support.name}',
                            '${result.support.type}',
                            '${result.support.description.replace(/'/g, "\\'")}'
                        )"
                    >

                        View Details

                    </button>

                </article>

            `
        ).join("");

}


/* ================= SUPPORT DETAILS ================= */

window.openSupportDetails =
    function(
        memberIndex,
        supportName,
        supportType,
        description
    ) {

        const member =
            familyMembers[memberIndex];


        $("#detailTitle").textContent =
            supportName;


        const availableDocuments =
            (member.documents || [])
            .filter(
                document =>
                document.available
            );


        const pendingDocuments =
            (member.documents || [])
            .filter(
                document =>
                !document.available
            );


        $("#detailContent").innerHTML = `

        <span class="tag">
            ${supportType.toUpperCase()}
        </span>


        <h2>
            ${supportName}
        </h2>


        <p>

            <strong>
                Eligible / Relevant Member:
            </strong>

            ${member.firstName}
            ${member.lastName || ""}

        </p>


        <p>

            ${description}

        </p>


        <h3>
            Documents
        </h3>


        <p>

            <strong>
                Available documents:
            </strong>

            ${availableDocuments.length}

        </p>


        <p>

            <strong>
                Pending documents:
            </strong>

            ${pendingDocuments.length}

        </p>


        <ul>

            ${
                pendingDocuments.length
                    ?

                    pendingDocuments
                        .map(
                            doc =>
                                `<li>
                                    ⚠️ ${doc.name}
                                </li>`
                        )
                        .join("")

                    :

                    "<li>All listed documents are currently marked available.</li>"
            }

        </ul>


        <h3>
            Next Action
        </h3>


        <p>

            Review the current official
            notification, confirm eligibility,
            attach required documents and apply
            through the authorised channel.

        </p>


        <button
            class="primary-btn"
            onclick="markPriority('${member.firstName}')"
        >

            📌 Mark as Priority

        </button>

    `;


        showPage("details");

    };


/* ================= PRIORITY ================= */

window.markPriority =
    function(memberName) {

        showToast(
            `${memberName}'s application marked as priority.`
        );

    };


/* ================= APPLICATION PRIORITY ================= */

window.showPriority =
    function() {

        let message =
            "APPLICATION PRIORITY\n\n";


        familyMembers.forEach(
            member => {

                const pending =
                    (member.documents || [])
                    .filter(
                        document =>
                        !document.available
                    ).length;


                message +=
                    `${member.firstName}: ` +
                    `${pending} pending document(s)\n`;

            }
        );


        message +=
            "\nPriority should be given to applications " +
            "with approaching deadlines and pending documents.";


        alert(message);

    };


/* ================= NEARBY CENTRES ================= */

window.showCentres =
    function() {

        alert(

            "NEARBY APPLICATION HELP\n\n" +

            "The prototype can be connected to " +
            "verified live cyber-centre, CSC and " +
            "government service-centre information.\n\n" +

            "For the current prototype, use authorised " +
            "cyber/application-help centres."

        );

    };


/* ================= EMI CALCULATOR ================= */

window.showEMI =
    function() {

        const principal =
            Number(
                prompt(
                    "Enter loan amount (₹):",
                    "100000"
                )
            );


        const annualRate =
            Number(
                prompt(
                    "Enter annual interest rate (%):",
                    "10"
                )
            );


        const months =
            Number(
                prompt(
                    "Enter loan tenure (months):",
                    "24"
                )
            );


        if (
            !principal ||
            !annualRate ||
            !months
        ) {

            return;

        }


        const monthlyRate =
            annualRate / 12 / 100;


        const emi =
            principal *
            monthlyRate *
            Math.pow(
                1 + monthlyRate,
                months
            ) /
            (
                Math.pow(
                    1 + monthlyRate,
                    months
                ) - 1
            );


        alert(

            "Estimated EMI\n\n" +

            "Loan Amount: ₹" +
            principal.toLocaleString("en-IN") +

            "\nInterest: " +
            annualRate +
            "%" +

            "\nTenure: " +
            months +
            " months" +

            "\n\nEstimated Monthly EMI: ₹" +
            emi.toFixed(2)

        );

    };


/* ================= MARKET PRICES ================= */

window.showMarketPrices =
    function() {

        alert(

            "MARKET PRICES\n\n" +

            "The market-price module is retained " +
            "as part of the ONEVISIT practical tools.\n\n" +

            "For the final live version, connect " +
            "verified market-price sources."

        );

    };


/* ================= DARK MODE ================= */

$("#themeBtn").addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        localStorage.setItem(
            "onevisit_theme",

            document.body.classList.contains("dark") ?
            "dark" :
            "light"
        );

    }
);


if (
    localStorage.getItem(
        "onevisit_theme"
    ) === "dark"
) {

    document.body.classList.add("dark");

}


/* ================= LOGOUT ================= */

$("#logoutBtn").addEventListener(
    "click",
    function() {

        showPage("login");

    }
);


/* ================= INITIALIZE ================= */

renderFamily();

renderDocuments();