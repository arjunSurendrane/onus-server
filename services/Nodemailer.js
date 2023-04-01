import nodemailer from 'nodemailer'

/**
 * Configure
 * @description Configure nodemailer sender details
 * @returns {Object} mailTransporter
 */
const Configure = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.EMAIL}`,
      pass: `${process.env.EMAIL_PASSWORD}`,
    },
  })
}

/**
 * Send Mail
 * @param {Object} mailTransporter
 * @param {Object} details
 */
const sendMail = (mailTransporter, details) => {
  mailTransporter.sendMail(details, (err) => {
    if (err) {
      console.log({ err })
    } else {
      console.log('email has sent')
    }
  })
}

/**
 * Generate verification email
 * @description - This function send otp to users for verifying their email is valid or not
 * @param {string} email
 * @param {string} otp
 */
export const GenerateMail = (email, otp) => {
  const mailTransporter = Configure()
  const details = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: 'Email Verification',
    text: 'body of the email',
    html: `<h1>Welcome To Onus</h1> 
              <h2>OTP : ${otp}</h2>`,
  }
  sendMail(mailTransporter, details)
}

/**
 * Generate invitation mail
 * @description - This function send workspace invitation for users
 * @param {String} email
 * @param {String} name
 * @param {String} id
 */
export const GenerateIvitationMail = (email, name, id) => {
  const mailTransporter = Configure()
  const details = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: 'Workspace Invitation',
    html: ` <div>
        <div style="display: flex; width: 100vw; justify-content: center">
          <h1>${name} Invite you to his workspace</h1>
        </div>
        <div style="display: flex; width: 100vw; justify-content: center">
          <div style="margin: 5px">
            <a href="http://127.0.0.1:5173/accept/${id}">
              <button
                style="
                  background-color: rgb(87, 139, 87);
                  padding: 5px;
                  border: none;
                  height: 50px;
                  width: 80px;
                "
              >
                Accept
              </button>
              </a>
          </div>
        </div>
      </div>`,
  }
  sendMail(mailTransporter, details)
}
