const nodemailer = require('nodemailer');

const sendApprovalEmail = async (userEmail, userName, role) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log('SMTP server is ready to take our messages');
        } catch (verifyError) {
            console.error('SMTP Verification Error:', verifyError);
            return false;
        }

        const mailOptions = {
            from: `"Productivity Pro" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Account Approved - Productivity Pro',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #f97316; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Congratulations!</h1>
                    </div>
                    <div style="padding: 40px; background-color: white;">
                        <h2 style="color: #1e293b; margin-top: 0;">Hello ${userName},</h2>
                        <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                            We are excited to inform you that your registration request for <strong>Productivity Pro</strong> has been <strong>approved</strong> by the SuperAdmin.
                        </p>
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 700; text-transform: uppercase; tracking-wider;">Assigned Role</p>
                            <p style="margin: 5px 0 0 0; color: #f97316; font-size: 20px; font-weight: 800;">${role}</p>
                        </div>
                        <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                            You can now log in to your dashboard using your registered email address and password to start tracking your tasks and collaborating with the team.
                        </p>
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="http://localhost:5173/login" style="background-color: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; transition: background-color 0.2s;">
                                Login to Dashboard
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                            &copy; 2026 Productivity Pro Team Tracker. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Approval email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email Sending Error:', error);
        return false;
    }
};

module.exports = { sendApprovalEmail };
