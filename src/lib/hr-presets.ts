export const HR_PRESETS = [
    {
        title: 'Offer Letter',
        type: 'OFFER_LETTER',
        content: `
<h1>Offer of Employment</h1>
<p>Date: {{date}}</p>
<p>To,</p>
<h3>{{name}}</h3>
<p>{{address}}</p>

<p>Dear <strong>{{name}}</strong>,</p>

<p>We are pleased to offer you the position of <strong>{{designation}}</strong> at <strong>{{companyName}}</strong>. We were impressed with your qualifications and believe you will be a valuable asset to our team.</p>

<h3>Compensation and Benefits</h3>
<p>Your annual cost to company (CTC) will be <strong>{{salary}}</strong>. A detailed breakdown of your salary structure is attached to this letter.</p>

<h3>Date of Joining</h3>
<p>You are expected to join on or before <strong>{{joiningDate}}</strong>. Please report to the HR department at 10:00 AM on your joining date.</p>

<h3>Terms and Conditions</h3>
<ul>
    <li>This offer is subject to satisfactory reference checks and verification of documents.</li>
    <li>You will be on probation for a period of 6 months.</li>
    <li>You are required to submit copies of your educational and professional certificates on the day of joining.</li>
</ul>

<p>We look forward to welcoming you to the <strong>{{companyName}}</strong> family.</p>

<p>Sincerely,</p>
<p><strong>HR Manager</strong></p>
<p>{{companyName}}</p>
<br>
<hr>
<p><strong>Acceptance of Offer</strong></p>
<p>I, <strong>{{name}}</strong>, accept the offer of employment on the terms and conditions mentioned above.</p>
        `
    },
    {
        title: 'Appointment Letter',
        type: 'CONTRACT',
        content: `
<h1>Appointment Letter</h1>
<p>Date: {{date}}</p>
<p><strong>{{companyName}}</strong><br>{{companyAddress}}</p>

<h3>Strictly Confidential</h3>
<p>To,<br><strong>{{name}}</strong><br>{{address}}</p>

<p>Dear {{name}},</p>

<p>Sub: <strong>Appointment for the post of {{designation}}</strong></p>

<p>Further to your application and subsequent interview, we are pleased to appoint you as <strong>{{designation}}</strong> in our organization, effective from <strong>{{joiningDate}}</strong>.</p>

<h3>1. Remuneration</h3>
<p>Your monthly gross salary will be <strong>{{salary}}</strong>/12.</p>

<h3>2. Probation</h3>
<p>You will be on probation for a period of six months from the date of joining. Upon successful completion, your services will be confirmed in writing.</p>

<h3>3. Responsibilities</h3>
<p>You will responsible for duties as assigned by your reporting manager. The company reserves the right to transfer you to any other department or location as per business requirements.</p>

<h3>4. Notice Period</h3>
<p>During probation, either party may terminate this appointment by giving 15 days notice. After confirmation, the notice period will be 1 month.</p>

<p>We welcome you to {{companyName}} and wish you a successful career with us.</p>

<p>For {{companyName}},</p>
<p>Authorized Signatory</p>
        `
    },
    {
        title: 'Non-Disclosure Agreement (NDA)',
        type: 'NDA',
        content: `
<h1>Non-Disclosure Agreement</h1>
<p>This Non-Disclosure Agreement ("Agreement") is entered into on <strong>{{date}}</strong> between:</p>

<p><strong>{{companyName}}</strong> ("Disclosing Party")</p>
<p>AND</p>
<p><strong>{{name}}</strong> ("Receiving Party"), employed as {{designation}}.</p>

<h3>1. Definition of Confidential Information</h3>
<p>"Confidential Information" includes, but is not limited to, technical data, trade secrets, know-how, software, customer lists, financial information, and business plans disclosed by the Disclosing Party.</p>

<h3>2. Obligations of Receiving Party</h3>
<p>The Receiving Party agrees to:</p>
<ul>
    <li>Maintain the confidentiality of the information.</li>
    <li>Use the information solely for the purpose of performing their employment duties.</li>
    <li>Not disclose the information to any third party without prior written consent.</li>
</ul>

<h3>3. Duration</h3>
<p>The obligations of this Agreement shall survive the termination of employment and continue for a period of 2 years thereafter.</p>

<h3>4. Governing Law</h3>
<p>This Agreement shall be governed by the laws of India.</p>

<p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the date first above written.</p>
        `
    },
    {
        title: 'Experience / Relieving Letter',
        type: 'RELIEVING_LETTER',
        content: `
<p>Date: {{date}}</p>
<h3>TO WHOMSOEVER IT MAY CONCERN</h3>

<p>This is to certify that <strong>{{name}}</strong> was employed with <strong>{{companyName}}</strong> from <strong>{{joiningDate}}</strong> to {{date}}.</p>

<p>He/She held the designation of <strong>{{designation}}</strong> at the time of leaving.</p>

<p>During his/her tenure with us, we found him/her to be sincere, hardworking, and result-oriented. He/She has been relieved from his/her duties effective close of business hours on {{date}}.</p>

<p>We wish him/her all the best for future endeavors.</p>

<p>For <strong>{{companyName}}</strong>,</p>
<br><br>
<p>Authorized Signatory</p>
        `
    },
    {
        title: 'No Objection Certificate (NOC)',
        type: 'NOC',
        content: `
<h1>No Objection Certificate</h1>
<p>Date: {{date}}</p>

<p>This is to certify that <strong>{{name}}</strong> is a permanent employee of <strong>{{companyName}}</strong>, working as <strong>{{designation}}</strong> since <strong>{{joiningDate}}</strong>.</p>

<p>This certificate is issued at the request of the employee for the purpose of <strong>[Visa Application / Loan Application / Other]</strong>.</p>

<p>The company has no objection to the employee obtaining the said facility/document.</p>

<p>Sincerely,</p>
<p>HR Manager</p>
<p><strong>{{companyName}}</strong></p>
        `
    },
    {
        title: 'IT & Data Security Policy',
        type: 'POLICY',
        content: `
<h1>IT & Data Security Policy Acknowledgement</h1>
<p><strong>Employee Name:</strong> {{name}}</p>
<p><strong>Designation:</strong> {{designation}}</p>

<h3>Policy Overview</h3>
<p>This policy outlines the acceptable use of computer equipment at {{companyName}}. You must protect the confidentiality, integrity, and availability of our data.</p>

<h3>Key Guidelines</h3>
<ul>
    <li>Access to systems is for business use only.</li>
    <li>Do not share passwords or access credentials.</li>
    <li>Report any suspicious activity or security breaches immediately.</li>
    <li>Ensure all proprietary data remains within the company network.</li>
</ul>

<p>By signing below, I acknowledge that I have read and understood the IT & Data Security Policy and agree to abide by it.</p>
        `
    }
];
