const axios = require('axios');

exports.sendVerificationEmail = async (verifyEmail, token) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    console.log(`Send email to ${verifyEmail} with link: ${verifyUrl}`);

    // Setingan Local
    // console.log('VERIFY URL:', verifyUrl);
    // return verifyUrl;
    // Setingan Local

    const data = {
      from: {
        email: process.env.MAIL_FROM_EMAIL,
        name: process.env.MAIL_FROM_NAME
      },
      to: [
        {
          email: verifyEmail,
          name: ''
        }
      ],
      subject: 'Verify your email',
      text: `Please verify your email by clicking this link: ${verifyUrl}`,
      html: `
        <p>
          Please verify your email by clicking this link:
          <a href="${verifyUrl}">Verify Email</a>
        </p>
      `
    };

    const config = {
      method: 'post',
      url: 'https://api.mailersend.com/v1/email',
      headers: {
        Authorization: `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data
    };

    const response = await axios.request(config);

    console.log('Email sent:', response.data);

    return response.data;
  } catch (error) {
    console.error(
      'Send verification email error:',
      error.response?.data || error.message
    );

    throw error;
  }
};
